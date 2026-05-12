<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Login to Portal</h2>
      <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{{ error }}</div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input v-model="email" type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Password</label>
          <input v-model="password" type="password" class="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500">
        </div>
        <!-- VULNERABLE: Form vulnerable to SQL Injection -->
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../api'

export default {
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        const res = await api.post('/login', {
          email: this.email,
          password: this.password
        })
        
        if (res.data.success) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('user', JSON.stringify(res.data.user))
          
          // Redirect to OTP
          this.$router.push('/otp')
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
      }
    }
  }
}
</script>
