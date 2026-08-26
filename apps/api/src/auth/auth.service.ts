import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { FastifyReply } from "fastify";

import { UsersService } from "../users/users.service.js";
import type { GoogleProfileData } from "./auth.types.js";

const sessionCookieName = "andre_os_session";
const sessionMaxAge = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(UsersService) private readonly users: UsersService,
  ) {}

  isGoogleConfigured() {
    return Boolean(
      this.config.get<string>("GOOGLE_CLIENT_ID") &&
        this.config.get<string>("GOOGLE_CLIENT_SECRET") &&
        this.config.get<string>("GOOGLE_CALLBACK_URL"),
    );
  }

  assertGoogleConfigured() {
    if (!this.isGoogleConfigured()) {
      throw new ServiceUnavailableException(
        "Google OAuth ainda não está configurado.",
      );
    }
  }

  async completeGoogleSignIn(reply: FastifyReply, profile: GoogleProfileData) {
    const user = await this.users.upsertGoogleUser(profile);
    const token = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.config.getOrThrow<string>("AUTH_SECRET"),
        expiresIn: "7d",
      },
    );

    const secure =
      this.config.get<string>("NODE_ENV") === "production" ? "; Secure" : "";
    reply.header(
      "set-cookie",
      `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionMaxAge}${secure}`,
    );
  }

  clearSession(reply: FastifyReply) {
    reply.header(
      "set-cookie",
      `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
    );
  }

  getSessionCookieName() {
    return sessionCookieName;
  }
}
