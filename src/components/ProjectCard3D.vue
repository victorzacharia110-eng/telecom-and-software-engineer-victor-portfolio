<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => ({
      icon: null,
      title: 'Untitled Project',
      description: 'No description available',
      tags: [],
      team_size: 'Unknown',
      year: 'N/A',
      live_url: '#',
      github_url: '#',
      category: 'General',
      tech_stack: ''
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

// ── Helper Functions ──────────────────────────────────────────────────
function getIcon() {
  console.log('Getting icon for:', props.project.title, 'Category:', props.project.category, 'Icon:', props.project.icon)
  
  // If project has an icon, use it
  if (props.project.icon && props.project.icon !== 'null') {
    return props.project.icon
  }
  
  // Otherwise use category-based icon
  const categoryIcons = {
    'ERP Systems': 'building-columns',
    'e-Commerce System': 'shopping-cart',
    'e-Commerce': 'shopping-cart',
    'Mobile App': 'mobile-alt',
    'Mobile': 'mobile-alt',
    'Web Development': 'globe',
    'Web': 'globe',
    'Cloud Solutions': 'cloud',
    'Cloud': 'cloud',
    'API': 'plug',
    'Analytics': 'chart-bar',
    'Machine Learning': 'brain',
    'Data Science': 'chart-pie',
    'DevOps': 'cloud',
    'General': 'code',
    'default': 'code'
  }
  
  // Try exact match
  let icon = categoryIcons[props.project.category]
  
  // If not found, try case-insensitive match
  if (!icon && props.project.category) {
    const lowerCategory = props.project.category.toLowerCase()
    for (const [key, value] of Object.entries(categoryIcons)) {
      if (key.toLowerCase() === lowerCategory) {
        icon = value
        break
      }
    }
  }
  
  // Final fallback
  return icon || 'code'
}

function getTeamDisplay() {
  if (props.project.team_size) {
    return `${props.project.team_size} dev${props.project.team_size > 1 ? 's' : ''}`
  }
  return props.project.team || 'Unknown'
}

function getTags() {
  // Handle tech_stack from database
  if (props.project.tech_stack) {
    if (typeof props.project.tech_stack === 'string') {
      try {
        // Handle JSON string or comma-separated
        let cleaned = props.project.tech_stack.replace(/^"|"$/g, '')
        return cleaned.split(',').map(t => t.trim()).filter(t => t)
      } catch {
        return props.project.tags || []
      }
    }
    if (Array.isArray(props.project.tech_stack)) {
      return props.project.tech_stack
    }
  }
  return props.project.tags || []
}

function hasValidLink(url) {
  return url && url !== '#' && url !== '' && url !== 'null' && url !== null
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

      <!-- Icon -->
      <div class="project-icon">
        <font-awesome-icon :icon="['fas', getIcon()]" size="2x" />
      </div>

      <!-- Title -->
      <h3 class="project-title">{{ project.title || 'Untitled Project' }}</h3>

      <!-- Category Badge -->
      <span v-if="project.category" class="category-badge">{{ project.category }}</span>

      <!-- Description -->
      <p class="project-desc">{{ project.description || 'No description available' }}</p>

      <!-- Tags -->
      <div class="project-tags">
        <span v-for="tag in getTags()" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <!-- Footer -->
      <div class="project-footer">
        <span class="team">{{ getTeamDisplay() }}</span>
        <span class="year">{{ project.year || 'N/A' }}</span>
      </div>

      <!-- ── LINKS ── -->
      <div class="project-links">
        <!-- Live URL -->
        <a 
          v-if="hasValidLink(project.live_url)"
          :href="project.live_url" 
          class="project-link live"
          target="_blank"
          rel="noopener noreferrer"
        >
          <font-awesome-icon icon="fa-solid fa-globe" size="xs" />
          Live Demo
          <font-awesome-icon icon="fa-solid fa-arrow-right" size="xs" />
        </a>

        <!-- Fallback if no live URL -->
        <span v-if="!hasValidLink(project.live_url)" class="project-link coming-soon">
          <font-awesome-icon icon="fa-solid fa-clock" size="xs" />
          Coming Soon
        </span>
      </div>

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
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.project-icon svg {
  width: 24px;
  height: 24px;
}

/* Category Badge */
.category-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.15);
  color: #00e5ff;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  align-self: flex-start;
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  font-size: 0.65rem;
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
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── LINKS ────────────────────────────────────────────────────────────── */
.project-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.project-link.live {
  background: linear-gradient(90deg, rgba(0, 196, 212, 0.15), rgba(0, 229, 255, 0.05));
  border: 1px solid rgba(0, 229, 255, 0.25);
  color: #00e5ff;
}

.project-link.live:hover {
  background: linear-gradient(90deg, rgba(0, 196, 212, 0.3), rgba(0, 229, 255, 0.15));
  border-color: rgba(0, 229, 255, 0.5);
  transform: translateX(4px);
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.1);
}

.project-link.coming-soon {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.25);
  cursor: not-allowed;
}

.project-link svg {
  font-size: 0.7rem;
}

.project-link.live:hover svg {
  transform: translateX(2px);
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
    min-height: 240px;
  }

  .project-title {
    font-size: 1rem;
  }

  .project-desc {
    font-size: 0.8rem;
  }

  .project-link {
    font-size: 0.7rem;
    padding: 4px 12px;
  }

  .project-links {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .project-links {
    flex-direction: column;
  }
  
  .project-link {
    width: 100%;
    justify-content: center;
  }
}
</style>