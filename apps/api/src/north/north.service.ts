import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import type { Prisma } from "../generated/prisma/client.js";
import {
  NorthItemStatus,
  NorthTrackStatus,
} from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateNorthItemDto } from "./dto/create-north-item.dto.js";
import type { CreateNorthTrackDto } from "./dto/create-north-track.dto.js";
import type { UpdateNorthItemDto } from "./dto/update-north-item.dto.js";
import type { UpdateNorthTrackDto } from "./dto/update-north-track.dto.js";

const itemInclude = {
  timeEntries: {
    where: { endedAt: { not: null } },
    select: { durationMinutes: true },
  },
} as const;
function serializeItem<
  T extends { timeEntries: { durationMinutes: number | null }[] },
>(item: T) {
  const { timeEntries, ...value } = item;
  return {
    ...value,
    trackedMinutes: timeEntries.reduce(
      (total, entry) => total + (entry.durationMinutes ?? 0),
      0,
    ),
  };
}

@Injectable()
export class NorthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  private transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return typeof this.prisma.$transaction === "function"
      ? this.prisma.$transaction(callback)
      : callback(this.prisma as unknown as Prisma.TransactionClient);
  }
  async overview(user: AuthenticatedUser) {
    const track = await this.prisma.northTrack.findFirst({
      where: { userId: user.id, status: NorthTrackStatus.ACTIVE },
      orderBy: { updatedAt: "desc" },
    });
    if (!track) return { track: null, items: [], currentItem: null };
    const items = await this.prisma.northItem.findMany({
      where: { trackId: track.id },
      include: itemInclude,
      orderBy: { position: "asc" },
    });
    const currentItem =
      items.find((item) => item.status === NorthItemStatus.IN_PROGRESS) ??
      items.find((item) => item.status === NorthItemStatus.TODO) ??
      null;
    return {
      track,
      items: items.map(serializeItem),
      currentItem: currentItem ? serializeItem(currentItem) : null,
    };
  }
  async findTrack(user: AuthenticatedUser, id: string) {
    const track = await this.prisma.northTrack.findFirst({
      where: { id, userId: user.id },
    });
    if (!track) throw new NotFoundException("Norte não encontrado.");
    return track;
  }
  async findItem(user: AuthenticatedUser, id: string) {
    const item = await this.prisma.northItem.findFirst({
      where: { id, track: { userId: user.id } },
    });
    if (!item) throw new NotFoundException("Item do Norte não encontrado.");
    return item;
  }
  async createTrack(user: AuthenticatedUser, dto: CreateNorthTrackDto) {
    return this.transaction(async (tx) => {
      await tx.northTrack.updateMany({
        where: { userId: user.id, status: NorthTrackStatus.ACTIVE },
        data: { status: NorthTrackStatus.PAUSED },
      });
      return tx.northTrack.create({
        data: {
          userId: user.id,
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          area: dto.area,
          targetDate: dto.targetDate,
          startedAt: new Date(),
        },
      });
    });
  }
  async updateTrack(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateNorthTrackDto,
  ) {
    await this.findTrack(user, id);
    const data: Prisma.NorthTrackUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description?.trim() || null }
        : {}),
      ...(dto.area !== undefined ? { area: dto.area } : {}),
      ...(dto.targetDate !== undefined ? { targetDate: dto.targetDate } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };
    return this.transaction(async (tx) => {
      if (dto.status === NorthTrackStatus.ACTIVE)
        await tx.northTrack.updateMany({
          where: {
            userId: user.id,
            status: NorthTrackStatus.ACTIVE,
            id: { not: id },
          },
          data: { status: NorthTrackStatus.PAUSED },
        });
      return tx.northTrack.update({ where: { id }, data });
    });
  }
  async removeTrack(user: AuthenticatedUser, id: string) {
    await this.findTrack(user, id);
    await this.prisma.northTrack.delete({ where: { id } });
  }
  async createItem(
    user: AuthenticatedUser,
    trackId: string,
    dto: CreateNorthItemDto,
  ) {
    await this.findTrack(user, trackId);
    return this.transaction(async (tx) => {
      const count = await tx.northItem.count({ where: { trackId } });
      const position = Math.max(
        1,
        Math.min(dto.position ?? count + 1, count + 1),
      );
      if (position <= count)
        await tx.northItem.updateMany({
          where: { trackId, position: { gte: position } },
          data: { position: { increment: 1 } },
        });
      return tx.northItem.create({
        data: {
          trackId,
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          plannedMinutes: dto.plannedMinutes,
          scheduledDate: dto.scheduledDate,
          position,
        },
      });
    });
  }
  async updateItem(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateNorthItemDto,
  ) {
    const item = await this.findItem(user, id);
    if (dto.status === NorthItemStatus.IN_PROGRESS)
      await this.prisma.northItem.updateMany({
        where: {
          trackId: item.trackId,
          status: NorthItemStatus.IN_PROGRESS,
          id: { not: id },
        },
        data: { status: NorthItemStatus.TODO },
      });
    const data: Prisma.NorthItemUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description?.trim() || null }
        : {}),
      ...(dto.plannedMinutes !== undefined
        ? { plannedMinutes: dto.plannedMinutes }
        : {}),
      ...(dto.scheduledDate !== undefined
        ? { scheduledDate: dto.scheduledDate }
        : {}),
      ...(dto.position !== undefined ? { position: dto.position } : {}),
      ...(dto.status !== undefined
        ? {
            status: dto.status,
            completedAt:
              dto.status === NorthItemStatus.COMPLETED ? new Date() : null,
          }
        : {}),
    };
    return this.transaction(async (tx) => {
      if (dto.position !== undefined) {
        const count = await tx.northItem.count({
          where: { trackId: item.trackId },
        });
        const next = Math.max(1, Math.min(dto.position, count));
        if (next < item.position)
          await tx.northItem.updateMany({
            where: {
              trackId: item.trackId,
              position: { gte: next, lt: item.position },
            },
            data: { position: { increment: 1 } },
          });
        if (next > item.position)
          await tx.northItem.updateMany({
            where: {
              trackId: item.trackId,
              position: { gt: item.position, lte: next },
            },
            data: { position: { decrement: 1 } },
          });
        data.position = next;
      }
      return tx.northItem
        .update({ where: { id }, data, include: itemInclude })
        .then(serializeItem);
    });
  }
  async removeItem(user: AuthenticatedUser, id: string) {
    const item = await this.findItem(user, id);
    await this.transaction(async (tx) => {
      await tx.northItem.delete({ where: { id } });
      await tx.northItem.updateMany({
        where: { trackId: item.trackId, position: { gt: item.position } },
        data: { position: { decrement: 1 } },
      });
    });
  }
}
