import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { GoogleStrategy } from "./google.strategy.js";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard.js";

@Module({
  imports: [PassportModule, JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GoogleOAuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
