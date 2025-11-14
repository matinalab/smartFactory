<template>
  <div class="device-icon" :style="{ width: size, height: size }">
    <img 
      :src="iconPath" 
      :alt="type"
      class="icon-svg"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '24px'
  }
})

const error = ref(false)

const iconPath = computed(() => {
  const mapper = deviceIconMap[props.type]
  if (mapper) {
    return mapper(props.deviceId)
  }
  return '/src/assets/devices/box.svg' // 默认图标
})

const handleError = () => {
  error.value = true
}
</script>

<style scoped>
.device-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>