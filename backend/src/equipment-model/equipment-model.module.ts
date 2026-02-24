import { Module } from '@nestjs/common';
import { EquipmentModelService } from './equipment-model.service';
import { EquipmentModelController } from './equipment-model.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [EquipmentModelService],
    controllers: [EquipmentModelController],
    exports: [EquipmentModelService],
})
export class EquipmentModelModule { }
