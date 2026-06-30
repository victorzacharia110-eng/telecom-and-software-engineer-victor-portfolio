<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const stats = ref({
  projects: 0,
  messages: 0,
  unread_messages: 0,
  pending: 0
})

const isLoading = ref(true)
const error = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────
const hasStats = computed(() => {
  return stats.value.projects > 0 || 
         stats.value.messages > 0 || 
         stats.value.unread_messages > 0
})

const totalActivities = computed(() => {
  return stats.value.projects + stats.value.messages + stats.value.unread_messages
})

// ── Methods ──────────────────────────────────────────────────────────────
async function fetchDashboardStats() {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await api.get('/client/dashboard/stats')
    
    if (response.data.success) {
      stats.value = response.data.data
      
      // Logging for debugging
      console.log('✅ Client stats loaded successfully:')
      console.log('📊 Projects:', stats.value.projects)
      console.log('✉️  Messages:', stats.value.messages)
      console.log('📩 Unread Messages:', stats.value.unread_messages)
      console.log('⏳ Pending Tasks:', stats.value.pending)
      console.log('📈 Total Activities:', totalActivities.value)
    } else {
      error.value = response.data.message || 'Failed to load dashboard stats'
    }
  } catch (err) {
    console.error('❌ Failed to fetch stats:', err)
    error.value = err.response?.data?.message || 'Network error. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  fetchDashboardStats()
})
</script>

<template>
  <div class="client-dashboard">
    <!-- ── Loading State ────────────────────────────────────────────────── -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your dashboard...</p>
    </div>

    <!-- ── Error State ──────────────────────────────────────────────────── -->
    <div v-else-if="error" class="error-state">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="2x" />
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="fetchDashboardStats" class="btn-retry">
        <font-awesome-icon icon="fa-solid fa-rotate" />
        Retry
      </button>
    </div>

    <!-- ── Dashboard Content ───────────────────────────────────────────── -->
    <template v-else>
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Client Dashboard</h1>
          <p class="page-sub">
            Welcome back, <span class="highlight">{{ authStore.userName }}</span>! 
            Here's what's happening with your account.
          </p>
        </div>
        <div class="header-actions">
          <RouterLink to="/dashboard/messages" class="btn-primary">
            <font-awesome-icon icon="fa-regular fa-envelope" />
            New Message
          </RouterLink>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <!-- Total Projects -->
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(0,196,212,0.15); color: #00C4D4;">
            <font-awesome-icon icon="fa-solid fa-briefcase" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.projects }}</div>
            <div class="stat-label">Active Projects</div>
          </div>
        </div>
        
        <!-- Total Messages -->
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(0,229,255,0.12); color: #00E5FF;">
            <font-awesome-icon icon="fa-regular fa-envelope" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.messages }}</div>
            <div class="stat-label">Total Messages</div>
          </div>
        </div>
        
        <!-- Unread Messages -->
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(255,217,61,0.15); color: #FFD93D;">
            <font-awesome-icon icon="fa-regular fa-envelope" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.unread_messages }}</div>
            <div class="stat-label">Unread Messages</div>
          </div>
        </div>
        
        <!-- Pending Tasks -->
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(37,99,196,0.18); color: #2563C4;">
            <font-awesome-icon icon="fa-solid fa-clock" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">Pending Tasks</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3 class="section-title">
          <font-awesome-icon icon="fa-solid fa-bolt" />
          Quick Actions
        </h3>
        <div class="actions-grid">
          <RouterLink to="/dashboard/projects" class="action-card">
            <font-awesome-icon icon="fa-solid fa-plus-circle" />
            <span>View Projects</span>
          </RouterLink>
          <RouterLink to="/dashboard/messages" class="action-card">
            <font-awesome-icon icon="fa-regular fa-paper-plane" />
            <span>Send Message</span>
          </RouterLink>
          <RouterLink to="/dashboard/profile" class="action-card">
            <font-awesome-icon icon="fa-regular fa-user" />
            <span>Update Profile</span>
          </RouterLink>
          <a href="/contact" class="action-card" target="_blank">
            <font-awesome-icon icon="fa-solid fa-external-link-alt" />
            <span>Contact Support</span>
          </a>
        </div>
      </div>

      <!-- Recent Activity (Optional) -->
      <div v-if="hasStats" class="recent-activity">
        <h3 class="section-title">
          <font-awesome-icon icon="fa-regular fa-clock" />
          Recent Activity
        </h3>
        <div class="activity-list">
          <div v-if="stats.messages > 0" class="activity-item">
            <span class="activity-dot" style="background: #00E5FF;"></span>
            <div>
              <p class="activity-text">You have {{ stats.messages }} total messages</p>
              <span class="activity-time">{{ stats.unread_messages }} unread</span>
            </div>
          </div>
          <div v-if="stats.projects > 0" class="activity-item">
            <span class="activity-dot" style="background: #00C4D4;"></span>
            <div>
              <p class="activity-text">{{ stats.projects }} active projects</p>
              <span class="activity-time">In progress</span>
            </div>
          </div>
          <div v-if="stats.pending > 0" class="activity-item">
            <span class="activity-dot" style="background: #FFD93D;"></span>
            <div>
              <p class="activity-text">{{ stats.pending }} pending tasks</p>
              <span class="activity-time">Requires attention</span>
            </div>
          </div>
          <div v-if="!hasStats" class="activity-item">
            <p class="activity-text no-activity">No recent activity to show</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.client-dashboard {
  animation: fadeIn 0.5s ease;
  padding: 0 4px;
}

/* ── Loading State ──────────────────────────────────────────────────────── */
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Error State ────────────────────────────────────────────────────────── */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 12px;
  text-align: center;
  color: #ff6b6b;
}

.error-state h3 {
  color: #fff;
  font-size: 1.2rem;
  margin: 0;
}

.error-state p {
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  margin-top: 8px;
}

.btn-retry:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 229, 255, 0.3);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
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

.highlight {
  color: #00E5FF;
}

.header-actions {
  display: flex;
  gap: 12px;
}

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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 229, 255, 0.35);
}

/* ── Stats Grid ─────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

/* ── Quick Actions ─────────────────────────────────────────────────────── */
.quick-actions {
  margin-bottom: 32px;
}

.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 229, 255, 0.2);
  color: #fff;
  transform: translateY(-2px);
}

.action-card svg {
  color: #00C4D4;
  font-size: 1rem;
}

/* ── Recent Activity ────────────────────────────────────────────────────── */
.recent-activity {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px 24px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.activity-time {
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.75rem;
}

.no-activity {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.85rem;
}

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .recent-activity {
    padding: 16px;
  }
}
</style>