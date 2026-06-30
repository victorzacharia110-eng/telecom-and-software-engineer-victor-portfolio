<template>
  <div class="client-profile">
    <h2 class="section-title">My Profile</h2>
    
    <div class="profile-card">
      <div class="profile-avatar">
        <span>{{ initials }}</span>
      </div>
      
      <div class="profile-info">
        <div class="info-row">
          <label>Full Name</label>
          <span>{{ authStore.userName }}</span>
        </div>
        <div class="info-row">
          <label>Email</label>
          <span>{{ authStore.userEmail }}</span>
        </div>
        <div class="info-row">
          <label>Account Type</label>
          <span class="role-badge">Client</span>
        </div>
        <div class="info-row">
          <label>Account Age</label>
          <span>{{ authStore.accountAge }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const initials = computed(() => {
  const name = authStore.userName || 'User'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
})
</script>

<style scoped>
.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00C4D4, #00E5FF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: #0a0818;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-row span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 640px) {
  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>