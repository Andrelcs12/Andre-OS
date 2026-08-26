import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";

import { AuthService } from "../auth.service.js";

@Injectable()
export class GoogleOAuthAvailableGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  canActivate(_: ExecutionContext) {
    this.auth.assertGoogleConfigured();
    return true;
  }
}
