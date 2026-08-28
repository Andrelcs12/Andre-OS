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

export class UpdateLinkDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsUrl({ protocols: ["http", "https"], require_protocol: true })
  @MaxLength(2_000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  description?: string | null;

  @IsOptional()
  @IsEnum(Area)
  area?: Area | null;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
