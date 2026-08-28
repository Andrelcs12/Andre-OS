import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Area } from "../../generated/prisma/enums.js";

export class CreateNorthTrackDto {
  @IsString() @MinLength(1) @MaxLength(120) title!: string;
  @IsOptional() @IsString() @MaxLength(2_000) description?: string;
  @IsOptional() @IsEnum(Area) area?: Area;
  @IsOptional() @Type(() => Date) @IsDate() targetDate?: Date;
}
