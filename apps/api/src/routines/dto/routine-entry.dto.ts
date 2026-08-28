import { IsBoolean } from "class-validator";
export class RoutineEntryDto {
  @IsBoolean() completed!: boolean;
}
