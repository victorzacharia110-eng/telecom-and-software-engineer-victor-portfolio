<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const projects = ref([])
const isLoading = ref(true)
const error = ref(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')
const isSubmitting = ref(false)

const form = ref({
  title: '',
  description: '',
  full_description: '',
  category: '',
  status: 'pending',
  featured: false,
  active: true,
  year: null,
  client: '',
  duration: '',
  live_url: '',
  github_url: '',
  thumbnail: null,
  tech_stack: [],
  team_size: null,
})

const editForm = ref({
  id: null,
  title: '',
  description: '',
  full_description: '',
  category: '',
  status: 'pending',
  featured: false,
  active: true,
  year: null,
  client: '',
  duration: '',
  live_url: '',
  github_url: '',
  thumbnail: null,
  tech_stack: [],
  team_size: null,
})

// ── Computed ──────────────────────────────────────────────────────────────
const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  return projects.value.filter(project =>
    project.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    project.category?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    project.status?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const statusOptions = ['pending', 'active', 'completed', 'archived']

// ── CSRF Cookie ──────────────────────────────────────────────────────────
async function fetchCsrfCookie() {
  try {
    await api.get('/sanctum/csrf-cookie')
    console.log('✅ CSRF cookie fetched')
  } catch (err) {
    console.warn('⚠️ CSRF cookie fetch failed:', err.message)
  }
}

// ── Methods ──────────────────────────────────────────────────────────────
async function fetchProjects() {
  isLoading.value = true
  error.value = null

  try {
    await fetchCsrfCookie()
    
    const response = await api.get('/admin/projects')
    if (response.data.success) {
      projects.value = response.data.data
      console.log('✅ Projects loaded:', projects.value.length)
    }
  } catch (err) {
    console.error('❌ Failed to fetch projects:', err)
    error.value = err.response?.data?.message || 'Failed to load projects'
  } finally {
    isLoading.value = false
  }
}

async function createProject() {
  isSubmitting.value = true
  error.value = null

  try {
    await fetchCsrfCookie()
    
    const response = await api.post('/admin/projects', form.value)
    if (response.data.success) {
      await fetchProjects()
      showCreateModal.value = false
      resetForm()
      console.log('✅ Project created successfully')
    }
  } catch (err) {
    console.error('❌ Failed to create project:', err)
    error.value = err.response?.data?.message || 'Failed to create project'
  } finally {
    isSubmitting.value = false
  }
}

async function updateProject() {
  isSubmitting.value = true
  error.value = null

  try {
    await fetchCsrfCookie()
    
    const response = await api.patch(`/admin/projects/${editForm.value.id}`, editForm.value)
    if (response.data.success) {
      await fetchProjects()
      showEditModal.value = false
      console.log('✅ Project updated successfully')
    }
  } catch (err) {
    console.error('❌ Failed to update project:', err)
    error.value = err.response?.data?.message || 'Failed to update project'
  } finally {
    isSubmitting.value = false
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return

  try {
    await fetchCsrfCookie()
    
    await api.delete(`/admin/projects/${id}`)
    await fetchProjects()
    console.log('✅ Project deleted successfully')
  } catch (err) {
    console.error('❌ Failed to delete project:', err)
    error.value = err.response?.data?.message || 'Failed to delete project'
  }
}

function openEditModal(project) {
  editForm.value = { ...project }
  showEditModal.value = true
}

// ✅ Fixed - Added null/undefined check
function getStatusColor(status) {
  if (!status) return '#666'
  const colors = {
    pending: '#FFD93D',
    active: '#00E5FF',
    completed: '#00C4D4',
    archived: 'rgba(255,255,255,0.3)'
  }
  return colors[status] || '#666'
}

// ✅ Fixed - Added null/undefined check
function getStatusLabel(status) {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function resetForm() {
  form.value = {
    title: '',
    description: '',
    full_description: '',
    category: '',
    status: 'pending',
    featured: false,
    active: true,
    year: null,
    client: '',
    duration: '',
    live_url: '',
    github_url: '',
    thumbnail: null,
    tech_stack: [],
    team_size: null,
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="admin-projects">
    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Projects</h1>
        <p class="page-sub">Manage all projects in the system</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        New Project
      </button>
    </div>

    <!-- ── Search & Filter ──────────────────────────────────────────────── -->
    <div class="search-bar">
      <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search projects by title, category, or status..."
        class="search-input"
      />
      <span class="result-count">{{ filteredProjects.length }} projects</span>
    </div>

    <!-- ── Error State ──────────────────────────────────────────────────── -->
    <div v-if="error" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
      {{ error }}
      <button @click="error = null" class="error-close">×</button>
    </div>

    <!-- ── Loading State ────────────────────────────────────────────────── -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>

    <!-- ── Projects Grid ────────────────────────────────────────────────── -->
    <div v-else-if="filteredProjects.length > 0" class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-card-header">
          <div 
            class="project-status" 
            :style="{ background: getStatusColor(project.status) }"
          >
            {{ getStatusLabel(project.status) }}
          </div>
          <div class="project-actions">
            <button @click="openEditModal(project)" class="btn-icon" title="Edit">
              <font-awesome-icon icon="fa-solid fa-pen" />
            </button>
            <button @click="deleteProject(project.id)" class="btn-icon danger" title="Delete">
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
          </div>
        </div>

        <div v-if="project.thumbnail" class="project-image">
          <img :src="project.thumbnail" :alt="project.title" />
        </div>

        <h3 class="project-name">{{ project.title || project.name || 'Untitled' }}</h3>
        <p class="project-description">{{ project.description || 'No description' }}</p>

        <div class="project-meta">
          <span v-if="project.category" class="meta-tag">
            <font-awesome-icon icon="fa-solid fa-tag" size="xs" />
            {{ project.category }}
          </span>
          <span v-if="project.featured" class="featured-badge">
            <font-awesome-icon icon="fa-solid fa-star" size="xs" />
            Featured
          </span>
          <span v-if="project.live_url" class="meta-tag link-tag">
            <font-awesome-icon icon="fa-solid fa-link" size="xs" />
            <a :href="project.live_url" target="_blank">View</a>
          </span>
          <span v-if="project.github_url" class="meta-tag link-tag">
            <font-awesome-icon icon="fa-brands fa-github" size="xs" />
            <a :href="project.github_url" target="_blank">Code</a>
          </span>
        </div>

        <div class="project-footer">
          <span class="project-date">
            <font-awesome-icon icon="fa-regular fa-calendar" size="xs" />
            {{ new Date(project.created_at).toLocaleDateString() }}
          </span>
          <span v-if="project.client" class="project-client">
            <font-awesome-icon icon="fa-regular fa-user" size="xs" />
            {{ project.client }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Empty State ──────────────────────────────────────────────────── -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-solid fa-briefcase" size="3x" />
      <h3>No Projects Found</h3>
      <p>Start by creating your first project.</p>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Create Project
      </button>
    </div>

    <!-- ── CREATE MODAL ─────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Create New Project</h3>
            <button class="modal-close" @click="showCreateModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="createProject">
            <div class="form-group">
              <label>Project Title <span class="required">*</span></label>
              <input v-model="form.title" type="text" required class="form-input" placeholder="Enter project title" />
            </div>

            <div class="form-group">
              <label>Short Description</label>
              <textarea v-model="form.description" class="form-input" rows="3" placeholder="Enter short description"></textarea>
            </div>

            <div class="form-group">
              <label>Full Description</label>
              <textarea v-model="form.full_description" class="form-input" rows="5" placeholder="Enter detailed description"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <input v-model="form.category" type="text" class="form-input" placeholder="e.g. ERP Systems" />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="form.status" class="form-input">
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ getStatusLabel(status) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Year</label>
                <input v-model="form.year" type="number" class="form-input" placeholder="2024" />
              </div>
              <div class="form-group">
                <label>Client</label>
                <input v-model="form.client" type="text" class="form-input" placeholder="Client name" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Duration</label>
                <input v-model="form.duration" type="text" class="form-input" placeholder="e.g. 6 months" />
              </div>
              <div class="form-group">
                <label>Team Size</label>
                <input v-model="form.team_size" type="number" class="form-input" placeholder="e.g. 5" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Live URL</label>
                <input v-model="form.live_url" type="url" class="form-input" placeholder="https://example.com" />
              </div>
              <div class="form-group">
                <label>GitHub URL</label>
                <input v-model="form.github_url" type="url" class="form-input" placeholder="https://github.com/..." />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tech Stack</label>
                <input v-model="form.tech_stack" type="text" class="form-input" placeholder="Laravel, Vue, MySQL" />
              </div>
              <div class="form-group">
                <label>Thumbnail URL</label>
                <input v-model="form.thumbnail" type="text" class="form-input" placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.featured" type="checkbox" />
                <span>Feature this project</span>
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.active" type="checkbox" />
                <span>Active project</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <span class="spinner-sm"></span>
                  Creating...
                </span>
                <span v-else>Create Project</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── EDIT MODAL ──────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Edit Project</h3>
            <button class="modal-close" @click="showEditModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="updateProject">
            <div class="form-group">
              <label>Project Title <span class="required">*</span></label>
              <input v-model="editForm.title" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Short Description</label>
              <textarea v-model="editForm.description" class="form-input" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Full Description</label>
              <textarea v-model="editForm.full_description" class="form-input" rows="5"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <input v-model="editForm.category" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="editForm.status" class="form-input">
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ getStatusLabel(status) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Year</label>
                <input v-model="editForm.year" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label>Client</label>
                <input v-model="editForm.client" type="text" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Duration</label>
                <input v-model="editForm.duration" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Team Size</label>
                <input v-model="editForm.team_size" type="number" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Live URL</label>
                <input v-model="editForm.live_url" type="url" class="form-input" />
              </div>
              <div class="form-group">
                <label>GitHub URL</label>
                <input v-model="editForm.github_url" type="url" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tech Stack</label>
                <input v-model="editForm.tech_stack" type="text" class="form-input" placeholder="Laravel, Vue, MySQL" />
              </div>
              <div class="form-group">
                <label>Thumbnail URL</label>
                <input v-model="editForm.thumbnail" type="text" class="form-input" />
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="editForm.featured" type="checkbox" />
                <span>Feature this project</span>
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="editForm.active" type="checkbox" />
                <span>Active project</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <span class="spinner-sm"></span>
                  Updating...
                </span>
                <span v-else>Update Project</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── All styles remain the same ── */
.admin-projects {
  animation: fadeIn 0.4s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.page-sub {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
}

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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 229, 255, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.btn-outline:hover {
  border-color: #00E5FF;
  color: #fff;
  background: rgba(0, 229, 255, 0.05);
}

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-icon.danger:hover {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.search-bar {
  position: relative;
  margin-bottom: 24px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.25);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.search-input:focus {
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.06);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.result-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.2rem;
  cursor: pointer;
}

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
  border-top-color: #00C4D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(10, 8, 24, 0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.project-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.project-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #0a0818;
}

.project-actions {
  display: flex;
  gap: 4px;
}

.project-image {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.project-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
  font-size: 0.7rem;
  font-weight: 600;
}

.link-tag a {
  color: #00E5FF;
  text-decoration: none;
}

.link-tag a:hover {
  text-decoration: underline;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
}

.project-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
}

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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-box {
  background: #13102a;
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 1.2rem;
}

.modal-close {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px 10px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 4px;
}

.required {
  color: #ff6b6b;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.form-input:focus {
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.06);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

select.form-input {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkbox-group {
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.85rem;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #00C4D4;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-box {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .modal-box {
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn-primary,
  .modal-actions .btn-outline {
    width: 100%;
    justify-content: center;
  }
}
</style>