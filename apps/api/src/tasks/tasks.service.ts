import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import type { Prisma } from "../generated/prisma/client.js";
import { TaskStatus } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateTaskDto } from "./dto/create-task.dto.js";
import type { ListTasksQueryDto } from "./dto/list-tasks-query.dto.js";
import type { UpdateTaskDto } from "./dto/update-task.dto.js";

@Injectable()
export class TasksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(user: AuthenticatedUser, query: ListTasksQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.TaskWhereInput = {
      userId: user.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.area ? { area: query.area } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return this.prisma.task.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId: user.id },
    });
    if (!task) throw new NotFoundException("Tarefa não encontrada.");
    return task;
  }

  create(user: AuthenticatedUser, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId: user.id,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        area: dto.area,
        priority: dto.priority,
        estimatedMinutes: dto.estimatedMinutes,
        dueDate: dto.dueDate,
      },
    });
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateTaskDto) {
    await this.findOne(user, id);
    const data: Prisma.TaskUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description?.trim() || null }
        : {}),
      ...(dto.area !== undefined ? { area: dto.area } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.estimatedMinutes !== undefined
        ? { estimatedMinutes: dto.estimatedMinutes }
        : {}),
      ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate } : {}),
      ...(dto.status !== undefined
        ? {
            status: dto.status,
            completedAt:
              dto.status === TaskStatus.COMPLETED ? new Date() : null,
          }
        : {}),
    };
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(user: AuthenticatedUser, id: string) {
    await this.findOne(user, id);
    await this.prisma.task.delete({ where: { id } });
  }
}
