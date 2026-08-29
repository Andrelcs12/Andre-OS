import { type ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { FastifyRequest } from "fastify";

type GoogleRequest = FastifyRequest & {
  raw: FastifyRequest["raw"];
};

@Injectable()
export class GoogleOAuthGuard extends AuthGuard("google") {
  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest<GoogleRequest>().raw;
  }

  getResponse(context: ExecutionContext) {
    return context.switchToHttp().getResponse().raw;
  }
}
