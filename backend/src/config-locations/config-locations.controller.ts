import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ConfigLocationsService } from './config-locations.service';
import { CreateCityDto, CreateSectionDto, CreateOfficeDto, UpdateCityDto, UpdateSectionDto, UpdateOfficeDto, MergeOfficesDto } from './config-locations.dto';

@Controller('config')
@UseGuards(AuthGuard('jwt'))
export class ConfigLocationsController {
  constructor(private svc: ConfigLocationsService) { }

  // ── Cities
  @Get('cities')
  getCities() { return this.svc.getCities(); }

  @Post('cities')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  createCity(@Body() dto: CreateCityDto) { return this.svc.createCity(dto); }

  @Patch('cities/:id')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  updateCity(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCityDto) {
    return this.svc.updateCity(id, dto.name);
  }

  @Delete('cities/:id')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  deleteCity(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteCity(id); }

  // ── Sections
  @Get('sections')
  getSections(@Query('cityId') cityId?: string) {
    return this.svc.getSections(cityId ? +cityId : undefined);
  }

  @Post('sections')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  createSection(@Body() dto: CreateSectionDto) { return this.svc.createSection(dto); }

  @Patch('sections/:id')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  updateSection(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    return this.svc.updateSection(id, dto.name, dto.cityId);
  }

  @Delete('sections/:id')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  deleteSection(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteSection(id); }

  // ── Offices
  @Get('offices')
  getOffices(@Query('sectionId') sectionId?: string) {
    return this.svc.getOffices(sectionId ? +sectionId : undefined);
  }

  @Post('offices')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  createOffice(@Body() dto: CreateOfficeDto) { return this.svc.createOffice(dto); }

  @Patch('offices/:id')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  updateOffice(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOfficeDto) {
    return this.svc.updateOffice(id, dto.name, dto.sectionId);
  }

  @Delete('offices/:id')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  deleteOffice(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOffice(id); }

  @Post('offices/merge')
  @UseGuards(RolesGuard) @Roles('ROOT', 'TECHNICIAN')
  mergeOffices(@Body() dto: MergeOfficesDto) {
    return this.svc.mergeOffices(dto.targetId, dto.sourceIds);
  }
}
