<template>
  <g>
    <!-- 区域背景 -->
    <rect
      :x="areaCoords.x"
      :y="areaCoords.y"
      :width="areaCoords.width"  
      :height="areaCoords.height"
      :fill="getAreaColor(area.type)"
      :stroke="getAreaStrokeColor(area.type)"
      stroke-width="2"
      :opacity="isSelected ? 0.8 : 0.3"
      @click="handleClick"
      style="cursor: pointer"
      class="area-rect"
    />
    
    <!-- 区域标题 -->
    <text
      :x="areaCoords.x + areaCoords.width / 2"
      :y="areaCoords.y + 20"
      text-anchor="middle"
      font-size="14"
      font-weight="bold"
      class="area-title"
    >
      {{ area.name }}
    </text>
  </g>
</template>

<script setup>
import { computed } from 'vue'
import { useConnection } from '../composables/useConnection'
import { useArea } from '../composables/useArea'

const props = defineProps({
  area: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  gridSize: { type: Number, default: 20 },
  svgHeight: { type: Number, required: true }
})

const emit = defineEmits(['click'])

// 使用 composables
const { getAreaPixelCoords } = useConnection()
const { getAreaColor, getAreaStrokeColor } = useArea()

// 计算区域像素坐标
const areaCoords = computed(() => {
  return getAreaPixelCoords(props.area, props.gridSize, props.svgHeight)
})

// 点击处理
const handleClick = (event) => {
  event.stopPropagation()
  emit('click', props.area, event)
}
</script>

<style scoped>
.area-rect {
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
  stroke-width: 3;
  stroke-dasharray: 10, 5;
  animation: borderFlow 2s linear infinite;
}

@keyframes borderFlow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -30; }
}

.area-title {
  pointer-events: none;
  user-select: none;
  fill: #00ffff !important;
  letter-spacing: 2px;
  text-transform: uppercase;
}
</style>