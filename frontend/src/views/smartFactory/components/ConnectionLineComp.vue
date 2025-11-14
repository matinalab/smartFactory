<template>
  <g v-if="connectionInfo">
    <!-- 内层管道 -->
    <path
      :d="connectionPath"
      :stroke="getConnectionColor(connection.type)"
      stroke-width="3"
      fill="none"
      class="connection-line-core"
    />
    
    <!-- 流动粒子效果（虚线） -->
    <path
      :d="connectionPath"
      stroke="#ffffff"
      stroke-width="2"
      stroke-dasharray="8,12"
      fill="none"
      opacity="0.8"
      class="connection-particles"
    />
    
    <!-- 零件组件 -->
    <ConnectionComponent
      v-if="connection.component && midPoint"
      :component="connection.component"
      :position="midPoint"
      @click="handleComponentClick"
    />
  </g>
</template>

<script setup>
import { computed } from 'vue'
import ConnectionComponent from './ConnectionComp.vue'
import { useConnection } from '../composables/useConnection'

const props = defineProps({
  connection: { type: Object, required: true },
  areas: { type: Array, required: true },
  gridSize: { type: Number, default: 20 },
  svgHeight: { type: Number, required: true }
})

const emit = defineEmits(['component-click'])

// 使用 useConnection
const { getSmartConnectionPoints, getConnectionPath, getConnectionColor } = useConnection()

// 连接信息
const connectionInfo = computed(() => {
  return getSmartConnectionPoints(props.connection, props.areas, props.gridSize, props.svgHeight)
})

// 连接路径
const connectionPath = computed(() => {
  return getConnectionPath(props.connection, props.areas, props.gridSize, props.svgHeight)
})

// 中点计算
const midPoint = computed(() => {
  if (!connectionInfo.value) return null
  const { fromPoint, toPoint } = connectionInfo.value
  return {
    x: (fromPoint.x + toPoint.x) / 2,
    y: (fromPoint.y + toPoint.y) / 2
  }
})

// 零件点击处理
const handleComponentClick = (component, event) => {
  emit('component-click', component, event)
}

// 暴露给父组件（叉车动画用）
defineExpose({
  connection: props.connection,
  connectionInfo,
  getConnectionCurvePoints: (numPoints = 5) => {
    const { getConnectionCurvePoints } = useConnection()
    return getConnectionCurvePoints(props.connection, props.areas, props.gridSize, props.svgHeight, numPoints)
  }
})
</script>

<style scoped>
/* 外层光晕 - 最宽的模糊发光 */
.connection-glow-outer {
  filter: blur(8px);
}

/* 中层发光 - 中等模糊 */
.connection-glow-middle {
  filter: blur(4px);
}

/* 内层核心管道 - 清晰的主线 */
.connection-line-core {
  animation: corePulse 2s ease-in-out infinite;
}

@keyframes corePulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 流动粒子效果 */
.connection-particles {
  animation: particleFlow 2s linear infinite;
  filter: drop-shadow(0 0 4px #ffffff)
          drop-shadow(0 0 8px #ffffff);
}

@keyframes particleFlow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -20;
  }
}
</style>