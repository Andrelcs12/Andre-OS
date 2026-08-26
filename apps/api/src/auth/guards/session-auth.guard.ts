import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { FastifyRequest } from "fastify";
import { AuthService } from "../auth.service.js";
import type { AuthenticatedUser } from "../auth.types.js";

type AuthenticatedRequest = FastifyRequest & { user?: AuthenticatedUser };
type SessionPayload = { sub: string; email: string };

function readCookie(header: string | undefined, name: string) {
  return header
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readCookie(
      request.headers.cookie,
      this.auth.getSessionCookieName(),
    );
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwt.verifyAsync<SessionPayload>(token, {
        secret: this.config.getOrThrow<string>("AUTH_SECRET"),
      });
      request.user = { id: payload.sub, email: payload.email };
      if (!request.user.id || !request.user.email)
        throw new UnauthorizedException();
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
