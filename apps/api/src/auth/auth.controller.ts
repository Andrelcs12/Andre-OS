import {
  Controller,
  Get,
  Inject,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { UsersService } from "../users/users.service.js";
import type { AuthenticatedUser } from "./auth.types.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";
import { SessionAuthGuard } from "./guards/session-auth.guard.js";

@Controller("auth")
export class AuthController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

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
