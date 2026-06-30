<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import ParticleBackground from './components/ParticleBackground.vue'
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'

const route = useRoute()

//  Use route meta for more flexibility
const hideNavBar = computed(() => route.meta.hideNavBar || false)
const hideFooter = computed(() => route.meta.hideFooter || false)

// Parallax on scroll elements
onMounted(() => {
  const parallaxEls = document.querySelectorAll('[data-parallax]')
  if (!parallaxEls.length) return
  window.addEventListener('scroll', () => {
    const y = window.scrollY
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3
      el.style.transform = `translateY(${y * speed}px)`
    })
  }, { passive: true })
})
</script>


<template>
  <div id="app-root">
    <ParticleBackground />
    <NavBar v-if="!hideNavBar" />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <FooterBar v-if="!hideFooter" />
  </div>
</template>



<style>
@import './assets/global.css';

#app-root {
  min-height: 100vh;
  position: relative;
}
.main-content {
  position: relative;
  z-index: 1;
}
.page-enter-active, .page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.page-enter-from { opacity: 0; transform: translateY(16px); }
.page-leave-to { opacity: 0; transform: translateY(-8px); }
</style>