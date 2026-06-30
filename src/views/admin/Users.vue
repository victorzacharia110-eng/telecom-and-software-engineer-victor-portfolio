<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const users = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'client'
})

const editUserData = ref({
  id: null,
  name: '',
  email: '',
  role: 'client'
})

// ── Computed ──────────────────────────────────────────────────────────────
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(user => 
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// ── API Calls ──────────────────────────────────────────────────────────────
async function fetchUsers() {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await api.get('/admin/users')
    if (response.data.success) {
      users.value = response.data.data
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch users'
  } finally {
    isLoading.value = false
  }
}

async function createUser() {
  isSaving.value = true
  error.value = null
  
  try {
    const response = await api.post('/admin/users', newUser.value)
    if (response.data.success) {
      await fetchUsers()
      showCreateModal.value = false
      newUser.value = { name: '', email: '', password: '', role: 'client' }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create user'
  } finally {
    isSaving.value = false
  }
}

async function updateUser() {
  isSaving.value = true
  error.value = null
  
  try {
    const response = await api.patch(`/admin/users/${editUserData.value.id}`, {
      name: editUserData.value.name,
      email: editUserData.value.email,
      role: editUserData.value.role
    })
    if (response.data.success) {
      await fetchUsers()
      showEditModal.value = false
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update user'
  } finally {
    isSaving.value = false
  }
}

async function deleteUser(id) {
  // Prevent self-deletion
  if (id === authStore.userId) {
    alert('You cannot delete your own account!')
    return
  }
  
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    await api.delete(`/admin/users/${id}`)
    await fetchUsers()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete user'
  }
}

function editUser(user) {
  editUserData.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'client'
  }
  showEditModal.value = true
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="admin-users">
    <!-- User Context Bar -->
    <div class="user-context">
      <span>
        <font-awesome-icon icon="fa-regular fa-user" />
        Logged in as: <strong>{{ authStore.userName }}</strong>
      </span>
      <span class="role-badge" :class="authStore.userRole">
        {{ authStore.userRole }}
      </span>
      <span class="context-divider">|</span>
      <span class="total-users">
        <font-awesome-icon icon="fa-solid fa-users" />
        {{ users.length }} total users
      </span>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
      {{ error }}
      <button @click="error = null" class="error-close">×</button>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Users Management</h1>
        <p class="page-sub">Manage all users in the system</p>
      </div>
      <!-- Only show Add User button if user is admin -->
      <button v-if="authStore.isAdmin" class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Add User
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search users by name or email..."
        class="search-input"
      />
      <span class="result-count">{{ filteredUsers.length }} users</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else-if="filteredUsers.length > 0" class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'current-user': user.id === authStore.userId }">
            <td>#{{ user.id }}</td>
            <td>
              <strong>{{ user.name }}</strong>
              <span v-if="user.id === authStore.userId" class="you-badge">(You)</span>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role || 'client' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="{ verified: user.is_verified }">
                {{ user.is_verified ? 'Verified' : 'Pending' }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <!-- Only show edit/delete for non-current user or if admin -->
                <button 
                  v-if="authStore.isAdmin"
                  @click="editUser(user)" 
                  class="btn-icon" 
                  title="Edit"
                >
                  <font-awesome-icon icon="fa-solid fa-pen" />
                </button>
                <button 
                  v-if="authStore.isAdmin && user.id !== authStore.userId"
                  @click="deleteUser(user.id)" 
                  class="btn-icon danger" 
                  title="Delete"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
                <span v-if="user.id === authStore.userId" class="self-msg">Current</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-solid fa-users" size="3x" />
      <h3>No Users Found</h3>
      <p>Start by adding your first user.</p>
    </div>

    <!-- ── CREATE USER MODAL ── -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <!-- Modal content -->
      </div>
    </Transition>

    <!-- ── EDIT USER MODAL ── -->
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <!-- Modal content -->
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ... styles ... */

.user-context {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.user-context strong {
  color: #fff;
}

.context-divider {
  color: rgba(255, 255, 255, 0.1);
}

.total-users {
  color: rgba(255, 255, 255, 0.4);
}

.role-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
}

.role-badge.client {
  background: rgba(37, 99, 196, 0.15);
  color: #2563C4;
}

.current-user {
  background: rgba(0, 229, 255, 0.03);
}

.you-badge {
  font-size: 0.7rem;
  color: #00E5FF;
  margin-left: 6px;
}

.self-msg {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.2);
}
</style>