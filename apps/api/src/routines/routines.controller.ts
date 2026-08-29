import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard.js";
import { CreateRoutineDto } from "./dto/create-routine.dto.js";
import { ListRoutinesQueryDto } from "./dto/list-routines-query.dto.js";
import { RoutineEntryDto } from "./dto/routine-entry.dto.js";
import { UpdateRoutineDto } from "./dto/update-routine.dto.js";
import { RoutinesService } from "./routines.service.js";

void [
  CreateRoutineDto,
  ListRoutinesQueryDto,
  RoutineEntryDto,
  UpdateRoutineDto,
];
@Controller("routines")
@UseGuards(SessionAuthGuard)
export class RoutinesController {
  constructor(
    @Inject(RoutinesService) private readonly routines: RoutinesService,
  ) {}
  @Get() list(
    @CurrentUser() u: AuthenticatedUser,
    @Query() q: ListRoutinesQueryDto,
  ) {
    return this.routines.list(u, q);
  }
  @Get("today") daily(
    @CurrentUser() u: AuthenticatedUser,
    @Query("date") d: string,
  ) {
    return this.routines.daily(u, d);
  }
  @Get(":id") one(
    @CurrentUser() u: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.routines.findOne(u, id);
  }
  @Post() create(
    @CurrentUser() u: AuthenticatedUser,
    @Body() d: CreateRoutineDto,
  ) {
    return this.routines.create(u, d);
  }
  @Patch(":id") update(
    @CurrentUser() u: AuthenticatedUser,
    @Param("id") id: string,
    @Body() d: UpdateRoutineDto,
  ) {
    return this.routines.update(u, id, d);
  }
  @Put(":id/entries/:date") entry(
    @CurrentUser() u: AuthenticatedUser,
    @Param("id") id: string,
    @Param("date") date: string,
    @Body() d: RoutineEntryDto,
  ) {
    return this.routines.setEntry(u, id, date, d);
  }
  @Delete(":id") async remove(
    @CurrentUser() u: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.routines.remove(u, id);
  }
}
