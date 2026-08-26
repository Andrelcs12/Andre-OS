import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

export type GoogleUserIdentity = {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  upsertGoogleUser(identity: GoogleUserIdentity) {
    return this.prisma.user.upsert({
      where: { googleId: identity.googleId },
      create: identity,
      update: {
        email: identity.email,
        displayName: identity.displayName,
        avatarUrl: identity.avatarUrl,
      },
    });
  }
}
