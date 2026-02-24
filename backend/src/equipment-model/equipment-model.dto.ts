import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { EquipmentType } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEquipmentModelDto {
    @IsString()
    name: string;

    @IsEnum(EquipmentType)
    type: EquipmentType;

    @IsString()
    brand: string;

    @IsString()
    modelName: string;

    @IsObject()
    specs: Record<string, any>;
}

export class UpdateEquipmentModelDto extends PartialType(CreateEquipmentModelDto) { }
