import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { ApiResponse } from '../../common/response.dto';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.connectionsService.findAll();
      return ApiResponse.success(data, '获取连接列表成功');
    } catch (error) {
      return ApiResponse.error('获取连接列表失败: ' + error.message, 500);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.connectionsService.findOne(+id);
      return ApiResponse.success(data, '获取连接详情成功');
    } catch (error) {
      return ApiResponse.error('获取连接详情失败: ' + error.message, 404);
    }
  }

  @Post()
  async create(@Body() createConnectionDto: any) {
    try {
      const data = await this.connectionsService.create(createConnectionDto);
      return ApiResponse.success(data, '创建连接成功');
    } catch (error) {
      return ApiResponse.error('创建连接失败: ' + error.message, 500);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateConnectionDto: any) {
    try {
      const data = await this.connectionsService.update(+id, updateConnectionDto);
      return ApiResponse.success(data, '更新连接成功');
    } catch (error) {
      return ApiResponse.error('更新连接失败: ' + error.message, 500);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const data = await this.connectionsService.remove(+id);
      return ApiResponse.success(data, '删除连接成功');
    } catch (error) {
      return ApiResponse.error('删除连接失败: ' + error.message, 500);
    }
  }
}

