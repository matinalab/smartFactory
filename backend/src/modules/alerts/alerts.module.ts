import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertGeneratorService } from './alert-generator.service';
import { AlertsGateway } from './alerts.gateway';
import { Alert } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  controllers: [AlertsController],
  providers: [AlertsService, AlertGeneratorService, AlertsGateway],
  exports: [AlertsService, AlertGeneratorService, AlertsGateway],
})
export class AlertsModule {}
