<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <nav class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center" v-if="isLoggedIn">
      <div class="text-xl font-bold">Employee Portal (LAB)</div>
      <div class="space-x-4">
        <router-link to="/dashboard" class="hover:underline">Dashboard</router-link>
        <router-link to="/employees" class="hover:underline">Employees</router-link>
        <router-link :to="`/profile/${userId}`" class="hover:underline">Profile</router-link>
        <button @click="logout" class="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
      </div>
    </nav>
    <div class="flex-grow p-4 md:p-8">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    const isLoggedIn = computed(() => {
      // Don't show nav on login or otp
      return !['Login', 'Otp'].includes(route.name) && localStorage.getItem('token')
    })

    const userId = computed(() => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          return user.id
        } catch(e) {}
      }
      return ''
    })

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    return { isLoggedIn, userId, logout }
  }
}
</script>
