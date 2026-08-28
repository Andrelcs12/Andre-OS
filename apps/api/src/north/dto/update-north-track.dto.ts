import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Area, NorthTrackStatus } from "../../generated/prisma/enums.js";

export class UpdateNorthTrackDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(2_000) description?: string | null;
  @IsOptional() @IsEnum(Area) area?: Area | null;
  @IsOptional() @Type(() => Date) @IsDate() targetDate?: Date | null;
  @IsOptional() @IsEnum(NorthTrackStatus) status?: NorthTrackStatus;
}
