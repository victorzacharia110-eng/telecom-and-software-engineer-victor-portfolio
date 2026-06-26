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

      <a href="/contact" class="btn-primary nav-cta">Let's Talk</a>

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
          v-for="link in links" :key="link.to"
          :to="link.to"
          class="mobile-link"
          @click="mobileOpen = false"
        >{{ link.label }}</RouterLink>
        <a href="/contact" class="btn-primary" style="margin-top:16px">Let's Talk</a>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const mobileOpen = ref(false)

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

function onScroll() { isScrolled.value = window.scrollY > 40 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
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
.logo-img { height: 36px; width: auto;   border-radius: 5%;}
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
  bottom: -4px; left: 0;
  width: 0; height: 2px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  transition: width 0.3s;
  border-radius: 1px;
}
.nav-link:hover, .nav-link.active { color: #fff; }
.nav-link:hover::after, .nav-link.active::after { width: 100%; }
.nav-cta { font-size: 0.85rem; padding: 10px 22px; }
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
  width: 24px; height: 2px;
  background: #fff;
  border-radius: 1px;
  transition: all 0.3s;
}
.mobile-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
.mobile-link:hover { color: #00E5FF; }
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 768px) {
  .nav-links, .nav-cta { display: none; }
  .hamburger { display: flex; margin-left: auto; }
}
</style>
