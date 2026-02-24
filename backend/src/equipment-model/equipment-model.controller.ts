import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EquipmentModelService } from './equipment-model.service';
import { CreateEquipmentModelDto, UpdateEquipmentModelDto } from './equipment-model.dto';

@Controller('equipment-models')
@UseGuards(AuthGuard('jwt'))
export class EquipmentModelController {
    constructor(private svc: EquipmentModelService) { }

    @Get()
    findAll() {
        return this.svc.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.svc.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('ROOT', 'TECHNICIAN')
    create(@Body() dto: CreateEquipmentModelDto) {
        return this.svc.create(dto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('ROOT', 'TECHNICIAN')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipmentModelDto) {
        return this.svc.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('ROOT', 'TECHNICIAN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.svc.remove(id);
    }
}
