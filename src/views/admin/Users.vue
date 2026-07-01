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
  phone_number: '',
  password: '',
  password_confirmation: '',
  role: 'client'
})

const editUserData = ref({
  id: null,
  name: '',
  email: '',
  phone_number: '',
  role: 'client'
})

// ── Computed ──────────────────────────────────────────────────────────────
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
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
      newUser.value = { name: '', email: '', phone_number: '', password: '', password_confirmation: '', role: 'client' }
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
      phone_number: editUserData.value.phone_number,
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
    phone_number: user.phone_number || '',
    role: user.role || 'client'
  }
  showEditModal.value = true
}

function formatDate(date) {
  if (!date) return '—'
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
            <th>Phone</th>
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
            <td>{{ user.phone_number || '—' }}</td>
            <td>
              <span class="role-badge" :class="user.role || 'client'">
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
        <div class="modal-box">
          <div class="modal-header">
            <h3>Add New User</h3>
            <button class="modal-close" @click="showCreateModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="createUser">
            <div class="form-group">
              <label>Full Name <span class="required">*</span></label>
              <input v-model="newUser.name" type="text" class="form-input" required placeholder="John Doe" />
            </div>
            <div class="form-group">
              <label>Email <span class="required">*</span></label>
              <input v-model="newUser.email" type="email" class="form-input" required placeholder="john@example.com" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input v-model="newUser.phone_number" type="tel" class="form-input" placeholder="+255 712 345 678" />
            </div>
            <div class="form-group">
              <label>Password <span class="required">*</span></label>
              <input v-model="newUser.password" type="password" class="form-input" required placeholder="Min 8 characters" />
            </div>
            <div class="form-group">
              <label>Confirm Password <span class="required">*</span></label>
              <input v-model="newUser.password_confirmation" type="password" class="form-input" required placeholder="Confirm password" />
            </div>
            <div class="form-group">
              <label>Role <span class="required">*</span></label>
              <select v-model="newUser.role" class="form-input">
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <span v-if="isSaving">
                  <span class="spinner-sm"></span>
                  Creating...
                </span>
                <span v-else>Create User</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── EDIT USER MODAL ── -->
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Edit User</h3>
            <button class="modal-close" @click="showEditModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="updateUser">
            <div class="form-group">
              <label>Full Name <span class="required">*</span></label>
              <input v-model="editUserData.name" type="text" class="form-input" required />
            </div>
            <div class="form-group">
              <label>Email <span class="required">*</span></label>
              <input v-model="editUserData.email" type="email" class="form-input" required />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input v-model="editUserData.phone_number" type="tel" class="form-input" placeholder="+255 712 345 678" />
            </div>
            <div class="form-group">
              <label>Role <span class="required">*</span></label>
              <select v-model="editUserData.role" class="form-input">
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <span v-if="isSaving">
                  <span class="spinner-sm"></span>
                  Updating...
                </span>
                <span v-else>Update User</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-users {
  animation: fadeIn 0.4s ease;
}

/* ── User Context Bar ──────────────────────────────────────────────────── */
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

/* ── Role Badge ────────────────────────────────────────────────────────── */
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

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-badge.verified {
  background: rgba(0, 229, 255, 0.15);
  color: #00E5FF;
}

.status-badge:not(.verified) {
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
}

/* ── Page Header ────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.page-sub {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
}

/* ── Buttons ────────────────────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 229, 255, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 30px;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.btn-outline:hover {
  border-color: #00E5FF;
  color: #fff;
  background: rgba(0, 229, 255, 0.05);
}

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-icon.danger:hover {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

/* ── Search Bar ────────────────────────────────────────────────────────── */
.search-bar {
  position: relative;
  margin-bottom: 24px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.25);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.search-input:focus {
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.06);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.result-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
}

/* ── Loading ────────────────────────────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: rgba(255, 255, 255, 0.3);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(0, 196, 212, 0.1);
  border-top-color: #00C4D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(10, 8, 24, 0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Table ───────────────────────────────────────────────────────────────── */
.table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.users-table th {
  text-align: left;
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.users-table td {
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.users-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.users-table tr:last-child td {
  border-bottom: none;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* ── Error ───────────────────────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.2rem;
  cursor: pointer;
}

/* ── Empty State ────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.3);
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #fff;
  margin-bottom: 8px;
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-box {
  background: #13102a;
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 1.2rem;
}

.modal-close {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px 10px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ── Form ────────────────────────────────────────────────────────────────── */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 4px;
}

.required {
  color: #ff6b6b;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.form-input:focus {
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.06);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

select.form-input {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-box {
    padding: 24px;
  }

  .user-context {
    flex-wrap: wrap;
    gap: 6px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .modal-box {
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn-primary,
  .modal-actions .btn-outline {
    width: 100%;
    justify-content: center;
  }
}
</style>