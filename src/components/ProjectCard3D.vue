<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => ({
      icon: 'code',
      title: 'Untitled Project',
      description: 'No description available',
      tags: [],
      team: 'Unknown',
      year: 'N/A',
      link: '#'
    })
  }
})

// ── 3D Tilt State ──────────────────────────────────────────────────────
const rotX = ref(0)
const rotY = ref(0)
const glareX = ref(50)
const glareY = ref(50)
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
  rotX.value = 0
  rotY.value = 0
  isHovered.value = false
}

function onEnter() {
  isHovered.value = true
}

// ── Check if icon is an emoji ──────────────────────────────────────────
function isEmoji(icon) {
  if (!icon) return false
  // Check if icon contains emoji characters
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]/u
  return emojiRegex.test(icon) || icon === '🏪' || icon === '🏦' || icon === '🚚'
}

// ── Computed Styles ────────────────────────────────────────────────────
const wrapperStyle = computed(() => ({
  perspective: '1000px',
  display: 'block',
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

<template>
  <div
    v-if="project"
    class="card-3d-wrapper"
    @mousemove="onMove"
    @mouseleave="onLeave"
    @mouseenter="onEnter"
    :style="wrapperStyle"
  >
    <div class="project-card-3d glass-card" :style="cardStyle">
      <!-- Glare overlay -->
      <div class="glare" :style="glareStyle"></div>

      <!-- Icon - Check if emoji or FontAwesome icon -->
      <div class="project-icon">
        <span v-if="isEmoji(project.icon)" class="emoji-icon">{{ project.icon }}</span>
        <font-awesome-icon v-else :icon="['fas', project.icon || 'code']" size="2x" />
      </div>

      <!-- Title -->
      <h3 class="project-title">{{ project.title || 'Untitled Project' }}</h3>

      <!-- Description -->
      <p class="project-desc">{{ project.description || 'No description available' }}</p>

      <!-- Tags -->
      <div class="project-tags">
        <span v-for="tag in (project.tags || [])" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <!-- Footer -->
      <div class="project-footer">
        <span class="team">{{ project.team || 'Unknown' }}</span>
        <span class="year">{{ project.year || 'N/A' }}</span>
      </div>

      <!-- Link -->
      <a v-if="project.link" :href="project.link" class="project-link">
        View Project →
      </a>

      <!-- Bottom accent line -->
      <div class="card-accent-line"></div>
    </div>
  </div>
</template>

<style scoped>
.card-3d-wrapper {
  display: block;
  cursor: pointer;
}

.project-card-3d {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px 24px;
  transition: all 0.3s ease;
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.glass-card {
  backdrop-filter: blur(12px);
}

.project-card-3d:hover {
  border-color: rgba(0, 229, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

/* Glare Effect */
.glare {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 10;
}

/* Icon */
.project-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 196, 212, 0.15), rgba(0, 229, 255, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00c4d4;
  flex-shrink: 0;
  font-size: 1.5rem;
}

.emoji-icon {
  font-size: 1.8rem;
  line-height: 1;
}

/* Title */
.project-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

/* Description */
.project-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

/* Tags */
.project-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Footer */
.project-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* Link */
.project-link {
  display: inline-block;
  margin-top: 4px;
  color: #00c4d4;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.project-link:hover {
  color: #00e5ff;
  transform: translateX(4px);
}

/* Bottom accent line */
.card-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00C4D4, #00E5FF, transparent);
  opacity: 0.4;
}

/* Responsive */
@media (max-width: 768px) {
  .project-card-3d {
    padding: 20px 16px;
    min-height: 220px;
  }

  .project-title {
    font-size: 1rem;
  }

  .project-desc {
    font-size: 0.8rem;
  }
}
</style>