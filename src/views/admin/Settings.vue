<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const isLoading = ref(false)
const error = ref(null)
const successMessage = ref(null)
const activeTab = ref('profile')

// ── Profile Form ──────────────────────────────────────────────────────────
const profileForm = reactive({
  name: '',
  email: '',
  phone_number: '',
  role: '',
})

// ── Password Form ──────────────────────────────────────────────────────────
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const isUpdatingPassword = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────
const isPasswordValid = computed(() => {
  return (
    passwordForm.current_password.length >= 8 &&
    passwordForm.new_password.length >= 8 &&
    passwordForm.new_password === passwordForm.new_password_confirmation
  )
})

// ── Methods ──────────────────────────────────────────────────────────────
async function fetchProfile() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.get('/user')
    if (response.data.success) {
      const user = response.data.data.user
      profileForm.name = user.name
      profileForm.email = user.email
      profileForm.phone_number = user.phone_number || ''
      profileForm.role = user.role || 'client'
      console.log('✅ Profile loaded')
    }
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err)
    error.value = err.response?.data?.message || 'Failed to load profile'
  } finally {
    isLoading.value = false
  }
}

async function updateProfile() {
  isLoading.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await api.patch('/admin/profile', {
      name: profileForm.name,
      email: profileForm.email,
      phone_number: profileForm.phone_number,
    })

    if (response.data.success) {
      successMessage.value = 'Profile updated successfully!'
      authStore.setUser(response.data.data)
      console.log('✅ Profile updated')
      
      setTimeout(() => {
        successMessage.value = null
      }, 3000)
    }
  } catch (err) {
    console.error('❌ Failed to update profile:', err)
    error.value = err.response?.data?.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}

async function updatePassword() {
  if (!isPasswordValid.value) {
    error.value = 'Please check your password requirements'
    return
  }

  isUpdatingPassword.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await api.post('/change-password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      new_password_confirmation: passwordForm.new_password_confirmation,
    })

    if (response.data.success) {
      successMessage.value = 'Password changed successfully!'
      passwordForm.current_password = ''
      passwordForm.new_password = ''
      passwordForm.new_password_confirmation = ''
      console.log('✅ Password updated')
      
      setTimeout(() => {
        successMessage.value = null
      }, 3000)
    }
  } catch (err) {
    console.error('❌ Failed to update password:', err)
    error.value = err.response?.data?.message || 'Failed to update password'
  } finally {
    isUpdatingPassword.value = false
  }
}

function clearMessages() {
  error.value = null
  successMessage.value = null
}

function switchTab(tab) {
  activeTab.value = tab
  clearMessages()
}

