<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ── Form State ──────────────────────────────────────────────────────────────
const form = reactive({
  name: '',
  email: '',
  phone_number: '', // ✅ Added
  password: '',
  password_confirmation: '',
})

// ── UI State ──────────────────────────────────────────────────────────────
const isLoading = ref(false)
const error = ref(null)
const fieldErrors = ref({})
const successMessage = ref(null)
const touched = ref({})

// ── Password Visibility ──────────────────────────────────────────────────
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────
const isFormValid = computed(() => {
  return (
    form.name.length >= 2 &&
    form.email.length > 0 &&
    form.phone_number.length >= 10 &&
    form.password.length >= 8 &&
    form.password === form.password_confirmation
  )
})

// ── Validation Functions ──────────────────────────────────────────────────
function validateField(field) {
  touched.value[field] = true
  
  switch(field) {
    case 'name':
      if (form.name.length < 2) {
        fieldErrors.value.name = 'Name must be at least 2 characters'
      } else if (form.name.length > 100) {
        fieldErrors.value.name = 'Name must be less than 100 characters'
      } else {
        delete fieldErrors.value.name
      }
      break
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email)) {
        fieldErrors.value.email = 'Please enter a valid email address'
      } else {
        delete fieldErrors.value.email
      }
      break
      
    case 'phone_number':
      const phoneRegex = /^\+?[0-9]{10,15}$/
      if (!phoneRegex.test(form.phone_number)) {
        fieldErrors.value.phone_number = 'Please enter a valid phone number'
      } else {
        delete fieldErrors.value.phone_number
      }
      break
      
    case 'password':
      if (form.password.length < 8) {
        fieldErrors.value.password = 'Password must be at least 8 characters'
      } else if (form.password.length > 255) {
        fieldErrors.value.password = 'Password must be less than 255 characters'
      } else if (!/[A-Z]/.test(form.password)) {
        fieldErrors.value.password = 'Password must contain at least one uppercase letter'
      } else if (!/[a-z]/.test(form.password)) {
        fieldErrors.value.password = 'Password must contain at least one lowercase letter'
      } else if (!/[0-9]/.test(form.password)) {
        fieldErrors.value.password = 'Password must contain at least one number'
      } else {
        delete fieldErrors.value.password
      }
      break
      
    case 'password_confirmation':
      if (form.password_confirmation !== form.password) {
        fieldErrors.value.password_confirmation = 'Passwords do not match'
      } else {
        delete fieldErrors.value.password_confirmation
      }
      break
  }
}

function validateAll() {
  validateField('name')
  validateField('email')
  validateField('phone_number')
  validateField('password')
  validateField('password_confirmation')
  return Object.keys(fieldErrors.value).length === 0
}

// ── Error Handling ────────────────────────────────────────────────────────
function handleValidationErrors(errors) {
  if (errors && typeof errors === 'object') {
    const formattedErrors = {}
    let firstError = null
    
    Object.keys(errors).forEach(key => {
      const messages = Array.isArray(errors[key]) ? errors[key] : [errors[key]]
      formattedErrors[key] = messages[0]
      
      if (!firstError) {
        firstError = messages[0]
      }
    })
    
    fieldErrors.value = formattedErrors
    error.value = firstError || 'Please check the form for errors'
    return true
  }
  return false
}

function handleServerError(errorResponse) {
  const status = errorResponse?.status
  const message = errorResponse?.data?.message || 'Registration failed'
  
  switch(status) {
    case 422:
      return false
    case 429:
      error.value = 'Too many attempts. Please wait a moment and try again.'
      break
    case 500:
      error.value = 'Server error. Please try again later or contact support.'
      break
    case 503:
      error.value = 'Service unavailable. Please try again later.'
      break
    default:
      error.value = message
  }
  
  return true
}

function handleNetworkError() {
  error.value = 'Network error. Please check your internet connection.'
}

