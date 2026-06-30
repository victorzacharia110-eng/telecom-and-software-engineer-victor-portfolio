<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const contacts = ref([])
const isLoading = ref(true)
const error = ref(null)
const showViewModal = ref(false)
const showReplyModal = ref(false)
const searchQuery = ref('')
const selectedContact = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────
const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value
  return contacts.value.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    contact.service?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const unreadCount = computed(() => {
  return contacts.value.filter(c => !c.is_read).length
})

// ── Methods ──────────────────────────────────────────────────────────────
async function fetchContacts() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.get('/admin/contacts')
    if (response.data.success) {
      contacts.value = response.data.data
      console.log('✅ Contacts loaded:', contacts.value.length)
    }
  } catch (err) {
    console.error('❌ Failed to fetch contacts:', err)
    error.value = err.response?.data?.message || 'Failed to load contacts'
  } finally {
    isLoading.value = false
  }
}

async function markAsRead(id) {
  try {
    const response = await api.patch(`/admin/contacts/${id}/read`)
    if (response.data.success) {
      const contact = contacts.value.find(c => c.id === id)
      if (contact) contact.is_read = true
      console.log('✅ Contact marked as read')
    }
  } catch (err) {
    console.error('❌ Failed to mark as read:', err)
  }
}

async function deleteContact(id) {
  if (!confirm('Are you sure you want to delete this message?')) return

  try {
    await api.delete(`/admin/contacts/${id}`)
    contacts.value = contacts.value.filter(c => c.id !== id)
    console.log('✅ Contact deleted successfully')
  } catch (err) {
    console.error('❌ Failed to delete contact:', err)
    error.value = err.response?.data?.message || 'Failed to delete contact'
  }
}

function viewContact(contact) {
  selectedContact.value = contact
  showViewModal.value = true
  if (!contact.is_read) {
    markAsRead(contact.id)
  }
}

function getServiceBadgeColor(service) {
  const colors = {
    'ERP Systems': '#00C4D4',
    'E-Commerce': '#2563C4',
    'Telecom': '#0097A7',
    'Mobile App': '#2D2B7F',
    'Web Development': '#00E5FF',
    'Cloud Solutions': '#6C63FF',
    'General': 'rgba(255,255,255,0.3)'
  }
  return colors[service] || 'rgba(255,255,255,0.3)'
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchContacts()
})
</script>

