import { Inject, Injectable } from "@nestjs/common";
import type { SupabaseUserIdentity } from "../auth/auth.types.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async upsertSupabaseUser(identity: SupabaseUserIdentity) {
    const byAuthUserId = await this.prisma.user.findUnique({
      where: { authUserId: identity.authUserId },
    });
    const existing =
      byAuthUserId ??
      (await this.prisma.user.findUnique({ where: { email: identity.email } }));

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          authUserId: identity.authUserId,
          email: identity.email,
          displayName: identity.displayName,
          avatarUrl: identity.avatarUrl,
        },
      });
    }

    return this.prisma.user.create({
      data: identity,
    });
  }
}
