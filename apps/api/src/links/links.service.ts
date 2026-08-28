import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import type { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateLinkDto } from "./dto/create-link.dto.js";
import type { ListLinksQueryDto } from "./dto/list-links-query.dto.js";
import type { UpdateLinkDto } from "./dto/update-link.dto.js";

@Injectable()
export class LinksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  list(user: AuthenticatedUser, query: ListLinksQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.LinkWhereInput = {
      userId: user.id,
      ...(query.area ? { area: query.area } : {}),
      ...(query.favorite !== undefined ? { isFavorite: query.favorite } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { url: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return this.prisma.link.findMany({
      where,
      orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
    });
  }
  async findOne(user: AuthenticatedUser, id: string) {
    const link = await this.prisma.link.findFirst({
      where: { id, userId: user.id },
    });
    if (!link) throw new NotFoundException("Link não encontrado.");
    return link;
  }
  create(user: AuthenticatedUser, dto: CreateLinkDto) {
    return this.prisma.link.create({
      data: {
        userId: user.id,
        title: dto.title.trim(),
        url: dto.url.trim(),
        description: dto.description?.trim() || null,
        area: dto.area,
        isFavorite: dto.isFavorite ?? false,
      },
    });
  }
  async update(user: AuthenticatedUser, id: string, dto: UpdateLinkDto) {
    await this.findOne(user, id);
    return this.prisma.link.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.url !== undefined ? { url: dto.url.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.area !== undefined ? { area: dto.area } : {}),
        ...(dto.isFavorite !== undefined ? { isFavorite: dto.isFavorite } : {}),
      },
    });
  }
  async remove(user: AuthenticatedUser, id: string) {
    await this.findOne(user, id);
    await this.prisma.link.delete({ where: { id } });
  }
}
