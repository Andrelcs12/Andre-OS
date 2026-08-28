import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { Area } from "../../generated/prisma/enums.js";
export class StartTimeEntryDto {
  @IsOptional() @IsUUID() taskId?: string;
  @IsOptional() @IsUUID() northItemId?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsEnum(Area) area?: Area;
}
