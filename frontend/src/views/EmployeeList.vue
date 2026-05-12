<template>
  <div class="bg-white p-8 rounded-lg shadow-md max-w-5xl mx-auto mt-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Employee Directory</h2>
      
      <!-- VULNERABLE: Search input vulnerable to SQL Injection -->
      <form @submit.prevent="searchEmployees" class="flex">
        <input v-model="searchQuery" type="text" placeholder="Search name..." class="border rounded-l px-3 py-2 focus:outline-none focus:border-blue-500">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition">Search</button>
      </form>
    </div>

    <div v-if="errorMsg" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{{ errorMsg }}</div>
    
    <!-- VULNERABLE: Reflected XSS -->
    <div v-if="lastSearchQuery" class="mb-4 text-gray-700 p-3 bg-gray-50 border rounded">
      Search results for: <span v-html="lastSearchQuery" class="font-semibold text-blue-600"></span>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="py-3 px-4 border-b font-semibold text-gray-700">ID</th>
            <th class="py-3 px-4 border-b font-semibold text-gray-700">Avatar</th>
            <th class="py-3 px-4 border-b font-semibold text-gray-700">Name</th>
            <th class="py-3 px-4 border-b font-semibold text-gray-700">Email</th>
            <th class="py-3 px-4 border-b font-semibold text-gray-700">Role</th>
            <th class="py-3 px-4 border-b font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employees" :key="emp.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 border-b text-gray-600">{{ emp.id }}</td>
            <td class="py-3 px-4 border-b">
              <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <img v-if="emp.avatar" :src="getAvatar(emp.avatar)" alt="Avatar" class="w-full h-full object-cover" @error="handleImageError">
                <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
              </div>
            </td>
            <td class="py-3 px-4 border-b text-gray-800">{{ emp.username }}</td>
            <td class="py-3 px-4 border-b text-gray-600">{{ emp.email }}</td>
            <td class="py-3 px-4 border-b">
              <span :class="emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'" class="px-2 py-1 rounded text-xs font-semibold uppercase">
                {{ emp.role }}
              </span>
            </td>
            <td class="py-3 px-4 border-b">
              <router-link :to="`/profile/${emp.id}`" class="text-blue-600 hover:underline">View Profile</router-link>
            </td>
          </tr>
          <tr v-if="employees.length === 0">
            <td colspan="6" class="py-6 text-center text-gray-500">No employees found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api, { getAvatarUrl } from '../api'

export default {
  data() {
    return {
      employees: [],
      searchQuery: '',
      lastSearchQuery: '',
      errorMsg: ''
    }
  },
  mounted() {
    this.fetchEmployees()
  },
  methods: {
    getAvatar(path) {
      return getAvatarUrl(path);
    },
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` }
    },
    async fetchEmployees() {
      try {
        const res = await api.get('/users', {
          headers: this.getAuthHeaders()
        })
        if (res.data.success) {
          this.employees = res.data.data
        }
      } catch (err) {
        this.errorMsg = 'Failed to fetch employees'
      }
    },
    async searchEmployees() {
      try {
        // VULNERABLE: SQL Injection via q parameter
        const res = await api.get(`/search?q=${this.searchQuery}`, {
          headers: this.getAuthHeaders()
        })
        if (res.data.success) {
          this.employees = res.data.data
          this.lastSearchQuery = this.searchQuery
          this.errorMsg = ''
        }
      } catch (err) {
        this.errorMsg = 'Search failed: ' + (err.response?.data?.error || err.message)
      }
    },
    handleImageError(e) {
      e.target.style.display = 'none'
    }
  }
}
</script>
