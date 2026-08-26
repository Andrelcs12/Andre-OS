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
import { AuthGuard } from "@nestjs/passport";
import type { FastifyReply, FastifyRequest } from "fastify";

import { UsersService } from "../users/users.service.js";
import { AuthService } from "./auth.service.js";
import type { AuthenticatedUser, GoogleProfileData } from "./auth.types.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";
import { GoogleOAuthAvailableGuard } from "./guards/google-oauth-available.guard.js";
import { SessionAuthGuard } from "./guards/session-auth.guard.js";

type GoogleRequest = FastifyRequest & { user: GoogleProfileData };

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(UsersService) private readonly users: UsersService,
  ) {}

  @Get("google")
  @UseGuards(GoogleOAuthAvailableGuard, AuthGuard("google"))
  googleLogin() {}

  @Get("google/callback")
  @UseGuards(GoogleOAuthAvailableGuard, AuthGuard("google"))
  async googleCallback(
    @Req() request: GoogleRequest,
    @Res() reply: FastifyReply,
  ) {
    await this.auth.completeGoogleSignIn(reply, request.user);
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
