import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from './common/response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    try {
      const data = this.appService.getHello();
      return ApiResponse.success(data, 'API服务运行正常');
    } catch (error) {
      return ApiResponse.error('服务异常: ' + error.message, 500);
    }
  }

  @Get('health')
  getHealth() {
    try {
      const data = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: '智慧工厂监控系统 API',
      };
      return ApiResponse.success(data, '健康检查通过');
    } catch (error) {
      return ApiResponse.error('健康检查失败: ' + error.message, 500);
    }
  }
}

