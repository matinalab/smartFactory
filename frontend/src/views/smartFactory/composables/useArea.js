export function useArea() {
  // 区域颜色
  const getAreaColor = (type) => {
    const colors = {
      production: '#1890ff',
      storage: '#52c41a',
      quality: '#faad14'
    }
    return colors[type] || '#d9d9d9'
  }

  // 区域边框颜色
  const getAreaStrokeColor = (type) => {
    const colors = {
      production: '#00ffff',
      storage: '#00ff88',
      quality: '#ff006e'
    }
    return colors[type] || '#999'
  }

  return {
    getAreaColor,
    getAreaStrokeColor
  }
}