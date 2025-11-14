<template>
  <div class="legend">
    <h4>设备图例</h4>
    <div class="legend-items">
      <div 
        v-for="item in legendItems" 
        :key="item.type" 
        class="legend-item"
        @click="toggleLegendItem(item.type)"
        :class="{ active: item.visible }"
      >
        <div 
          class="legend-icon"
          :style="{ 
            backgroundColor: item.color,
            borderRadius: getDeviceShape(item.type) === 'circle' ? '50%' : '3px'
          }"
        >
          <img 
            :src="getDeviceIconPath(item.type)" 
            class="legend-svg-icon"
            :alt="item.type"
          />
        </div>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-count">({{ item.count }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDevice } from '../composables/useDevice'

// Props
const props = defineProps({
  factoryData: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['legend-toggle'])

// 使用设备配置
const { getDeviceShape, getDeviceIconPath, getDeviceColor } = useDevice()

// 设备类型的中文标签映射
const deviceLabels = {
  robot: '机械臂',
  cnc: 'CNC机床',
  conveyor: '传输设备',
  forklift: '叉车',
  shelf: '货架',
  tester: '检测设备',
  camera: '摄像头',
  washer: '清洗机',
  reactor: '反应釜',
  pump: '物料泵',
  mixer: '搅拌机',
  labeler: '贴标机',
  filler: '灌装机',
  feeder: '投料机',
  dryer: '烘干机',
  capper: '封盖机',
  tranCar: '运输车'
}

// 动态生成图例项
const legendItems = computed(() => {
  // 获取所有设备
  const allDevices = props.factoryData.areas
    .flatMap(area => area.devices || [])
  
  // 按类型分组统计
  const devicesByType = {}
  allDevices.forEach(device => {
    if (!devicesByType[device.type]) {
      devicesByType[device.type] = {
        count: 0,
        visible: true
      }
    }
    devicesByType[device.type].count++
  })
  
  // 生成图例项
  return Object.keys(devicesByType)
    .sort() // 按字母顺序排序
    .map(type => ({
      type,
      label: deviceLabels[type] || type,
      color: getDeviceColor(type, 'running'), // 使用运行状态的颜色
      visible: devicesByType[type].visible,
      count: devicesByType[type].count
    }))
})

// 切换图例项
const toggleLegendItem = (type) => {
  const item = legendItems.value.find(item => item.type === type)
  if (item) {
    item.visible = !item.visible
    emit('legend-toggle', type, item.visible)
  }
}

// 暴露legendItems给父组件
defineExpose({
  legendItems
})
</script>

<style scoped>
.legend {
  padding: 15px 20px;
  border-top: 2px solid rgba(139, 92, 246, 0.3);
  background: linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.1) 100%);
  position: relative;
}

.legend::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
}

.legend h4 {
  margin: 0 0 12px 0;
  color: #8b5cf6;
  font-size: 12px;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(139, 92, 246, 0.3);
  font-size: 11px;
  background: rgba(139, 92, 246, 0.05);
}

.legend-item:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  transform: translateY(-2px);
}

.legend-item.active {
  background: rgba(0, 255, 136, 0.15);
  border-color: #00ff88;
}

.legend-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  font-weight: bold;
}

.legend-svg-icon {
  width: 12px;
  height: 12px;
  object-fit: contain;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
}

.legend-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.legend-count {
  color: rgba(0, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 600;
}
</style>
