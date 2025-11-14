import request from './request'

/**
 * 工厂数据API
 */
export const factoryApi = {
  /**
   * 获取完整工厂数据（包含areas和connections）
   */
  getFactoryData() {
    return request({
      url: '/factory/data',
      method: 'get'
    })
  }
}

/**
 * 区域API
 */
export const areasApi = {
  /**
   * 获取所有区域
   */
  getAll() {
    return request({
      url: '/areas',
      method: 'get'
    })
  },
  
  /**
   * 获取单个区域
   */
  getOne(id) {
    return request({
      url: `/areas/${id}`,
      method: 'get'
    })
  },
  
  /**
   * 创建区域
   */
  create(data) {
    return request({
      url: '/areas',
      method: 'post',
      data
    })
  },
  
  /**
   * 更新区域
   */
  update(id, data) {
    return request({
      url: `/areas/${id}`,
      method: 'put',
      data
    })
  },
  
  /**
   * 删除区域
   */
  delete(id) {
    return request({
      url: `/areas/${id}`,
      method: 'delete'
    })
  }
}

/**
 * 设备API
 */
export const devicesApi = {
  /**
   * 获取所有设备
   */
  getAll() {
    return request({
      url: '/devices',
      method: 'get'
    })
  },
  
  /**
   * 获取单个设备
   */
  getOne(id) {
    return request({
      url: `/devices/${id}`,
      method: 'get'
    })
  },
  
  /**
   * 创建设备
   */
  create(data) {
    return request({
      url: '/devices',
      method: 'post',
      data
    })
  },
  
  /**
   * 更新设备
   */
  update(id, data) {
    return request({
      url: `/devices/${id}`,
      method: 'put',
      data
    })
  },
  
  /**
   * 删除设备
   */
  delete(id) {
    return request({
      url: `/devices/${id}`,
      method: 'delete'
    })
  },
  
  /**
   * 控制设备（启动/停止/重启）
   */
  control(id, action) {
    return request({
      url: `/devices/${id}/control`,
      method: 'post',
      data: { action }
    })
  },
  
  /**
   * 获取设备日志
   */
  getLogs(id) {
    return request({
      url: `/devices/${id}/logs`,
      method: 'get'
    })
  }
}

/**
 * 告警API
 */
export const alertsApi = {
  /**
   * 获取所有告警
   */
  getAll() {
    return request({
      url: '/alerts',
      method: 'get'
    })
  },
  
  /**
   * 获取最近一小时的告警
   */
  getRecent() {
    return request({
      url: '/alerts/recent',
      method: 'get'
    })
  },
  
  /**
   * 获取告警统计
   */
  getStats() {
    return request({
      url: '/alerts/stats',
      method: 'get'
    })
  },
  
  /**
   * 创建告警
   */
  create(data) {
    return request({
      url: '/alerts',
      method: 'post',
      data
    })
  },
  
  /**
   * 标记告警已读
   */
  markAsRead(id) {
    return request({
      url: `/alerts/${id}/read`,
      method: 'put'
    })
  },
  
  /**
   * 删除告警
   */
  delete(id) {
    return request({
      url: `/alerts/${id}`,
      method: 'delete'
    })
  },
  
  /**
   * 启动告警生成器
   */
  startGenerator() {
    return request({
      url: '/alerts/generator/start',
      method: 'post'
    })
  },
  
  /**
   * 停止告警生成器
   */
  stopGenerator() {
    return request({
      url: '/alerts/generator/stop',
      method: 'post'
    })
  },
  
  /**
   * 获取生成器状态
   */
  getGeneratorStatus() {
    return request({
      url: '/alerts/generator/status',
      method: 'get'
    })
  },
  
  /**
   * 清空所有告警
   */
  clearAll() {
    return request({
      url: '/alerts/generator/clear',
      method: 'delete'
    })
  }
}

/**
 * 统计数据API
 */
export const statsApi = {
  /**
   * 获取统计数据
   */
  getStats() {
    return request({
      url: '/stats',
      method: 'get'
    })
  }
}

/**
 * 连接线API
 */
export const connectionsApi = {
  /**
   * 获取所有连接线
   */
  getAll() {
    return request({
      url: '/connections',
      method: 'get'
    })
  },
  
  /**
   * 创建连接线
   */
  create(data) {
    return request({
      url: '/connections',
      method: 'post',
      data
    })
  },
  
  /**
   * 更新连接线
   */
  update(id, data) {
    return request({
      url: `/connections/${id}`,
      method: 'put',
      data
    })
  },
  
  /**
   * 删除连接线
   */
  delete(id) {
    return request({
      url: `/connections/${id}`,
      method: 'delete'
    })
  }
}

