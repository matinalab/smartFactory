import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertGeneratorService } from './alert-generator.service';
import { ApiResponse } from '../../common/response.dto';

@Controller('alerts')
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly alertGeneratorService: AlertGeneratorService,
  ) {}

  @Get()
  async findAll() {
    try {
      const data = await this.alertsService.findAll();
      return ApiResponse.success(data, '获取告警列表成功');
    } catch (error) {
      return ApiResponse.error('获取告警列表失败: ' + error.message, 500);
    }
  }

  @Get('recent')
  async findRecentAlerts() {
    try {
      const data = await this.alertsService.findRecentAlerts();
      return ApiResponse.success(data, '获取最近告警成功');
    } catch (error) {
      return ApiResponse.error('获取最近告警失败: ' + error.message, 500);
    }
  }

  @Get('stats')
  async getAlertStats() {
    try {
      const data = await this.alertsService.getAlertStats();
      return ApiResponse.success(data, '获取告警统计成功');
    } catch (error) {
      return ApiResponse.error('获取告警统计失败: ' + error.message, 500);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.alertsService.findOne(+id);
      return ApiResponse.success(data, '获取告警详情成功');
    } catch (error) {
      return ApiResponse.error('获取告警详情失败: ' + error.message, 404);
    }
  }

  @Post()
  async create(@Body() createAlertDto: any) {
    try {
      const data = await this.alertsService.create(createAlertDto);
      return ApiResponse.success(data, '创建告警成功');
    } catch (error) {
      return ApiResponse.error('创建告警失败: ' + error.message, 500);
    }
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    try {
      const data = await this.alertsService.markAsRead(+id);
      return ApiResponse.success(data, '标记已读成功');
    } catch (error) {
      return ApiResponse.error('标记已读失败: ' + error.message, 500);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const data = await this.alertsService.remove(+id);
      return ApiResponse.success(data, '删除告警成功');
    } catch (error) {
      return ApiResponse.error('删除告警失败: ' + error.message, 500);
    }
  }

  // 新增：告警生成器控制API
  @Post('generator/start')
  async startGenerator() {
    try {
      const data = await this.alertGeneratorService.startGenerator();
      return ApiResponse.success(data, '告警生成器启动成功');
    } catch (error) {
      return ApiResponse.error('启动告警生成器失败: ' + error.message, 500);
    }
  }

  @Post('generator/stop')
  async stopGenerator() {
    try {
      const data = await this.alertGeneratorService.stopGenerator();
      return ApiResponse.success(data, '告警生成器停止成功');
    } catch (error) {
      return ApiResponse.error('停止告警生成器失败: ' + error.message, 500);
    }
  }

  @Get('generator/status')
  async getGeneratorStatus() {
    try {
      const data = this.alertGeneratorService.getGeneratorStatus();
      return ApiResponse.success(data, '获取生成器状态成功');
    } catch (error) {
      return ApiResponse.error('获取生成器状态失败: ' + error.message, 500);
    }
  }

  @Delete('generator/clear')
  async clearAllAlerts() {
    try {
      const data = await this.alertGeneratorService.clearAllAlerts();
      return ApiResponse.success(data, '清空告警成功');
    } catch (error) {
      return ApiResponse.error('清空告警失败: ' + error.message, 500);
    }
  }
}
