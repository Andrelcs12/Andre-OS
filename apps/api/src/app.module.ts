import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth/auth.module.js";
import { HealthModule } from "./health/health.module.js";
import { HistoryModule } from "./history/history.module.js";
import { LinksModule } from "./links/links.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { RoutinesModule } from "./routines/routines.module.js";
import { TasksModule } from "./tasks/tasks.module.js";
import { TimeEntriesModule } from "./time-entries/time-entries.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TasksModule,
    RoutinesModule,
    LinksModule,
    TimeEntriesModule,
    HealthModule,
    HistoryModule,
  ],
})
export class AppModule {}
