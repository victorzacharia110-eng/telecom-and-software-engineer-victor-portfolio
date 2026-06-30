import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useTestimonialStore = defineStore('testimonials', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const testimonials = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const isSubmitting = ref(false)
  const selectedTestimonial = ref(null)

  // ── Form State ────────────────────────────────────────────────────────────
  const form = ref({
    client_name: '',
    client_position: '',
    content: '',
    rating: 5,
    is_approved: false,
    is_featured: false,
    project_id: null,
  })

  const editForm = ref({
    id: null,
    client_name: '',
    client_position: '',
    content: '',
    rating: 5,
    is_approved: false,
    is_featured: false,
    project_id: null,
  })

  // ── Computed Properties ──────────────────────────────────────────────────
  const filteredTestimonials = computed(() => {
    if (!searchQuery.value) return testimonials.value
    return testimonials.value.filter(t =>
      t.client_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.content?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.client_position?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const approvedCount = computed(() => {
    return testimonials.value.filter(t => t.is_approved).length
  })

  const featuredCount = computed(() => {
    return testimonials.value.filter(t => t.is_featured).length
  })

  const pendingCount = computed(() => {
    return testimonials.value.filter(t => !t.is_approved).length
  })

  const averageRating = computed(() => {
    if (testimonials.value.length === 0) return 0
    const sum = testimonials.value.reduce((acc, t) => acc + (t.rating || 0), 0)
    return (sum / testimonials.value.length).toFixed(1)
  })

  const hasTestimonials = computed(() => testimonials.value.length > 0)

  // ── Helper Functions ─────────────────────────────────────────────────────
  function renderStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  function getStatusLabel(approved) {
    return approved ? 'Approved' : 'Pending'
  }

  function getStatusColor(approved) {
    return approved ? '#00E5FF' : '#FFD93D'
  }

  function getRatingColor(rating) {
    if (rating >= 4) return '#00E5FF'
    if (rating >= 3) return '#FFD93D'
    return '#ff6b6b'
  }

  function resetForm() {
    form.value = {
      client_name: '',
      client_position: '',
      content: '',
      rating: 5,
      is_approved: false,
      is_featured: false,
      project_id: null,
    }
  }

  function resetEditForm() {
    editForm.value = {
      id: null,
      client_name: '',
      client_position: '',
      content: '',
      rating: 5,
      is_approved: false,
      is_featured: false,
      project_id: null,
    }
  }

  // ── API Actions ──────────────────────────────────────────────────────────
  async function fetchTestimonials() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/admin/testimonials')
      
      if (response.data.success) {
        // Handle different data formats
        let data = response.data.data
        
        if (!data) {
          testimonials.value = []
        } else if (typeof data === 'object' && !Array.isArray(data)) {
          // If data is an object with nested array
          if (data.data && Array.isArray(data.data)) {
            testimonials.value = data.data
          } else if (data.testimonials && Array.isArray(data.testimonials)) {
            testimonials.value = data.testimonials
          } else {
            // Try to extract array from object values
            const values = Object.values(data).filter(item => typeof item === 'object')
            testimonials.value = values.length > 0 ? values : []
          }
        } else if (Array.isArray(data)) {
          testimonials.value = data
        } else {
          testimonials.value = []
        }
        
        console.log('✅ Testimonials loaded:', testimonials.value.length)
      } else {
        testimonials.value = []
        error.value = response.data.message || 'Failed to load testimonials'
      }
    } catch (err) {
      console.error('❌ Failed to fetch testimonials:', err)
      error.value = err.response?.data?.message || 'Failed to load testimonials'
      testimonials.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createTestimonial() {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await api.post('/admin/testimonials', form.value)
      
      if (response.data.success) {
        await fetchTestimonials()
        resetForm()
        console.log('✅ Testimonial created successfully')
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to create testimonial'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to create testimonial:', err)
      error.value = err.response?.data?.message || 'Failed to create testimonial'
      return { success: false, error: error.value }
    } finally {
      isSubmitting.value = false
    }
  }

  async function updateTestimonial() {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await api.patch(`/admin/testimonials/${editForm.value.id}`, editForm.value)
      
      if (response.data.success) {
        await fetchTestimonials()
        resetEditForm()
        console.log('✅ Testimonial updated successfully')
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to update testimonial'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to update testimonial:', err)
      error.value = err.response?.data?.message || 'Failed to update testimonial'
      return { success: false, error: error.value }
    } finally {
      isSubmitting.value = false
    }
  }

  async function toggleFeatured(id) {
    try {
      const response = await api.patch(`/admin/testimonials/${id}/featured`)
      
      if (response.data.success) {
        await fetchTestimonials()
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

  async function deleteTestimonial(id) {
    try {
      const response = await api.delete(`/admin/testimonials/${id}`)
      
      if (response.data.success) {
        testimonials.value = testimonials.value.filter(t => t.id !== id)
        console.log('✅ Testimonial deleted successfully')
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to delete testimonial'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to delete testimonial:', err)
      error.value = err.response?.data?.message || 'Failed to delete testimonial'
      return { success: false, error: error.value }
    }
  }

  async function approveTestimonial(id) {
    try {
      const response = await api.patch(`/admin/testimonials/${id}/approve`)
      
      if (response.data.success) {
        await fetchTestimonials()
        console.log('✅ Testimonial approved')
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to approve testimonial'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('❌ Failed to approve testimonial:', err)
      error.value = err.response?.data?.message || 'Failed to approve testimonial'
      return { success: false, error: error.value }
    }
  }

  // ── Modal Functions ──────────────────────────────────────────────────────
  function openEditModal(testimonial) {
    editForm.value = { ...testimonial }
  }

  function setSelectedTestimonial(testimonial) {
    selectedTestimonial.value = testimonial
  }

  function clearSelectedTestimonial() {
    selectedTestimonial.value = null
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  // ── Clear Functions ─────────────────────────────────────────────────────
  function clearError() {
    error.value = null
  }

  function resetAll() {
    testimonials.value = []
    isLoading.value = false
    error.value = null
    searchQuery.value = ''
    isSubmitting.value = false
    selectedTestimonial.value = null
    resetForm()
    resetEditForm()
  }

  // ── Return ──────────────────────────────────────────────────────────────
  return {
    // State
    testimonials,
    isLoading,
    error,
    searchQuery,
    isSubmitting,
    selectedTestimonial,
    form,
    editForm,

    // Computed
    filteredTestimonials,
    approvedCount,
    featuredCount,
    pendingCount,
    averageRating,
    hasTestimonials,

    // Helper functions
    renderStars,
    getStatusLabel,
    getStatusColor,
    getRatingColor,
    resetForm,
    resetEditForm,

    // API Actions
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    toggleFeatured,
    deleteTestimonial,
    approveTestimonial,

    // Modal Functions
    openEditModal,
    setSelectedTestimonial,
    clearSelectedTestimonial,
    setSearchQuery,

    // Clear Functions
    clearError,
    resetAll,
  }
})