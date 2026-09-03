import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Area } from "../../generated/prisma/enums.js";

export class ManualTimeEntryDto {
  @IsOptional() @IsUUID() taskId?: string | null;
  @IsOptional() @IsUUID() northItemId?: string | null;
  @IsOptional() @IsUUID() routineId?: string | null;
  @IsOptional() @IsString() @MaxLength(500) description?: string | null;
  @IsOptional() @IsString() @MaxLength(2000) note?: string | null;
  @IsOptional() @IsEnum(Area) area?: Area | null;
  @Type(() => Date) @IsDate() startedAt!: Date;
  @Type(() => Number) @IsInt() @Min(1) @Max(1440) durationMinutes!: number;
}
