import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard.js";
import type { CreateNorthItemDto } from "./dto/create-north-item.dto.js";
import type { CreateNorthTrackDto } from "./dto/create-north-track.dto.js";
import type { UpdateNorthItemDto } from "./dto/update-north-item.dto.js";
import type { UpdateNorthTrackDto } from "./dto/update-north-track.dto.js";
import { NorthService } from "./north.service.js";

@Controller("north")
@UseGuards(SessionAuthGuard)
export class NorthController {
  constructor(@Inject(NorthService) private readonly north: NorthService) {}
  @Get() overview(@CurrentUser() user: AuthenticatedUser) {
    return this.north.overview(user);
  }
  @Post("tracks") createTrack(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateNorthTrackDto,
  ) {
    return this.north.createTrack(user, dto);
  }
  @Patch("tracks/:id") updateTrack(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateNorthTrackDto,
  ) {
    return this.north.updateTrack(user, id, dto);
  }
  @Delete("tracks/:id") removeTrack(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.north.removeTrack(user, id);
  }
  @Post("tracks/:trackId/items") createItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("trackId") trackId: string,
    @Body() dto: CreateNorthItemDto,
  ) {
    return this.north.createItem(user, trackId, dto);
  }
  @Patch("items/:id") updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateNorthItemDto,
  ) {
    return this.north.updateItem(user, id, dto);
  }
  @Delete("items/:id") removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.north.removeItem(user, id);
  }
}
