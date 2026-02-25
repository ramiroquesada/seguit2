import { IsString, IsInt, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';
import { EquipmentStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateEquipmentDto {
  @IsInt()
  number: number;

  @IsInt()
  categoryId: number;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  @IsOptional()
  serial?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsInt()
  @IsOptional()
  officeId?: number;

  @IsInt()
  @IsOptional()
  modelId?: number;

  @IsObject()
  @IsOptional()
  specs?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  acquiredAt?: string;
}

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {
  @IsString()
  @IsOptional()
  historyDescription?: string;
}

export class QueryEquipmentDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsOptional()
  @Type(() => Number)
  cityId?: number;

  @IsOptional()
  @Type(() => Number)
  sectionId?: number;

  @IsOptional()
  @Type(() => Number)
  officeId?: number;

  @IsString()
  @IsOptional()
  sortBy?: string = 'number';

  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
