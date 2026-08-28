import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { RoutinesController } from "./routines.controller.js";
import { RoutinesService } from "./routines.service.js";
@Module({
  imports: [AuthModule],
  controllers: [RoutinesController],
  providers: [RoutinesService],
})
export class RoutinesModule {}
