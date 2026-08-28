import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export enum HistoryEventType {
  TASK_COMPLETED = "TASK_COMPLETED",
  ROUTINE_COMPLETED = "ROUTINE_COMPLETED",
  TIME_ENTRY = "TIME_ENTRY",
}

export class ListHistoryQueryDto {
  @IsOptional()
  @IsEnum(HistoryEventType)
  type?: HistoryEventType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
