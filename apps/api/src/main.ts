import "reflect-metadata";

import fastifyCookie from "@fastify/cookie";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import type { FastifyPluginAsync } from "fastify";

import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const config = app.get(ConfigService);
  const webUrl = config.get<string>("WEB_URL") ?? "http://localhost:3000";

  await app.register(fastifyCookie as unknown as FastifyPluginAsync);
  app.enableCors({ origin: webUrl, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen({
    port: Number(config.get("PORT") ?? 3001),
    host: "0.0.0.0",
  });
}

void bootstrap();
