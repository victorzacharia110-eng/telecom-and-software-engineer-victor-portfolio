<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  remember_me: false,
})

const isLoading = ref(false) // ✅ Added this
const error = ref(null)

async function handleLogin() {
  isLoading.value = true // ✅ Set loading to true
  error.value = null

  try {
    const result = await authStore.login(form)

    if (result.success) {
      const user = result.user
      const userRole = user.role || 'client'
      
      console.log('Login successful!')
      console.log('User Role:', userRole)
      console.log('Is Admin:', userRole === 'admin')
      
      // Role-based redirect
      if (userRole === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      error.value = result.message || 'Invalid email or password'
      
      if (result.errors) {
        const firstError = Object.values(result.errors)[0]?.[0]
        if (firstError) {
          error.value = firstError
        }
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false //  Resetting the loading state
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo -->
      <div class="login-header">
        <div class="login-logo">
          <img src="/src/assets/telesoft-company-limited-logo.png" alt="TSCL" class="logo-img" />
          <span class="logo-text">TSCL</span>
        </div>
        <p class="login-subtitle">Sign in to manage your dashboard</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="error" class="error-msg">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
            {{ error }}
          </div>
        </Transition>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email">
            <font-awesome-icon icon="fa-regular fa-envelope" />
            Email Address
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="admin@telesoft.co.tz"
            required
            autocomplete="email"
            :disabled="isLoading"
          />
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">
            <font-awesome-icon icon="fa-solid fa-lock" />
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
            :disabled="isLoading"
          />
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="form-options">
          <label class="remember-me">
            <input v-model="form.remember_me" type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-primary login-btn" :disabled="isLoading">
          <span v-if="!isLoading">
            <font-awesome-icon icon="fa-solid fa-arrow-right-to-bracket" />
            Sign In
          </span>
          <span v-else class="spinner"></span>
        </button>

        <!-- Back to Home -->
        <RouterLink to="/" class="back-home">
          <font-awesome-icon icon="fa-solid fa-arrow-left" />
          Back to Home
        </RouterLink>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0818;
  padding: 24px;
  position: relative;
}

/* Background glow effect */
.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 50% 50%, rgba(0, 196, 212, 0.05) 0%, transparent 60%);
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 48px 40px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-img {
  height: 40px;
  width: auto;
  border-radius: 8px;
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label svg {
  color: #00C4D4;
  font-size: 0.8rem;
}

.form-group input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s;
  outline: none;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #00C4D4;
  cursor: pointer;
}

.forgot-link {
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #00E5FF;
}

.login-btn {
  width: 100%;
  justify-content: center;
  font-size: 0.95rem;
  padding: 14px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  to {
    transform: rotate(360deg);
  }
}

.back-home {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
  margin-top: 8px;
}

.back-home:hover {
  color: rgba(255, 255, 255, 0.7);
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 0.85rem;
  color: #ff6b6b;
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

/* Button Styles (from your global styles) */
.btn-primary {
  background: linear-gradient(135deg, #00C4D4, #00E5FF);
  color: #0a0818;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 229, 255, 0.25);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>