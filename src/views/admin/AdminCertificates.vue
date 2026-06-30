<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useCertificateStore } from '@/stores/certificates'

const certStore = useCertificateStore()

// ── Local State ──────────────────────────────────────────────────────────
const showModal = ref(false)
const showViewModal = ref(false)
const editingCert = ref(null)
const viewingCert = ref(null)
const fileInput = ref(null)
const validationErrors = ref({})
const formSubmitted = ref(false)

const form = reactive({
  title: '',
  institution: '',
  year: '',
  type: 'Certificate',
  level: 'certificate',
  file_path: '',
  file_type: 'pdf',
  thumbnail_path: '',
  is_active: true,
  file: null,
})

// ── Certificate Type Options ─────────────────────────────────────────────
const typeOptions = [
  { value: 'CSEE', label: 'CSEE (Ordinary Level)', icon: 'fa-solid fa-graduation-cap' },
  { value: 'ACSEE', label: 'ACSEE (Advanced Level)', icon: 'fa-solid fa-graduation-cap' },
  { value: 'Degree', label: 'Degree', icon: 'fa-solid fa-university' },
  { value: 'Diploma', label: 'Diploma', icon: 'fa-solid fa-certificate' },
  { value: 'Certificate', label: 'Certificate', icon: 'fa-regular fa-file' },
  { value: 'Certification', label: 'Certification', icon: 'fa-solid fa-award' },
  { value: 'Professional', label: 'Professional Certification', icon: 'fa-solid fa-badge' },
]

const levelOptions = [
  { value: 'secondary', label: 'Secondary Education' },
  { value: 'tertiary', label: 'Tertiary/University' },
  { value: 'professional', label: 'Professional' },
  { value: 'certificate', label: 'Certificate Program' },
]

// ── Validation Rules ──────────────────────────────────────────────────────
const validationRules = {
  title: [
    { required: true, message: 'Title is required' },
    { min: 3, message: 'Title must be at least 3 characters' },
    { max: 255, message: 'Title cannot exceed 255 characters' },
    { pattern: /^[a-zA-Z0-9\s\-.,:()&]+$/, message: 'Title contains invalid characters' }
  ],
  institution: [
    { required: true, message: 'Institution is required' },
    { min: 2, message: 'Institution must be at least 2 characters' },
    { max: 255, message: 'Institution cannot exceed 255 characters' },
    { pattern: /^[a-zA-Z0-9\s\-.,:()&]+$/, message: 'Institution contains invalid characters' }
  ],
  year: [
    { required: true, message: 'Year is required' },
    { pattern: /^\d{4}$/, message: 'Year must be a valid 4-digit year (e.g., 2024)' },
    { minValue: 1900, message: 'Year must be 1900 or later' },
    { maxValue: new Date().getFullYear() + 1, message: `Year cannot be later than ${new Date().getFullYear() + 1}` }
  ],
  type: [
    { required: true, message: 'Certificate type is required' },
    { in: ['CSEE', 'ACSEE', 'Degree', 'Diploma', 'Certificate', 'Certification', 'Professional'], message: 'Invalid certificate type' }
  ],
  level: [
    { required: true, message: 'Education level is required' },
    { in: ['secondary', 'tertiary', 'professional', 'certificate'], message: 'Invalid education level' }
  ],
  file_path: [
    { required: true, message: 'Certificate file is required' },
    { pattern: /\.(pdf|jpg|jpeg|png|doc|docx)$/i, message: 'File must be PDF, JPG, PNG, or DOC format' },
    { max: 500, message: 'File path is too long' }
  ],
  file_type: [
    { required: true, message: 'File type is required' },
    { in: ['pdf', 'image', 'doc', 'excel'], message: 'File type must be PDF, Image, DOC, or Excel' }
  ],
  thumbnail_path: [
    { pattern: /^https?:\/\/.+\..+$/, message: 'Thumbnail must be a valid URL (e.g., https://example.com/image.jpg)' }
  ]
}

// ── Validation Functions ──────────────────────────────────────────────────

