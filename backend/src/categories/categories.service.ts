import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { equipment: true, equipmentModels: true }
                }
            }
        });
    }

    async findOne(id: number) {
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        return cat;
    }

    async create(dto: CreateCategoryDto) {
        try {
            return await this.prisma.category.create({ data: dto });
        } catch (e) {
            if (e.code === 'P2002') throw new ConflictException('Ya existe una categoría con ese nombre');
            throw e;
        }
    }

    async update(id: number, dto: UpdateCategoryDto) {
        try {
            return await this.prisma.category.update({
                where: { id },
                data: dto,
            });
        } catch (e) {
            if (e.code === 'P2025') throw new NotFoundException('Categoría no encontrada');
            if (e.code === 'P2002') throw new ConflictException('Ya existe una categoría con ese nombre');
            throw e;
        }
    }

    async remove(id: number) {
        const cat = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: { select: { equipment: true, equipmentModels: true } }
            }
        });

        if (!cat) throw new NotFoundException('Categoría no encontrada');
        if (cat._count.equipment > 0 || cat._count.equipmentModels > 0) {
            throw new BadRequestException('No se puede eliminar una categoría que tiene equipos o modelos asociados');
        }

        return this.prisma.category.delete({ where: { id } });
    }
}