// ── Register Handler ──────────────────────────────────────────────────────
async function handleRegister() {
  error.value = null
  successMessage.value = null
  fieldErrors.value = {}
  
  const isValid = validateAll()
  if (!isValid) {
    error.value = 'Please fix all errors before submitting'
    const firstErrorField = Object.keys(fieldErrors.value)[0]
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      if (element) element.focus()
    }
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authStore.register(form)
    
    if (result.success) {
      const user = result.user
      const userRole = user.role || 'client'
      
      successMessage.value = 'Account created successfully!'
      
      console.log('Registration successful!')
      console.log('User ID:', user.id)
      console.log('User Name:', user.name)
      console.log('User Email:', user.email)
      console.log('User Phone:', user.phone_number)
      console.log('User Role:', userRole)
      
      setTimeout(() => {
        if (userRole === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }, 1500)
      
    } else {
      if (result.errors) {
        const hasValidationErrors = handleValidationErrors(result.errors)
        if (!hasValidationErrors) {
          error.value = result.message || 'Registration failed'
        }
      } else {
        error.value = result.message || 'Registration failed'
      }
      
      console.error('Registration failed:', result)
    }
    
  } catch (err) {
    console.error('Unexpected error during registration:', err)
    
    if (err.code === 'ERR_NETWORK') {
      handleNetworkError()
    } else if (err.response) {
      const handled = handleServerError(err.response)
      if (!handled) {
        error.value = err.response?.data?.message || 'An unexpected error occurred'
      }
    } else {
      error.value = 'An unexpected error occurred. Please try again.'
    }
    
  } finally {
    isLoading.value = false
  }
}

// ── Utility Functions ──────────────────────────────────────────────────────
function clearError(field) {
  if (field) {
    delete fieldErrors.value[field]
  }
  if (Object.keys(fieldErrors.value).length === 0) {
    error.value = null
  }
}

function getFieldError(field) {
  return fieldErrors.value[field]
}

function hasFieldError(field) {
  return !!fieldErrors.value[field]
}

// ── Toggle Password Visibility ──────────────────────────────────────────
function togglePassword() {
  showPassword.value = !showPassword.value
}

function togglePasswordConfirmation() {
  showPasswordConfirmation.value = !showPasswordConfirmation.value
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <div class="auth-header-content">
          <h1>Create Account</h1>
          <p>Join TSCL today</p>
        </div>
        <div class="auth-header-decoration">
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        <!-- ── Messages ────────────────────────────────────────────────────── -->
        <Transition name="fade">
          <div v-if="error" class="error-msg">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
            {{ error }}
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="successMessage" class="success-msg">
            <font-awesome-icon icon="fa-regular fa-circle-check" />
            {{ successMessage }}
          </div>
        </Transition>

        <!-- ── Form Grid ────────────────────────────────────────────────────── -->
        <div class="form-grid">
          <!-- Name Field -->
          <div class="form-group" :class="{ error: hasFieldError('name') }">
            <label for="name">
              Full Name
              <span class="required">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="John Doe"
              required
              :disabled="isLoading"
              @blur="validateField('name')"
              @input="clearError('name')"
              :class="{ 'input-error': hasFieldError('name') }"
            />
            <span v-if="hasFieldError('name')" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ getFieldError('name') }}
            </span>
          </div>

          <!-- Email Field -->
          <div class="form-group" :class="{ error: hasFieldError('email') }">
            <label for="email">
              Email Address
              <span class="required">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="john@example.com"
              required
              :disabled="isLoading"
              @blur="validateField('email')"
              @input="clearError('email')"
              :class="{ 'input-error': hasFieldError('email') }"
            />
            <span v-if="hasFieldError('email')" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ getFieldError('email') }}
            </span>
          </div>

          <!-- Phone Number Field -->
          <div class="form-group full-width" :class="{ error: hasFieldError('phone_number') }">
            <label for="phone_number">
              <font-awesome-icon icon="fa-solid fa-phone" />
              Phone Number
              <span class="required">*</span>
            </label>
            <input
              id="phone_number"
              v-model="form.phone_number"
              type="tel"
              placeholder="+255 712 345 678"
              required
              :disabled="isLoading"
              @blur="validateField('phone_number')"
              @input="clearError('phone_number')"
              :class="{ 'input-error': hasFieldError('phone_number') }"
            />
            <span v-if="hasFieldError('phone_number')" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ getFieldError('phone_number') }}
            </span>
          </div>

          <!-- Password Field -->
          <div class="form-group full-width" :class="{ error: hasFieldError('password') }">
            <label for="password">
              Password
              <span class="required">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Min 8 characters"
                required
                :disabled="isLoading"
                @blur="validateField('password')"
                @input="clearError('password')"
                :class="{ 'input-error': hasFieldError('password') }"
              />
              <button 
                type="button" 
                class="password-toggle"
                @click="togglePassword"
                :disabled="isLoading"
                tabindex="-1"
              >
                <font-awesome-icon 
                  :icon="showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"
                />
              </button>
            </div>
            <div class="password-requirements">
              <span :class="{ met: form.password.length >= 8 }">
                <font-awesome-icon :icon="form.password.length >= 8 ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                At least 8 characters
              </span>
              <span :class="{ met: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) }">
                <font-awesome-icon :icon="/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                Uppercase & lowercase
              </span>
              <span :class="{ met: /[0-9]/.test(form.password) }">
                <font-awesome-icon :icon="/[0-9]/.test(form.password) ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                At least 1 number
              </span>
            </div>
            <span v-if="hasFieldError('password')" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ getFieldError('password') }}
            </span>
          </div>

          <!-- Confirm Password Field -->
          <div class="form-group full-width" :class="{ error: hasFieldError('password_confirmation') }">
            <label for="password_confirmation">
              Confirm Password
              <span class="required">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="password_confirmation"
                v-model="form.password_confirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                placeholder="Confirm your password"
                required
                :disabled="isLoading"
                @blur="validateField('password_confirmation')"
                @input="clearError('password_confirmation')"
                :class="{ 'input-error': hasFieldError('password_confirmation') }"
              />
              <button 
                type="button" 
                class="password-toggle"
                @click="togglePasswordConfirmation"
                :disabled="isLoading"
                tabindex="-1"
              >
                <font-awesome-icon 
                  :icon="showPasswordConfirmation ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"
                />
              </button>
            </div>
            <span v-if="hasFieldError('password_confirmation')" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ getFieldError('password_confirmation') }}
            </span>
          </div>
        </div>

        <!-- ── Submit Button ──────────────────────────────────────────────── -->
        <button 
          type="submit" 
          class="btn-primary" 
          :disabled="isLoading || !isFormValid"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="!isLoading">
            <font-awesome-icon icon="fa-solid fa-user-plus" />
            Create Account
          </span>
          <span v-else class="spinner"></span>
        </button>

        <!-- ── Login Link ──────────────────────────────────────────────────── -->
        <p class="auth-switch">
          Already have an account?
          <RouterLink to="/auth/login">Sign In</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0818;
  padding: 24px;
}

