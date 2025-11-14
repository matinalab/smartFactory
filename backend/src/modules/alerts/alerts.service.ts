import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Alert } from '../../database/entities';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async findAll() {
    return this.alertRepository.find({
      order: { createdAt: 'DESC' },
      take: 100, // 最近100条
    });
  }

  async findOne(id: number) {
    const alert = await this.alertRepository.findOne({
      where: { id },
    });
    
    if (!alert) {
      throw new NotFoundException(`告警 ${id} 未找到`);
    }
    
    return alert;
  }

  async create(createAlertDto: any) {
    const alert = this.alertRepository.create(createAlertDto);
    return this.alertRepository.save(alert);
  }

  async markAsRead(id: number) {
    const alert = await this.findOne(id);
    alert.isRead = true;
    await this.alertRepository.save(alert);
    return { message: `告警 ${id} 已标记为已读` };
  }

  async remove(id: number) {
    const alert = await this.findOne(id);
    await this.alertRepository.remove(alert);
    return { message: `告警 ${id} 已删除` };
  }

  /**
   * 获取最近一小时的告警
   */
  async findRecentAlerts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return this.alertRepository.find({
      where: {
        createdAt: MoreThanOrEqual(oneHourAgo)
      },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 批量删除告警
   */
  async removeMany(ids: number[]) {
    const alerts = await this.alertRepository.findByIds(ids);
    await this.alertRepository.remove(alerts);
    return { message: `已删除 ${alerts.length} 条告警` };
  }

  /**
   * 获取告警统计
   */
  async getAlertStats() {
    const [total, unread, byLevel] = await Promise.all([
      this.alertRepository.count(),
      this.alertRepository.count({ where: { isRead: false } }),
      this.alertRepository
        .createQueryBuilder('alert')
        .select('alert.level', 'level')
        .addSelect('COUNT(*)', 'count')
        .groupBy('alert.level')
        .getRawMany()
    ]);

    return {
      total,
      unread,
      byLevel: byLevel.reduce((acc, item) => {
        acc[item.level] = parseInt(item.count);
        return acc;
      }, {})
    };
  }
}

