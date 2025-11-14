<template> 
  <router-view/> 
</template>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}

:deep(::-webkit-scrollbar){
  width: 0 !important;
  height: 0 !important;
  color: transparent !important;
  display: none !important;
}

:deep(::-moz-scrollbar){
  width: 0 !important;
  height: 0 !important;
  color: transparent !important;
  display: none !important;
}

:deep(::-ms-scrollbar){
  width: 0 !important;
  height: 0 !important;
  color: transparent !important;
  display: none !important;
}
</style>


