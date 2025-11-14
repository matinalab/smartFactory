import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../database/entities';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  /**
   * 获取统计数据
   */
  async getStats() {
    const devices = await this.deviceRepository.find();
    
    const totalDevices = devices.length;
    const runningDevices = devices.filter(d => d.status === 'running').length;
    const errorDevices = devices.filter(d => d.status === 'error').length;
    const efficiency = totalDevices > 0 
      ? Math.round((runningDevices / totalDevices) * 100) 
      : 0;

    return {
      totalDevices,
      runningDevices,
      errorDevices,
      efficiency,
    };
  }
}