.auth-container {
  width: 100%;
  max-width: 560px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 48px 40px;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.auth-header-content h1 {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.auth-header-content p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
}

.auth-header-decoration {
  display: flex;
  gap: 8px;
}

.decoration-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00C4D4, #00E5FF);
  opacity: 0.3;
}

.decoration-circle:nth-child(2) {
  opacity: 0.6;
  width: 10px;
  height: 10px;
}

.decoration-circle:nth-child(3) {
  opacity: 0.9;
  width: 12px;
  height: 12px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ff6b6b;
  font-size: 1rem;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-wrapper input {
  width: 100%;
  padding-right: 44px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
  font-size: 1rem;
  z-index: 1;
}

.password-toggle:hover:not(:disabled) {
  color: rgba(255, 255, 255, 0.7);
}

.password-toggle:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.form-group input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  font-family: 'Space Grotesk', sans-serif;
  width: 100%;
}

.form-group input:focus {
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.06);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group input.input-error {
  border-color: rgba(255, 107, 107, 0.4);
}

.form-group.input-error label {
  color: #ff6b6b;
}

.field-error {
  font-size: 0.8rem;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

.password-requirements span {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.password-requirements span.met {
  color: #00E5FF;
}

.btn-primary {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 229, 255, 0.25);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary.btn-loading {
  opacity: 0.8;
}

.auth-switch {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  margin-top: 4px;
}

.auth-switch a {
  color: #00E5FF;
  text-decoration: none;
  font-weight: 600;
}

.auth-switch a:hover {
  text-decoration: underline;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  color: #ff6b6b;
  font-size: 0.9rem;
}

.success-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 10px;
  color: #00E5FF;
  font-size: 0.9rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(10, 8, 24, 0.3);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .auth-container {
    max-width: 100%;
    padding: 32px 24px;
  }
  
  .auth-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .auth-header-decoration {
    display: none;
  }
  
  .auth-header-content h1 {
    font-size: 1.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-group.full-width {
    grid-column: 1;
  }
  
  .password-requirements {
    flex-direction: column;
    gap: 4px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .auth-container {
    max-width: 480px;
  }
}

@media (min-width: 1025px) {
  .auth-container {
    max-width: 600px;
    padding: 56px 48px;
  }
}
</style>