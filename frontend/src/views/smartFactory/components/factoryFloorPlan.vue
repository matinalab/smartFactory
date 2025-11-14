<template>
  <div class="factory-floor-plan" ref="containerRef">
    <div class="floor-plan-header">
      <h3>智慧工厂平面图</h3>
      <div class="view-controls">
        <button @click="zoomIn" class="zoom-btn" :disabled="designMode">+</button>
        <button @click="zoomOut" class="zoom-btn" :disabled="designMode">-</button>
        <button @click="resetView" class="zoom-btn" :disabled="designMode">重置</button>
        <button @click="toggleFullscreen" class="zoom-btn">全屏</button>
        <button @click="toggleDesignMode" class="zoom-btn" :class="{ active: designMode }">
          设计
        </button>
      </div>
    </div>
    <!-- 容器 -->
    <div 
      class="chart-container" 
      ref="chartContainer"
      @mousedown="dragHandlers.handleMouseDown"
      @wheel="handleWheel"
      :style="{ cursor: dragHandlers.isDragging.value ? 'grabbing' : 'grab' }"
    >
      <!-- 背景板 -->
      <svg 
        ref="svgRef"
        :width="svgSize.width" 
        :height="svgSize.height" 
        :viewBox="`0 0 ${svgSize.width} ${svgSize.height}`"
        @click="handleSvgClick"
        @mousemove="handleDesignMouseMove"
        @mouseleave="handleDesignMouseLeave"
        class="factory-svg"
        :style="{ 
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center center'
        }"
      >
        <!-- 绘制背景网格 -->
        <defs>  
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e8e8e8" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- 工厂区域 -->
        <AreaComponent
          v-for="area in factoryData.areas"
          :key="area.id"
          :area="area"
          :is-selected="selectedArea?.id === area.id"
          :grid-size="GRID_SIZE"
          :svg-height="svgSize.height"
          @click="handleAreaClick"
        />

        <!-- 连接线 -->
        <ConnectionLineComponent
          v-for="connection in factoryData.connections"
          :key="`${connection.from}-${connection.to}`"
          :connection="connection"
          :areas="factoryData.areas"
          :grid-size="GRID_SIZE"
          :svg-height="svgSize.height"
          @component-click="handleComponentClick"
        />

        <!-- 区域内的设备 -->
        <g v-for="area in factoryData.areas" :key="`devices-${area.id}`">
          <g v-for="device in getVisibleDevices(area.devices)" :key="device.id">
            <DeviceComponent
              :device="device"
              :area="area"
              :position="getDevicePixelCoords(device)"
              :is-selected="selectedDevice?.id === device.id"
              :is-hovered="hoveredDevice?.id === device.id"
              @click="handleDeviceClick"
              @mouseenter="handleDeviceHover"
              @mouseleave="handleDeviceHover"
            />
          </g>
        </g>

        <!-- 外部建筑轮廓 -->
        <rect
          x="10"
          y="10"
          :width="svgSize.width - 20"
          :height="svgSize.height - 20"
          fill="none"
          class="building-outline"
        />

        <!-- 入口标识 -->
        <g transform="translate(30, 10)">
          <rect x="-10" y="-5" width="20" height="10" fill="#52c41a" />
          <text x="0" y="0" text-anchor="middle" font-size="8" fill="white" dy="0.3em">入口</text>
        </g>

        <!-- 设计模式：网格吸附指示器 -->
        <g v-if="designMode && showSnapPoint">
          <!-- 吸附点圆圈 -->
          <circle 
            :cx="snapPoint.x" 
            :cy="snapPoint.y" 
            r="6" 
            fill="none" 
            stroke="#ff4444" 
            stroke-width="2"
            opacity="0.8"
          />
          <circle 
            :cx="snapPoint.x" 
            :cy="snapPoint.y" 
            r="2" 
            fill="#ff4444"
          />
          
          <!-- 坐标显示 -->
          <g :transform="`translate(${snapPoint.x + snapPoint.displayOffsetX}, ${snapPoint.y + snapPoint.displayOffsetY})`">
            <rect 
              x="0" 
              y="-16" 
              width="60" 
              height="24" 
              fill="rgba(255, 68, 68, 0.9)" 
              rx="3"
            />
            <text 
              x="30" 
              y="0" 
              text-anchor="middle" 
              font-size="10" 
              fill="white"
              font-weight="bold"
            >
              {{ snapPoint.gridX }} , {{ snapPoint.gridY }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- 使用图例组件并添加ref -->
    <FactoryLegend 
      ref="factoryLegendRef"
      :factory-data="factoryData" 
      @legend-toggle="handleLegendToggle"
    />

    <!-- 使用弹窗组件 -->
    <DevicePopup
      :selected-device="selectedDevice"
      :hovered-device="hoveredDevice"
      :popup-style="popupStyle"
      :tooltip-style="tooltipStyle"
      @close="closePopup"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { useDrag } from '../composables/useDrag'
// 导入图例组件
import FactoryLegend from './FactoryLegend.vue'
// 导入弹窗组件
import DevicePopup from './DevicePopup.vue'
// 导入设备组件
import DeviceComponent from './DeviceComp.vue'
// 导入区域组件
import AreaComponent from './AreaComp.vue'
// 导入连接线组件
import ConnectionLineComponent from './ConnectionLineComp.vue'
// 导入composables
import { useConnection } from '../composables/useConnection'

const { getSmartConnectionPoints, getConnectionCurvePoints } = useConnection()
// Props
const props = defineProps({
  factoryData: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['area-click', 'device-click', 'svg-size-updated'])

// 响应式数据
const containerRef = ref(null)
const chartContainer = ref(null)
const svgRef = ref(null)
const selectedDevice = ref(null)
const selectedArea = ref(null)
const hoveredDevice = ref(null)
const popupStyle = ref({})
const tooltipStyle = ref({})
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const designMode = ref(false)
const snapPoint = ref({ x: 0, y: 0, gridX: 0, gridY: 0 })
const showSnapPoint = ref(false)

// 图例可见性状态
const legendVisibility = reactive({
  robot: true,
  cnc: true,
  conveyor: true,
  forklift: true,
  shelf: true,
  tester: true,
  camera: true
})

const svgSize = reactive({
  width: 800,
  height: 600
})

// 坐标转换函数
const GRID_SIZE = 20

// 网格坐标转像素坐标
const gridToPixel = (gridX, gridY) => {
  return {
    x: gridX * GRID_SIZE,
    y: svgSize.height - (gridY * GRID_SIZE)
  }
}

// 获取设备的像素坐标
const getDevicePixelCoords = (device) => {
  // 如果设备正在动画中，使用精确的动画坐标
  if (device._animationX !== undefined && device._animationY !== undefined) {
    return {
      x: device._animationX,
      y: device._animationY
    }
  }
  // 否则使用网格坐标转换
  return gridToPixel(device.gridX, device.gridY)
}

// 零件点击处理
const handleComponentClick = (component, event) => {
  event.stopPropagation()
  console.log('点击了零件:', component)
}

// 鼠标滚轮缩放
const handleWheel = (event) => {
  if (designMode.value) return // 设计模式下禁用滚轮缩放
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.3, Math.min(3, scale.value * delta))
  
  if (newScale !== scale.value) {
    scale.value = newScale
  }
}


// 使用拖拽composable
const dragHandlers = useDrag({
  shouldStartDrag: (event) => {
    if (designMode.value) return false // 设计模式下禁用拖拽
    // 只在SVG背景或容器上开始拖拽
    return event.target === svgRef.value || 
           event.target === chartContainer.value ||
           event.target.classList.contains('factory-svg') ||
           event.target.tagName === 'rect' && event.target.getAttribute('width') === '100%'
  },
  onDragStart: (event, startPos) => {
    // 拖拽开始时记录当前的translate值
    dragHandlers.lastTranslate = {
      x: translateX.value,
      y: translateY.value
    }
    // 禁用 SVG transition 避免卡顿
    if (svgRef.value) {
      svgRef.value.classList.add('no-transition')
    }
  },
  onDragMove: (event, offset) => {
    // 根据缩放比例调整拖拽灵敏度
    const sensitivity = 1 / scale.value
    translateX.value = dragHandlers.lastTranslate.x + offset.x * sensitivity
    translateY.value = dragHandlers.lastTranslate.y + offset.y * sensitivity
  },
  onDragEnd: (event, offset) => {
    // 拖拽结束，无需特殊处理
  }
})

const handleAreaClick = (area, event) => {
  if (dragHandlers.isDragging.value) return
  event.stopPropagation()

  // 如果点击的是当前选中的区域，则取消选中
  if (selectedArea.value?.id === area.id) {
    selectedArea.value = null
    emit('area-click', null)
    return
  }

  selectedDevice.value = null
  selectedArea.value = area
  hoveredDevice.value = null
  emit('area-click', {
    ...area,
    deviceCount: area.devices.length
  })
}

const handleDeviceClick = (device, area, event) => {
  if (dragHandlers.isDragging.value) return
  event.stopPropagation()
  selectedArea.value = null
  hoveredDevice.value = null
  selectedDevice.value = {
    ...device,
    area: area.name
  }
  
  // 获取容器和SVG的位置信息
  const containerRect = chartContainer.value.getBoundingClientRect()
  const svgRect = svgRef.value.getBoundingClientRect()
  
  // 获取设备的像素坐标
  const devicePixelCoords = getDevicePixelCoords(device)
  // 计算设备在SVG中的实际位置
  const deviceScreenX = svgRect.left + (devicePixelCoords.x * scale.value) + (translateX.value * scale.value)
  const deviceScreenY = svgRect.top + (devicePixelCoords.y * scale.value) + (translateY.value * scale.value)
  
  // 相对于容器的位置
  const relativeX = deviceScreenX - containerRect.left
  const relativeY = deviceScreenY - containerRect.top
  
  popupStyle.value = {
    position: 'absolute',
    left: Math.max(10, Math.min(relativeX + 30, containerRect.width - 220)) + 'px',
    top: Math.max(10, relativeY - 60) + 'px',
    zIndex: 1000
  }
  
  emit('device-click', selectedDevice.value)
}

const handleDeviceHover = (device, area, event, isEnter) => {
  if (dragHandlers.isDragging.value) return
  
  if (isEnter) {
    hoveredDevice.value = {
      ...device,
      area: area.name
    }
    
    // 获取容器和SVG的位置信息
    const containerRect = chartContainer.value.getBoundingClientRect()
    const svgRect = svgRef.value.getBoundingClientRect()
    
    // 获取设备的像素坐标
    const devicePixelCoords = getDevicePixelCoords(device)
    // 计算设备在SVG中的实际位置
    const deviceScreenX = svgRect.left + (devicePixelCoords.x * scale.value) + (translateX.value * scale.value)
    const deviceScreenY = svgRect.top + (devicePixelCoords.y * scale.value) + (translateY.value * scale.value)
    
    // 相对于容器的位置
    const relativeX = deviceScreenX - containerRect.left
    const relativeY = deviceScreenY - containerRect.top
    
    tooltipStyle.value = {
      position: 'absolute',
      left: Math.max(10, Math.min(relativeX + 25, containerRect.width - 160)) + 'px',
      top: Math.max(10, relativeY - 40) + 'px',
      zIndex: 999
    }
  } else {
    // 延迟隐藏，避免快速移动时闪烁
    setTimeout(() => {
      if (hoveredDevice.value?.id === device.id) {
        hoveredDevice.value = null
      }
    }, 50)
  }
}

const handleSvgClick = (event) => {
  if (dragHandlers.isDragging.value) return
  // 点击空白区域时取消选择
  if (event.target === svgRef.value || event.target.classList.contains('factory-svg')) {
    selectedDevice.value = null
    selectedArea.value = null
    hoveredDevice.value = null
  }
}

const closePopup = () => {
  selectedDevice.value = null
}

// 图例切换处理
const handleLegendToggle = (type, visible) => {
  console.log(`图例 ${type} 切换为: ${visible}`)
  legendVisibility[type] = visible
}

// 根据图例过滤可见设备
const getVisibleDevices = (devices) => {
  return devices.filter(device => legendVisibility[device.type] !== false)
}

const zoomIn = () => {
  if (designMode.value) return // 设计模式下禁用缩放
  scale.value = Math.min(scale.value * 1.2, 3)
}

const zoomOut = () => {
  if (designMode.value) return // 设计模式下禁用缩放
  scale.value = Math.max(scale.value / 1.2, 0.3)
}

const resetView = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen()
    } else {
    document.exitFullscreen()
  }
}