function validateField(fieldName, value) {
  const rules = validationRules[fieldName]
  if (!rules) return null

  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message
    }
    if (rule.min && value.length < rule.min) {
      return rule.message
    }
    if (rule.max && value.length > rule.max) {
      return rule.message
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message
    }
    if (rule.in && !rule.in.includes(value)) {
      return rule.message
    }
    if (rule.minValue && parseInt(value) < rule.minValue) {
      return rule.message
    }
    if (rule.maxValue && parseInt(value) > rule.maxValue) {
      return rule.message
    }
  }
  return null
}

function validateForm() {
  formSubmitted.value = true
  validationErrors.value = {}

  const fields = ['title', 'institution', 'year', 'type', 'level', 'file_path', 'file_type']
  let isValid = true

  for (const field of fields) {
    const value = form[field]
    const error = validateField(field, value)
    if (error) {
      validationErrors.value[field] = error
      isValid = false
    }
  }

  // Validate thumbnail if provided
  if (form.thumbnail_path && form.thumbnail_path.trim() !== '') {
    const thumbError = validateField('thumbnail_path', form.thumbnail_path)
    if (thumbError) {
      validationErrors.value.thumbnail_path = thumbError
      isValid = false
    }
  }

  // Special validation: if creating new and no file uploaded
  if (!editingCert.value && !form.file && !form.file_path) {
    validationErrors.value.file_path = 'Please upload a certificate file'
    isValid = false
  }

  return isValid
}

function getFieldError(field) {
  return validationErrors.value[field]
}

function hasFieldError(field) {
  return !!validationErrors.value[field]
}

function clearFieldError(field) {
  delete validationErrors.value[field]
}

// ── Computed ──────────────────────────────────────────────────────────────
const isFormValid = computed(() => {
  return Object.keys(validationErrors.value).length === 0
})

// ── Methods ──────────────────────────────────────────────────────────────

function openCreateModal() {
  editingCert.value = null
  resetForm()
  validationErrors.value = {}
  formSubmitted.value = false
  showModal.value = true
}

function editCertificate(cert) {
  editingCert.value = cert
  Object.assign(form, {
    title: cert.title,
    institution: cert.institution,
    year: cert.year,
    type: cert.type || 'Certificate',
    level: cert.level || 'certificate',
    file_path: cert.file_path || '',
    file_type: cert.file_type || 'pdf',
    thumbnail_path: cert.thumbnail_path || '',
    is_active: cert.is_active !== false,
    file: null,
  })
  validationErrors.value = {}
  formSubmitted.value = false
  showModal.value = true
}

async function saveCertificate() {
  // ── 1. Frontend Validation ──────────────────────────────────────────
  if (!validateForm()) {
    const firstErrorField = Object.keys(validationErrors.value)[0]
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      if (element) element.focus()
    }
    return
  }

  // ── 2. Prepare Data ─────────────────────────────────────────────────
  const certificateData = {
    title: form.title.trim(),
    institution: form.institution.trim(),
    year: parseInt(form.year),
    type: form.type,
    level: form.level,
    file_path: form.file_path,
    file_type: form.file_type,
    thumbnail_path: form.thumbnail_path || null,
    is_active: form.is_active,
  }

  // ── 3. API Call ──────────────────────────────────────────────────────
  let result
  if (editingCert.value) {
    result = await certStore.updateCertificate(editingCert.value.id, certificateData)
  } else {
    result = await certStore.createCertificate(certificateData)
  }

  if (result.success) {
    closeModal()
  } else {
    if (result.errors) {
      validationErrors.value = result.errors
    }
  }
}

async function deleteCertificate(id) {
  if (!confirm('Are you sure you want to delete this certificate?')) return
  await certStore.deleteCertificate(id)
}

async function toggleActive(cert) {
  await certStore.toggleActive(cert.id)
}

function viewCertificate(cert) {
  viewingCert.value = cert
  showViewModal.value = true
}

function closeViewModal() {
  showViewModal.value = false
  viewingCert.value = null
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      validationErrors.value.file_path = 'File size must be less than 10MB'
      return
    }
    await uploadFile(file)
  }
}

async function handleDrop(event) {
  const file = event.dataTransfer.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      validationErrors.value.file_path = 'File size must be less than 10MB'
      return
    }
    await uploadFile(file)
  }
}