<template>
  <div class="admin-contacts">
    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Contacts</h1>
        <p class="page-sub">
          Manage all contact messages
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }} unread</span>
        </p>
      </div>
      <button class="btn-outline" @click="fetchContacts" title="Refresh">
        <font-awesome-icon icon="fa-solid fa-rotate" />
        Refresh
      </button>
    </div>

    <!-- ── Search ────────────────────────────────────────────────────────── -->
    <div class="search-bar">
      <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search contacts by name, email, company, or service..."
        class="search-input"
      />
      <span class="result-count">{{ filteredContacts.length }} contacts</span>
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
      <p>Loading contacts...</p>
    </div>

    <!-- ── Contacts Table ────────────────────────────────────────────────── -->
    <div v-else-if="filteredContacts.length > 0" class="table-container">
      <table class="contacts-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Service</th>
            <th>Budget</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="contact in filteredContacts"
            :key="contact.id"
            :class="{ 'unread': !contact.is_read }"
          >
            <td>
              <span class="status-dot" :class="{ 'unread': !contact.is_read }"></span>
              <span class="status-text">{{ contact.is_read ? 'Read' : 'Unread' }}</span>
            </td>
            <td><strong>{{ contact.name }}</strong></td>
            <td>
              <a :href="`mailto:${contact.email}`" class="email-link">
                {{ contact.email }}
              </a>
            </td>
            <td>{{ contact.company || '—' }}</td>
            <td>
              <span
                class="service-badge"
                :style="{ background: getServiceBadgeColor(contact.service) }"
              >
                {{ contact.service || 'General' }}
              </span>
            </td>
            <td>{{ contact.budget || '—' }}</td>
            <td class="date-cell">{{ formatDate(contact.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="viewContact(contact)" class="btn-icon" title="View">
                  <font-awesome-icon icon="fa-regular fa-eye" />
                </button>
                <a :href="`mailto:${contact.email}`" class="btn-icon" title="Reply">
                  <font-awesome-icon icon="fa-regular fa-reply" />
                </a>
                <button @click="deleteContact(contact.id)" class="btn-icon danger" title="Delete">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Empty State ──────────────────────────────────────────────────── -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-regular fa-envelope" size="3x" />
      <h3>No Contacts</h3>
      <p>No contact messages have been received yet.</p>
    </div>

    <!-- ── VIEW MODAL ───────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showViewModal && selectedContact" class="modal-overlay" @click.self="showViewModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Message from {{ selectedContact.name }}</h3>
            <button class="modal-close" @click="showViewModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>

          <div class="contact-meta">
            <div class="meta-row">
              <span class="meta-label">Email:</span>
              <a :href="`mailto:${selectedContact.email}`" class="meta-value email-link">
                {{ selectedContact.email }}
              </a>
            </div>
            <div class="meta-row" v-if="selectedContact.company">
              <span class="meta-label">Company:</span>
              <span class="meta-value">{{ selectedContact.company }}</span>
            </div>
            <div class="meta-row" v-if="selectedContact.service">
              <span class="meta-label">Service:</span>
              <span class="meta-value">{{ selectedContact.service }}</span>
            </div>
            <div class="meta-row" v-if="selectedContact.budget">
              <span class="meta-label">Budget:</span>
              <span class="meta-value">{{ selectedContact.budget }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Date:</span>
              <span class="meta-value">{{ formatDate(selectedContact.created_at) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Status:</span>
              <span class="status-badge" :class="{ read: selectedContact.is_read }">
                {{ selectedContact.is_read ? 'Read' : 'Unread' }}
              </span>
            </div>
          </div>

          <div class="message-body">
            <label>Message:</label>
            <p>{{ selectedContact.message }}</p>
          </div>

          <div class="modal-actions">
            <a :href="`mailto:${selectedContact.email}`" class="btn-primary">
              <font-awesome-icon icon="fa-regular fa-paper-plane" />
              Reply by Email
            </a>
            <button @click="showViewModal = false" class="btn-outline">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-contacts {
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
  display: flex;
  align-items: center;
  gap: 12px;
}

.unread-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 20px;
  background: rgba(0, 229, 255, 0.15);
  color: #00E5FF;
  font-size: 0.75rem;
  font-weight: 600;
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 229, 255, 0.35);
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
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-icon.danger:hover {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Table ───────────────────────────────────────────────────────────────── */
.table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow-x: auto;
}

.contacts-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.contacts-table th {
  text-align: left;
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.contacts-table td {
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.contacts-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.contacts-table tr.unread td {
  background: rgba(0, 229, 255, 0.03);
}

.contacts-table tr.unread:hover td {
  background: rgba(0, 229, 255, 0.06);
}

.contacts-table tr:last-child td {
  border-bottom: none;
}

/* ── Status ────────────────────────────────────────────────────────────── */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  margin-right: 6px;
}

.status-dot.unread {
  background: #00E5FF;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.status-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.email-link {
  color: #00E5FF;
  text-decoration: none;
}

.email-link:hover {
  text-decoration: underline;
}

.service-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
}

.date-cell {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
}

.action-buttons {
  display: flex;
  gap: 4px;
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
  max-width: 550px;
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

.contact-meta {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  padding: 4px 0;
  font-size: 0.9rem;
}

.meta-label {
  color: rgba(255, 255, 255, 0.4);
  width: 80px;
  flex-shrink: 0;
}

.meta-value {
  color: rgba(255, 255, 255, 0.8);
}

.status-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.status-badge.read {
  background: rgba(0, 229, 255, 0.15);
  color: #00E5FF;
}

.message-body label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
}

.message-body p {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  font-size: 0.95rem;
  margin: 0;
  white-space: pre-wrap;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
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

  .modal-box {
    padding: 24px;
  }

  .meta-row {
    flex-direction: column;
    gap: 2px;
  }

  .meta-label {
    width: auto;
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