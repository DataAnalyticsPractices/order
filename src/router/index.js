import { createRouter, createWebHistory } from 'vue-router'
import Production from '../views/Production.vue'
import Shipping from '../views/Shipping.vue'

const routes = [
  {
    path: '/',
    redirect: '/production'
  },
  {
    path: '/production',
    name: 'Production',
    component: Production
  },
  {
    path: '/shipping',
    name: 'Shipping',
    component: Shipping
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
