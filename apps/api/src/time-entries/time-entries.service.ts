import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { ListTimeEntriesQueryDto } from "./dto/list-time-entries-query.dto.js";
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
  list(user: AuthenticatedUser, query: ListTimeEntriesQueryDto) {
    return this.prisma.timeEntry.findMany({
      where: { userId: user.id },
      include: { task: { select: { id: true, title: true } } },
      orderBy: { startedAt: "desc" },
      take: query.limit ?? 20,
    });
  }
  active(user: AuthenticatedUser) {
    return this.prisma.timeEntry.findFirst({
      where: { userId: user.id, endedAt: null },
      include: { task: { select: { id: true, title: true } } },
      orderBy: { startedAt: "desc" },
    });
  }
  async start(user: AuthenticatedUser, dto: StartTimeEntryDto) {
    if (dto.taskId) {
      const task = await this.prisma.task.findFirst({
        where: { id: dto.taskId, userId: user.id },
      });
      if (!task) throw new NotFoundException("Tarefa não encontrada.");
    }
    if (await this.active(user))
      throw new ConflictException("Já existe uma sessão ativa.");
    try {
      return await this.prisma.timeEntry.create({
        data: {
          userId: user.id,
          taskId: dto.taskId,
          description: dto.description?.trim() || null,
          area: dto.area,
          startedAt: new Date(),
        },
        include: { task: { select: { id: true, title: true } } },
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
        include: { task: { select: { id: true, title: true } } },
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
}
