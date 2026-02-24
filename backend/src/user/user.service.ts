import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (exists) throw new BadRequestException('Ese nombre de usuario ya existe');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        username: dto.username,
        fullName: dto.fullName,
        email: dto.email,
        role: dto.role ?? 'TECHNICIAN',
        passwordHash,
      },
      select: { id: true, username: true, fullName: true, email: true, role: true, active: true, createdAt: true },
    });
  }

  async update(id: number, dto: UpdateUserDto, currentUserId: number) {
    const user = await this.findOne(id);

    // Prevent lockout: if trying to deactivate or change role of a ROOT user
    if (user.role === 'ROOT' && (dto.active === false || (dto.role && dto.role !== 'ROOT'))) {
      const activeRoots = await this.prisma.user.count({
        where: { role: 'ROOT', active: true }
      });
      if (activeRoots <= 1) {
        throw new BadRequestException('No podés desactivar o cambiar el rol del último administrador ROOT activo');
      }
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.role && { role: dto.role }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(passwordHash && { passwordHash }),
      },
      select: { id: true, username: true, fullName: true, email: true, role: true, active: true, createdAt: true },
    });
  }

  async remove(id: number, currentUserId: number) {
    if (id === currentUserId) throw new BadRequestException('No podés eliminar tu propio usuario');
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
