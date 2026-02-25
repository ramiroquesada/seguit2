import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto, UpdateEquipmentDto, QueryEquipmentDto } from './equipment.dto';
import { EquipmentStatus, HistoryAction } from '@prisma/client';

const EQUIPMENT_SELECT = {
  id: true,
  number: true,
  categoryId: true,
  category: { select: { id: true, name: true } },
  brand: true,
  model: true,
  serial: true,
  status: true,
  specs: true,
  notes: true,
  acquiredAt: true,
  createdAt: true,
  updatedAt: true,
  equipmentModel: {
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: { select: { id: true, name: true } },
      brand: true,
      modelName: true,
      specs: true,
    },
  },
  office: {
    select: {
      id: true,
      name: true,
      section: {
        select: {
          id: true,
          name: true,
          city: { select: { id: true, name: true } },
        },
      },
    },
  },
};

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) { }

  async findAll(q: QueryEquipmentDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const skip = (page - 1) * limit;

    // build where
    const where: any = {};

    if (q.search) {
      const s = q.search.trim();
      const numVal = parseInt(s, 10);
      where.OR = [
        { brand: { contains: s, mode: 'insensitive' } },
        { model: { contains: s, mode: 'insensitive' } },
        { serial: { contains: s, mode: 'insensitive' } },
        { notes: { contains: s, mode: 'insensitive' } },
        ...(isNaN(numVal) ? [] : [{ number: numVal }]),
      ];
    }

    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.status) where.status = q.status;

    if (q.officeId) {
      where.officeId = q.officeId;
    } else if (q.sectionId) {
      where.office = { sectionId: +q.sectionId };
    } else if (q.cityId) {
      where.office = { section: { cityId: +q.cityId } };
    }

    // build orderBy
    const validSortFields = ['id', 'number', 'categoryId', 'brand', 'model', 'status', 'createdAt', 'updatedAt', 'acquiredAt'];
    const sortBy = validSortFields.includes(q.sortBy ?? '') ? q.sortBy! : 'number';
    const order = q.order === 'desc' ? 'desc' : 'asc';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.equipment.findMany({
        where,
        select: EQUIPMENT_SELECT,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      this.prisma.equipment.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const eq = await this.prisma.equipment.findUnique({
      where: { id },
      select: EQUIPMENT_SELECT,
    });
    if (!eq) throw new NotFoundException('Equipo no encontrado');
    return eq;
  }

  async getStats(newestLimit: number = 5) {
    const [total, byStatus, byType, byCity] = await this.prisma.$transaction([
      this.prisma.equipment.count(),
      this.prisma.equipment.groupBy({ by: ['status'], _count: { _all: true } } as any),
      this.prisma.equipment.groupBy({ by: ['categoryId'], _count: { _all: true } } as any),
      this.prisma.city.findMany({
        select: {
          name: true,
          _count: false,
          sections: {
            select: {
              offices: {
                select: { _count: { select: { equipment: true } } },
              },
            },
          },
        },
      }),
    ]);

    const byStatusMap = Object.fromEntries(
      (byStatus as any[]).map((s) => [s.status, s._count?._all ?? 0]),
    );
    const byCategoryMap = Object.fromEntries(
      (byType as any[]).map((t) => [t.categoryId, t._count?._all ?? 0]),
    );

    // newest items
    const newest = await this.prisma.equipment.findMany({
      take: newestLimit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, number: true, categoryId: true, category: { select: { name: true } }, brand: true, model: true, status: true, createdAt: true },
    });

    return { total, byStatus: byStatusMap, byCategory: byCategoryMap, newest };
  }

  async create(dto: CreateEquipmentDto, userId: number) {
    const existing = await this.prisma.equipment.findUnique({ where: { number: dto.number } });
    if (existing) throw new BadRequestException(`El número de equipo ${dto.number} ya existe`);

    const equipment = await this.prisma.equipment.create({
      data: {
        number: dto.number,
        categoryId: dto.categoryId,
        brand: dto.brand,
        model: dto.model,
        serial: dto.serial,
        status: dto.status ?? EquipmentStatus.ACTIVE,
        officeId: dto.officeId,
        modelId: dto.modelId,
        specs: dto.specs ?? {},
        notes: dto.notes,
        acquiredAt: dto.acquiredAt ? new Date(dto.acquiredAt) : undefined,
      } as any,
      select: EQUIPMENT_SELECT,
    });

    await this.prisma.equipmentHistory.create({
      data: {
        equipmentId: equipment.id,
        action: HistoryAction.CREATED,
        description: `Equipo registrado. ${dto.notes ?? ''}`.trim(),
        userId,
        toOfficeId: dto.officeId,
      },
    });

    return equipment;
  }

  async update(id: number, dto: UpdateEquipmentDto, userId: number) {
    const current = await this.findOne(id);

    const updated = await this.prisma.equipment.update({
      where: { id },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.brand && { brand: dto.brand }),
        ...(dto.model && { model: dto.model }),
        ...(dto.serial !== undefined && { serial: dto.serial }),
        ...(dto.status && { status: dto.status }),
        ...(dto.officeId !== undefined && { officeId: dto.officeId }),
        ...(dto.modelId !== undefined && { modelId: dto.modelId }),
        ...(dto.specs !== undefined && { specs: dto.specs }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.acquiredAt && { acquiredAt: new Date(dto.acquiredAt) }),
      } as any,
      select: EQUIPMENT_SELECT,
    });

    // Detect meaningful changes for auto-history
    if (dto.status && dto.status !== current.status) {
      let action: HistoryAction = HistoryAction.STATUS_CHANGE;
      let description = dto.historyDescription || `Estado cambiado de ${current.status} a ${dto.status}`;

      if (dto.status === EquipmentStatus.REPAIR) {
        action = HistoryAction.REPAIR_IN;
        if (!dto.historyDescription) description = 'Ingreso a reparación';
      } else if (current.status === EquipmentStatus.REPAIR && dto.status === EquipmentStatus.ACTIVE) {
        action = HistoryAction.REPAIR_OUT;
        if (!dto.historyDescription) description = 'Reparación finalizada - Equipo operativo';
      }

      await this.prisma.equipmentHistory.create({
        data: {
          equipmentId: id,
          action,
          description,
          userId,
        },
      });
    }

    if (dto.officeId !== undefined && dto.officeId !== ((current as any).office?.id ?? null)) {
      await this.prisma.equipmentHistory.create({
        data: {
          equipmentId: id,
          action: HistoryAction.TRANSFER,
          description: dto.historyDescription || `Traslado de oficina`,
          fromOfficeId: (current as any).office?.id ?? undefined,
          toOfficeId: dto.officeId,
          userId,
        },
      });
    } else if (dto.historyDescription && (!dto.status || dto.status === current.status)) {
      // Manual note or other update with description
      await this.prisma.equipmentHistory.create({
        data: {
          equipmentId: id,
          action: HistoryAction.NOTE,
          description: dto.historyDescription,
          userId,
        },
      });
    }

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.equipment.delete({ where: { id } });
  }

  async getNextId() {
    const last = await this.prisma.equipment.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    return { nextId: (last?.number ?? 1999) + 1 };
  }
}
