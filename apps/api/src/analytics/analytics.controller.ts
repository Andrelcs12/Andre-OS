import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard.js";
import { AnalyticsService } from "./analytics.service.js";
import type { AnalyticsRangeQueryDto } from "./dto/analytics-range-query.dto.js";
@Controller("analytics")
@UseGuards(SessionAuthGuard)
export class AnalyticsController {
  constructor(
    @Inject(AnalyticsService) private readonly analytics: AnalyticsService,
  ) {}
  @Get("overview") overview(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analytics.overview(user, query);
  }
}
