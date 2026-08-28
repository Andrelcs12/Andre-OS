import { Module } from "@nestjs/common";
import { NorthController } from "./north.controller.js";
import { NorthService } from "./north.service.js";

@Module({
  controllers: [NorthController],
  providers: [NorthService],
  exports: [NorthService],
})
export class NorthModule {}
