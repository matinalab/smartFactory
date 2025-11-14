<template>
  <g
    :transform="`translate(${position.x}, ${position.y})`"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    style="cursor: pointer"
    class="device-group"
    :class="{ 
      selected: isSelected,
      hovered: isHovered
    }"
  >
    <!-- 设备悬浮背景（增大点击区域，避免抖动） -->
    <rect
      x="-20"
      y="-20"
      width="40"
      height="40"
      fill="transparent"
      class="device-hover-area"
    />

    <!-- 设备SVG图标 -->
    <foreignObject
      x="-20"
      y="-20"
      width="40"
      height="40"
    >
      <div xmlns="http://www.w3.org/1999/xhtml" class="device-icon-container">
        <img 
          :src="getDeviceIconPath(device.type, device.id)" 
          class="device-svg-icon"
          :alt="device.type"
        />
      </div>
    </foreignObject>

    <!-- 状态指示灯 -->
    <circle
      cx="15"
      cy="-15"
      r="4"
      :fill="getStatusColor(device.status)"
      stroke="#fff"
      stroke-width="2"
      class="status-indicator"
    />

    <!-- 设备标签 -->
    <!-- <text
      x="0"
      y="30"
      text-anchor="middle"
      font-size="10"
      fill="#666"
      class="device-label"
    >
      {{ device.name }}
    </text> -->

    <!-- 悬浮时的高亮圈 -->
    <circle
      v-if="isHovered"
      cx="0"
      cy="0"
      r="22"
      fill="none"
      :stroke="getHoverColor(device.status)"
      stroke-width="2"
      stroke-dasharray="5,5"
      :class="getHoverAnimationClass(device.status)"
    />
  </g>
</template>

<script setup>
import { useDevice } from '../composables/useDevice'

// Props
const props = defineProps({
  device: { type: Object, required: true },
  area: { type: Object, required: true },
  position: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isHovered: { type: Boolean, default: false }
})

// Emits
const emit = defineEmits(['click', 'mouseenter', 'mouseleave'])

// 使用设备配置 composable
const {
  getDeviceColor,
  getDeviceStrokeColor, 
  getDeviceTextColor,
  getStatusColor,
  getDeviceShape,
  getDeviceIcon,
  getDeviceIconPath,
  getHoverAnimationClass,
  getHoverColor
} = useDevice()

// 事件处理
const handleClick = (event) => {
  emit('click', props.device, props.area, event)
}

const handleMouseEnter = (event) => {
  emit('mouseenter', props.device, props.area, event, true)
}

const handleMouseLeave = (event) => {
  emit('mouseleave', props.device, props.area, event, false)
}
</script>

<style scoped>
.device-group {
  transition: none;
}

.device-hover-area {
  pointer-events: all;
}

.device-label {
  pointer-events: none;
  user-select: none;
  fill: #00ffff !important;
  letter-spacing: 1px;
}

.device-icon-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.device-svg-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  pointer-events: none;
}

.hover-highlight {
  animation: rotate 2s linear infinite;
  stroke: #00ffff;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.8));
}

.hover-highlight-blink {
  animation: simpleBlink 1s ease-in-out infinite;
}

@keyframes rotate {
  from { 
    transform: rotate(0deg);
  }
  to { 
    transform: rotate(360deg);
  }
}

@keyframes simpleBlink {
  0%, 100% { 
    opacity: 1;
  }
  50% { 
    opacity: 0.3;
  }
}

.status-indicator {
  animation: statusPulse 2s infinite;
  filter: drop-shadow(0 0 8px currentColor);
}

@keyframes statusPulse {
  0%, 100% { 
    opacity: 1;
  }
  50% { 
    opacity: 0.6;
  }
}

/* 设备悬浮时的增强效果 */
.device-group.hovered {
  filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.8))
          drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
}

/* 选中效果 */
.device-group.selected {
  filter: drop-shadow(0 0 20px rgba(255, 0, 110, 0.9))
          drop-shadow(0 0 40px rgba(255, 0, 110, 0.5));
}
</style> 