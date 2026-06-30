<template>
  <div class="client-projects">
    <h2 class="section-title">My Projects</h2>
    <div class="projects-list">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <span class="status" :class="project.status">{{ project.status }}</span>
      </div>
      <p v-if="projects.length === 0" class="empty-state">
        You don't have any projects yet.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const projects = ref([])

onMounted(async () => {
  // Fetch client projects from API
  try {
    // const response = await api.get('/client/projects')
    // projects.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  }
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

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
}

.project-card h3 {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 8px;
}

.project-card p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status.active {
  background: rgba(0, 229, 255, 0.15);
  color: #00E5FF;
}

.status.completed {
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
}

.status.pending {
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
}

.empty-state {
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 40px;
}
</style>