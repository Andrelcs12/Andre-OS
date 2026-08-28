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
import type { CreateLinkDto } from "./dto/create-link.dto.js";
import type { ListLinksQueryDto } from "./dto/list-links-query.dto.js";
import type { UpdateLinkDto } from "./dto/update-link.dto.js";
import { LinksService } from "./links.service.js";
@Controller("links")
@UseGuards(SessionAuthGuard)
export class LinksController {
  constructor(@Inject(LinksService) private readonly links: LinksService) {}
  @Get() list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListLinksQueryDto,
  ) {
    return this.links.list(user, query);
  }
  @Get(":id") findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.links.findOne(user, id);
  }
  @Post() create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLinkDto,
  ) {
    return this.links.create(user, dto);
  }
  @Patch(":id") update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateLinkDto,
  ) {
    return this.links.update(user, id, dto);
  }
  @Delete(":id") async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.links.remove(user, id);
  }
}
