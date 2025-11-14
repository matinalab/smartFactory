import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceLog } from '../../database/entities';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(DeviceLog)
    private deviceLogRepository: Repository<DeviceLog>,
  ) {}

  async findAll() {
    return this.deviceRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: string) {
    const device = await this.deviceRepository.findOne({
      where: { id },
    });
    
    if (!device) {
      throw new NotFoundException(`设备 ${id} 未找到`);
    }
    
    return device;
  }

  async create(createDeviceDto: any) {
    const device = this.deviceRepository.create(createDeviceDto);
    return this.deviceRepository.save(device);
  }

  async update(id: string, updateDeviceDto: any) {
    const device = await this.findOne(id);
    Object.assign(device, updateDeviceDto);
    return this.deviceRepository.save(device);
  }

  async remove(id: string) {
    const device = await this.findOne(id);
    await this.deviceRepository.remove(device);
    return { message: `设备 ${id} 已删除` };
  }

  /**
   * 控制设备（启动/停止/重启）
   */
  async controlDevice(id: string, action: string) {
    const device = await this.findOne(id);
    const oldStatus = device.status;
    let newStatus = oldStatus;

    switch (action) {
      case 'start':
        newStatus = 'running';
        break;
      case 'stop':
        newStatus = 'idle';
        break;
      case 'restart':
        newStatus = 'idle';
        // 保存日志
        await this.createDeviceLog(id, action, oldStatus, newStatus);
        await this.deviceRepository.save({ ...device, status: newStatus });
        
        // 1秒后自动启动
        setTimeout(async () => {
          const currentDevice = await this.deviceRepository.findOne({ where: { id } });
          if (currentDevice) {
            currentDevice.status = 'running';
            await this.deviceRepository.save(currentDevice);
            await this.createDeviceLog(id, 'auto_start_after_restart', 'idle', 'running');
          }
        }, 1000);
        
        return { message: `设备 ${id} 正在重启...`, status: newStatus };
      default:
        throw new Error(`不支持的操作: ${action}`);
    }

    device.status = newStatus;
    await this.deviceRepository.save(device);
    
    // 记录日志
    await this.createDeviceLog(id, action, oldStatus, newStatus);

    return { message: `设备 ${id} 已${action === 'start' ? '启动' : '停止'}`, status: newStatus };
  }

  /**
   * 创建设备操作日志
   */
  private async createDeviceLog(deviceId: string, action: string, oldStatus: string, newStatus: string) {
    const log = this.deviceLogRepository.create({
      deviceId,
      action,
      oldStatus,
      newStatus,
    });
    await this.deviceLogRepository.save(log);
  }

  /**
   * 获取设备日志
   */
  async getDeviceLogs(id: string) {
    const logs = await this.deviceLogRepository.find({
      where: { deviceId: id },
      order: { createdAt: 'DESC' },
      take: 50, // 最近50条
    });
    return logs;
  }
}

