<script setup>
import { ref, onMounted } from 'vue'
import { useTestimonialStore } from '@/stores/testimonials'
import { storeToRefs } from 'pinia'

const store = useTestimonialStore()

// ── Store Refs ────────────────────────────────────────────────────────────
const {
  testimonials,
  isLoading,
  error,
  searchQuery,
  isSubmitting,
  selectedTestimonial,
  filteredTestimonials,
  approvedCount,
  featuredCount,
  averageRating,
  form,
  editForm,
} = storeToRefs(store)

// ── Local State ──────────────────────────────────────────────────────────
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)

// ── Methods ──────────────────────────────────────────────────────────────
async function fetchTestimonials() {
  await store.fetchTestimonials()
}

async function createTestimonial() {
  const result = await store.createTestimonial()
  if (result.success) {
    showCreateModal.value = false
  }
}

async function updateTestimonial() {
  const result = await store.updateTestimonial()
  if (result.success) {
    showEditModal.value = false
  }
}

async function toggleFeatured(id) {
  await store.toggleFeatured(id)
}

async function deleteTestimonial(id) {
  if (!confirm('Are you sure you want to delete this testimonial?')) return
  await store.deleteTestimonial(id)
}

function openEditModal(testimonial) {
  store.openEditModal(testimonial)
  showEditModal.value = true
}

function viewTestimonial(testimonial) {
  store.setSelectedTestimonial(testimonial)
  showViewModal.value = true
}

function closeViewModal() {
  showViewModal.value = false
  store.clearSelectedTestimonial()
}

function resetForm() {
  store.resetForm()
}

function clearError() {
  store.clearError()
}

// ── Helper Functions from Store ──────────────────────────────────────────
const { renderStars, getStatusLabel, getStatusColor, getRatingColor } = store

onMounted(() => {
  fetchTestimonials()
})
</script>

