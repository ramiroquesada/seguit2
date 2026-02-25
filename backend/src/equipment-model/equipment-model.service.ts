import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentModelDto, UpdateEquipmentModelDto } from './equipment-model.dto';

@Injectable()
export class EquipmentModelService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.equipmentModel.findMany({
            orderBy: { name: 'asc' },
            include: { category: true }
        });
    }

    async findOne(id: number) {
        const model = await this.prisma.equipmentModel.findUnique({
            where: { id },
            include: { category: true }
        });
        if (!model) throw new NotFoundException('Modelo no encontrado');
        return model;
    }

    async create(dto: CreateEquipmentModelDto) {
        const exists = await this.prisma.equipmentModel.findUnique({ where: { name: dto.name } });
        if (exists) throw new BadRequestException('Ya existe un modelo con ese nombre');

        return this.prisma.equipmentModel.create({
            data: {
                name: dto.name,
                categoryId: dto.categoryId,
                brand: dto.brand,
                modelName: dto.modelName,
                specs: dto.specs,
            }
        });
    }

    async update(id: number, dto: UpdateEquipmentModelDto) {
        await this.findOne(id);
        return this.prisma.equipmentModel.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.categoryId && { categoryId: dto.categoryId }),
                ...(dto.brand && { brand: dto.brand }),
                ...(dto.modelName && { modelName: dto.modelName }),
                ...(dto.specs && { specs: dto.specs }),
            }
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        // Check if any equipment is using this model
        const count = await this.prisma.equipment.count({ where: { modelId: id } });
        if (count > 0) throw new BadRequestException('No se puede eliminar el modelo porque hay equipos vinculados a él');

        return this.prisma.equipmentModel.delete({ where: { id } });
    }
}
