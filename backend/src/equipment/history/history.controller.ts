import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './history.dto';

@Controller('equipment/:equipmentId/history')
@UseGuards(AuthGuard('jwt'))
export class HistoryController {
  constructor(private svc: HistoryService) {}

  @Get()
  getByEquipment(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.svc.getByEquipment(equipmentId);
  }

  @Post()
  create(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @Body() dto: CreateHistoryDto,
    @Request() req: any,
  ) {
    return this.svc.create(equipmentId, dto, req.user.id);
  }
}
