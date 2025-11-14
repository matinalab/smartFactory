import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { ApiResponse } from '../../common/response.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.devicesService.findAll();
      return ApiResponse.success(data, '获取设备列表成功');
    } catch (error) {
      return ApiResponse.error('获取设备列表失败: ' + error.message, 500);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.devicesService.findOne(id);
      return ApiResponse.success(data, '获取设备详情成功');
    } catch (error) {
      return ApiResponse.error('获取设备详情失败: ' + error.message, 404);
    }
  }

  @Post()
  async create(@Body() createDeviceDto: any) {
    try {
      const data = await this.devicesService.create(createDeviceDto);
      return ApiResponse.success(data, '创建设备成功');
    } catch (error) {
      return ApiResponse.error('创建设备失败: ' + error.message, 500);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDeviceDto: any) {
    try {
      const data = await this.devicesService.update(id, updateDeviceDto);
      return ApiResponse.success(data, '更新设备成功');
    } catch (error) {
      return ApiResponse.error('更新设备失败: ' + error.message, 500);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const data = await this.devicesService.remove(id);
      return ApiResponse.success(data, '删除设备成功');
    } catch (error) {
      return ApiResponse.error('删除设备失败: ' + error.message, 500);
    }
  }

  @Post(':id/control')
  async control(@Param('id') id: string, @Body() controlDto: { action: string }) {
    try {
      const data = await this.devicesService.controlDevice(id, controlDto.action);
      return ApiResponse.success(data, `设备${controlDto.action}操作成功`);
    } catch (error) {
      return ApiResponse.error('设备控制失败: ' + error.message, 500);
    }
  }

  @Get(':id/logs')
  async getLogs(@Param('id') id: string) {
    try {
      const data = await this.devicesService.getDeviceLogs(id);
      return ApiResponse.success(data, '获取设备日志成功');
    } catch (error) {
      return ApiResponse.error('获取设备日志失败: ' + error.message, 500);
    }
  }
}

