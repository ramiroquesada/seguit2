import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHistoryDto } from './history.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getByEquipment(equipmentId: number) {
    const eq = await this.prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!eq) throw new NotFoundException('Equipo no encontrado');

    return this.prisma.equipmentHistory.findMany({
      where: { equipmentId },
      orderBy: { date: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, username: true } },
        fromOffice: { select: { id: true, name: true } },
        toOffice: { select: { id: true, name: true } },
      },
    });
  }

  async create(equipmentId: number, dto: CreateHistoryDto, userId: number) {
    const eq = await this.prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!eq) throw new NotFoundException('Equipo no encontrado');

    return this.prisma.equipmentHistory.create({
      data: {
        equipmentId,
        action: dto.action,
        description: dto.description,
        fromOfficeId: dto.fromOfficeId,
        toOfficeId: dto.toOfficeId,
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: {
        user: { select: { id: true, fullName: true, username: true } },
        fromOffice: { select: { id: true, name: true } },
        toOffice: { select: { id: true, name: true } },
      },
    });
  }
}
