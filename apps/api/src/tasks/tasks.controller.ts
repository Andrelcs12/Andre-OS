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
import { CreateTaskDto } from "./dto/create-task.dto.js";
import { ListTasksQueryDto } from "./dto/list-tasks-query.dto.js";
import { UpdateTaskDto } from "./dto/update-task.dto.js";
import { TasksService } from "./tasks.service.js";

void [CreateTaskDto, ListTasksQueryDto, UpdateTaskDto];

@Controller("tasks")
@UseGuards(SessionAuthGuard)
export class TasksController {
  constructor(@Inject(TasksService) private readonly tasks: TasksService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListTasksQueryDto,
  ) {
    return this.tasks.list(user, query);
  }
  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.tasks.findOne(user, id);
  }
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTaskDto) {
    return this.tasks.create(user, dto);
  }
  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(user, id, dto);
  }
  @Delete(":id")
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.tasks.remove(user, id);
  }
}
