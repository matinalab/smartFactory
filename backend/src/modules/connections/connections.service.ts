import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from '../../database/entities';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}

  async findAll() {
    return this.connectionRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const connection = await this.connectionRepository.findOne({
      where: { id },
    });
    
    if (!connection) {
      throw new NotFoundException(`连接 ${id} 未找到`);
    }
    
    return connection;
  }

  async create(createConnectionDto: any) {
    const connection = this.connectionRepository.create(createConnectionDto);
    return this.connectionRepository.save(connection);
  }

  async update(id: number, updateConnectionDto: any) {
    const connection = await this.findOne(id);
    Object.assign(connection, updateConnectionDto);
    return this.connectionRepository.save(connection);
  }

  async remove(id: number) {
    const connection = await this.findOne(id);
    await this.connectionRepository.remove(connection);
    return { message: `连接 ${id} 已删除` };
  }
}

