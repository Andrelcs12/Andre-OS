import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import { Area } from "../../generated/prisma/enums.js";

export class CreateLinkDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsUrl({ protocols: ["http", "https"], require_protocol: true })
  @MaxLength(2_000)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  description?: string;

  @IsOptional()
  @IsEnum(Area)
  area?: Area;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
