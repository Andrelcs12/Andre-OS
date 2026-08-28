import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import type { Prisma } from "../generated/prisma/client.js";
import { RoutineSchedule } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateRoutineDto } from "./dto/create-routine.dto.js";
import type { ListRoutinesQueryDto } from "./dto/list-routines-query.dto.js";
import type { RoutineEntryDto } from "./dto/routine-entry.dto.js";
import type { UpdateRoutineDto } from "./dto/update-routine.dto.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function civilDate(value: string) {
  if (!datePattern.test(value))
    throw new BadRequestException("Data inválida. Use YYYY-MM-DD.");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value)
    throw new BadRequestException("Data inválida. Use YYYY-MM-DD.");
  return date;
}
function normalizedDays(schedule: RoutineSchedule, days?: number[]) {
  if (schedule === RoutineSchedule.CUSTOM && !days?.length)
    throw new BadRequestException(
      "Selecione ao menos um dia para frequência personalizada.",
    );
  return schedule === RoutineSchedule.CUSTOM ? [...new Set(days)].sort() : [];
}

@Injectable()
export class RoutinesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  list(user: AuthenticatedUser, query: ListRoutinesQueryDto) {
    return this.prisma.routine.findMany({
      where: {
        userId: user.id,
        ...(query.active === undefined
          ? {}
          : { isActive: query.active === "true" }),
      },
      orderBy: { createdAt: "desc" },
    });
  }
  async findOne(user: AuthenticatedUser, id: string) {
    const routine = await this.prisma.routine.findFirst({
      where: { id, userId: user.id },
    });
    if (!routine) throw new NotFoundException("Rotina não encontrada.");
    return routine;
  }
  create(user: AuthenticatedUser, dto: CreateRoutineDto) {
    return this.prisma.routine.create({
      data: {
        userId: user.id,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        area: dto.area,
        schedule: dto.schedule,
        daysOfWeek: normalizedDays(dto.schedule, dto.daysOfWeek),
      },
    });
  }
  async update(user: AuthenticatedUser, id: string, dto: UpdateRoutineDto) {
    const current = await this.findOne(user, id);
    const schedule = dto.schedule ?? current.schedule;
    const days = dto.daysOfWeek ?? current.daysOfWeek;
    const data: Prisma.RoutineUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description?.trim() || null }
        : {}),
      ...(dto.area !== undefined ? { area: dto.area } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.schedule !== undefined || dto.daysOfWeek !== undefined
        ? { schedule, daysOfWeek: normalizedDays(schedule, days) }
        : {}),
    };
    return this.prisma.routine.update({ where: { id }, data });
  }
  async remove(user: AuthenticatedUser, id: string) {
    await this.findOne(user, id);
    await this.prisma.routine.delete({ where: { id } });
  }
  async daily(user: AuthenticatedUser, dateValue: string) {
    const date = civilDate(dateValue);
    const weekday = date.getUTCDay();
    const routines = await this.prisma.routine.findMany({
      where: { userId: user.id, isActive: true },
      include: { entries: { where: { date } } },
      orderBy: { createdAt: "desc" },
    });
    return routines
      .filter(
        (r) =>
          r.schedule === RoutineSchedule.DAILY ||
          (r.schedule === RoutineSchedule.WEEKDAYS &&
            weekday >= 1 &&
            weekday <= 5) ||
          (r.schedule === RoutineSchedule.CUSTOM &&
            r.daysOfWeek.includes(weekday)),
      )
      .map(({ entries, ...routine }) => ({
        ...routine,
        completed: entries[0]?.completed ?? false,
        completedAt: entries[0]?.completedAt ?? null,
      }));
  }
  async setEntry(
    user: AuthenticatedUser,
    id: string,
    dateValue: string,
    dto: RoutineEntryDto,
  ) {
    await this.findOne(user, id);
    const date = civilDate(dateValue);
    return this.prisma.routineEntry.upsert({
      where: { routineId_date: { routineId: id, date } },
      create: {
        routineId: id,
        userId: user.id,
        date,
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : null,
      },
      update: {
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : null,
      },
    });
  }
}
