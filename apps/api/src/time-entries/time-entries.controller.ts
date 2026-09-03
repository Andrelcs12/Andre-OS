import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard.js";
import { ListTimeEntriesQueryDto } from "./dto/list-time-entries-query.dto.js";
import { ManualTimeEntryDto } from "./dto/manual-time-entry.dto.js";
import { StartTimeEntryDto } from "./dto/start-time-entry.dto.js";
import { TimeEntriesService } from "./time-entries.service.js";

void [ListTimeEntriesQueryDto, StartTimeEntryDto, ManualTimeEntryDto];
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
  @Post("manual") manual(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ManualTimeEntryDto,
  ) {
    return this.entries.manual(user, dto);
  }
  @Patch(":id") update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: ManualTimeEntryDto,
  ) {
    return this.entries.update(user, id, dto);
  }
  @Delete(":id") remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.entries.remove(user, id);
  }
  @Post(":id/stop") stop(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.entries.stop(user, id);
  }
}
