import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Request,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto, UpdateEquipmentDto, QueryEquipmentDto } from './equipment.dto';

@Controller('equipment')
@UseGuards(AuthGuard('jwt'))
export class EquipmentController {
  constructor(private svc: EquipmentService) {}

  @Get('stats')
  getStats(@Query('limit') limit?: number) { 
    return this.svc.getStats(limit ? +limit : 25); 
  }

  @Get('next-id')
  getNextId() { return this.svc.getNextId(); }

  @Get()
  findAll(@Query() q: QueryEquipmentDto) { return this.svc.findAll(q); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Post()
  create(@Body() dto: CreateEquipmentDto, @Request() req: any) {
    return this.svc.create(dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentDto,
    @Request() req: any,
  ) {
    return this.svc.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('ROOT')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
