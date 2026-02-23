import { IsString, IsEnum, IsInt, IsOptional, IsDateString } from 'class-validator';
import { HistoryAction } from '@prisma/client';

export class CreateHistoryDto {
  @IsEnum(HistoryAction)
  action: HistoryAction;

  @IsString()
  description: string;

  @IsInt()
  @IsOptional()
  fromOfficeId?: number;

  @IsInt()
  @IsOptional()
  toOfficeId?: number;

  @IsDateString()
  @IsOptional()
  date?: string;
}