<template>
  <div class="admin-testimonials">
    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Testimonials</h1>
        <p class="page-sub">Manage client testimonials and reviews</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        New Testimonial
      </button>
    </div>

    <!-- ── Stats ──────────────────────────────────────────────────────────── -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ testimonials.length }}</div>
        <div class="stat-label">Total Testimonials</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ approvedCount }}</div>
        <div class="stat-label">Approved</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ featuredCount }}</div>
        <div class="stat-label">Featured</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ averageRating }}</div>
        <div class="stat-label">Average Rating</div>
      </div>
    </div>

    <!-- ── Search ────────────────────────────────────────────────────────── -->
    <div class="search-bar">
      <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search testimonials by client name or content..."
        class="search-input"
      />
      <span class="result-count">{{ filteredTestimonials.length }} testimonials</span>
    </div>

    <!-- ── Error State ──────────────────────────────────────────────────── -->
    <div v-if="error" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
      {{ error }}
      <button @click="clearError" class="error-close">×</button>
    </div>

    <!-- ── Loading State ────────────────────────────────────────────────── -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading testimonials...</p>
    </div>

    <!-- ── Testimonials Grid ────────────────────────────────────────────── -->
    <div v-else-if="filteredTestimonials.length > 0" class="testimonials-grid">
      <div v-for="testimonial in filteredTestimonials" :key="testimonial.id" class="testimonial-card">
        <div class="testimonial-header">
          <div class="client-info">
            <div class="client-avatar">
              {{ testimonial.client_name?.charAt(0).toUpperCase() || '?' }}
            </div>
            <div>
              <h3 class="client-name">{{ testimonial.client_name }}</h3>
              <p class="client-position">{{ testimonial.client_position || 'Client' }}</p>
            </div>
          </div>
          <div class="testimonial-status">
            <span class="status-badge" :style="{ background: getStatusColor(testimonial.is_approved) }">
              {{ getStatusLabel(testimonial.is_approved) }}
            </span>
            <button
              v-if="testimonial.is_approved"
              class="featured-btn"
              :class="{ active: testimonial.is_featured }"
              @click="toggleFeatured(testimonial.id)"
              title="Toggle featured"
            >
              <font-awesome-icon icon="fa-solid fa-star" />
            </button>
          </div>
        </div>

        <div class="rating" :style="{ color: getRatingColor(testimonial.rating) }">
          {{ renderStars(testimonial.rating) }}
        </div>

        <p class="testimonial-content">{{ testimonial.content }}</p>

        <div class="testimonial-footer">
          <span class="testimonial-date">
            <font-awesome-icon icon="fa-regular fa-calendar" size="xs" />
            {{ new Date(testimonial.created_at).toLocaleDateString() }}
          </span>
          <div class="testimonial-actions">
            <button @click="viewTestimonial(testimonial)" class="btn-icon" title="View">
              <font-awesome-icon icon="fa-regular fa-eye" />
            </button>
            <button @click="openEditModal(testimonial)" class="btn-icon" title="Edit">
              <font-awesome-icon icon="fa-solid fa-pen" />
            </button>
            <button @click="deleteTestimonial(testimonial.id)" class="btn-icon danger" title="Delete">
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Empty State ──────────────────────────────────────────────────── -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-solid fa-star" size="3x" />
      <h3>No Testimonials</h3>
      <p>Start by adding your first client testimonial.</p>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Add Testimonial
      </button>
    </div>

    <!-- ── CREATE MODAL ─────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Add New Testimonial</h3>
            <button class="modal-close" @click="showCreateModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="createTestimonial">
            <div class="form-group">
              <label>Client Name <span class="required">*</span></label>
              <input v-model="form.client_name" type="text" required class="form-input" placeholder="Enter client name" />
            </div>

            <div class="form-group">
              <label>Client Position</label>
              <input v-model="form.client_position" type="text" class="form-input" placeholder="e.g. CEO, Director" />
            </div>

            <div class="form-group">
              <label>Testimonial <span class="required">*</span></label>
              <textarea v-model="form.content" class="form-input" rows="4" required placeholder="What did the client say?" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Rating</label>
                <select v-model="form.rating" class="form-input">
                  <option v-for="i in 5" :key="i" :value="i">{{ i }} Star{{ i > 1 ? 's' : '' }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="form.is_approved" class="form-input">
                  <option :value="false">Pending</option>
                  <option :value="true">Approved</option>
                </select>
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.is_featured" type="checkbox" />
                <span>Feature this testimonial</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <span class="spinner-sm"></span>
                  Saving...
                </span>
                <span v-else>Add Testimonial</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── EDIT MODAL ───────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Edit Testimonial</h3>
            <button class="modal-close" @click="showEditModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="updateTestimonial">
            <div class="form-group">
              <label>Client Name <span class="required">*</span></label>
              <input v-model="editForm.client_name" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Client Position</label>
              <input v-model="editForm.client_position" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label>Testimonial <span class="required">*</span></label>
              <textarea v-model="editForm.content" class="form-input" rows="4" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Rating</label>
                <select v-model="editForm.rating" class="form-input">
                  <option v-for="i in 5" :key="i" :value="i">{{ i }} Star{{ i > 1 ? 's' : '' }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="editForm.is_approved" class="form-input">
                  <option :value="false">Pending</option>
                  <option :value="true">Approved</option>
                </select>
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="editForm.is_featured" type="checkbox" />
                <span>Feature this testimonial</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <span class="spinner-sm"></span>
                  Updating...
                </span>
                <span v-else>Update Testimonial</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── VIEW MODAL ───────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showViewModal && selectedTestimonial" class="modal-overlay" @click.self="closeViewModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Testimonial from {{ selectedTestimonial.client_name }}</h3>
            <button class="modal-close" @click="closeViewModal">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>

          <div class="view-info">
            <div class="info-row">
              <span class="info-label">Client:</span>
              <span class="info-value">{{ selectedTestimonial.client_name }}</span>
            </div>
            <div class="info-row" v-if="selectedTestimonial.client_position">
              <span class="info-label">Position:</span>
              <span class="info-value">{{ selectedTestimonial.client_position }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Rating:</span>
              <span class="info-value rating-display" :style="{ color: getRatingColor(selectedTestimonial.rating) }">
                {{ renderStars(selectedTestimonial.rating) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="status-badge" :style="{ background: getStatusColor(selectedTestimonial.is_approved) }">
                {{ getStatusLabel(selectedTestimonial.is_approved) }}
              </span>
              <span v-if="selectedTestimonial.is_featured" class="featured-badge-sm">
                <font-awesome-icon icon="fa-solid fa-star" />
                Featured
              </span>
            </div>
          </div>

          <div class="view-content">
            <label>Testimonial:</label>
            <p>{{ selectedTestimonial.content }}</p>
          </div>

          <div class="modal-actions">
            <button @click="closeViewModal" class="btn-outline">Close</button>
            <button @click="closeViewModal; openEditModal(selectedTestimonial)" class="btn-primary">
              <font-awesome-icon icon="fa-solid fa-pen" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-testimonials {
  animation: fadeIn 0.4s ease;
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

/* ── Stats ────────────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

/* ── Search Bar ────────────────────────────────────────────────────────── */
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

.featured-btn {
  padding: 2px 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.featured-btn.active {
  color: #FFD93D;
}

.featured-btn.active:hover {
  color: #ffd93d;
  background: rgba(255, 217, 61, 0.1);
}

/* ── Testimonials Grid ──────────────────────────────────────────────────── */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.testimonial-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.testimonial-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00C4D4, #00E5FF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0818;
  font-weight: 700;
  font-size: 1rem;
}

.client-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
}

.client-position {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.testimonial-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #0a0818;
}

.rating {
  font-size: 1rem;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.testimonial-content {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.testimonial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.testimonial-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  gap: 4px;
}

.testimonial-actions {
  display: flex;
  gap: 4px;
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

/* ── Error Banner ──────────────────────────────────────────────────────── */
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
  max-width: 520px;
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

/* ── Form ────────────────────────────────────────────────────────────────── */
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

/* ── View Modal ──────────────────────────────────────────────────────────── */
.view-info {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  padding: 4px 0;
  font-size: 0.9rem;
  gap: 8px;
  flex-wrap: wrap;
}

.info-label {
  color: rgba(255, 255, 255, 0.4);
  min-width: 80px;
}

.info-value {
  color: rgba(255, 255, 255, 0.8);
}

.rating-display {
  font-size: 1rem;
  letter-spacing: 2px;
}

.featured-badge-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
  font-size: 0.7rem;
  font-weight: 600;
}

.view-content label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
}

.view-content p {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  margin: 0;
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
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-box {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

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