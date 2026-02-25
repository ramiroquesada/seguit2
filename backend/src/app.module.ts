import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigLocationsModule } from './config-locations/config-locations.module';
import { EquipmentModule } from './equipment/equipment.module';
import { EquipmentModelModule } from './equipment-model/equipment-model.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    ConfigLocationsModule,
    EquipmentModule,
    EquipmentModelModule,
    CategoriesModule,
  ],
})
export class AppModule { }
