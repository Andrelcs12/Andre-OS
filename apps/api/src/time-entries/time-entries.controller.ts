import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard.js";
import { ListTimeEntriesQueryDto } from "./dto/list-time-entries-query.dto.js";
import { StartTimeEntryDto } from "./dto/start-time-entry.dto.js";
import { TimeEntriesService } from "./time-entries.service.js";

void [ListTimeEntriesQueryDto, StartTimeEntryDto];
@Controller("time-entries")
@UseGuards(SessionAuthGuard)
export class TimeEntriesController {
  constructor(
    @Inject(TimeEntriesService) private readonly entries: TimeEntriesService,
  ) {}
  @Get() list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListTimeEntriesQueryDto,
  ) {
    return this.entries.list(user, query);
  }
  @Get("active") active(@CurrentUser() user: AuthenticatedUser) {
    return this.entries.active(user);
  }
  @Post("start") start(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartTimeEntryDto,
  ) {
    return this.entries.start(user, dto);
  }
  @Post(":id/stop") stop(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.entries.stop(user, id);
  }
}
