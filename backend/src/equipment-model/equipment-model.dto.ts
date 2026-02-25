import { IsString, IsEnum, IsObject, IsOptional, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEquipmentModelDto {
    @IsString()
    name: string;

    @IsInt()
    categoryId: number;

    @IsString()
    brand: string;

    @IsString()
    modelName: string;

    @IsObject()
    specs: Record<string, any>;
}

export class UpdateEquipmentModelDto extends PartialType(CreateEquipmentModelDto) { }
