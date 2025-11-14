import { createApp } from 'vue'
import './style.css'
import '@/styles/index.scss'
import App from './App.vue'
import router from './router'
import { createPinia } from "pinia"
import utils from '@/utils/index'

const app = createApp(App)
app.use(createPinia()).use(router).mount('#app')
app.config.globalProperties.$Utils = utils


