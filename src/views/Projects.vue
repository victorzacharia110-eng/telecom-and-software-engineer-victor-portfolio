<script setup>
import { onMounted } from "vue";
import ProjectCard3D from "../components/ProjectCard3D.vue";
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'

const store = useProjectStore()

// ── Store Refs ────────────────────────────────────────────────────────────
const {
  projects,
  categories,
  isLoading,
  error,
  activeCategory,
  filteredProjects,
} = storeToRefs(store)

const { getCategoryIcon } = store

// ── Methods ──────────────────────────────────────────────────────────────
function setCategory(category) {
  store.setCategory(category)
}

onMounted(() => {
  store.fetchProjects()
})
</script>

<template>
  <div class="projects-page">
    <div class="page-header">
      <div class="page-header-inner">
        <p class="section-label">Our Work</p>
        <h1 class="page-title">Projects That <span class="gradient-text">Define Us</span></h1>
        <p class="page-sub">
          A curated collection of enterprise solutions we've crafted with precision.
        </p>

        <!-- Loading Filters -->
        <div v-if="isLoading" class="loading-filters">
          <span class="spinner-sm"></span> Loading projects...
        </div>

        <!-- Filters -->
        <div v-else class="filters">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="['filter-btn', { active: activeCategory === cat }]"
            @click="setCategory(cat)"
          >
            <font-awesome-icon v-if="cat !== 'All'" :icon="['fas', getCategoryIcon(cat)]" size="xs" />
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
      {{ error }}
      <button @click="error = null" class="error-close">×</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>

    <!-- Projects Grid -->
    <div v-else class="projects-grid-wrap">
      <TransitionGroup name="cards" tag="div" class="projects-grid">
        <ProjectCard3D
          v-for="project in filteredProjects"
          :key="project.id || project.title"
          :project="project"
        />
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-folder-open" size="3x" />
        <h3>No Projects Found</h3>
        <p>No projects available in the "{{ activeCategory }}" category.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.page-header {
  padding: 140px 32px 80px;
  text-align: center;
  position: relative;
}

.page-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(0, 196, 212, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.page-header-inner {
  position: relative;
  z-index: 1;
}

.section-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #00c4d4;
  font-weight: 600;
}

.page-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  margin: 12px 0 16px;
  color: #fff;
}

.gradient-text {
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-sub {
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 40px;
  line-height: 1.7;
}

/* Loading Filters */
.loading-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 196, 212, 0.2);
  border-top-color: #00c4d4;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Filters */
.filters {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  font-family: "Space Grotesk", sans-serif;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn:hover {
  border-color: rgba(0, 229, 255, 0.4);
  color: #fff;
}

.filter-btn.active {
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  color: #0a0818;
  border-color: transparent;
  font-weight: 700;
}

.filter-btn.active svg {
  color: #0a0818;
}

/* Projects Grid */
.projects-grid-wrap {
  padding: 0 32px 100px;
}

.projects-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Animations */
.cards-enter-active,
.cards-leave-active {
  transition: all 0.4s ease;
}

.cards-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.cards-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Loading State */
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
  border-top-color: #00c4d4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.3);
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #fff;
  margin-bottom: 8px;
}

.empty-state p {
  margin-bottom: 24px;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 0 32px 16px;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  color: #ff6b6b;
  font-size: 0.9rem;
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.2rem;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .projects-grid-wrap {
    padding: 0 16px 60px;
  }

  .page-header {
    padding: 100px 16px 50px;
  }

  .error-banner {
    margin: 0 16px 16px;
  }
}

@media (max-width: 640px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    gap: 6px;
  }

  .filter-btn {
    padding: 6px 14px;
    font-size: 0.75rem;
  }
}
</style>