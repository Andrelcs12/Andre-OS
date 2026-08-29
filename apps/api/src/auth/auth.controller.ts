import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { UsersService } from "../users/users.service.js";
import { AuthService } from "./auth.service.js";
import type { AuthenticatedUser, GoogleProfileData } from "./auth.types.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard.js";
import { GoogleOAuthAvailableGuard } from "./guards/google-oauth-available.guard.js";
import { SessionAuthGuard } from "./guards/session-auth.guard.js";

type GoogleRequest = FastifyRequest & {
  raw: FastifyRequest["raw"] & { user: GoogleProfileData };
};

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(UsersService) private readonly users: UsersService,
  ) {}

  @Get("google")
  @UseGuards(GoogleOAuthAvailableGuard, GoogleOAuthGuard)
  googleLogin() {}

  @Get("google/callback")
  @UseGuards(GoogleOAuthAvailableGuard, GoogleOAuthGuard)
  async googleCallback(
    @Req() request: GoogleRequest,
    @Res() reply: FastifyReply,
  ) {
    await this.auth.completeGoogleSignIn(reply, request.raw.user);
    return reply.redirect(
      `${process.env.WEB_URL ?? "http://localhost:3000"}/today`,
    );
  }

  @Post("logout")
  logout(@Res() reply: FastifyReply) {
    this.auth.clearSession(reply);
    return reply.status(204).send();
  }

  @Get("me")
  @UseGuards(SessionAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    const currentUser = await this.users.findById(user.id);
    if (!currentUser) throw new UnauthorizedException();
    return {
      id: currentUser.id,
      email: currentUser.email,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
    };
  }
}
