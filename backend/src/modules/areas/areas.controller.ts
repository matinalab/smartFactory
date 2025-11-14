import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AreasService } from './areas.service';
import { ApiResponse } from '../../common/response.dto';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.areasService.findAll();
      return ApiResponse.success(data, '获取区域列表成功');
    } catch (error) {
      return ApiResponse.error('获取区域列表失败: ' + error.message, 500);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.areasService.findOne(id);
      return ApiResponse.success(data, '获取区域详情成功');
    } catch (error) {
      return ApiResponse.error('获取区域详情失败: ' + error.message, 404);
    }
  }

  @Post()
  async create(@Body() createAreaDto: any) {
    try {
      const data = await this.areasService.create(createAreaDto);
      return ApiResponse.success(data, '创建区域成功');
    } catch (error) {
      return ApiResponse.error('创建区域失败: ' + error.message, 500);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAreaDto: any) {
    try {
      const data = await this.areasService.update(id, updateAreaDto);
      return ApiResponse.success(data, '更新区域成功');
    } catch (error) {
      return ApiResponse.error('更新区域失败: ' + error.message, 500);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const data = await this.areasService.remove(id);
      return ApiResponse.success(data, '删除区域成功');
    } catch (error) {
      return ApiResponse.error('删除区域失败: ' + error.message, 500);
    }
  }
}

