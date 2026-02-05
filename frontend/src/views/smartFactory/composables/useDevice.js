export function useDevice() {
  // === 设备颜色配置 ===
  const getDeviceColor = (type, status) => {
    const baseColors = {
      robot: '#722ed1',
      cnc: '#eb2f96',
      conveyor: '#13c2c2',
      forklift: '#fa8c16',
      shelf: '#a0d911',
      tester: '#f5222d',
      camera: '#722ed1',

      washer: '#1890ff',
      reactor: '#9254de',
      pump: '#13c2c2',
      mixer: '#faad14',
      labeler: '#52c41a',
      filler: '#2f54eb',
      feeder: '#fa8c16',
      dryer: '#f5222d',
      capper: '#722ed1',
      tranCar: '#fa8c16'
    }
    
    const baseColor = baseColors[type] || '#d9d9d9'
    
    // 根据状态调整颜色
    if (status === 'error') return '#ff4d4f'
    if (status === 'idle') return '#d9d9d9'
    if (status === 'warning') return '#faad14'
    
    return baseColor
  }

  // 设备边框颜色
  const getDeviceStrokeColor = (status) => {
    const colors = {
      running: '#52c41a',
      error: '#ff4d4f',
      warning: '#faad14',
      idle: '#d9d9d9',
      normal: '#52c41a'
    }
    return colors[status] || '#999'
  }

  // 设备文字颜色
  const getDeviceTextColor = (status) => {
    return status === 'idle' ? '#666' : '#fff'
  }

  // 状态颜色
  const getStatusColor = (status) => {
    const colors = {
      running: '#52c41a',
      error: '#ff4d4f',
      warning: '#faad14',
      idle: '#d9d9d9',
      normal: '#52c41a'
    }
    return colors[status] || '#d9d9d9'
  }

  // 设备形状
  const getDeviceShape = (type) => {
    const shapes = {
      robot: 'circle',
      cnc: 'rect',
      conveyor: 'rect',
      forklift: 'circle',
      shelf: 'rect',
      tester: 'circle',
      camera: 'circle',

      washer: 'rect',
      reactor: 'circle',
      pump: 'circle',
      mixer: 'rect',
      labeler: 'rect',
      filler: 'rect',
      feeder: 'rect',
      dryer: 'rect',
      capper: 'rect',
      tranCar: 'circle'
    }
    return shapes[type] || 'circle'
  }

  // 设备SVG图标路径
  const getDeviceIconPath = (type, deviceId = '') => {
    const iconMap = {
      robot: (id) => {
        if (id === 'robot1') return '/assets/devices/robot1.svg'
        if (id === 'robot2') return '/assets/devices/robot2.svg'
        return '/assets/devices/robot1.svg'
      },
      cnc: (id) => {
        if (id === 'cnc1') return '/assets/devices/cnc1.svg'
        if (id === 'cnc2') return '/assets/devices/cnc2.svg'
        return '/assets/devices/cnc1.svg'
      },
      conveyor: () => '/assets/devices/conveyor1.svg',
      forklift: () => '/assets/devices/forklift1.svg',
      shelf: () => '/assets/devices/shelf1.svg',
      tester: (id) => {
        if (id === 'tester2') return '/assets/devices/tester2.svg'
        return '/assets/devices/tester1.svg'
      },
      camera: () => '/assets/devices/camera1.svg',

      washer: () => '/assets/devices/washer1.svg',
      reactor: () => '/assets/devices/reactor1.svg',
      pump: () => '/assets/devices/pump1.svg',
      mixer: () => '/assets/devices/mixer1.svg',
      labeler: () => '/assets/devices/labeler1.svg',
      filler: () => '/assets/devices/filler1.svg',
      feeder: () => '/assets/devices/feeder1.svg',
      dryer: () => '/assets/devices/dryer1.svg',
      capper: () => '/assets/devices/capper1.svg',
      tranCar: () => '/assets/devices/tranCar.svg'
    }
    
    const mapper = iconMap[type]
    return mapper ? mapper(deviceId) : '/assets/devices/box.svg'
  }

  // 备用
  const getDeviceIcon = (type) => {
    const icons = {
      robot: '🤖',
      cnc: '⚙️',
      conveyor: '📦',
      forklift: '🚛',
      shelf: '📚',
      tester: '🔍',
      camera: '📷',

      washer: '🧼',
      reactor: '⚗️',
      pump: '💧',
      mixer: '🌀',
      labeler: '🏷️',
      filler: '🍶',
      feeder: '📥',
      dryer: '🔥',
      capper: '🔒',
      tranCar: '🚗'
    }
    return icons[type] || '⚫'
  }

  // 悬浮动画类
  const getHoverAnimationClass = (status) => {
    switch(status) {
      case 'error':
      case 'warning':
        return 'hover-highlight-blink'
      case 'idle':
        return ''
      default:
        return 'hover-highlight'
    }
  }

  // 悬浮颜色
  const getHoverColor = (status) => {
    const colors = {
      error: '#ff4d4f',
      warning: '#faad14', 
      idle: '#d9d9d9',
      running: '#1890ff',
      normal: '#52c41a'
    }
    return colors[status] || '#1890ff'
  }

  // 状态文字
  const getStatusText = (status) => {
    const statusMap = {
      running: '运行中',
      idle: '空闲',
      error: '故障',
      warning: '警告',
      normal: '正常'
    }
    return statusMap[status] || status
  }

  return {
    getDeviceColor,
    getDeviceStrokeColor,
    getDeviceTextColor,
    getStatusColor,
    getDeviceShape,
    getDeviceIcon,
    getDeviceIconPath,
    getHoverAnimationClass,
    getHoverColor,
    getStatusText
  }
}
