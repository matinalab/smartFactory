import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Device } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}

