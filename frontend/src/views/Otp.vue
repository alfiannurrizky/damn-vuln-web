<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">2-Factor Authentication</h2>
      <p class="text-center text-gray-600 mb-6">Please enter the 6-digit OTP sent to your device.</p>
      <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{{ error }}</div>
      <form @submit.prevent="verifyOtp">
        <div class="mb-6">
          <input v-model="otp" type="text" class="w-full border rounded px-3 py-2 text-center text-xl tracking-widest focus:outline-none focus:border-blue-500" maxlength="6">
        </div>
        <!-- VULNERABLE: OTP bypass by changing the response in BurpSuite -->
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Verify OTP</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../api'

export default {
  data() {
    return {
      otp: '',
      error: ''
    }
  },
  methods: {
    async verifyOtp() {
      try {
        const res = await api.post('/verify-otp', {
          otp: this.otp
        })
        
        // VULNERABLE LOGIC: 
        // Completely trusting the response from the server without session/token validation 
        if (res.data.success) {
          this.$router.push('/dashboard')
        } else {
          this.error = res.data.message || 'Invalid OTP'
        }
      } catch (err) {
        this.error = 'Verification failed'
      }
    }
  }
}
</script>
