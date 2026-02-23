import { Module } from '@nestjs/common';
import { ConfigLocationsService } from './config-locations.service';
import { ConfigLocationsController } from './config-locations.controller';

@Module({
  controllers: [ConfigLocationsController],
  providers: [ConfigLocationsService],
})
export class ConfigLocationsModule {}
