<template>
  <div class="client-layout">
    <nav class="client-nav">
      <div class="nav-container">
        <RouterLink to="/dashboard" class="nav-brand">
          <font-awesome-icon icon="fa-solid fa-gauge-high" />
          Client Dashboard
        </RouterLink>
        <div class="nav-links">
          <RouterLink to="/dashboard/projects" class="nav-link">
            <font-awesome-icon icon="fa-solid fa-briefcase" />
            Projects
          </RouterLink>
          <RouterLink to="/dashboard/messages" class="nav-link">
            <font-awesome-icon icon="fa-regular fa-envelope" />
            Messages
          </RouterLink>
          <RouterLink to="/dashboard/profile" class="nav-link">
            <font-awesome-icon icon="fa-regular fa-user" />
            Profile
          </RouterLink>
          <button @click="handleLogout" class="logout-btn">
            <font-awesome-icon icon="fa-solid fa-sign-out-alt" />
            Logout
          </button>
        </div>
      </div>
    </nav>
    <main class="client-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.client-layout {
  min-height: 100vh;
  background: #0a0818;
}

.client-nav {
  background: rgba(10, 8, 24, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00E5FF;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  font-family: 'Syne', sans-serif;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  padding: 6px 12px;
  border-radius: 8px;
}

.nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.router-link-active {
  color: #00E5FF;
  background: rgba(0, 229, 255, 0.08);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: rgba(255, 107, 107, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.logout-btn:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.08);
}

.client-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>