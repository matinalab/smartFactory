# WebSocket 实时告警推送 - 安装指南

## 概述

本项目实现了基于 WebSocket 的实时告警推送系统，后端使用 NestJS + Socket.io，前端使用 Vue3 + Socket.io-client。

## 安装步骤

### 1. 后端依赖安装

进入后端目录并安装 WebSocket 相关依赖：

```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### 2. 前端依赖安装

进入前端目录并安装 Socket.io 客户端：

```bash
cd frontend
npm install socket.io-client
```

### 3. 环境配置（可选）

在前端项目根目录创建 `.env` 文件（如果还没有）：

```env
# WebSocket 服务器地址
VITE_WS_URL=http://localhost:3000
```

## 实现原理

### 后端架构

1. **AlertsGateway** (`backend/src/modules/alerts/alerts.gateway.ts`)
   - WebSocket 网关，处理客户端连接和消息推送
   - 命名空间：`/alerts`
   - 事件：
     - `new-alert`: 推送新告警
     - `alert-deleted`: 推送告警删除通知
     - `alerts-cleared`: 推送告警清空通知

2. **AlertGeneratorService** 
   - 每30秒自动生成一条告警
   - 生成告警后立即通过 WebSocket 推送给所有连接的客户端
   - 自动清理超过10条的旧告警

### 前端架构

1. **useWebSocket Composable** (`frontend/src/composables/useWebSocket.js`)
   - 封装 Socket.io 客户端连接管理
   - 提供连接、断开、监听事件等方法
   - 自动重连机制（最多5次）

2. **主组件集成** (`frontend/src/views/smartFactory/index.vue`)
   - 在组件挂载时建立 WebSocket 连接
   - 监听 `new-alert` 事件，实时更新告警列表
   - 监听 `alert-deleted` 和 `alerts-cleared` 事件
   - WebSocket 连接状态可视化指示器

## 使用方法

### 启动后端服务

```bash
cd backend
npm run start:dev
```

后端将在 `http://localhost:3000` 启动，WebSocket 服务在 `ws://localhost:3000/alerts`

### 启动前端服务

```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动（默认）

### 测试实时推送

1. 打开浏览器访问前端页面
2. 在页面右上角可以看到 "WebSocket 已连接" 的绿色状态指示器
3. 2秒后告警生成器会自动启动
4. 每30秒会自动生成一条新告警
5. 新告警会实时出现在左侧的"实时告警"面板中
6. 控制台会打印 "📢 收到新告警推送" 的日志

## 功能特性

✅ **实时推送** - 无需轮询，告警即时送达  
✅ **自动重连** - 网络断开后自动尝试重连  
✅ **连接状态** - 可视化显示 WebSocket 连接状态  
✅ **高效节能** - 相比轮询减少 90% 以上的网络请求  
✅ **双向通信** - 支持客户端和服务器双向通信  

## 故障排除

### 1. WebSocket 连接失败

**问题**: 前端显示 "WebSocket 未连接"

**解决方案**:
- 确认后端服务已启动
- 检查后端是否安装了 WebSocket 依赖
- 检查防火墙是否阻止了端口 3000
- 查看浏览器控制台的错误信息

### 2. 没有收到告警推送

**问题**: WebSocket 已连接但没有收到告警

**解决方案**:
- 确认告警生成器已启动（页面加载2秒后自动启动）
- 查看后端控制台是否有 "生成新告警" 的日志
- 检查前端控制台是否有 "收到新告警推送" 的日志

### 3. CORS 错误

**问题**: 浏览器报 CORS 相关错误

**解决方案**:
- 后端 `alerts.gateway.ts` 已配置 `cors: { origin: '*' }`
- 生产环境应该配置具体的域名而不是 `*`

## 扩展建议

### 1. 添加用户认证

```typescript
// 在 WebSocket 连接时验证 token
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/alerts'
})
export class AlertsGateway {
  @SubscribeMessage('authenticate')
  handleAuth(client: Socket, token: string) {
    // 验证 token 逻辑
  }
}
```

### 2. 支持告警过滤

前端可以发送过滤条件到服务器，只接收特定类型的告警：

```javascript
// 前端发送过滤条件
emit('filter-alerts', { level: ['error', 'warning'] })
```

### 3. 支持告警确认

用户点击告警后可以标记为已读：

```javascript
emit('acknowledge-alert', alertId)
```

### 4. 添加心跳检测

保持长连接的健康状态：

```typescript
@Cron('*/10 * * * * *')
sendHeartbeat() {
  this.server.emit('heartbeat', { timestamp: Date.now() })
}
```

## 技术栈

- **后端**: NestJS + Socket.io + TypeORM + MySQL
- **前端**: Vue 3 + Socket.io-client + Composition API
- **协议**: WebSocket (ws://) / HTTP (http://)

## 参考资料

- [Socket.io 官方文档](https://socket.io/docs/v4/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [MDN WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)

