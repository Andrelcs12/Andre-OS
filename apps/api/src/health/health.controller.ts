import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

@Controller("health")
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    try {
      await this.prisma.checkConnection();
      return { status: "ok", database: "ok" };
    } catch {
      throw new ServiceUnavailableException({
        status: "unavailable",
        database: "unavailable",
      });
    }
  }
}
