<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isScrolled = ref(false)
const mobileOpen = ref(false)

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userRole = computed(() => authStore.userRole)
const userName = computed(() => authStore.userName)

function onScroll() { 
  isScrolled.value = window.scrollY > 40 
}

async function handleLogout() {
  const result = await authStore.logout()
  if (result.success) {
    // Redirect to home or login page
    window.location.href = '/'
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  // Initialize auth to check if user is logged in
  authStore.init()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <nav :class="['navbar', { scrolled: isScrolled }]">
    <div class="nav-inner">
      <RouterLink to="/" class="nav-logo">
        <img src="/src/assets/telesoft-company-limited-logo.png" alt="TSCL" class="logo-img" />
        <span class="logo-text">TSCL</span>
      </RouterLink>

      <ul class="nav-links">
        <li v-for="link in links" :key="link.to">
          <RouterLink :to="link.to" class="nav-link" active-class="active">
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>

      <div class="nav-actions">
        <!-- Show different buttons based on auth status -->
        <template v-if="isAuthenticated">
          <!-- Logged In -->
          <span class="user-greeting">
            <font-awesome-icon icon="fa-regular fa-user" />
            {{ userName }}
          </span>
          
          <!-- Admin Dashboard Link -->
          <RouterLink v-if="userRole === 'admin'" to="/admin" class="btn-primary nav-cta">
            <font-awesome-icon icon="fa-solid fa-gauge-high" />
            Dashboard
          </RouterLink>
          
          <!-- Client Dashboard Link -->
          <RouterLink v-else to="/dashboard" class="btn-primary nav-cta">
            <font-awesome-icon icon="fa-solid fa-gauge-high" />
            Dashboard
          </RouterLink>
          
          <!-- Logout Button -->
          <button @click="handleLogout" class="btn-outline nav-logout-btn">
            <font-awesome-icon icon="fa-solid fa-sign-out-alt" />
            Logout
          </button>
        </template>

        <template v-else>
          <!-- Guest -->
          <RouterLink to="/auth/login" class="btn-outline nav-login-btn">
            <font-awesome-icon icon="fa-solid fa-sign-in-alt" />
            Login
          </RouterLink>
          <RouterLink to="/auth/register" class="btn-primary nav-cta">
            <font-awesome-icon icon="fa-solid fa-user-plus" />
            Register
          </RouterLink>
        </template>
      </div>

      <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
        <span :class="{ open: mobileOpen }"></span>
        <span :class="{ open: mobileOpen }"></span>
        <span :class="{ open: mobileOpen }"></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu">
        <RouterLink
          v-for="link in links" 
          :key="link.to"
          :to="link.to"
          class="mobile-link"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </RouterLink>

        <!-- Mobile Auth Links -->
        <template v-if="isAuthenticated">
          <div class="mobile-user-info">
            <font-awesome-icon icon="fa-regular fa-user" />
            {{ userName }}
          </div>
          
          <RouterLink 
            v-if="userRole === 'admin'" 
            to="/admin" 
            class="btn-primary mobile-action-btn"
            @click="mobileOpen = false"
          >
            <font-awesome-icon icon="fa-solid fa-gauge-high" />
            Admin Dashboard
          </RouterLink>
          
          <RouterLink 
            v-else 
            to="/dashboard" 
            class="btn-primary mobile-action-btn"
            @click="mobileOpen = false"
          >
            <font-awesome-icon icon="fa-solid fa-gauge-high" />
            Dashboard
          </RouterLink>
          
          <button @click="handleLogout" class="btn-outline mobile-action-btn">
            <font-awesome-icon icon="fa-solid fa-sign-out-alt" />
            Logout
          </button>
        </template>

        <template v-else>
          <RouterLink 
            to="/auth/login" 
            class="btn-outline mobile-action-btn"
            @click="mobileOpen = false"
          >
            <font-awesome-icon icon="fa-solid fa-sign-in-alt" />
            Login
          </RouterLink>
          
          <RouterLink 
            to="/auth/register" 
            class="btn-primary mobile-action-btn"
            @click="mobileOpen = false"
          >
            <font-awesome-icon icon="fa-solid fa-user-plus" />
            Register
          </RouterLink>
        </template>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0; 
  left: 0; 
  right: 0;
  z-index: 1000;
  padding: 20px 0;
  transition: all 0.3s ease;
}
.navbar.scrolled {
  background: rgba(10, 8, 24, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,229,255,0.1);
  padding: 12px 0;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 40px;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  margin-right: auto;
}
.logo-img { 
  height: 36px; 
  width: auto;   
  border-radius: 5%;
}
.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.nav-links {
  display: flex;
  list-style: none;
  gap: 32px;
}
.nav-link {
  text-decoration: none;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px; 
  left: 0;
  width: 0; 
  height: 2px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  transition: width 0.3s;
  border-radius: 1px;
}
.nav-link:hover, 
.nav-link.active { 
  color: #fff; 
}
.nav-link:hover::after, 
.nav-link.active::after { 
  width: 100%; 
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Button Styles */
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
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-outline:hover {
  border-color: #00E5FF;
  color: #fff;
  background: rgba(0, 229, 255, 0.05);
}

.nav-cta { 
  font-size: 0.85rem; 
  padding: 10px 22px; 
}

.nav-login-btn {
  padding: 10px 20px;
}

.nav-logout-btn {
  padding: 10px 20px;
  color: rgba(255, 107, 107, 0.7);
  border-color: rgba(255, 107, 107, 0.2);
}
.nav-logout-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.hamburger span {
  display: block;
  width: 24px; 
  height: 2px;
  background: #fff;
  border-radius: 1px;
  transition: all 0.3s;
}
.hamburger span.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: rgba(10, 8, 24, 0.97);
  border-top: 1px solid rgba(0,229,255,0.1);
}
.mobile-link {
  text-decoration: none;
  color: rgba(255,255,255,0.8);
  font-size: 1.1rem;
  font-weight: 500;
  padding: 12px;
  transition: color 0.2s;
}
.mobile-link:hover { 
  color: #00E5FF; 
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 500;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  width: 100%;
  justify-content: center;
}

.mobile-action-btn {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 1rem;
  text-align: center;
}

.slide-enter-active, 
.slide-leave-active { 
  transition: all 0.3s ease; 
}
.slide-enter-from, 
.slide-leave-to { 
  opacity: 0; 
  transform: translateY(-10px); 
}

@media (max-width: 768px) {
  .nav-links { 
    display: none; 
  }
  
  .nav-actions {
    display: none;
  }
  
  .hamburger { 
    display: flex; 
    margin-left: auto; 
  }
  
  .nav-inner {
    gap: 20px;
  }
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }
}
</style>