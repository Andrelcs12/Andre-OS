import { IsDateString } from "class-validator";
export class AnalyticsRangeQueryDto {
  @IsDateString() from!: string;
  @IsDateString() to!: string;
}
