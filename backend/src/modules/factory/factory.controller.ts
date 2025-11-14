import { Controller, Get } from '@nestjs/common';
import { FactoryService } from './factory.service';
import { ApiResponse } from '../../common/response.dto';

@Controller('factory')
export class FactoryController {
  constructor(private readonly factoryService: FactoryService) {}

  @Get('data')
  async getFactoryData() {
    try {
      const data = await this.factoryService.getCompleteFactoryData();
      return ApiResponse.success(data, '获取工厂数据成功');
    } catch (error) {
      return ApiResponse.error('获取工厂数据失败: ' + error.message, 500);
    }
  }
}

