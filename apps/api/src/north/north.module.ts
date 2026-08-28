import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { NorthController } from "./north.controller.js";
import { NorthService } from "./north.service.js";

@Module({
  imports: [AuthModule],
  controllers: [NorthController],
  providers: [NorthService],
  exports: [NorthService],
})
export class NorthModule {}
