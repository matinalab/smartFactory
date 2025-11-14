import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from '../../database/entities';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
  ) {}

  async findAll() {
    const areas = await this.areaRepository.find({
      relations: ['devices'],
      order: { id: 'ASC' },
    });
    return areas;
  }

  async findOne(id: string) {
    const area = await this.areaRepository.findOne({
      where: { id },
      relations: ['devices'],
    });
    
    if (!area) {
      throw new NotFoundException(`区域 ${id} 未找到`);
    }
    
    return area;
  }

  async create(createAreaDto: any) {
    const area = this.areaRepository.create(createAreaDto);
    return this.areaRepository.save(area);
  }

  async update(id: string, updateAreaDto: any) {
    const area = await this.findOne(id);
    Object.assign(area, updateAreaDto);
    return this.areaRepository.save(area);
  }

  async remove(id: string) {
    const area = await this.findOne(id);
    await this.areaRepository.remove(area);
    return { message: `区域 ${id} 已删除` };
  }
}

