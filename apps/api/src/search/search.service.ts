import { Inject, Injectable } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { PrismaService } from "../prisma/prisma.service.js";

const limit = 8;

@Injectable()
export class SearchService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async search(user: AuthenticatedUser, query: string) {
    const contains = { contains: query.trim(), mode: "insensitive" as const };
    const [tasks, routines, links, tracks, items] =
      await this.prisma.$transaction([
        this.prisma.task.findMany({
          where: {
            userId: user.id,
            OR: [{ title: contains }, { description: contains }],
          },
          select: { id: true, title: true, description: true },
          orderBy: { updatedAt: "desc" },
          take: limit,
        }),
        this.prisma.routine.findMany({
          where: {
            userId: user.id,
            OR: [{ title: contains }, { description: contains }],
          },
          select: { id: true, title: true, description: true },
          orderBy: { updatedAt: "desc" },
          take: limit,
        }),
        this.prisma.link.findMany({
          where: {
            userId: user.id,
            OR: [
              { title: contains },
              { description: contains },
              { url: contains },
            ],
          },
          select: { id: true, title: true, description: true, url: true },
          orderBy: { updatedAt: "desc" },
          take: limit,
        }),
        this.prisma.northTrack.findMany({
          where: {
            userId: user.id,
            OR: [{ title: contains }, { description: contains }],
          },
          select: { id: true, title: true, description: true },
          orderBy: { updatedAt: "desc" },
          take: limit,
        }),
        this.prisma.northItem.findMany({
          where: {
            track: { userId: user.id },
            OR: [{ title: contains }, { description: contains }],
          },
          select: {
            id: true,
            title: true,
            description: true,
            track: { select: { title: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: limit,
        }),
      ]);

    return [
      ...tasks.map((item) => ({ ...item, type: "TASK" as const })),
      ...routines.map((item) => ({ ...item, type: "ROUTINE" as const })),
      ...links.map(({ url, ...item }) => ({
        ...item,
        description: item.description ?? url,
        type: "LINK" as const,
      })),
      ...tracks.map((item) => ({ ...item, type: "NORTH_TRACK" as const })),
      ...items.map(({ track, ...item }) => ({
        ...item,
        description: item.description ?? track.title,
        type: "NORTH_ITEM" as const,
      })),
    ];
  }
}
