import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto, CreateSectionDto, CreateOfficeDto } from './config-locations.dto';

@Injectable()
export class ConfigLocationsService {
  constructor(private prisma: PrismaService) {}

  // ── CITIES ──────────────────────────────────────────────────────────────
  getCities() {
    return this.prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: { sections: { include: { offices: true } } },
    });
  }

  createCity(dto: CreateCityDto) {
    return this.prisma.city.create({ data: { name: dto.name } });
  }

  updateCity(id: number, name: string) {
    return this.prisma.city.update({ where: { id }, data: { name } });
  }

  async deleteCity(id: number) {
    const sections = await this.prisma.section.count({ where: { cityId: id } });
    if (sections > 0) throw new BadRequestException('La ciudad tiene secciones asociadas');
    return this.prisma.city.delete({ where: { id } });
  }

  // ── SECTIONS ─────────────────────────────────────────────────────────────
  getSections(cityId?: number) {
    return this.prisma.section.findMany({
      where: cityId ? { cityId } : undefined,
      orderBy: { name: 'asc' },
      include: { city: true, offices: true },
    });
  }

  createSection(dto: CreateSectionDto) {
    return this.prisma.section.create({
      data: { name: dto.name, cityId: dto.cityId },
      include: { city: true },
    });
  }

  updateSection(id: number, name: string) {
    return this.prisma.section.update({ where: { id }, data: { name } });
  }

  async deleteSection(id: number) {
    const offices = await this.prisma.office.count({ where: { sectionId: id } });
    if (offices > 0) throw new BadRequestException('La sección tiene oficinas asociadas');
    return this.prisma.section.delete({ where: { id } });
  }

  // ── OFFICES ──────────────────────────────────────────────────────────────
  getOffices(sectionId?: number) {
    return this.prisma.office.findMany({
      where: sectionId ? { sectionId } : undefined,
      orderBy: { name: 'asc' },
      include: { section: { include: { city: true } } },
    });
  }

  createOffice(dto: CreateOfficeDto) {
    return this.prisma.office.create({
      data: { name: dto.name, sectionId: dto.sectionId },
      include: { section: { include: { city: true } } },
    });
  }

  updateOffice(id: number, name: string) {
    return this.prisma.office.update({ where: { id }, data: { name } });
  }

  async deleteOffice(id: number) {
    const equipment = await this.prisma.equipment.count({ where: { officeId: id } });
    if (equipment > 0) throw new BadRequestException('La oficina tiene equipos asignados');
    return this.prisma.office.delete({ where: { id } });
  }
}
