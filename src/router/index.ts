import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import AdvicePage from '@/pages/AdvicePage.vue'
import PrescriptionPage from '@/pages/PrescriptionPage.vue'
import StatsPage from '@/pages/StatsPage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/advice',
    name: 'advice',
    component: AdvicePage,
  },
  {
    path: '/prescription',
    name: 'prescription',
    component: PrescriptionPage,
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsPage,
  },
  {
    path: '/about',
    name: 'about',
    component: {
      template: '<div class="text-center text-xl p-8">About Page - Coming Soon</div>',
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