async function uploadFile(file) {
  const result = await certStore.uploadFile(file)
  if (result.success) {
    form.file_path = result.path
    form.file_type = result.fileType
    form.file = file
    delete validationErrors.value.file_path
  } else {
    validationErrors.value.file_path = result.message || 'File upload failed'
  }
}

function removeFile() {
  form.file = null
  form.file_path = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  delete validationErrors.value.file_path
}

function getFileIcon(fileType) {
  const icons = {
    pdf: 'fa-regular fa-file-pdf',
    image: 'fa-regular fa-file-image',
    doc: 'fa-regular fa-file-word',
    excel: 'fa-regular fa-file-excel',
  }
  return icons[fileType] || 'fa-regular fa-file'
}

function resetForm() {
  Object.assign(form, {
    title: '',
    institution: '',
    year: '',
    type: 'Certificate',
    level: 'certificate',
    file_path: '',
    file_type: 'pdf',
    thumbnail_path: '',
    is_active: true,
    file: null,
  })
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function closeModal() {
  showModal.value = false
  editingCert.value = null
  resetForm()
  validationErrors.value = {}
  formSubmitted.value = false
  certStore.clearMessages()
}

onMounted(() => {
  certStore.fetchCertificates()
})
</script>

<template>
  <div class="admin-certificates">
    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Certificates</h1>
        <p class="page-sub">Manage educational certificates</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Add Certificate
      </button>
    </div>

    <!-- ── Messages ──────────────────────────────────────────────────────── -->
    <div v-if="certStore.successMessage" class="success-banner">
      <font-awesome-icon icon="fa-regular fa-circle-check" />
      {{ certStore.successMessage }}
    </div>

    <div v-if="certStore.error" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
      {{ certStore.error }}
      <button @click="certStore.clearMessages()" class="close-btn">×</button>
    </div>

    <!-- ── Loading State ────────────────────────────────────────────────── -->
    <div v-if="certStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading certificates...</p>
    </div>

    <!-- ── Certificates Grid ────────────────────────────────────────────── -->
    <div v-else-if="certStore.certificates.length > 0" class="certificates-grid">
      <div v-for="cert in certStore.certificates" :key="cert.id" class="certificate-card">
        <div class="certificate-thumbnail" @click="viewCertificate(cert)">
          <img v-if="cert.thumbnail_path" :src="cert.thumbnail_path" :alt="cert.title" />
          <div v-else class="placeholder">
            <font-awesome-icon icon="fa-solid fa-file-pdf" size="3x" />
          </div>
          <div class="certificate-overlay">
            <font-awesome-icon icon="fa-regular fa-eye" />
            <span>Preview</span>
          </div>
        </div>
        <div class="certificate-info">
          <div class="cert-header">
            <h3>{{ cert.title }}</h3>
            <span class="type-badge" :class="cert.type.toLowerCase()">
              {{ cert.type }}
            </span>
          </div>
          <p>{{ cert.institution }}</p>
          <div class="meta">
            <span class="year">
              <font-awesome-icon icon="fa-regular fa-calendar" size="xs" />
              {{ cert.year }}
            </span>
            <span class="level-badge" :class="cert.level">
              {{ cert.level === 'secondary' ? 'Secondary' : 
                 cert.level === 'tertiary' ? 'Tertiary' : 
                 cert.level === 'professional' ? 'Professional' : 'Certificate' }}
            </span>
            <span v-if="cert.is_active === false" class="badge-inactive">Inactive</span>
          </div>
        </div>
        <div class="certificate-actions">
          <button @click="editCertificate(cert)" class="btn-icon" title="Edit">
            <font-awesome-icon icon="fa-solid fa-pen" />
          </button>
          <button @click="toggleActive(cert)" class="btn-icon" :title="cert.is_active ? 'Deactivate' : 'Activate'">
            <font-awesome-icon :icon="cert.is_active ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'" />
          </button>
          <button @click="deleteCertificate(cert.id)" class="btn-icon danger" title="Delete">
            <font-awesome-icon icon="fa-solid fa-trash" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Empty State ──────────────────────────────────────────────────── -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-solid fa-certificate" size="3x" />
      <h3>No Certificates</h3>
      <p>Start by adding your first certificate.</p>
      <button class="btn-primary" @click="openCreateModal">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Add Certificate
      </button>
    </div>

    <!-- ── CREATE/EDIT MODAL ───────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ editingCert ? 'Edit' : 'Add' }} Certificate</h3>
            <button class="modal-close" @click="closeModal">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="saveCertificate" class="certificate-form" novalidate>
            <!-- ── File Upload ──────────────────────────────────────────── -->
            <div class="form-group file-upload-group" :class="{ 'has-error': hasFieldError('file_path') }">
              <label>Certificate File <span class="required">*</span></label>
              <div 
                class="file-drop-zone" 
                :class="{ 'drop-error': hasFieldError('file_path') }"
                @dragover.prevent @drop.prevent="handleDrop"
              >
                <div v-if="!form.file && !form.file_path" class="drop-content">
                  <font-awesome-icon icon="fa-solid fa-cloud-upload-alt" size="2x" />
                  <p>Drag & drop file here or click to browse</p>
                  <span class="file-hint">PDF, JPG, PNG, DOC (Max 10MB)</span>
                </div>
                <div v-else class="file-preview">
                  <font-awesome-icon :icon="getFileIcon(form.file_type)" size="2x" />
                  <span class="file-name">{{ form.file?.name || form.file_path?.split('/').pop() }}</span>
                  <button type="button" @click="removeFile" class="remove-file">
                    <font-awesome-icon icon="fa-solid fa-times" />
                  </button>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  @change="handleFileSelect"
                  class="file-input"
                />
              </div>
              <span v-if="hasFieldError('file_path')" class="field-error">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                {{ getFieldError('file_path') }}
              </span>
              <div v-if="certStore.uploadProgress > 0 && certStore.uploadProgress < 100" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: certStore.uploadProgress + '%' }"></div>
                </div>
                <span>{{ certStore.uploadProgress }}%</span>
              </div>
            </div>

            <!-- ── Title ────────────────────────────────────────────────── -->
            <div class="form-group" :class="{ 'has-error': hasFieldError('title') }">
              <label for="title">Title <span class="required">*</span></label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="form-input"
                :class="{ 'input-error': hasFieldError('title') }"
                placeholder="e.g. Certificate of Secondary Education Examination"
                @blur="validateField('title', form.title)"
                @input="clearFieldError('title')"
              />
              <span v-if="hasFieldError('title')" class="field-error">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                {{ getFieldError('title') }}
              </span>
            </div>

            <!-- ── Institution ──────────────────────────────────────────── -->
            <div class="form-group" :class="{ 'has-error': hasFieldError('institution') }">
              <label for="institution">Institution <span class="required">*</span></label>
              <input
                id="institution"
                v-model="form.institution"
                type="text"
                required
                class="form-input"
                :class="{ 'input-error': hasFieldError('institution') }"
                placeholder="e.g. Nangwanda Secondary School"
                @blur="validateField('institution', form.institution)"
                @input="clearFieldError('institution')"
              />
              <span v-if="hasFieldError('institution')" class="field-error">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                {{ getFieldError('institution') }}
              </span>
            </div>

            <!-- ── Certificate Type & Level ────────────────────────────── -->
            <div class="form-row">
              <div class="form-group" :class="{ 'has-error': hasFieldError('type') }">
                <label for="type">Certificate Type <span class="required">*</span></label>
                <select
                  id="type"
                  v-model="form.type"
                  class="form-input"
                  :class="{ 'input-error': hasFieldError('type') }"
                  @change="clearFieldError('type')"
                >
                  <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <span v-if="hasFieldError('type')" class="field-error">
                  <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                  {{ getFieldError('type') }}
                </span>
              </div>
              <div class="form-group" :class="{ 'has-error': hasFieldError('level') }">
                <label for="level">Education Level <span class="required">*</span></label>
                <select
                  id="level"
                  v-model="form.level"
                  class="form-input"
                  :class="{ 'input-error': hasFieldError('level') }"
                  @change="clearFieldError('level')"
                >
                  <option v-for="option in levelOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <span v-if="hasFieldError('level')" class="field-error">
                  <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                  {{ getFieldError('level') }}
                </span>
              </div>
            </div>

            <!-- ── Year ──────────────────────────────────────────────────── -->
            <div class="form-group" :class="{ 'has-error': hasFieldError('year') }">
              <label for="year">Year <span class="required">*</span></label>
              <input
                id="year"
                v-model="form.year"
                type="number"
                required
                class="form-input"
                :class="{ 'input-error': hasFieldError('year') }"
                placeholder="2024"
                min="1900"
                :max="new Date().getFullYear() + 1"
                @blur="validateField('year', form.year)"
                @input="clearFieldError('year')"
              />
              <span v-if="hasFieldError('year')" class="field-error">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                {{ getFieldError('year') }}
              </span>
            </div>

            <!-- ── File Type ────────────────────────────────────────────── -->
            <div class="form-group" :class="{ 'has-error': hasFieldError('file_type') }">
              <label for="file_type">File Type <span class="required">*</span></label>
              <select
                id="file_type"
                v-model="form.file_type"
                class="form-input"
                :class="{ 'input-error': hasFieldError('file_type') }"
                @change="clearFieldError('file_type')"
              >
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="doc">Word Document</option>
              </select>
              <span v-if="hasFieldError('file_type')" class="field-error">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                {{ getFieldError('file_type') }}
              </span>
            </div>

            <!-- ── Thumbnail URL ────────────────────────────────────────── -->
            <div class="form-group" :class="{ 'has-error': hasFieldError('thumbnail_path') }">
              <label for="thumbnail_path">Thumbnail URL</label>
              <input
                id="thumbnail_path"
                v-model="form.thumbnail_path"
                type="url"
                class="form-input"
                :class="{ 'input-error': hasFieldError('thumbnail_path') }"
                placeholder="https://example.com/thumbnail.jpg"
                @blur="validateField('thumbnail_path', form.thumbnail_path)"
                @input="clearFieldError('thumbnail_path')"
              />
              <span v-if="hasFieldError('thumbnail_path')" class="field-error">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
                {{ getFieldError('thumbnail_path') }}
              </span>
            </div>

            <!-- ── Active ────────────────────────────────────────────────── -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.is_active" type="checkbox" />
                <span>Active (visible on public site)</span>
              </label>
            </div>

            <!-- ── Modal Actions ────────────────────────────────────────── -->
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="certStore.isSaving || !isFormValid">
                <span v-if="certStore.isSaving">
                  <span class="spinner-sm"></span>
                  Saving...
                </span>
                <span v-else>{{ editingCert ? 'Update' : 'Create' }} Certificate</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── VIEW MODAL ───────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showViewModal && viewingCert" class="modal-overlay" @click.self="closeViewModal">
        <div class="modal-box view-modal">
          <div class="modal-header">
            <h3>{{ viewingCert.title }}</h3>
            <button class="modal-close" @click="closeViewModal">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <div class="view-content">
            <div class="view-image">
              <img v-if="viewingCert.thumbnail_path" :src="viewingCert.thumbnail_path" :alt="viewingCert.title" />
              <div v-else class="view-placeholder">
                <font-awesome-icon icon="fa-solid fa-file-pdf" size="5x" />
              </div>
            </div>
            <div class="view-details">
              <p><strong>Type:</strong> {{ viewingCert.type }}</p>
              <p><strong>Level:</strong> {{ 
                viewingCert.level === 'secondary' ? 'Secondary Education' : 
                viewingCert.level === 'tertiary' ? 'Tertiary/University' : 
                viewingCert.level === 'professional' ? 'Professional' : 'Certificate Program' 
              }}</p>
              <p><strong>Institution:</strong> {{ viewingCert.institution }}</p>
              <p><strong>Year:</strong> {{ viewingCert.year }}</p>
              <p><strong>Status:</strong> {{ viewingCert.is_active !== false ? 'Active' : 'Inactive' }}</p>
              <div class="view-actions">
                <a :href="viewingCert.file_path" target="_blank" class="btn-primary" v-if="viewingCert.file_path">
                  <font-awesome-icon icon="fa-regular fa-file-pdf" />
                  Download
                </a>
                <button @click="closeViewModal" class="btn-outline">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Validation Styles ──────────────────────────────────────────────────── */
