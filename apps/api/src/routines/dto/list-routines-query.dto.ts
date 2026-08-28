import { IsBooleanString, IsOptional } from "class-validator";
export class ListRoutinesQueryDto {
  @IsOptional() @IsBooleanString() active?: string;
}
