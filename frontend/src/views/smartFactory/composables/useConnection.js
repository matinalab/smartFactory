import { computed } from 'vue'

export function useConnection() {
  // === 连接线颜色配置 ===
  const getConnectionColor = (type) => {
    const colors = {
      material: '#52c41a',
      product: '#1890ff', 
      data: '#722ed1'
    }
    return colors[type] || '#999'
  }

  // === 连接零件配置 ===
  // 零件颜色
  const getComponentColor = (type) => {
    const colors = {
      valve: '#fa8c16',      // 阀门
      sensor: '#13c2c2',     // 传感器  
      filter: '#722ed1',     // 过滤器
      pump: '#52c41a',       // 泵
      meter: '#eb2f96'       // 仪表
    }
    return colors[type] || '#d9d9d9'
  }

  // 零件图标
  const getComponentIcon = (type) => {
    const icons = {
      valve: '🔧',
      sensor: '📡', 
      filter: '🔍',
      pump: '⚡',
      meter: '📊'
    }
    return icons[type] || '⚫'
  }
  // 网格坐标转像素坐标
  const gridToPixel = (gridX, gridY, gridSize, svgHeight) => ({
    x: gridX * gridSize,
    y: svgHeight - (gridY * gridSize)
  })

  // 获取区域像素坐标
  const getAreaPixelCoords = (area, gridSize, svgHeight) => {
    const topLeft = gridToPixel(area.gridX, area.gridY + area.gridHeight, gridSize, svgHeight)
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: area.gridWidth * gridSize,
      height: area.gridHeight * gridSize
    }
  }

  // 智能连接点计算
  const getSmartConnectionPoints = (connection, areas, gridSize, svgHeight) => {
    const fromArea = areas.find(area => area.id === connection.from)
    const toArea = areas.find(area => area.id === connection.to)
    
    if (!fromArea || !toArea) return null
    
    const fromCoords = getAreaPixelCoords(fromArea, gridSize, svgHeight)
    const toCoords = getAreaPixelCoords(toArea, gridSize, svgHeight)
    
    const fromCenter = {
      x: fromCoords.x + fromCoords.width / 2,
      y: fromCoords.y + fromCoords.height / 2
    }
    
    const toCenter = {
      x: toCoords.x + toCoords.width / 2,
      y: toCoords.y + toCoords.height / 2
    }
    
    const deltaX = toCenter.x - fromCenter.x
    const deltaY = toCenter.y - fromCenter.y
    
    let fromPoint, toPoint, fromDirection, toDirection
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        fromPoint = { x: fromCoords.x + fromCoords.width, y: fromCenter.y }
        toPoint = { x: toCoords.x, y: toCenter.y }
        fromDirection = 'right'
        toDirection = 'left'
      } else {
        fromPoint = { x: fromCoords.x, y: fromCenter.y }
        toPoint = { x: toCoords.x + toCoords.width, y: toCenter.y }
        fromDirection = 'left'
        toDirection = 'right'
      }
    } else {
      if (deltaY > 0) {
        fromPoint = { x: fromCenter.x, y: fromCoords.y + fromCoords.height }
        toPoint = { x: toCenter.x, y: toCoords.y }
        fromDirection = 'down'
        toDirection = 'up'
      } else {
        fromPoint = { x: fromCenter.x, y: fromCoords.y }
        toPoint = { x: toCenter.x, y: toCoords.y + toCoords.height }
        fromDirection = 'up'
        toDirection = 'down'
      }
    }
    
    return { fromPoint, toPoint, fromDirection, toDirection }
  }

  // 连接路径计算
  const getConnectionPath = (connection, areas, gridSize, svgHeight) => {
    const connectionInfo = getSmartConnectionPoints(connection, areas, gridSize, svgHeight)
    if (!connectionInfo) return ''
    
    const { fromPoint, toPoint, fromDirection, toDirection } = connectionInfo
    
    const distance = Math.sqrt(
      Math.pow(toPoint.x - fromPoint.x, 2) + 
      Math.pow(toPoint.y - fromPoint.y, 2)
    )
    const controlDistance = Math.min(distance * 0.4, 80)
    
    const getControlPoint = (point, direction, distance) => {
      switch (direction) {
        case 'right': return { x: point.x + distance, y: point.y }
        case 'left': return { x: point.x - distance, y: point.y }
        case 'up': return { x: point.x, y: point.y - distance }
        case 'down': return { x: point.x, y: point.y + distance }
        default: return point
      }
    }
    
    const control1 = getControlPoint(fromPoint, fromDirection, controlDistance)
    const control2 = getControlPoint(toPoint, toDirection, controlDistance)
    
    return `M ${fromPoint.x} ${fromPoint.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${toPoint.x} ${toPoint.y}`
  }

  // 曲线点计算（叉车动画用）
  const getConnectionCurvePoints = (connection, areas, gridSize, svgHeight, numPoints = 5) => {
    const connectionInfo = getSmartConnectionPoints(connection, areas, gridSize, svgHeight)
    if (!connectionInfo) return []
    
    const { fromPoint, toPoint, fromDirection, toDirection } = connectionInfo
    
    const distance = Math.sqrt(
      Math.pow(toPoint.x - fromPoint.x, 2) + 
      Math.pow(toPoint.y - fromPoint.y, 2)
    )
    const controlDistance = Math.min(distance * 0.4, 80)
    
    const getControlPoint = (point, direction, distance) => {
      switch (direction) {
        case 'right': return { x: point.x + distance, y: point.y }
        case 'left': return { x: point.x - distance, y: point.y }
        case 'up': return { x: point.x, y: point.y - distance }
        case 'down': return { x: point.x, y: point.y + distance }
        default: return point
      }
    }
    
    const control1 = getControlPoint(fromPoint, fromDirection, controlDistance)
    const control2 = getControlPoint(toPoint, toDirection, controlDistance)
    
    const points = []
    for (let i = 0; i <= numPoints - 1; i++) {
      const t = i / (numPoints - 1)
      
      const x = Math.pow(1 - t, 3) * fromPoint.x +
                3 * Math.pow(1 - t, 2) * t * control1.x +
                3 * (1 - t) * Math.pow(t, 2) * control2.x +
                Math.pow(t, 3) * toPoint.x
                
      const y = Math.pow(1 - t, 3) * fromPoint.y +
                3 * Math.pow(1 - t, 2) * t * control1.y +
                3 * (1 - t) * Math.pow(t, 2) * control2.y +
                Math.pow(t, 3) * toPoint.y
                
      points.push({ x, y })
    }
    
    return points
  }

  return {
    // 布局计算
    getAreaPixelCoords,
    getSmartConnectionPoints,
    getConnectionPath,
    getConnectionCurvePoints,
    // 连接线配置
    getConnectionColor,
    // 连接零件配置  
    getComponentColor,
    getComponentIcon
  }
}
