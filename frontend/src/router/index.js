import { createRouter, createWebHistory } from "vue-router"
import SmartFactory from "@/views/smartFactory/index.vue"

const routes = [
  {
    path: "/",
    name: "smartFactory",
    component: SmartFactory,
    meta: { title: "智慧工厂监控系统" }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const title = to.meta?.title || "智慧工厂监控系统"
  if (title) {
    document.title = title
  }
  next()
})

export default router


