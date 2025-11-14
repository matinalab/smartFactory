import { ref, onUnmounted } from 'vue'

export function useDrag(options = {}) {
  const {
    onDragStart = () => {},
    onDragMove = () => {},
    onDragEnd = () => {},
    shouldStartDrag = () => true
  } = options

  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })

  let cleanupListeners = null

  const handleMouseDown = (event) => {
    // 检查是否应该开始拖拽
    if (!shouldStartDrag(event)) {
      return
    }

    event.preventDefault()
    isDragging.value = true
    
    dragStart.value = {
      x: event.clientX,
      y: event.clientY
    }

    dragOffset.value = { x: 0, y: 0 }

    // 调用开始拖拽回调
    onDragStart(event, dragStart.value)

    // 添加全局事件监听器
    const handleGlobalMouseMove = (e) => {
      if (!isDragging.value) return

      dragOffset.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y
      }

      onDragMove(e, dragOffset.value)
    }

    const handleGlobalMouseUp = (e) => {
      if (!isDragging.value) return

      isDragging.value = false
      onDragEnd(e, dragOffset.value)
      
      // 清理监听器
      if (cleanupListeners) {
        cleanupListeners()
        cleanupListeners = null
      }
    }

    // 设置清理函数
    cleanupListeners = () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
  }

  // 组件卸载时清理
  onUnmounted(() => {
    if (cleanupListeners) {
      cleanupListeners()
    }
  })

  return {
    isDragging,
    dragOffset,
    handleMouseDown
  }
}