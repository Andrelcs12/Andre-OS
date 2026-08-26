import { Controller, Get, Inject } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

@Controller("health")
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    await this.prisma.checkConnection();
    return { status: "ok", service: "andre-os-api" };
  }
}