// 更新SVG尺寸的函数
const updateSvgSize = () => {
  if (chartContainer.value) {
    const rect = chartContainer.value.getBoundingClientRect()
    const newWidth = rect.width - 40
    const newHeight = rect.height - 40
    
    // 检查是否真的改变了
    if (Math.abs(svgSize.width - newWidth) > 1 || Math.abs(svgSize.height - newHeight) > 1) {
      svgSize.width = newWidth
      svgSize.height = newHeight
      
      // 立即通知父组件，确保同步
      emit('svg-size-updated', { width: newWidth, height: newHeight })
    }
  }
}

// 防抖的resize处理函数
let resizeTimeout = null
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    updateSvgSize()  // 防抖后更新并通知
    if (designMode.value) {
      showSnapPoint.value = false
    }
  }, 100)
}

// 生命周期
onMounted(async () => {
  await nextTick()
  // 初始化SVG尺寸
  updateSvgSize()
 
  // 添加全局点击监听
  document.addEventListener('click', handleDocumentClick)
  // 添加窗口resize监听
  window.addEventListener('resize', handleResize)
})

// 全局点击处理
const handleDocumentClick = (event) => {
  // 检查点击是否在弹窗内部
  const popup = document.querySelector('.device-popup')
  if (!popup || !popup.contains(event.target)) {
    selectedDevice.value = null
    hoveredDevice.value = null
  }
}

