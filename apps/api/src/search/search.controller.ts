import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard.js";
import { SearchQueryDto } from "./dto/search-query.dto.js";
import { SearchService } from "./search.service.js";

void SearchQueryDto;

@Controller("search")
@UseGuards(SessionAuthGuard)
export class SearchController {
  constructor(@Inject(SearchService) private readonly search: SearchService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: SearchQueryDto) {
    return this.search.search(user, query.q);
  }
}
