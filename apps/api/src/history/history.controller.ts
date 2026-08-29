import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard.js";
import { ListHistoryQueryDto } from "./dto/list-history-query.dto.js";
import { HistoryService } from "./history.service.js";

void ListHistoryQueryDto;
@Controller("history")
@UseGuards(SessionAuthGuard)
export class HistoryController {
  constructor(
    @Inject(HistoryService) private readonly history: HistoryService,
  ) {}
  @Get() list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListHistoryQueryDto,
  ) {
    return this.history.list(user, query);
  }
}