onUnmounted(() => {
  // 清理全局监听器
  document.removeEventListener('click', handleDocumentClick)
  // 清理resize监听器
  window.removeEventListener('resize', handleResize)
  // 清理防抖定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})

// 设计模式控制
const toggleDesignMode = () => {
  designMode.value = !designMode.value
  if (!designMode.value) {
    showSnapPoint.value = false
  } else {
    // 开启设计模式时自动重置视图
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    showSnapPoint.value = false
  }
}

// 网格吸附计算
const snapToGrid = (x, y) => {
  const gridSize = 20
  const gridX = Math.round(x / gridSize)
  // Y轴反转：将屏幕坐标系转换为笛卡尔坐标系
  // svgSize.height 是SVG的总高度
  const gridY = Math.round((svgSize.height - y) / gridSize)
  const snapX = gridX * gridSize
  // 保留屏幕坐标用于实际渲染位置
  const snapY = y - (y % gridSize)
  
  // 计算坐标显示框的安全位置
  const displayWidth = 60
  const displayHeight = 16
  const margin = 5
  
  // 动态调整显示位置，防止超出边界
  let offsetX = 15  // 默认显示在右侧
  let offsetY = -15 // 默认显示在上方
  
  // 右侧边界检查
  if (snapX + 15 + displayWidth + margin > svgSize.width) {
    offsetX = -(displayWidth + 15)  // 显示在左侧
  }
  
  // 顶部边界检查  
  if (snapY - 25 - margin < 0) {
    offsetY = 25  // 显示在下方
  }
  
  return {
    x: snapX,
    y: snapY,
    gridX,
    gridY,
    displayOffsetX: offsetX,
    displayOffsetY: offsetY
  }
}

// 设计模式下的鼠标移动处理
const handleDesignMouseMove = (event) => {
  if (!designMode.value) return
  
  const svgRect = svgRef.value.getBoundingClientRect()
  // 设计模式下无变换，直接计算坐标
  const rawX = event.clientX - svgRect.left
  const rawY = event.clientY - svgRect.top
  
  // 边界检查
  if (rawX >= 0 && rawY >= 0 && rawX <= svgSize.width && rawY <= svgSize.height) {
    const snapped = snapToGrid(rawX, rawY)
    snapPoint.value = snapped
    showSnapPoint.value = true
  } else {
    showSnapPoint.value = false
  }
}

const handleDesignMouseLeave = () => {
  if (designMode.value) {
    showSnapPoint.value = false
  }
}

// 工作动画控制方法
const setWorkingAnimation = (device) => {
  // 设置悬浮状态来触发旋转动画
  hoveredDevice.value = {
    ...device,
    area: device.area || ''
  }
}

const clearWorkingAnimation = () => {
  hoveredDevice.value = null
}

// 超简单版本：先居中再放大
const zoomToDevice = (device, zoomLevel = 2, duration = 800) => {
  if (!device) return
  
  // 第一步：重置视图并将设备放到屏幕中心
  const devicePixelCoords = getDevicePixelCoords(device)
  
  // 计算让设备居中所需的translate
  // SVG的中心点
  const svgCenterX = svgSize.width / 2
  const svgCenterY = svgSize.height / 2
  
  // 设备相对于SVG中心的偏移
  const offsetX = devicePixelCoords.x - svgCenterX
  const offsetY = devicePixelCoords.y - svgCenterY
  
  // 第一步动画：移动到中心（不改变缩放）
  const startTranslateX = translateX.value
  const startTranslateY = translateY.value
  const startScale = scale.value
  
  // 目标：让设备居中，所以translate应该是设备偏移的负值
  const centerTranslateX = -offsetX
  const centerTranslateY = -offsetY
  
  const firstPhase = () => {
    const startTime = Date.now()
    const phaseDuration = duration / 2
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / phaseDuration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      translateX.value = startTranslateX + (centerTranslateX - startTranslateX) * easeProgress
      translateY.value = startTranslateY + (centerTranslateY - startTranslateY) * easeProgress
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 第一阶段完成，开始第二阶段
        secondPhase()
      }
    }
    
    requestAnimationFrame(animate)
  }
  
  // 第二步动画：放大
  const secondPhase = () => {
    const startTime = Date.now()
    const phaseDuration = duration / 2
    
    const animate = () => {
      const elapsed = Date.now() - startTime  
      const progress = Math.min(elapsed / phaseDuration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      scale.value = startScale + (zoomLevel - startScale) * easeProgress
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }
  
  // 开始第一阶段
  firstPhase()
}

// 保存当前视图状态
const savedViewState = ref(null)

const saveCurrentView = () => {
  savedViewState.value = {
    scale: scale.value,
    translateX: translateX.value,
    translateY: translateY.value
  }
}

const restoreView = () => {
  if (savedViewState.value) {
    scale.value = savedViewState.value.scale
    translateX.value = savedViewState.value.translateX
    translateY.value = savedViewState.value.translateY
  } else {
    // 如果没有保存的状态，就重置为默认状态
    resetView()
  }
  savedViewState.value = null
}

// 暴露智能连接点计算给父组件
defineExpose({
  setWorkingAnimation,
  clearWorkingAnimation,
  getSmartConnectionPoints: (connection) => {
    return getSmartConnectionPoints(connection, props.factoryData.areas, GRID_SIZE, svgSize.height)
  },
  getConnectionCurvePoints: (connection) => {
    return getConnectionCurvePoints(connection, props.factoryData.areas, GRID_SIZE, svgSize.height)
  },
  svgSize,
  updateSvgSize,
  zoomToDevice, 
  saveCurrentView, 
  restoreView      
})

// 添加图例组件引用
const factoryLegendRef = ref(null)

</script>

<style scoped>
.factory-floor-plan {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 31, 58, 0.9) 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(0, 255, 255, 0.1),
              inset 0 0 40px rgba(0, 255, 255, 0.05);
  overflow: hidden;
  position: relative;
}

.floor-plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(180deg, rgba(0, 255, 255, 0.1) 0%, transparent 100%);
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  position: relative;
}

