<template>
  <g :transform="`translate(${position.x}, ${position.y})`"
     class="connection-component-group"
     @click="handleClick">
    
    <!-- 零件悬浮背景（增大点击区域） -->
    <rect
      x="-20"
      y="-20"
      width="40"
      height="40"
      fill="transparent"
      class="component-hover-area"
    />

    <!-- 光圈效果 -->
    <g v-if="component.status !== 'error'">
      <!-- 外层光圈 -->
      <circle
        cx="0"
        cy="0"
        r="18"
        fill="none"
        stroke-width="1"
        class="component-outer-ring"
      />

      <!-- 中层光圈 -->
      <circle
        cx="0"
        cy="0"
        r="15"
        fill="none"
        stroke-width="2"
        class="component-middle-ring"
      />

      <!-- 内层发光圈 -->
      <circle
        cx="0"
        cy="0"
        r="13"
        fill="none"
        stroke-width="1"
        class="component-inner-ring"
      />
    </g>

    <!-- 零件背景圆形 -->
    <circle
      cx="0"
      cy="0"
      r="12"
      :fill="getComponentColor(component.type)"
      stroke="#fff"
      stroke-width="2"
      class="connection-component"
    />
    
    <!-- 零件图标 -->
    <text
      x="0"
      y="0"
      text-anchor="middle"
      font-size="12"
      fill="white"
      dy="0.3em"
      font-weight="bold"
      class="component-icon"
    >
      {{ getComponentIcon(component.type) }}
    </text>
    
    <!-- 零件状态指示灯 -->
    <circle
      cx="8"
      cy="-8"
      r="3"
      :fill="getStatusColor(component.status)"
      stroke="#fff"
      stroke-width="1"
      class="component-status-indicator"
    />
  </g>
</template>

<script setup>
import { useConnection } from '../composables/useConnection'
import { useDevice } from '../composables/useDevice'

// Props
const props = defineProps({
  component: { type: Object, required: true },
  position: { type: Object, required: true }
})

// Emits
const emit = defineEmits(['click'])

// 使用 composables
const { getComponentColor, getComponentIcon } = useConnection()
const { getStatusColor } = useDevice()

// 点击处理
const handleClick = (event) => {
  event.stopPropagation()
  emit('click', props.component, event)
}
</script>

<style scoped>
/* 零件组整体样式 */
.connection-component-group {
  /* transition: all 0.3s ease; */
}

/* 零件点击区域样式 */
.component-hover-area {
  pointer-events: all;
  cursor: pointer;
}

/* 连接零件样式 */
.connection-component {
  pointer-events: none;
}

/* 零件图标样式 */
.component-icon {
  pointer-events: none;
  user-select: none;
}

/* 零件状态指示灯样式 */
.component-status-indicator {
  pointer-events: none;
}

/* 悬浮时显示光圈效果 */
.connection-component-group:hover .component-outer-ring {
  opacity: 1;
  animation: pulse-outer 2s ease-in-out infinite;
}

.connection-component-group:hover .component-middle-ring {
  opacity: 1;
  animation: pulse-middle 1.5s ease-in-out infinite reverse;
}

.connection-component-group:hover .component-inner-ring {
  opacity: 1;
  animation: pulse-inner 1s ease-in-out infinite;
}

/* 悬浮时零件轻微放大 */
.connection-component-group:hover .connection-component {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)) drop-shadow(0 0 15px rgba(24, 144, 255, 0.3));
}

.connection-component-group:hover .component-icon {
  transform: scale(1.1);
}

.connection-component-group:hover .component-status-indicator {
  transform: scale(1.1);
}

/* 光圈脉冲动画 */
@keyframes pulse-outer {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.8;
    stroke: #00ffff;
  }
  50% { 
    transform: scale(1.2);
    opacity: 0.3;
  }
}

@keyframes pulse-middle {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.6;
    stroke: #00ffff;
  }
  50% { 
    transform: scale(1.15);
    opacity: 0.3;
  }
}

@keyframes pulse-inner {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.5;
  }
}
</style> 