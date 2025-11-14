import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { databaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreasModule } from './modules/areas/areas.module';
import { DevicesModule } from './modules/devices/devices.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { StatsModule } from './modules/stats/stats.module';
import { FactoryModule } from './modules/factory/factory.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig),
    AreasModule,
    DevicesModule,
    ConnectionsModule,
    AlertsModule,
    StatsModule,
    FactoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

