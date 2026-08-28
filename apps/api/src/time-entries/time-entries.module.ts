import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { TimeEntriesController } from "./time-entries.controller.js";
import { TimeEntriesService } from "./time-entries.service.js";
@Module({
  imports: [AuthModule],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService],
})
export class TimeEntriesModule {}
