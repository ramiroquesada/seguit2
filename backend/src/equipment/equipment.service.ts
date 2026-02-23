import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto, UpdateEquipmentDto, QueryEquipmentDto } from './equipment.dto';
import { EquipmentStatus, HistoryAction } from '@prisma/client';

const EQUIPMENT_SELECT = {
  id: true,
  code: true,
  type: true,
  brand: true,
  model: true,
  serial: true,
  status: true,
  specs: true,
  notes: true,
  acquiredAt: true,
  createdAt: true,
  updatedAt: true,
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
  constructor(private prisma: PrismaService) {}

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
        ...(isNaN(numVal) ? [] : [{ code: numVal }]),
      ];
    }

    if (q.type) where.type = q.type;
    if (q.status) where.status = q.status;

    if (q.officeId) {
      where.officeId = q.officeId;
    } else if (q.sectionId) {
      where.office = { sectionId: +q.sectionId };
    } else if (q.cityId) {
      where.office = { section: { cityId: +q.cityId } };
    }

    // build orderBy
    const validSortFields = ['code', 'type', 'brand', 'model', 'status', 'createdAt', 'updatedAt', 'acquiredAt'];
    const sortBy = validSortFields.includes(q.sortBy ?? '') ? q.sortBy! : 'code';
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
      this.prisma.equipment.groupBy({ by: ['type'], _count: { _all: true } } as any),
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
    const byTypeMap = Object.fromEntries(
      (byType as any[]).map((t) => [t.type, t._count?._all ?? 0]),
    );

    // newest items
    const newest = await this.prisma.equipment.findMany({
      take: newestLimit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, code: true, type: true, brand: true, model: true, status: true, createdAt: true },
    });

    return { total, byStatus: byStatusMap, byType: byTypeMap, newest };
  }

  async create(dto: CreateEquipmentDto, userId: number) {
    const existing = await this.prisma.equipment.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`El código ${dto.code} ya existe`);

    const equipment = await this.prisma.equipment.create({
      data: {
        code: dto.code,
        type: dto.type,
        brand: dto.brand,
        model: dto.model,
        serial: dto.serial,
        status: dto.status ?? EquipmentStatus.ACTIVE,
        officeId: dto.officeId,
        specs: dto.specs ?? {},
        notes: dto.notes,
        acquiredAt: dto.acquiredAt ? new Date(dto.acquiredAt) : undefined,
      },
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

    // detect meaningful changes for auto-history
    const historyItems: { action: HistoryAction; description: string; extra?: object }[] = [];

    if (dto.status && dto.status !== current.status) {
      historyItems.push({
        action: HistoryAction.STATUS_CHANGE,
        description: `Estado cambiado de ${current.status} a ${dto.status}`,
      });
    }

    if (dto.officeId !== undefined && dto.officeId !== (current.office?.id ?? null)) {
      historyItems.push({
        action: HistoryAction.TRANSFER,
        description: `Traslado de oficina`,
        extra: { fromOfficeId: current.office?.id ?? undefined, toOfficeId: dto.officeId },
      });
    }

    const updated = await this.prisma.equipment.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.brand && { brand: dto.brand }),
        ...(dto.model && { model: dto.model }),
        ...(dto.serial !== undefined && { serial: dto.serial }),
        ...(dto.status && { status: dto.status }),
        ...(dto.officeId !== undefined && { officeId: dto.officeId }),
        ...(dto.specs !== undefined && { specs: dto.specs }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.acquiredAt && { acquiredAt: new Date(dto.acquiredAt) }),
      },
      select: EQUIPMENT_SELECT,
    });

    // create auto history entries
    for (const h of historyItems) {
      await this.prisma.equipmentHistory.create({
        data: {
          equipmentId: id,
          action: h.action,
          description: h.description,
          userId,
          ...(h.extra ?? {}),
        },
      });
    }

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.equipment.delete({ where: { id } });
  }

  async getNextCode() {
    const last = await this.prisma.equipment.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    return { nextCode: (last?.code ?? 1999) + 1 };
  }
}
