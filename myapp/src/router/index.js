import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Stations from '@/views/Stations.vue'
import Map from '@/views/Map.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/stations',
    name: 'Stations',
    component: Stations
  },
  {
    path: '/map',
    name: 'Map',
    component: Map
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router