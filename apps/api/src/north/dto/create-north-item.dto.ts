import { Type } from "class-transformer";
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateNorthItemDto {
  @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(2_000) description?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_080)
  plannedMinutes?: number;
  @IsOptional() @Type(() => Date) @IsDate() scheduledDate?: Date;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) position?: number;
}
