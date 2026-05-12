<template>
  <div class="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
    <h1 class="text-3xl font-bold mb-4 text-gray-800">Welcome to Employee Portal</h1>
    <p class="text-gray-600 mb-8">This portal allows you to manage your profile and view employee information.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h2 class="text-xl font-bold text-blue-800 mb-2">My Profile</h2>
        <p class="text-gray-600 mb-4">View and edit your personal information, address, and upload your avatar.</p>
        <router-link :to="`/profile/${user.id}`" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Go to Profile</router-link>
      </div>
      
      <div class="bg-green-50 p-6 rounded-lg border border-green-100">
        <h2 class="text-xl font-bold text-green-800 mb-2">Employee Directory</h2>
        <p class="text-gray-600 mb-4">Search and view other employees in the organization.</p>
        <router-link to="/employees" class="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">View Employees</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {}
    }
  },
  mounted() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        this.user = JSON.parse(userStr)
      } catch(e) {}
    }
  }
}
</script>
