import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiResponse } from '../../common/response.dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats() {
    try {
      const data = await this.statsService.getStats();
      return ApiResponse.success(data, '获取统计数据成功');
    } catch (error) {
      return ApiResponse.error('获取统计数据失败: ' + error.message, 500);
    }
  }
}