.has-error label {
  color: #ff6b6b !important;
}

.input-error {
  border-color: rgba(255, 107, 107, 0.4) !important;
}

.input-error:focus {
  border-color: #ff6b6b !important;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #ff6b6b;
  margin-top: 4px;
}

.field-error svg {
  flex-shrink: 0;
}

.drop-error {
  border-color: rgba(255, 107, 107, 0.4) !important;
  background: rgba(255, 107, 107, 0.05) !important;
}

/* ── Header ────────────────────────────────────────────────────────────── */
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

/* ── Buttons ────────────────────────────────────────────────────────────── */
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

/* ── Messages ────────────────────────────────────────────────────────────── */
.success-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 10px;
  color: #00E5FF;
  font-size: 0.9rem;
  margin-bottom: 16px;
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

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
}

/* ── Loading ────────────────────────────────────────────────────────────── */
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

/* ── Certificates Grid ──────────────────────────────────────────────────── */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.certificate-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.certificate-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 229, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.certificate-thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.certificate-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.2);
}

.certificate-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
}

.certificate-card:hover .certificate-overlay {
  opacity: 1;
}

.certificate-overlay svg {
  font-size: 1.5rem;
}

.certificate-overlay span {
  font-size: 0.8rem;
  font-weight: 500;
}

