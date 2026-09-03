import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { Area, RoutineSchedule } from "../../generated/prisma/enums.js";

export class UpdateRoutineDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;
  @IsOptional()
  @IsEnum(Area)
  area?: Area | null;
  @IsOptional()
  @IsEnum(RoutineSchedule)
  schedule?: RoutineSchedule;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  targetMinutes?: number | null;
}
