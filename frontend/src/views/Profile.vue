<template>
  <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto mt-8">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">User Profile</h2>
    
    <!-- VULNERABLE: Stored XSS -->
    <div v-if="profile.username" class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
      Welcome, <span v-html="profile.username" class="font-semibold"></span>! Here you can manage your details.
    </div>
    <div v-if="successMsg" class="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{{ successMsg }}</div>
    <div v-if="errorMsg" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{{ errorMsg }}</div>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Avatar Section -->
      <div class="flex flex-col items-center">
        <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 border-4 border-blue-100">
          <img v-if="profile.avatar" :src="getAvatar(profile.avatar)" alt="Avatar" class="w-full h-full object-cover" @error="handleImageError">
          <div v-else class="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
        </div>
        
        <!-- VULNERABLE: Unrestricted File Upload -->
        <label class="block mb-2 text-sm text-gray-600 font-medium">Update Avatar</label>
        <input type="file" ref="fileInput" @change="uploadAvatar" class="text-sm w-full max-w-[200px] mb-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
      </div>

      <!-- Form Section -->
      <!-- VULNERABLE: Broken Access Control (IDOR) on submit -->
      <form @submit.prevent="updateProfile" class="flex-grow">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Username</label>
          <input v-model="profile.username" type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email (Read-only)</label>
          <input v-model="profile.email" type="text" class="w-full border rounded px-3 py-2 bg-gray-100" readonly>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Phone</label>
          <input v-model="profile.phone" type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Address</label>
          <textarea v-model="profile.address" rows="3" class="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"></textarea>
        </div>
        <div class="mb-6 bg-yellow-50 p-3 rounded border border-yellow-200">
          <label class="block text-gray-700 mb-1 font-semibold">Salary</label>
          <div class="text-lg text-gray-800">${{ profile.salary }}</div>
        </div>

        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Save Changes</button>
      </form>
    </div>
  </div>
</template>

<script>
import api, { getAvatarUrl } from '../api'

export default {
  data() {
    return {
      profile: {
        username: '',
        email: '',
        phone: '',
        address: '',
        salary: '',
        avatar: ''
      },
      successMsg: '',
      errorMsg: ''
    }
  },
  mounted() {
    this.fetchProfile()
  },
  methods: {
    getAvatar(path) {
      return getAvatarUrl(path);
    },
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` }
    },
    async fetchProfile() {
      try {
        // VULNERABLE: IDOR - fetches data based on URL parameter which can be manipulated
        const id = this.$route.params.id
        const res = await api.get(`/users/${id}`, {
          headers: this.getAuthHeaders()
        })
        if (res.data.success) {
          this.profile = res.data.data
        }
      } catch (err) {
        this.errorMsg = 'Failed to load profile. ' + (err.response?.data?.message || '')
      }
    },
    async updateProfile() {
      try {
        // VULNERABLE: IDOR - updates data based on URL parameter which can be manipulated
        const id = this.$route.params.id
        const res = await api.put(`/users/${id}`, {
          username: this.profile.username,
          phone: this.profile.phone,
          address: this.profile.address
        }, {
          headers: this.getAuthHeaders()
        })
        
        if (res.data.success) {
          this.successMsg = 'Profile updated successfully!'
          setTimeout(() => this.successMsg = '', 3000)
        }
      } catch (err) {
        this.errorMsg = 'Failed to update profile.'
      }
    },
    async uploadAvatar(event) {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('avatar', file)
      formData.append('userId', this.$route.params.id)

      try {
        // VULNERABLE: File Upload
        const res = await api.post('/upload', formData, {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (res.data.success) {
          this.profile.avatar = res.data.url
          this.successMsg = 'Avatar uploaded successfully! You can access it directly at: ' + res.data.url
          setTimeout(() => this.successMsg = '', 5000)
        }
      } catch (err) {
        this.errorMsg = 'Failed to upload avatar.'
      }
    },
    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/150?text=No+Image'
    }
  }
}
</script>