.certificate-info {
  padding: 16px;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.certificate-info h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
  flex: 1;
}

.type-badge {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.type-badge.csee {
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
}

.type-badge.acsee {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.type-badge.degree {
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
}

.type-badge.diploma {
  background: rgba(0, 229, 255, 0.15);
  color: #00E5FF;
}

.type-badge.certificate {
  background: rgba(37, 99, 196, 0.15);
  color: #2563C4;
}

.type-badge.certification {
  background: rgba(45, 43, 127, 0.2);
  color: #6C63FF;
}

.type-badge.professional {
  background: rgba(0, 151, 167, 0.15);
  color: #0097A7;
}

.certificate-info p {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.year {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
}

.level-badge {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-badge.secondary {
  background: rgba(255, 217, 61, 0.1);
  color: #FFD93D;
}

.level-badge.tertiary {
  background: rgba(0, 196, 212, 0.1);
  color: #00C4D4;
}

.level-badge.professional {
  background: rgba(45, 43, 127, 0.15);
  color: #6C63FF;
}

.level-badge.certificate {
  background: rgba(37, 99, 196, 0.1);
  color: #2563C4;
}

.badge-inactive {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.certificate-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 8px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── Empty State ────────────────────────────────────────────────────────── */
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

/* ── Modal ──────────────────────────────────────────────────────────────── */
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

.view-modal {
  max-width: 600px;
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

/* ── Form ────────────────────────────────────────────────────────────────── */
.certificate-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* ── File Upload ────────────────────────────────────────────────────────── */
.file-upload-group {
  grid-column: 1 / -1;
}

.file-drop-zone {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-drop-zone:hover {
  border-color: rgba(0, 229, 255, 0.3);
  background: rgba(0, 229, 255, 0.03);
}

.drop-content {
  color: rgba(255, 255, 255, 0.3);
}

.drop-content svg {
  margin-bottom: 8px;
  color: rgba(0, 229, 255, 0.3);
}

.drop-content p {
  margin: 4px 0;
  font-size: 0.9rem;
}

.file-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.2);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.file-preview svg {
  color: #00E5FF;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.remove-file {
  background: rgba(255, 107, 107, 0.1);
  border: none;
  border-radius: 50%;
  color: #ff6b6b;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.2s;
}

.remove-file:hover {
  background: rgba(255, 107, 107, 0.2);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-progress {
  margin-top: 8px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.upload-progress span {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  display: block;
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

/* ── View Modal ──────────────────────────────────────────────────────────── */
.view-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.view-image {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.view-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.view-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.1);
}

.view-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-details p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.view-details strong {
  color: rgba(255, 255, 255, 0.4);
}

.view-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

/* ── Animations ──────────────────────────────────────────────────────────── */
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

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .certificates-grid {
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