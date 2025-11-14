<template>
  <g 
    :transform="`translate(${position.x}, ${position.y})`"
    class="box-component"
    :style="{ opacity: visible ? 1 : 0 }"
  >
    <!-- Box SVG图标 -->
    <foreignObject
      x="-8"
      y="-8"
      width="16"
      height="16"
    >
      <div xmlns="http://www.w3.org/1999/xhtml" class="box-icon-container">
        <img 
          src="/src/assets/devices/box.svg" 
          class="box-svg-icon"
          alt="box"
        />
      </div>
    </foreignObject>
    
    <!-- 移动时的光晕效果 -->
    <circle
      v-show="isMoving"
      cx="0"
      cy="0"
      r="12"
      fill="none"
      stroke="#ffa940"
      stroke-width="2"
      opacity="0.6"
      class="box-glow"
    />
  </g>
</template>

<script setup>
const props = defineProps({
  position: { type: Object, required: true },
  isMoving: { type: Boolean, default: false },
  visible: { type: Boolean, default: true }
})
</script>

<style scoped>
.box-component {
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.box-icon-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-svg-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.box-glow {
  animation: pulse-glow 0.8s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.2);
  }
}
</style>