function confirmDelete() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
    // Handle account deletion
    console.log('Account deletion requested')
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="admin-settings">
    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-sub">Manage your account settings and preferences</p>
      </div>
    </div>

    <!-- ── Tabs ──────────────────────────────────────────────────────────── -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'profile' }"
        @click="switchTab('profile')"
      >
        <font-awesome-icon icon="fa-regular fa-user" />
        Profile
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'security' }"
        @click="switchTab('security')"
      >
        <font-awesome-icon icon="fa-solid fa-shield-alt" />
        Security
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'preferences' }"
        @click="switchTab('preferences')"
      >
        <font-awesome-icon icon="fa-solid fa-sliders-h" />
        Preferences
      </button>
    </div>

    <!-- ── Messages ──────────────────────────────────────────────────────── -->
    <div v-if="error" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
      {{ error }}
      <button @click="error = null" class="close-btn">×</button>
    </div>

    <div v-if="successMessage" class="success-banner">
      <font-awesome-icon icon="fa-regular fa-circle-check" />
      {{ successMessage }}
      <button @click="successMessage = null" class="close-btn">×</button>
    </div>

    <!-- ── Profile Tab ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'profile'" class="tab-content">
      <div class="settings-card">
        <div class="card-header">
          <h3>Profile Information</h3>
          <p class="card-sub">Update your personal information</p>
        </div>

        <form @submit.prevent="updateProfile" class="settings-form">
          <div class="form-group">
            <label>Full Name</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input
              v-model="profileForm.email"
              type="email"
              class="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input
              v-model="profileForm.phone_number"
              type="tel"
              class="form-input"
              placeholder="+255 712 345 678"
            />
          </div>

          <div class="form-group">
            <label>Role</label>
            <input
              :value="profileForm.role"
              type="text"
              class="form-input"
              disabled
            />
            <span class="form-hint">Role cannot be changed here</span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="isLoading">
                <span class="spinner-sm"></span>
                Saving...
              </span>
              <span v-else>
                <font-awesome-icon icon="fa-solid fa-save" />
                Save Changes
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- ── Account Stats ──────────────────────────────────────────────── -->
      <div class="settings-card stats-card">
        <div class="card-header">
          <h3>Account Information</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Account Created</span>
            <span class="stat-value">{{ authStore.accountAge || 'N/A' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Account Type</span>
            <span class="stat-value role-badge" :class="authStore.userRole">
              {{ authStore.userRole || 'client' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Email Verified</span>
            <span class="stat-value">
              <span class="status-dot" :class="{ verified: authStore.isVerified }"></span>
              {{ authStore.isVerified ? 'Verified' : 'Pending' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">User ID</span>
            <span class="stat-value">#{{ authStore.userId || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Security Tab ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'security'" class="tab-content">
      <div class="settings-card">
        <div class="card-header">
          <h3>Change Password</h3>
          <p class="card-sub">Update your password to keep your account secure</p>
        </div>

        <form @submit.prevent="updatePassword" class="settings-form">
          <div class="form-group">
            <label>Current Password</label>
            <input
              v-model="passwordForm.current_password"
              type="password"
              class="form-input"
              placeholder="Enter your current password"
              required
              minlength="8"
            />
          </div>

          <div class="form-group">
            <label>New Password</label>
            <input
              v-model="passwordForm.new_password"
              type="password"
              class="form-input"
              placeholder="Enter new password (min 8 characters)"
              required
              minlength="8"
            />
            <div class="password-requirements">
              <span :class="{ met: passwordForm.new_password.length >= 8 }">
                <font-awesome-icon :icon="passwordForm.new_password.length >= 8 ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                At least 8 characters
              </span>
              <span :class="{ met: /[A-Z]/.test(passwordForm.new_password) && /[a-z]/.test(passwordForm.new_password) }">
                <font-awesome-icon :icon="/[A-Z]/.test(passwordForm.new_password) && /[a-z]/.test(passwordForm.new_password) ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                Uppercase & lowercase
              </span>
              <span :class="{ met: /[0-9]/.test(passwordForm.new_password) }">
                <font-awesome-icon :icon="/[0-9]/.test(passwordForm.new_password) ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                At least 1 number
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Confirm New Password</label>
            <input
              v-model="passwordForm.new_password_confirmation"
              type="password"
              class="form-input"
              placeholder="Confirm your new password"
              required
              minlength="8"
            />
            <span v-if="passwordForm.new_password !== passwordForm.new_password_confirmation && passwordForm.new_password_confirmation" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              Passwords do not match
            </span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isUpdatingPassword || !isPasswordValid">
              <span v-if="isUpdatingPassword">
                <span class="spinner-sm"></span>
                Updating...
              </span>
              <span v-else>
                <font-awesome-icon icon="fa-solid fa-key" />
                Update Password
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- ── Sessions ────────────────────────────────────────────────────── -->
      <div class="settings-card">
        <div class="card-header">
          <h3>Active Sessions</h3>
          <p class="card-sub">Manage your active sessions</p>
        </div>
        <div class="session-list">
          <div class="session-item">
            <div class="session-info">
              <font-awesome-icon icon="fa-solid fa-laptop" class="session-icon" />
              <div>
                <div class="session-device">Current Device</div>
                <div class="session-details">Chrome on Windows</div>
              </div>
            </div>
            <span class="session-status active">Active</span>
          </div>
          <div class="session-item">
            <div class="session-info">
              <font-awesome-icon icon="fa-solid fa-mobile-alt" class="session-icon" />
              <div>
                <div class="session-device">Mobile Device</div>
                <div class="session-details">Last active 2 hours ago</div>
              </div>
            </div>
            <button class="btn-danger-sm">Revoke</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Preferences Tab ──────────────────────────────────────────────── -->
    <div v-if="activeTab === 'preferences'" class="tab-content">
      <div class="settings-card">
        <div class="card-header">
          <h3>Preferences</h3>
          <p class="card-sub">Customize your experience</p>
        </div>

        <div class="preference-group">
          <div class="preference-item">
            <div class="preference-info">
              <h4>Dark Mode</h4>
              <p>Enable dark mode for the dashboard</p>
            </div>
            <div class="toggle-switch">
              <input type="checkbox" id="darkMode" class="toggle-input" />
              <label for="darkMode" class="toggle-label"></label>
            </div>
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Email Notifications</h4>
              <p>Receive email notifications for new messages</p>
            </div>
            <div class="toggle-switch">
              <input type="checkbox" id="emailNotifications" class="toggle-input" checked />
              <label for="emailNotifications" class="toggle-label"></label>
            </div>
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Compact View</h4>
              <p>Use compact layout for tables</p>
            </div>
            <div class="toggle-switch">
              <input type="checkbox" id="compactView" class="toggle-input" />
              <label for="compactView" class="toggle-label"></label>
            </div>
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Auto-refresh</h4>
              <p>Automatically refresh dashboard every 5 minutes</p>
            </div>
            <div class="toggle-switch">
              <input type="checkbox" id="autoRefresh" class="toggle-input" checked />
              <label for="autoRefresh" class="toggle-label"></label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-primary" @click="successMessage = 'Preferences saved!'">
            <font-awesome-icon icon="fa-solid fa-save" />
            Save Preferences
          </button>
        </div>
      </div>

      <!-- ── Danger Zone ────────────────────────────────────────────────── -->
      <div class="settings-card danger-zone">
        <div class="card-header">
          <h3>Danger Zone</h3>
          <p class="card-sub">Irreversible actions</p>
        </div>
        <div class="danger-actions">
          <div class="danger-item">
            <div>
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all associated data</p>
            </div>
            <button class="btn-danger" @click="confirmDelete">
              <font-awesome-icon icon="fa-solid fa-trash" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-settings {
  animation: fadeIn 0.4s ease;
}

/* ── Header ────────────────────────────────────────────────────────────── */
.page-header {
  margin-bottom: 24px;
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

/* ── Tabs ────────────────────────────────────────────────────────────────── */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.03);
}

.tab-btn.active {
  background: rgba(0, 229, 255, 0.08);
  color: #00E5FF;
}

/* ── Cards ────────────────────────────────────────────────────────────────── */
.settings-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.card-header {
  margin-bottom: 20px;
}

.card-header h3 {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-sub {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
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
  text-decoration: none;
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

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 30px;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.25);
  border-color: rgba(255, 107, 107, 0.5);
  transform: translateY(-2px);
}

.btn-danger-sm {
  padding: 4px 12px;
  border-radius: 6px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.btn-danger-sm:hover {
  background: rgba(255, 107, 107, 0.2);
}

/* ── Form ────────────────────────────────────────────────────────────────── */
.settings-form {
  max-width: 500px;
}

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

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
  margin-top: 4px;
}

.form-actions {
  margin-top: 20px;
}

.field-error {
  display: block;
  font-size: 0.8rem;
  color: #ff6b6b;
  margin-top: 4px;
}

/* ── Password Requirements ────────────────────────────────────────────── */
.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

.password-requirements span {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.password-requirements span.met {
  color: #00E5FF;
}

/* ── Stats ───────────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.role-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin {
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
}

.role-badge.client {
  background: rgba(37, 99, 196, 0.15);
  color: #2563C4;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 217, 61, 0.15);
}

.status-dot.verified {
  background: #00E5FF;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}

/* ── Sessions ───────────────────────────────────────────────────────────── */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.session-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-icon {
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.2rem;
}

.session-device {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.9rem;
}

.session-details {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
}

.session-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.session-status.active {
  background: rgba(0, 229, 255, 0.15);
  color: #00E5FF;
}

/* ── Preferences ────────────────────────────────────────────────────────── */
.preference-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info h4 {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.preference-info p {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
}

/* ── Toggle Switch ──────────────────────────────────────────────────────── */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-input:checked + .toggle-label {
  background: #00C4D4;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(20px);
}

/* ── Danger Zone ────────────────────────────────────────────────────────── */
.danger-zone {
  border-color: rgba(255, 107, 107, 0.2);
}

.danger-zone .card-header h3 {
  color: #ff6b6b;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.danger-item h4 {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.danger-item p {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}

/* ── Messages ────────────────────────────────────────────────────────────── */
.error-banner, .success-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.error-banner {
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
}

.success-banner {
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: #00E5FF;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
}

/* ── Spinner ────────────────────────────────────────────────────────────── */
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

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
  }

  .tab-btn {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .danger-item {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .settings-card {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .session-item {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>