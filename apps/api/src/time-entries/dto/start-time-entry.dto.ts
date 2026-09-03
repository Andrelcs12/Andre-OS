import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Area, TimeEntryMode } from "../../generated/prisma/enums.js";
export class StartTimeEntryDto {
  @IsOptional() @IsUUID() taskId?: string;
  @IsOptional() @IsUUID() northItemId?: string;
  @IsOptional() @IsUUID() routineId?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsEnum(Area) area?: Area;
  @IsOptional() @IsEnum(TimeEntryMode) mode?: TimeEntryMode;
  @IsOptional() @IsInt() @Min(1) @Max(120) focusMinutes?: number;
}
