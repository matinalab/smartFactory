<template>
  <div>
    <!-- 设备详情弹窗 -->
    <div v-if="selectedDevice" class="device-popup" :style="popupStyle" @click.stop>
      <div class="popup-header">
        <h4>{{ selectedDevice.name }}</h4>
        <span @click="closePopup" class="close-btn">×</span>
      </div>
      <div class="popup-content">
        <div class="info-row">
          <span class="label">类型:</span>
          <span class="value">{{ selectedDevice.type }}</span>
        </div>
        <div class="info-row">
          <span class="label">状态:</span>
          <span class="value" :class="selectedDevice.status">{{ getStatusText(selectedDevice.status) }}</span>
        </div>
        <div class="info-row">
          <span class="label">所在区域:</span>
          <span class="value">{{ selectedDevice.area }}</span>
        </div>
        <div class="info-row">
          <span class="label">效率:</span>
          <span class="value">{{ selectedDevice.efficiency }}%</span>
        </div>
      </div>
    </div>

    <!-- 悬浮tooltip -->
    <div v-if="hoveredDevice && !selectedDevice" class="device-tooltip" :style="tooltipStyle">
      <div class="tooltip-content">
        <strong>{{ hoveredDevice.name }}</strong>
        <div class="tooltip-status" :class="hoveredDevice.status">
          {{ getStatusText(hoveredDevice.status) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  selectedDevice: {
    type: Object,
    default: null
  },
  hoveredDevice: {
    type: Object,
    default: null
  },
  popupStyle: {
    type: Object,
    default: () => ({})
  },
  tooltipStyle: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['close'])

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

// 关闭弹窗
const closePopup = () => {
  emit('close')
}
</script>

<style scoped>
.device-popup {
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 31, 58, 0.98) 100%);
  border-radius: 6px;
  border: 2px solid rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4),
              0 0 40px rgba(0, 255, 255, 0.2),
              inset 0 0 30px rgba(0, 255, 255, 0.1);
  min-width: 200px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.device-tooltip {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 14, 39, 0.98) 100%);
  color: #00ffff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.5);
  font-size: 11px;
  z-index: 999;
  pointer-events: none;
  max-width: 150px;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5),
              inset 0 0 20px rgba(0, 255, 255, 0.1);
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
}

.tooltip-content {
  text-align: center;
}

.tooltip-status {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tooltip-status.running {
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
}

.tooltip-status.error {
  color: #ff006e;
  text-shadow: 0 0 10px rgba(255, 0, 110, 0.8);
}

.tooltip-status.warning {
  color: #faad14;
  text-shadow: 0 0 10px rgba(250, 173, 20, 0.8);
}

.tooltip-status.idle {
  color: #666;
  text-shadow: none
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.15) 0%, transparent 100%);
  border-radius: 4px 4px 0 0;
}

.popup-header h4 {
  margin: 0;
  color: #00ffff;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.close-btn {
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  color: #ffffff;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(0, 255, 255, 0.3);
  transform: scale(1.1);
}

.popup-content {
  padding: 12px 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: rgba(0, 255, 255, 0.7);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-row .value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.value.running {
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
}

.value.error {
  color: #ff006e;
  text-shadow: 0 0 10px rgba(255, 0, 110, 0.6);
}

.value.warning {
  color: #faad14;
  text-shadow: 0 0 10px rgba(250, 173, 20, 0.6);
}

.value.idle {
  color: #666;
}
</style> 