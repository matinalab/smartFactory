import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area, Device, Connection } from '../../database/entities';

@Injectable()
export class FactoryService {
  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}

  /**
   * 获取完整工厂数据（聚合接口）
   * 返回areas、devices和connections
   */
  async getCompleteFactoryData() {
    // 获取所有区域及其设备
    const areas = await this.areaRepository.find({
      relations: ['devices'],
      order: {
        id: 'ASC',
      },
    });

    // 获取所有连接
    const connections = await this.connectionRepository.find({
      order: {
        id: 'ASC',
      },
    });

    // 转换为前端需要的格式
    const formattedAreas = areas.map(area => ({
      id: area.id,
      name: area.name,
      type: area.type,
      gridX: parseFloat(area.gridX.toString()),
      gridY: parseFloat(area.gridY.toString()),
      gridWidth: parseFloat(area.gridWidth.toString()),
      gridHeight: parseFloat(area.gridHeight.toString()),
      devices: area.devices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        status: device.status,
        gridX: parseFloat(device.gridX.toString()),
        gridY: parseFloat(device.gridY.toString()),
        efficiency: device.efficiency,
        temperature: parseFloat(device.temperature.toString()),
      })),
    }));

    const formattedConnections = connections.map(conn => ({
      from: conn.fromAreaId,
      to: conn.toAreaId,
      type: conn.type,
      component: {
        type: conn.componentType,
        status: conn.componentStatus,
        name: conn.componentName,
        id: conn.componentId,
      },
    }));

    return {
      areas: formattedAreas,
      connections: formattedConnections,
    };
  }
}

