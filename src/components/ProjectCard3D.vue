<template>
  <div
    class="card-3d-wrapper"
    @mousemove="onMove"
    @mouseleave="onLeave"
    @mouseenter="onEnter"
    :style="wrapperStyle"
  >
    <div class="card-3d glass-card" :style="cardStyle">
      <!-- Glare overlay -->
      <div class="glare" :style="glareStyle"></div>

      <!-- Icon badge -->
      <div class="card-icon">
        <span>{{ project.icon }}</span>
      </div>

      <!-- Tags -->
      <div class="card-tags">
        <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <h3 class="card-title">{{ project.title }}</h3>
      <p class="card-desc">{{ project.description }}</p>

      <div class="card-footer">
        <div class="card-stats">
          <span class="stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {{ project.team }}
          </span>
          <span class="stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ project.year }}
          </span>
        </div>
        <a :href="project.link" class="card-cta">
          View
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>

      <!-- Bottom accent line -->
      <div class="card-accent-line"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ project: Object })

const rotX = ref(0), rotY = ref(0), glareX = ref(50), glareY = ref(50)
const isHovered = ref(false)

function onMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  rotY.value = ((e.clientX - cx) / rect.width) * 18
  rotX.value = -((e.clientY - cy) / rect.height) * 18
  glareX.value = ((e.clientX - rect.left) / rect.width) * 100
  glareY.value = ((e.clientY - rect.top) / rect.height) * 100
}
function onLeave() {
  rotX.value = 0; rotY.value = 0; isHovered.value = false
}
function onEnter() { isHovered.value = true }

const wrapperStyle = computed(() => ({
  perspective: '1000px',
}))

const cardStyle = computed(() => ({
  transform: `rotateX(${rotX.value}deg) rotateY(${rotY.value}deg) ${isHovered.value ? 'scale(1.04)' : 'scale(1)'}`,
  transition: isHovered.value ? 'transform 0.1s ease' : 'transform 0.5s ease',
  boxShadow: isHovered.value
    ? `0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(0,196,212,0.15), inset 0 0 0 1px rgba(0,229,255,0.3)`
    : `0 8px 32px rgba(0,0,0,0.3)`,
}))

const glareStyle = computed(() => ({
  opacity: isHovered.value ? 0.12 : 0,
  background: `radial-gradient(circle at ${glareX.value}% ${glareY.value}%, rgba(255,255,255,0.9) 0%, transparent 60%)`,
  transition: 'opacity 0.3s',
}))
</script>

<style scoped>
.card-3d-wrapper {
  display: block;
  cursor: pointer;
}
.card-3d {
  position: relative;
  padding: 28px;
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.glare {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 10;
}
.card-icon {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, rgba(0,196,212,0.2), rgba(37,99,196,0.2));
  border: 1px solid rgba(0,229,255,0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  font-size: 0.7rem;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(0,196,212,0.12);
  border: 1px solid rgba(0,196,212,0.3);
  color: #00C4D4;
  font-weight: 500;
  letter-spacing: 0.03em;
}
.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}
.card-desc {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  flex: 1;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}
.card-stats { display: flex; gap: 16px; }
.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.45);
}
.card-cta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #00E5FF;
  text-decoration: none;
  transition: gap 0.2s;
}
.card-cta:hover { gap: 8px; }
.card-accent-line {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00C4D4, #00E5FF, transparent);
  opacity: 0.6;
}
</style>
