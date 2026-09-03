import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { UsersService } from "../../users/users.service.js";
import { AuthService } from "../auth.service.js";
import type { AuthenticatedUser } from "../auth.types.js";

type AuthenticatedRequest = FastifyRequest & { user?: AuthenticatedUser };
function readBearerToken(header: string | undefined) {
  const [scheme, token] = header?.split(" ") ?? [];
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(UsersService) private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readBearerToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException();

    try {
      const identity = await this.auth.getIdentity(token);
      if (!identity) throw new UnauthorizedException();
      const user = await this.users.upsertSupabaseUser(identity);
      request.user = { id: user.id, email: user.email };
      return true;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new UnauthorizedException();
    }
  }
}
