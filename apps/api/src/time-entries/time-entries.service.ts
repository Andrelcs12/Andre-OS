import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { Prisma } from "../generated/prisma/client.js";
import {
  NorthItemStatus,
  TaskStatus,
  TimeEntryMode,
} from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { ListTimeEntriesQueryDto } from "./dto/list-time-entries-query.dto.js";
import type { ManualTimeEntryDto } from "./dto/manual-time-entry.dto.js";
import type { StartTimeEntryDto } from "./dto/start-time-entry.dto.js";

export function calculateDurationMinutes(startedAt: Date, endedAt: Date) {
  return Math.max(
    1,
    Math.ceil((endedAt.getTime() - startedAt.getTime()) / 60_000),
  );
}

@Injectable()
export class TimeEntriesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  private transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return typeof this.prisma.$transaction === "function"
      ? this.prisma.$transaction(callback)
      : callback(this.prisma as unknown as Prisma.TransactionClient);
  }
  list(user: AuthenticatedUser, query: ListTimeEntriesQueryDto) {
    return this.prisma.timeEntry.findMany({
      where: { userId: user.id },
      include: {
        task: { select: { id: true, title: true } },
        northItem: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: "desc" },
      take: query.limit ?? 20,
    });
  }
  active(user: AuthenticatedUser) {
    return this.prisma.timeEntry.findFirst({
      where: { userId: user.id, endedAt: null },
      include: {
        task: { select: { id: true, title: true } },
        northItem: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: "desc" },
    });
  }
  async start(user: AuthenticatedUser, dto: StartTimeEntryDto) {
    if ([dto.taskId, dto.northItemId, dto.routineId].filter(Boolean).length > 1)
      throw new BadRequestException(
        "Escolha uma tarefa, item do Norte ou essencial, não mais de um.",
      );
    if (dto.taskId) {
      const task = await this.prisma.task.findFirst({
        where: { id: dto.taskId, userId: user.id },
      });
      if (!task) throw new NotFoundException("Tarefa não encontrada.");
    }
    if (dto.northItemId) {
      const item = await this.prisma.northItem.findFirst({
        where: { id: dto.northItemId, track: { userId: user.id } },
        include: { track: { select: { area: true } } },
      });
      if (!item) throw new NotFoundException("Item do Norte não encontrado.");
      dto.area ??= item.track.area ?? undefined;
    }
    if (dto.routineId) {
      const routine = await this.prisma.routine.findFirst({
        where: { id: dto.routineId, userId: user.id },
      });
      if (!routine) throw new NotFoundException("Essencial não encontrado.");
      dto.area ??= routine.area ?? undefined;
    }
    if (await this.active(user))
      throw new ConflictException("Já existe uma sessão ativa.");
    try {
      return await this.transaction(async (tx) => {
        if (dto.taskId)
          await tx.task.update({
            where: { id: dto.taskId },
            data: { status: TaskStatus.IN_PROGRESS, completedAt: null },
          });
        if (dto.northItemId)
          await tx.northItem.updateMany({
            where: {
              id: dto.northItemId,
              status: { not: NorthItemStatus.COMPLETED },
            },
            data: { status: NorthItemStatus.IN_PROGRESS, completedAt: null },
          });
        return tx.timeEntry.create({
          data: {
            userId: user.id,
            taskId: dto.taskId,
            northItemId: dto.northItemId,
            routineId: dto.routineId,
            description: dto.description?.trim() || null,
            area: dto.area,
            mode: dto.mode ?? TimeEntryMode.FREE,
            focusEndsAt:
              dto.mode === TimeEntryMode.POMODORO && dto.focusMinutes
                ? new Date(Date.now() + dto.focusMinutes * 60_000)
                : null,
            startedAt: new Date(),
          },
          include: {
            task: { select: { id: true, title: true } },
            northItem: { select: { id: true, title: true } },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException("Já existe uma sessão ativa.");
      throw error;
    }
  }
  async stop(user: AuthenticatedUser, id: string) {
    const entry = await this.prisma.timeEntry.findFirst({
      where: { id, userId: user.id },
    });
    if (!entry) throw new NotFoundException("Sessão não encontrada.");
    if (entry.endedAt)
      throw new ConflictException("Esta sessão já foi encerrada.");
    const endedAt = new Date();
    const durationMinutes = calculateDurationMinutes(entry.startedAt, endedAt);
    return this.prisma.$transaction(async (tx) => {
      const stopped = await tx.timeEntry.update({
        where: { id },
        data: { endedAt, durationMinutes },
        include: {
          task: { select: { id: true, title: true } },
          northItem: { select: { id: true, title: true } },
        },
      });
      if (entry.taskId) {
        const result = await tx.timeEntry.aggregate({
          where: { taskId: entry.taskId, endedAt: { not: null } },
          _sum: { durationMinutes: true },
        });
        await tx.task.update({
          where: { id: entry.taskId },
          data: { actualMinutes: result._sum.durationMinutes ?? 0 },
        });
      }
      return stopped;
    });
  }
  async manual(user: AuthenticatedUser, dto: ManualTimeEntryDto) {
    const endedAt = new Date(
      dto.startedAt.getTime() + dto.durationMinutes * 60_000,
    );
    return this.transaction(async (tx) => {
      const entry = await tx.timeEntry.create({
        data: {
          userId: user.id,
          taskId: dto.taskId || null,
          northItemId: dto.northItemId || null,
          routineId: dto.routineId || null,
          description: dto.description?.trim() || null,
          note: dto.note?.trim() || null,
          area: dto.area || null,
          mode: TimeEntryMode.MANUAL,
          startedAt: dto.startedAt,
          endedAt,
          durationMinutes: dto.durationMinutes,
        },
      });
      if (entry.taskId) await this.refreshTaskMinutes(tx, entry.taskId);
      return entry;
    });
  }
  async update(user: AuthenticatedUser, id: string, dto: ManualTimeEntryDto) {
    const current = await this.prisma.timeEntry.findFirst({
      where: { id, userId: user.id },
    });
    if (!current) throw new NotFoundException("Sessão não encontrada.");
    if (!current.endedAt)
      throw new ConflictException("Pare a sessão antes de editar.");
    const endedAt = new Date(
      dto.startedAt.getTime() + dto.durationMinutes * 60_000,
    );
    return this.transaction(async (tx) => {
      const entry = await tx.timeEntry.update({
        where: { id },
        data: {
          taskId: dto.taskId || null,
          northItemId: dto.northItemId || null,
          routineId: dto.routineId || null,
          description: dto.description?.trim() || null,
          note: dto.note?.trim() || null,
          area: dto.area || null,
          startedAt: dto.startedAt,
          endedAt,
          durationMinutes: dto.durationMinutes,
        },
      });
      if (current.taskId) await this.refreshTaskMinutes(tx, current.taskId);
      if (entry.taskId && entry.taskId !== current.taskId)
        await this.refreshTaskMinutes(tx, entry.taskId);
      return entry;
    });
  }
  async remove(user: AuthenticatedUser, id: string) {
    const current = await this.prisma.timeEntry.findFirst({
      where: { id, userId: user.id },
    });
    if (!current) throw new NotFoundException("Sessão não encontrada.");
    return this.transaction(async (tx) => {
      await tx.timeEntry.delete({ where: { id } });
      if (current.taskId) await this.refreshTaskMinutes(tx, current.taskId);
    });
  }
  private async refreshTaskMinutes(
    tx: Prisma.TransactionClient,
    taskId: string,
  ) {
    const total = await tx.timeEntry.aggregate({
      where: { taskId, endedAt: { not: null } },
      _sum: { durationMinutes: true },
    });
    await tx.task.update({
      where: { id: taskId },
      data: { actualMinutes: total._sum.durationMinutes ?? 0 },
    });
  }
}
