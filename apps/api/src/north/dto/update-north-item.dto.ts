import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { NorthItemStatus } from "../../generated/prisma/enums.js";

export class UpdateNorthItemDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(160) title?: string;
  @IsOptional() @IsString() @MaxLength(2_000) description?: string | null;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_080)
  plannedMinutes?: number | null;
  @IsOptional() @Type(() => Date) @IsDate() scheduledDate?: Date | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) position?: number;
  @IsOptional() @IsEnum(NorthItemStatus) status?: NorthItemStatus;
}
