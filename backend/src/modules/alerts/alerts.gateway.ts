import { 
  WebSocketGateway, 
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // 生产环境要配置具体的域名
  },
  namespace: '/alerts' // WebSocket命名空间
})
export class AlertsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AlertsGateway.name);

  /**
   * 客户端连接时触发
   */
  handleConnection(client: any) {
    this.logger.log(`客户端已连接: ${client.id}`);
  }

  /**
   * 客户端断开连接时触发
   */
  handleDisconnect(client: any) {
    this.logger.log(`客户端已断开: ${client.id}`);
  }

  /**
   * 向所有客户端推送新告警
   */
  broadcastNewAlert(alert: any) {
    this.logger.debug(`推送新告警: ${alert.message}`);
    this.server.emit('new-alert', alert);
  }

  /**
   * 向所有客户端推送告警删除通知
   */
  broadcastAlertDeleted(alertId: number) {
    this.logger.debug(`推送告警删除通知: ${alertId}`);
    this.server.emit('alert-deleted', alertId);
  }

  /**
   * 向所有客户端推送告警清空通知
   */
  broadcastAlertsCleared() {
    this.logger.debug('推送告警清空通知');
    this.server.emit('alerts-cleared');
  }
}

