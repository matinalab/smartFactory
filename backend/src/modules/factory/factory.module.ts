import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactoryController } from './factory.controller';
import { FactoryService } from './factory.service';
import { Area, Device, Connection } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Area, Device, Connection])],
  controllers: [FactoryController],
  providers: [FactoryService],
})
export class FactoryModule {}

