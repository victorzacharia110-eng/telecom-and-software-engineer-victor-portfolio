<script setup>
import { ref } from 'vue'

const submitting = ref(false)
const submitted = ref(false)

const form = ref({
  name: '', email: '', company: '',
  service: '', budget: '', message: '',
})

const serviceOptions = [
  'Enterprise Web Application', 'ERP System', 'API Development',
  'Mobile Application', 'Cloud & DevOps', 'UI/UX Design', 'Other',
]

const socials = [
  { label: 'LinkedIn', icon: '🔗', href: '#' },
  { label: 'Twitter', icon: '🐦', href: '#' },
  { label: 'GitHub', icon: '💻', href: '#' },
  { label: 'WhatsApp', icon: '💬', href: '#' },
]

async function submitForm() {
  submitting.value = true
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(form.value),
    })
    submitted.value = true
    form.value = { name:'', email:'', company:'', service:'', budget:'', message:'' }
  } catch(e) {
    // In production, handle error
    submitted.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="contact-page">
    <div class="contact-inner">
      <!-- Left: info -->
      <div class="contact-info">
        <p class="section-label">Get In Touch</p>
        <h1 class="contact-title">
          Let's Build<br>
          <span class="gradient-text">Together</span>
        </h1>
        <p class="contact-sub">
          Have a project in mind? We'd love to hear about it.
          Tell us what you need and we'll get back to you within 24 hours.
        </p>

        <div class="contact-details">
          <a href="mailto:info@telesoft.co.tz" class="contact-detail-item">
            <div class="detail-icon">✉️</div>
            <div>
              <div class="detail-label">Email</div>
              <div class="detail-value">info@telesoft.co.tz</div>
            </div>
          </a>
          <a href="tel:+255000000000" class="contact-detail-item">
            <div class="detail-icon">📞</div>
            <div>
              <div class="detail-label">Phone</div>
              <div class="detail-value">+255 000 000 000</div>
            </div>
          </a>
          <div class="contact-detail-item">
            <div class="detail-icon">📍</div>
            <div>
              <div class="detail-label">Location</div>
              <div class="detail-value">Dar es Salaam, Tanzania</div>
            </div>
          </div>
        </div>

        <!-- Social links -->
        <div class="social-links">
          <a v-for="s in socials" :key="s.label" :href="s.href" class="social-link" :title="s.label">
            {{ s.icon }}
          </a>
        </div>
      </div>

      <!-- Right: form -->
      <div class="contact-form-wrap glass-card">
        <div class="form-glow"></div>
        <h2 class="form-title">Send a Message</h2>

        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="form.name" type="text" placeholder="John Doe" required />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input v-model="form.email" type="email" placeholder="john@company.com" required />
            </div>
          </div>

          <div class="form-group">
            <label>Company (Optional)</label>
            <input v-model="form.company" type="text" placeholder="Your Company Ltd" />
          </div>

          <div class="form-group">
            <label>Service Interested In</label>
            <select v-model="form.service">
              <option value="">Select a service...</option>
              <option v-for="s in serviceOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Project Budget</label>
            <select v-model="form.budget">
              <option value="">Select budget range...</option>
              <option value="<5k">Under $5,000</option>
              <option value="5k-15k">$5,000 – $15,000</option>
              <option value="15k-50k">$15,000 – $50,000</option>
              <option value=">50k">$50,000+</option>
            </select>
          </div>

          <div class="form-group">
            <label>Message</label>
            <textarea v-model="form.message" rows="5" placeholder="Tell us about your project..." required></textarea>
          </div>

          <button type="submit" class="btn-primary submit-btn" :class="{ loading: submitting }">
            <span v-if="!submitting">Send Message</span>
            <span v-else class="spinner"></span>
            <svg v-if="!submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>

          <Transition name="fade">
            <div v-if="submitted" class="success-msg">
              ✅ Message sent! We'll be in touch within 24 hours.
            </div>
          </Transition>
        </form>
      </div>
    </div>
  </div>
</template>



<style scoped>
.contact-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding: 120px 32px 80px;
}
.contact-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 80px;
  align-items: start;
}
.contact-title {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 800;
  margin: 12px 0 20px;
  line-height: 1.1;
}
.contact-sub {
  color: rgba(255,255,255,0.6);
  line-height: 1.7;
  margin-bottom: 48px;
  max-width: 380px;
}
.contact-details { display: flex; flex-direction: column; gap: 24px; margin-bottom: 40px; }
.contact-detail-item {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}
.contact-detail-item:hover .detail-value { color: #00E5FF; }
.detail-icon {
  width: 48px; height: 48px;
  background: rgba(0,196,212,0.1);
  border: 1px solid rgba(0,196,212,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.detail-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
.detail-value { font-size: 0.95rem; font-weight: 500; color: rgba(255,255,255,0.85); transition: color 0.2s; }
.social-links { display: flex; gap: 12px; }
.social-link {
  width: 44px; height: 44px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.2s;
}
.social-link:hover {
  background: rgba(0,196,212,0.1);
  border-color: rgba(0,229,255,0.3);
  transform: translateY(-2px);
}

/* Form */
.contact-form-wrap {
  padding: 48px 40px;
  position: relative;
  overflow: hidden;
}
.form-glow {
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(0,196,212,0.1), transparent);
  border-radius: 50%;
  pointer-events: none;
}
.form-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 32px; }
.contact-form { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.82rem; font-weight: 500; color: rgba(255,255,255,0.65); }
.form-group input,
.form-group select,
.form-group textarea {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
  outline: none;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: rgba(0,229,255,0.4);
  box-shadow: 0 0 0 3px rgba(0,229,255,0.06);
}
.form-group select option { background: #1a1840; }
.form-group input::placeholder,
.form-group textarea::placeholder { color: rgba(255,255,255,0.25); }

.submit-btn { width: 100%; justify-content: center; font-size: 1rem; padding: 16px; margin-top: 4px; }
.submit-btn.loading { opacity: 0.7; pointer-events: none; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(10,8,24,0.3);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.success-msg {
  text-align: center;
  padding: 16px;
  background: rgba(0,229,255,0.08);
  border: 1px solid rgba(0,229,255,0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  color: #00E5FF;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s, transform 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 900px) {
  .contact-inner { grid-template-columns: 1fr; gap: 48px; }
  .form-row { grid-template-columns: 1fr; }
  .contact-form-wrap { padding: 32px 24px; }
}
</style>
