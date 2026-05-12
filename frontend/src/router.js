import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Otp from './views/Otp.vue'
import Dashboard from './views/Dashboard.vue'
import Profile from './views/Profile.vue'
import EmployeeList from './views/EmployeeList.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/otp', name: 'Otp', component: Otp },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/profile/:id', name: 'Profile', component: Profile },
  { path: '/employees', name: 'EmployeeList', component: EmployeeList }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Simple auth guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/otp']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('token')

  if (authRequired && !loggedIn) {
    return next('/login')
  }

  next()
})

export default router
