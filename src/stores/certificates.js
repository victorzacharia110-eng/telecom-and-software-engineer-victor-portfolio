// stores/certificates.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useCertificateStore = defineStore('certificates', () => {
  // ── State ──────────────────────────────────────────────────────────────
  const certificates = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref(null)
  const successMessage = ref(null)
  const uploadProgress = ref(0)
  const selectedCertificate = ref(null)

  // ── Getters ──────────────────────────────────────────────────────────────
  const totalCertificates = computed(() => certificates.value.length)
  
  // Get certificates by type
  const degrees = computed(() => certificates.value.filter(c => c.type === 'Degree'))
  const diplomas = computed(() => certificates.value.filter(c => c.type === 'Diploma'))
  const certificatesList = computed(() => certificates.value.filter(c => c.type === 'Certificate'))
  const certifications = computed(() => certificates.value.filter(c => c.type === 'Certification'))
  const cseeCertificates = computed(() => certificates.value.filter(c => c.type === 'CSEE'))
  const acseeCertificates = computed(() => certificates.value.filter(c => c.type === 'ACSEE'))
  const professionalCertificates = computed(() => certificates.value.filter(c => c.type === 'Professional'))
  
  // Get certificates by level
  const secondaryLevel = computed(() => certificates.value.filter(c => c.level === 'secondary'))
  const tertiaryLevel = computed(() => certificates.value.filter(c => c.level === 'tertiary'))
  const professionalLevel = computed(() => certificates.value.filter(c => c.level === 'professional'))
  const certificateLevel = computed(() => certificates.value.filter(c => c.level === 'certificate'))
  
  const activeCertificates = computed(() => 
    certificates.value.filter(c => c.is_active !== false)
  )

  const sortedByYear = computed(() => 
    [...certificates.value].sort((a, b) => b.year - a.year)
  )

  const sortedByOrder = computed(() => 
    [...certificates.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  )

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Fetch all certificates
   */
  async function fetchCertificates() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/admin/certificates')
      
      if (response.data.success) {
        certificates.value = response.data.data
        console.log('✅ Certificates loaded:', certificates.value.length)
        return { success: true, data: certificates.value }
      } else {
        error.value = response.data.message || 'Failed to fetch certificates'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch certificates'
      console.error('❌ Failed to fetch certificates:', err)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a single certificate by ID
   */
  async function getCertificate(id) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/admin/certificates/${id}`)
      
      if (response.data.success) {
        selectedCertificate.value = response.data.data
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Certificate not found'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch certificate'
      console.error('❌ Failed to fetch certificate:', err)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new certificate
   */
  async function createCertificate(certificateData) {
    isSaving.value = true
    error.value = null
    successMessage.value = null

    try {
      const response = await api.post('/admin/certificates', certificateData)
      
      if (response.data.success) {
        const newCertificate = response.data.data
        certificates.value.unshift(newCertificate)
        successMessage.value = 'Certificate created successfully!'
        console.log('✅ Certificate created:', newCertificate)
        
        setTimeout(() => {
          successMessage.value = null
        }, 3000)
        
        return { success: true, data: newCertificate }
      } else {
        error.value = response.data.message || 'Failed to create certificate'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create certificate'
      console.error('❌ Failed to create certificate:', err)
      return { success: false, message: error.value }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update an existing certificate
   */
  async function updateCertificate(id, certificateData) {
    isSaving.value = true
    error.value = null
    successMessage.value = null

    try {
      const response = await api.patch(`/admin/certificates/${id}`, certificateData)
      
      if (response.data.success) {
        const updatedCertificate = response.data.data
        const index = certificates.value.findIndex(c => c.id === id)
        if (index !== -1) {
          certificates.value[index] = updatedCertificate
        }
        successMessage.value = 'Certificate updated successfully!'
        console.log('✅ Certificate updated:', updatedCertificate)
        
        setTimeout(() => {
          successMessage.value = null
        }, 3000)
        
        return { success: true, data: updatedCertificate }
      } else {
        error.value = response.data.message || 'Failed to update certificate'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update certificate'
      console.error('❌ Failed to update certificate:', err)
      return { success: false, message: error.value }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete a certificate
   */
  async function deleteCertificate(id) {
    isLoading.value = true
    error.value = null
    successMessage.value = null

    try {
      const response = await api.delete(`/admin/certificates/${id}`)
      
      if (response.data.success) {
        certificates.value = certificates.value.filter(c => c.id !== id)
        successMessage.value = 'Certificate deleted successfully!'
        console.log('✅ Certificate deleted:', id)
        
        setTimeout(() => {
          successMessage.value = null
        }, 3000)
        
        return { success: true, message: response.data.message }
      } else {
        error.value = response.data.message || 'Failed to delete certificate'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete certificate'
      console.error('❌ Failed to delete certificate:', err)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload certificate file
   */
  async function uploadFile(file) {
    uploadProgress.value = 0
    error.value = null

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/admin/upload/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        },
      })
      
      if (response.data.success) {
        uploadProgress.value = 100
        console.log('✅ File uploaded:', response.data.path)
        return { 
          success: true, 
          path: response.data.path, 
          fileType: response.data.file_type,
          filename: response.data.filename
        }
      } else {
        error.value = response.data.message || 'File upload failed'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'File upload failed'
      console.error('❌ File upload failed:', err)
      return { success: false, message: error.value }
    } finally {
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }

  /**
   * Toggle certificate active status
   */
  async function toggleActive(id) {
    try {
      const certificate = certificates.value.find(c => c.id === id)
      if (!certificate) {
        return { success: false, message: 'Certificate not found' }
      }

      const response = await api.patch(`/admin/certificates/${id}/toggle-active`, {
        is_active: !certificate.is_active
      })
      
      if (response.data.success) {
        const index = certificates.value.findIndex(c => c.id === id)
        if (index !== -1) {
          certificates.value[index] = response.data.data
        }
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      console.error('❌ Failed to toggle certificate:', err)
      return { success: false, message: err.response?.data?.message }
    }
  }

  /**
   * Reorder certificates
   */
  async function reorderCertificates(orderData) {
    try {
      const response = await api.post('/admin/certificates/reorder', orderData)
      
      if (response.data.success) {
        certificates.value = response.data.data
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      console.error('❌ Failed to reorder certificates:', err)
      return { success: false, message: err.response?.data?.message }
    }
  }

  /**
   * Clear all messages
   */
  function clearMessages() {
    error.value = null
    successMessage.value = null
  }

  /**
   * Reset store state
   */
  function reset() {
    certificates.value = []
    isLoading.value = false
    isSaving.value = false
    error.value = null
    successMessage.value = null
    uploadProgress.value = 0
    selectedCertificate.value = null
  }

  // ── Helper Methods ──────────────────────────────────────────────────────

  /**
   * Get certificate by ID from store (without API call)
   */
  function findById(id) {
    return certificates.value.find(c => c.id === id)
  }

  /**
   * Get certificate by type
   */
  function getByType(type) {
    return certificates.value.filter(c => c.type === type)
  }

  /**
   * Get certificate by level
   */
  function getByLevel(level) {
    return certificates.value.filter(c => c.level === level)
  }

  /**
   * Get certificate by year
   */
  function getByYear(year) {
    return certificates.value.filter(c => c.year === year)
  }

  /**
   * Get recent certificates
   */
  function getRecent(limit = 3) {
    return [...certificates.value]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
  }

  /**
   * Get public certificates (active only)
   */
  function getPublicCertificates() {
    return certificates.value
      .filter(c => c.is_active !== false)
      .sort((a, b) => b.year - a.year)
  }

  /**
   * Get certificate statistics
   */
  function getStats() {
    return {
      total: certificates.value.length,
      byType: {
        csee: certificates.value.filter(c => c.type === 'CSEE').length,
        acsee: certificates.value.filter(c => c.type === 'ACSEE').length,
        degree: certificates.value.filter(c => c.type === 'Degree').length,
        diploma: certificates.value.filter(c => c.type === 'Diploma').length,
        certificate: certificates.value.filter(c => c.type === 'Certificate').length,
        certification: certificates.value.filter(c => c.type === 'Certification').length,
        professional: certificates.value.filter(c => c.type === 'Professional').length,
      },
      byLevel: {
        secondary: certificates.value.filter(c => c.level === 'secondary').length,
        tertiary: certificates.value.filter(c => c.level === 'tertiary').length,
        professional: certificates.value.filter(c => c.level === 'professional').length,
        certificate: certificates.value.filter(c => c.level === 'certificate').length,
      },
      active: certificates.value.filter(c => c.is_active !== false).length,
      inactive: certificates.value.filter(c => c.is_active === false).length,
    }
  }

  return {
    // State
    certificates,
    isLoading,
    isSaving,
    error,
    successMessage,
    uploadProgress,
    selectedCertificate,

    // Getters
    totalCertificates,
    degrees,
    diplomas,
    certificatesList,
    certifications,
    cseeCertificates,
    acseeCertificates,
    professionalCertificates,
    secondaryLevel,
    tertiaryLevel,
    professionalLevel,
    certificateLevel,
    activeCertificates,
    sortedByYear,
    sortedByOrder,

    // Actions
    fetchCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    uploadFile,
    toggleActive,
    reorderCertificates,
    clearMessages,
    reset,

    // Helpers
    findById,
    getByType,
    getByLevel,
    getByYear,
    getRecent,
    getPublicCertificates,
    getStats,
  }
})