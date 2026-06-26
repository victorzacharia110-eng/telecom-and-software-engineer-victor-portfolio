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
        <font-awesome-icon :icon="['fas', project.icon]" />
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
            <font-awesome-icon icon="fa-solid fa-users" size="xs" />
            {{ project.team }}
          </span>
          <span class="stat">
            <font-awesome-icon icon="fa-regular fa-calendar" size="xs" />
            {{ project.year }}
          </span>
        </div>
        <a :href="project.link" class="card-cta">
          View
          <font-awesome-icon icon="fa-solid fa-arrow-right" size="xs" />
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
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, rgba(0,196,212,0.2), rgba(37,99,196,0.2));
  border: 1px solid rgba(0,229,255,0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #00E5FF;
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