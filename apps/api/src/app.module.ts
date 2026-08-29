import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalyticsModule } from "./analytics/analytics.module.js";

import { AuthModule } from "./auth/auth.module.js";
import { HealthModule } from "./health/health.module.js";
import { HistoryModule } from "./history/history.module.js";
import { LinksModule } from "./links/links.module.js";
import { NorthModule } from "./north/north.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { RoutinesModule } from "./routines/routines.module.js";
import { SearchModule } from "./search/search.module.js";
import { TasksModule } from "./tasks/tasks.module.js";
import { TimeEntriesModule } from "./time-entries/time-entries.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AnalyticsModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    TasksModule,
    RoutinesModule,
    SearchModule,
    LinksModule,
    NorthModule,
    TimeEntriesModule,
    HealthModule,
    HistoryModule,
  ],
})
export class AppModule {}
