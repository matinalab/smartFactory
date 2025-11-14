import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', () => {
  const isLoading = ref(false)
  const changeLoading = (data) => {
    isLoading.value = data
  }

  return { isLoading, changeLoading }
})


