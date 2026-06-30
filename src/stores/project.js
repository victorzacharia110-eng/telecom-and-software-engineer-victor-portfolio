import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useProjectStore = defineStore('project', () => {
  // ── State ──────────────────────────────────────────────────────────────
  const projects = ref([])
  const categories = ref(['All'])
  const isLoading = ref(false)
  const error = ref(null)
  const activeCategory = ref('All')
  const selectedProject = ref(null)

  // ── Computed ──────────────────────────────────────────────────────────
  const filteredProjects = computed(() => {
    if (activeCategory.value === 'All') {
      return projects.value
    }
    return projects.value.filter(p => p.category === activeCategory.value)
  })

  const featuredProjects = computed(() => {
    return projects.value.filter(p => p.is_featured)
  })

  const projectCount = computed(() => projects.value.length)
  const activeProjects = computed(() => projects.value.filter(p => p.is_active))
  const categoryCount = computed(() => categories.value.length - 1)

  // ── Category Icons ────────────────────────────────────────────────────
  const categoryIcons = {
    ERP: 'chart-line',
    'E-Commerce': 'shopping-cart',
    Mobile: 'mobile-alt',
    API: 'plug',
    Analytics: 'chart-bar',
    Web: 'globe',
    'Machine Learning': 'brain',
    'Data Science': 'chart-pie',
    DevOps: 'cloud',
    'Web Development': 'globe',
    'Mobile Development': 'mobile-alt',
    'Cloud Computing': 'cloud',
    'Data Analytics': 'chart-pie',
    'Artificial Intelligence': 'brain',
    'Internet of Things': 'microchip',
  }

  const getCategoryIcon = (cat) => categoryIcons[cat] || 'tag'

  // ── Actions ──────────────────────────────────────────────────────────

  /**
   * Fetch all projects from API
   */
  async function fetchProjects(category = null) {
    isLoading.value = true
    error.value = null

    try {
      // Remove /api prefix since api instance already has it
      let url = '/projects'
      
      if (category && category !== 'All') {
        url += `?category=${encodeURIComponent(category)}`
      }
      
      const response = await api.get(url)
      
      if (response.data.success) {
        projects.value = response.data.data || []
        
        // Extract unique categories from projects
        const uniqueCategories = [...new Set(projects.value.map(p => p.category).filter(Boolean))]
        categories.value = ['All', ...uniqueCategories]
        
        console.log('✅ Projects loaded:', projects.value.length)
      } else {
        error.value = response.data.message || 'Failed to load projects'
        projects.value = []
      }
    } catch (err) {
      console.error('❌ Failed to fetch projects:', err)
      error.value = err.response?.data?.message || 'Failed to load projects'
      projects.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch featured projects
   */
  async function fetchFeaturedProjects() {
    try {
      // Remove /api prefix
      const response = await api.get('/projects/featured')
      
      if (response.data.success) {
        return response.data.data || []
      }
      return []
    } catch (err) {
      console.error('❌ Failed to fetch featured projects:', err)
      return []
    }
  }

  /**
   * Fetch categories from API
   */
  async function fetchCategories() {
    try {
      // Remove /api prefix
      const response = await api.get('/projects/categories')
      
      if (response.data.success) {
        const cats = response.data.data || []
        categories.value = ['All', ...cats]
      }
    } catch (err) {
      console.error('❌ Failed to fetch categories:', err)
    }
  }

  /**
   * Get a single project by ID
   */
  async function fetchProject(id) {
    isLoading.value = true
    error.value = null

    try {
      // Remove /api prefix
      const response = await api.get(`/projects/${id}`)
      
      if (response.data.success) {
        selectedProject.value = response.data.data
        return selectedProject.value
      } else {
        error.value = response.data.message || 'Failed to load project'
        return null
      }
    } catch (err) {
      console.error('❌ Failed to fetch project:', err)
      error.value = err.response?.data?.message || 'Failed to load project'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new project (Admin only)
   */
  async function createProject(projectData) {
    isLoading.value = true
    error.value = null

    try {
      // Remove /api prefix - use admin route
      const response = await api.post('/admin/projects', projectData)
      
      if (response.data.success) {
        projects.value.unshift(response.data.data)
        console.log('✅ Project created successfully')
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to create project'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to create project:', err)
      error.value = err.response?.data?.message || 'Failed to create project'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a project (Admin only)
   */
  async function updateProject(id, projectData) {
    isLoading.value = true
    error.value = null

    try {
      // Remove /api prefix - use admin route
      const response = await api.patch(`/admin/projects/${id}`, projectData)
      
      if (response.data.success) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) {
          projects.value[index] = response.data.data
        }
        console.log('✅ Project updated successfully')
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to update project'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to update project:', err)
      error.value = err.response?.data?.message || 'Failed to update project'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a project (Admin only)
   */
  async function deleteProject(id) {
    isLoading.value = true
    error.value = null

    try {
      // Remove /api prefix - use admin route
      const response = await api.delete(`/admin/projects/${id}`)
      
      if (response.data.success) {
        projects.value = projects.value.filter(p => p.id !== id)
        console.log('✅ Project deleted successfully')
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to delete project'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to delete project:', err)
      error.value = err.response?.data?.message || 'Failed to delete project'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle project featured status (Admin only)
   */
  async function toggleFeatured(id) {
    try {
      // Remove /api prefix - use admin route
      const response = await api.patch(`/admin/projects/${id}/featured`)
      
      if (response.data.success) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) {
          projects.value[index].is_featured = response.data.data.is_featured
        }
        console.log('✅ Featured status toggled')
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to toggle featured status'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to toggle featured:', err)
      error.value = err.response?.data?.message || 'Failed to toggle featured status'
      return { success: false, error: error.value }
    }
  }

  /**
   * Toggle project active status (Admin only)
   */
  async function toggleActive(id) {
    try {
      // Remove /api prefix - use admin route
      const response = await api.patch(`/admin/projects/${id}/active`)
      
      if (response.data.success) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) {
          projects.value[index].is_active = response.data.data.is_active
        }
        console.log('✅ Active status toggled')
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to toggle active status'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to toggle active:', err)
      error.value = err.response?.data?.message || 'Failed to toggle active status'
      return { success: false, error: error.value }
    }
  }

  /**
   * Set active category filter
   */
  function setCategory(category) {
    activeCategory.value = category
    fetchProjects(category)
  }

  /**
   * Add a project locally (for optimistic updates)
   */
  function addProject(project) {
    projects.value.unshift(project)
  }

  /**
   * Remove a project locally (for optimistic updates)
   */
  function removeProject(project) {
    projects.value = projects.value.filter((p) => p.id !== project.id)
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  /**
   * Reset all state
   */
  function resetState() {
    projects.value = []
    categories.value = ['All']
    isLoading.value = false
    error.value = null
    activeCategory.value = 'All'
    selectedProject.value = null
  }

  return {
    // State
    projects,
    categories,
    isLoading,
    error,
    activeCategory,
    selectedProject,

    // Computed
    filteredProjects,
    featuredProjects,
    projectCount,
    activeProjects,
    categoryCount,
    getCategoryIcon,

    // Actions
    fetchProjects,
    fetchFeaturedProjects,
    fetchCategories,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    toggleFeatured,
    toggleActive,
    setCategory,
    addProject,
    removeProject,
    clearError,
    resetState,
  }
})