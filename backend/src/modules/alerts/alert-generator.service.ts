import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Alert } from '../../database/entities';
import { AlertsGateway } from './alerts.gateway';

@Injectable()
export class AlertGeneratorService {
  private readonly logger = new Logger(AlertGeneratorService.name);
  private isGenerating = false;
  private readonly maxAlerts = 10;

  // 模拟告警模板 - 匹配新的生产流程
  private readonly alertTemplates = [
    // 料库相关
    { message: '叉车1电量低', level: 'info', deviceId: 'forklift1', areaId: 'warehouse' },
    { message: '料库温度偏高', level: 'warning', deviceId: null, areaId: 'warehouse' },
    { message: '料库库存不足', level: 'warning', deviceId: 'shelf1', areaId: 'warehouse' },
    
    // 投料区相关
    { message: '投料区物料不足', level: 'info', deviceId: null, areaId: 'feeding' },
    { message: '投料机1速度异常', level: 'error', deviceId: 'feeder1', areaId: 'feeding' },
    { message: '输送带1堵料告警', level: 'warning', deviceId: 'conveyor1', areaId: 'feeding' },
    
    // 生产车间相关
    { message: '反应釜1温度超标', level: 'error', deviceId: 'reactor1', areaId: 'production' },
    { message: '搅拌机1转速异常', level: 'warning', deviceId: 'mixer1', areaId: 'production' },
    { message: '物料泵1压力过高', level: 'error', deviceId: 'pump1', areaId: 'production' },
    { message: '生产车间空气质量告警', level: 'warning', deviceId: null, areaId: 'production' },
    
    // 清洗区相关
    { message: '烘干机1温度不足', level: 'info', deviceId: 'dryer1', areaId: 'cleaning' },
    { message: '清洗机1需要维护', level: 'warning', deviceId: 'washer1', areaId: 'cleaning' },
    { message: '清洗水质检测异常', level: 'error', deviceId: null, areaId: 'cleaning' },
    
    // 灌装区相关
    { message: '灌装区环境湿度超标', level: 'info', deviceId: null, areaId: 'filling' },
    { message: '灌装机1速度异常', level: 'error', deviceId: 'filler1', areaId: 'filling' },
    { message: '封盖机1压力不足', level: 'warning', deviceId: 'capper1', areaId: 'filling' },
    { message: '贴标机1标签耗尽', level: 'warning', deviceId: 'labeler1', areaId: 'filling' },
    
    // 成品库相关
    { message: '叉车2需要充电', level: 'info', deviceId: 'forklift2', areaId: 'finished_goods' },
    { message: '成品库容量告警', level: 'warning', deviceId: 'shelf2', areaId: 'finished_goods' },
    
    // 系统级告警
    { message: '系统定期维护提醒', level: 'info', deviceId: null, areaId: null },
    { message: '网络连接不稳定', level: 'warning', deviceId: null, areaId: null },
    { message: '电力系统负载过高', level: 'error', deviceId: null, areaId: null }
  ];

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @Inject(forwardRef(() => AlertsGateway))
    private alertsGateway: AlertsGateway,
  ) {}

  /**
   * 定时任务：每30秒生成一条告警（可根据需要调整频率）
   */
  @Cron('*/30 * * * * *') // 每30秒执行一次
  async handleCron() {
    if (this.isGenerating) {
      await this.generateAlert();
    }
  }

  /**
   * 启动告警生成器
   */
  async startGenerator(): Promise<{ message: string; status: boolean }> {
    this.isGenerating = true;
    this.logger.log('告警生成器已启动');
    
    // 立即生成一条告警作为测试
    await this.generateAlert();
    
    return {
      message: '告警生成器已启动，每30秒自动生成一条告警',
      status: true
    };
  }

  /**
   * 停止告警生成器
   */
  async stopGenerator(): Promise<{ message: string; status: boolean }> {
    this.isGenerating = false;
    this.logger.log('告警生成器已停止');
    
    return {
      message: '告警生成器已停止',
      status: false
    };
  }

  /**
   * 获取生成器状态
   */
  getGeneratorStatus(): { isGenerating: boolean; maxAlerts: number } {
    return {
      isGenerating: this.isGenerating,
      maxAlerts: this.maxAlerts
    };
  }

  /**
   * 生成一条随机告警
   */
  private async generateAlert(): Promise<void> {
    try {
      // 随机选择一个告警模板
      const template = this.alertTemplates[
        Math.floor(Math.random() * this.alertTemplates.length)
      ];

      // 创建告警数据
      const alertData = {
        time: new Date(),
        message: template.message,
        level: template.level as 'info' | 'warning' | 'error',
        deviceId: template.deviceId,
        areaId: template.areaId,
        isRead: false
      };

      // 保存到数据库
      const alert = this.alertRepository.create(alertData);
      await this.alertRepository.save(alert);

      this.logger.debug(`生成新告警: ${alertData.message}`);

      // 通过WebSocket推送新告警给所有客户端
      this.alertsGateway.broadcastNewAlert({
        id: alert.id,
        time: alert.time,
        message: alert.message,
        level: alert.level,
        deviceId: alert.deviceId,
        areaId: alert.areaId,
        isRead: alert.isRead
      });

      // 清理超出限制的旧数据
      await this.cleanupOldAlerts();

    } catch (error) {
      this.logger.error('生成告警失败:', error);
    }
  }

  /**
   * 清理超过最大数量的旧告警
   */
  private async cleanupOldAlerts(): Promise<void> {
    try {
      // 获取当前告警总数
      const totalCount = await this.alertRepository.count();

      if (totalCount > this.maxAlerts) {
        // 获取最旧的告警记录，需要删除的数量
        const deleteCount = totalCount - this.maxAlerts;
        
        const oldAlerts = await this.alertRepository.find({
          order: { createdAt: 'ASC' }, // 按创建时间升序
          take: deleteCount
        });

        if (oldAlerts.length > 0) {
          // 通知客户端这些告警将被删除
          oldAlerts.forEach(alert => {
            this.alertsGateway.broadcastAlertDeleted(alert.id);
          });
          
          await this.alertRepository.remove(oldAlerts);
          this.logger.debug(`清理了 ${oldAlerts.length} 条旧告警`);
        }
      }
    } catch (error) {
      this.logger.error('清理旧告警失败:', error);
    }
  }

  /**
   * 手动清理所有告警
   */
  async clearAllAlerts(): Promise<{ message: string; deletedCount: number }> {
    try {
      const alerts = await this.alertRepository.find();
      const deletedCount = alerts.length;
      
      if (deletedCount > 0) {
        await this.alertRepository.remove(alerts);
        // 通知所有客户端告警已被清空
        this.alertsGateway.broadcastAlertsCleared();
      }

      this.logger.log(`手动清理了 ${deletedCount} 条告警`);
      
      return {
        message: `已清理 ${deletedCount} 条告警`,
        deletedCount
      };
    } catch (error) {
      this.logger.error('清理告警失败:', error);
      throw error;
    }
  }
}

