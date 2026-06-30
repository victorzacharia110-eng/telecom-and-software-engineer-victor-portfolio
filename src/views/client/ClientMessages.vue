<script setup>
import { ref, onMounted } from 'vue'
import api from '@/composables/api'

const messages = ref([])
const isLoading = ref(true)
const isSending = ref(false)
const showNewMessageForm = ref(false)
const activeMessage = ref(null)

const newMessage = ref({
  service: '',
  company: '',
  budget: '',
  message: '',
})

// Fetch messages
async function fetchMessages() {
  isLoading.value = true
  try {
    const response = await api.get('/client/messages')
    if (response.data.success) {
      messages.value = response.data.data
      console.log('Messages loaded:', messages.value.length)
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    isLoading.value = false
  }
}

// Send a new message
async function sendMessage() {
  if (!newMessage.value.message.trim()) {
    return
  }

  isSending.value = true
  try {
    const response = await api.post('/client/messages', newMessage.value)
    if (response.data.success) {
      // Refresh messages
      await fetchMessages()
      showNewMessageForm.value = false
      newMessage.value = {
        service: '',
        company: '',
        budget: '',
        message: '',
      }
      console.log('Message sent successfully!')
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    if (error.response?.data?.errors) {
      alert('Please check your message and try again.')
    }
  } finally {
    isSending.value = false
  }
}

// Open message detail
async function openMessage(msg) {
  activeMessage.value = msg
  
  // Mark as read if unread
  if (!msg.is_read) {
    try {
      await api.get(`/client/messages/${msg.id}`)
      // Update local state
      msg.is_read = true
      msg.read_at = new Date().toISOString()
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="client-messages">
    <div class="messages-header">
      <h2 class="section-title">My Messages</h2>
      <button @click="showNewMessageForm = !showNewMessageForm" class="btn-primary">
        <font-awesome-icon icon="fa-solid fa-plus" />
        New Message
      </button>
    </div>

    <!-- New Message Form -->
    <Transition name="slide">
      <div v-if="showNewMessageForm" class="new-message-form">
        <h3>Send a Message</h3>
        <form @submit.prevent="sendMessage">
          <div class="form-group">
            <label for="service">Service</label>
            <select id="service" v-model="newMessage.service" class="form-input">
              <option value="">Select a service</option>
              <option value="ERP Systems">ERP Systems</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Telecom">Telecom</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Web Development">Web Development</option>
              <option value="Cloud Solutions">Cloud Solutions</option>
            </select>
          </div>

          <div class="form-group">
            <label for="company">Company</label>
            <input
              id="company"
              v-model="newMessage.company"
              type="text"
              placeholder="Your company name"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="budget">Budget Range</label>
            <select id="budget" v-model="newMessage.budget" class="form-input">
              <option value="">Select budget range</option>
              <option value="<$5k">Less than $5k</option>
              <option value="$5k–$15k">$5k – $15k</option>
              <option value="$15k–$50k">$15k – $50k</option>
              <option value=">$50k">More than $50k</option>
            </select>
          </div>

          <div class="form-group">
            <label for="message">Message <span class="required">*</span></label>
            <textarea
              id="message"
              v-model="newMessage.message"
              placeholder="Describe your project or inquiry..."
              required
              class="form-input"
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="showNewMessageForm = false" class="btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="isSending">
              <span v-if="!isSending">
                <font-awesome-icon icon="fa-regular fa-paper-plane" />
                Send Message
              </span>
              <span v-else class="spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Messages List -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading messages...</p>
    </div>

    <div v-else-if="messages.length > 0" class="messages-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-card"
        :class="{ unread: !msg.is_read }"
        @click="openMessage(msg)"
      >
        <div class="message-header">
          <div class="message-sender">
            <span class="sender-name">{{ msg.from }}</span>
            <span v-if="!msg.is_read" class="unread-badge">New</span>
          </div>
          <span class="message-date">{{ msg.date }} at {{ msg.time }}</span>
        </div>
        <div class="message-meta">
          <span v-if="msg.service" class="meta-tag">
            <font-awesome-icon icon="fa-solid fa-cog" size="xs" />
            {{ msg.service }}
          </span>
          <span v-if="msg.budget" class="meta-tag">
            <font-awesome-icon icon="fa-solid fa-coins" size="xs" />
            {{ msg.budget }}
          </span>
          <span v-if="msg.company" class="meta-tag">
            <font-awesome-icon icon="fa-solid fa-building" size="xs" />
            {{ msg.company }}
          </span>
        </div>
        <p class="message-preview">{{ msg.preview }}</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-regular fa-envelope" size="2x" />
      <p>No messages yet</p>
      <span class="empty-sub">Send a message to get started</span>
    </div>

    <!-- Message Detail Modal -->
    <Transition name="modal">
      <div v-if="activeMessage" class="modal-overlay" @click.self="activeMessage = null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="modal-title">Message from {{ activeMessage.from }}</h3>
            <button class="modal-close" @click="activeMessage = null">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <div class="modal-meta">
            <span><font-awesome-icon icon="fa-regular fa-envelope" /> {{ activeMessage.email }}</span>
            <span v-if="activeMessage.company">
              <font-awesome-icon icon="fa-solid fa-building" /> {{ activeMessage.company }}
            </span>
            <span v-if="activeMessage.service">
              <font-awesome-icon icon="fa-solid fa-cog" /> {{ activeMessage.service }}
            </span>
            <span v-if="activeMessage.budget">
              <font-awesome-icon icon="fa-solid fa-coins" /> {{ activeMessage.budget }}
            </span>
            <span><font-awesome-icon icon="fa-regular fa-clock" /> {{ activeMessage.date }} at {{ activeMessage.time }}</span>
          </div>
          <p class="modal-message">{{ activeMessage.message }}</p>
          <div class="modal-actions">
            <a :href="`mailto:${activeMessage.email}`" class="btn-primary">
              <font-awesome-icon icon="fa-regular fa-paper-plane" />
              Reply by Email
            </a>
            <button class="btn-outline" @click="activeMessage = null">
              <font-awesome-icon icon="fa-solid fa-times" />
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>



<style scoped>
.client-messages {
  animation: fadeIn 0.5s ease;
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.85rem;
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
  padding: 10px 20px;
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

/* New Message Form */
.new-message-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.new-message-form h3 {
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 16px;
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
  transition: all 0.2s;
  outline: none;
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

select.form-input option {
  background: #13102a;
  color: #fff;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.message-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.message-card.unread {
  border-color: rgba(0, 229, 255, 0.2);
  background: rgba(0, 229, 255, 0.04);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
}

.message-sender {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sender-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.unread-badge {
  padding: 2px 10px;
  border-radius: 12px;
  background: #00E5FF;
  color: #0a0818;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.message-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}

.message-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
}

.message-preview {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.3);
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.2);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.3);
}

.spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 2px solid rgba(0, 196, 212, 0.1);
  border-top-color: #00C4D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
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
  max-width: 530px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.modal-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.modal-close {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  margin-bottom: 18px;
}

.modal-meta span {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
}

.modal-message {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.72;
  margin-bottom: 22px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-box {
    padding: 20px;
  }
  
  .messages-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>