.floor-plan-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.floor-plan-header h3 {
  margin: 0;
  color: #00ffff;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.zoom-btn {
  padding: 6px 12px;
  border: 1px solid rgba(0, 255, 255, 0.5);
  background: rgba(0, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #00ffff;
  transition: all 0.3s;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2),
              inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.zoom-btn:hover {
  border-color: #00ffff;
  color: #00ffff;
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5),
              inset 0 0 15px rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
}

.zoom-btn:focus {
  outline: none;
  border-color: #00ffff;
}

.zoom-btn.active {
  background: rgba(255, 0, 110, 0.2);
  color: #ff006e;
  border-color: #ff006e;
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.5),
              inset 0 0 15px rgba(255, 0, 110, 0.2);
}

.zoom-btn:disabled {
  background: rgba(100, 100, 100, 0.1);
  color: #555;
  border-color: #555;
  cursor: not-allowed;
  box-shadow: none;
}

.chart-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: radial-gradient(ellipse at center, rgba(26, 31, 58, 0.5) 0%, rgba(10, 14, 39, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

/* 添加三角形科技纹理背景 */
.chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.02) 49%, rgba(0, 255, 255, 0.02) 51%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(0, 255, 255, 0.02) 49%, rgba(0, 255, 255, 0.02) 51%, transparent 52%);
  background-size: 40px 40px;
  pointer-events: none;
  opacity: 0.5;
}

.factory-svg {
  max-width: 100%;
  max-height: 100%;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(15, 20, 41, 0.9) 100%);
  border-radius: 4px;
  border: 2px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3),
              inset 0 0 50px rgba(0, 255, 255, 0.05);
  transition: transform 0.1s ease;
}

/* 当需要禁用过渡时的class */
.factory-svg.no-transition {
  transition: none;
}

.building-outline {
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))
          drop-shadow(0 0 20px rgba(0, 255, 255, 0.3));
  stroke: #00ffff;
  stroke-width: 3;
  animation: outlinePulse 3s ease-in-out infinite;
}

@keyframes outlinePulse {
  0%, 100% {
    stroke-opacity: 0.6;
    filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
  }
  50% {
    stroke-opacity: 1;
    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.8));
  }
}
</style>