import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api, { csrfApi } from '@/composables/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)
  const csrfFetched = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isVerified = computed(() => user.value?.is_verified || false)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.id || null)
  const accountAge = computed(() => user.value?.account_age || '')
  const userRole = computed(() => user.value?.role || 'client')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isClient = computed(() => user.value?.role === 'client')

  // ── CSRF Cookie Methods ──────────────────────────────────────────────────

  async function fetchCsrfCookie() {
    if (csrfFetched.value) return true
    
    try {
      //  Use csrfApi which has NO /api prefix
      await csrfApi.get('/sanctum/csrf-cookie')
      csrfFetched.value = true
      console.log('CSRF cookie fetched successfully')
      return true
    } catch (err) {
      console.warn('CSRF cookie not available (continuing anyway):', err.message)
      return false
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  function setUser(userData) {
    user.value = userData
    try {
      sessionStorage.setItem('auth_user', JSON.stringify(userData))
    } catch (e) {}
  }

  function clearUser() {
    user.value = null
    csrfFetched.value = false
    try {
      sessionStorage.removeItem('auth_user')
    } catch (e) {}
  }

  function rehydrate() {
    try {
      const storedUser = sessionStorage.getItem('auth_user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        user.value = parsedUser
        console.log('User rehydrated from session:', parsedUser.name)
        return true
      }
    } catch (e) {
      console.warn('Failed to rehydrate user:', e)
      sessionStorage.removeItem('auth_user')
    }
    return false
  }

  // ── Auth Methods ──────────────────────────────────────────────────────────

  async function register(userData) {
    isLoading.value = true
    error.value = null

    try {
      await fetchCsrfCookie()
      
      // ✅ Use api for auth routes (has /api prefix)
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        const newUser = response.data.data.user

        console.log('User registered successfully!')
        console.log('User ID:', newUser.id)
        console.log('User Name:', newUser.name)
        console.log('User Email:', newUser.email)
        console.log('User Phone:', newUser.phone_number)
        console.log('User Role:', newUser.role || 'client')

        setUser(newUser)

        return {
          success: true,
          user: newUser,
          message: response.data.message
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors
        if (errors) {
          const firstError = Object.values(errors)[0]?.[0]
          error.value = firstError || 'Validation failed'
        } else {
          error.value = err.response?.data?.message || 'Validation failed'
        }
      } else if (err.response?.status === 404) {
        error.value = 'API endpoint not found. Please check your server is running on port 8000.'
      } else if (err.code === 'ERR_NETWORK') {
        error.value = 'Network error. Cannot connect to the server. Make sure Laravel is running on port 8000.'
      } else {
        error.value = err.response?.data?.message || 'Registration failed'
      }
      
      return {
        success: false,
        message: error.value,
        errors: err.response?.data?.errors,
        status: err.response?.status
      }
    } finally {
      isLoading.value = false
    }
  }

  async function login(credentials) {
    isLoading.value = true
    error.value = null

    try {
      await fetchCsrfCookie()
      
      // ✅ Use api for auth routes (has /api prefix)
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        const userData = response.data.data.user
        const rememberMe = response.data.data.remember_me

        console.log('Login successful!')
        console.log('User ID:', userData.id)
        console.log('User Name:', userData.name)
        console.log('User Email:', userData.email)
        console.log('User Phone:', userData.phone_number)
        console.log('User Role:', userData.role || 'client')
        console.log('Is Admin:', userData.role === 'admin')
        console.log('Is Verified:', userData.is_verified)

        setUser(userData)

        return {
          success: true,
          user: userData,
          remember_me: rememberMe,
          message: response.data.message
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      
      if (err.response?.status === 401) {
        error.value = 'Invalid email or password'
      } else if (err.code === 'ERR_NETWORK') {
        error.value = 'Network error. Cannot connect to the server.'
      } else {
        error.value = err.response?.data?.message || 'Login failed'
      }
      
      return {
        success: false,
        message: error.value,
        errors: err.response?.data?.errors,
        status: err.response?.status
      }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    error.value = null

    try {
      await fetchCsrfCookie()
      
      // ✅ Use api for auth routes (has /api prefix)
      const response = await api.post('/auth/logout')
      
      if (response.data.success) {
        console.log('Logged out successfully!')
        clearUser()

        return {
          success: true,
          message: response.data.message
        }
      }
    } catch (err) {
      console.error('Logout error:', err)
      error.value = err.response?.data?.message || 'Logout failed'
      clearUser()
      return {
        success: false,
        message: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    isLoading.value = true
    error.value = null

    try {
      // ✅ Use api for auth routes (has /api prefix)
      const response = await api.get('/auth/user')
      
      if (response.data.success) {
        const userData = response.data.data.user

        console.log('User fetched successfully!')
        console.log('User Role:', userData.role || 'client')
        console.log('Is Admin:', userData.role === 'admin')

        setUser(userData)

        return {
          success: true,
          user: userData
        }
      }
    } catch (err) {
      console.error('Fetch user error:', err)
      error.value = err.response?.data?.message || 'Failed to fetch user'
      
      if (err.response?.status === 401) {
        clearUser()
      }

      return {
        success: false,
        message: error.value,
        status: err.response?.status
      }
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(passwordData) {
    isLoading.value = true
    error.value = null

    try {
      await fetchCsrfCookie()
      
      //  Use api for auth routes (has /api prefix)
      const response = await api.post('/auth/change-password', passwordData)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          updated_at: response.data.data.password_updated_at
        }
      }
    } catch (err) {
      console.error('Change password error:', err)
      error.value = err.response?.data?.errors || err.message
      
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to change password',
        errors: err.response?.data?.errors,
        status: err.response?.status
      }
    } finally {
      isLoading.value = false
    }
  }

  async function checkAuth() {
    const result = await fetchUser()
    return result.success
  }

  async function init() {
    if (isInitialized.value) return
    
    const rehydrated = rehydrate()
    
    if (rehydrated) {
      console.log('Auth rehydrated from session')
      isInitialized.value = true
      return
    }
    
    isLoading.value = true
    
    try {
      console.log('Initializing auth from server...')
      await fetchUser()
      isInitialized.value = true
      console.log('Auth initialized. Authenticated:', isAuthenticated.value)
      console.log('User Role:', userRole.value)
    } catch (err) {
      console.error('Auth initialization failed:', err)
      clearUser()
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  function reset() {
    clearUser()
    error.value = null
    isLoading.value = false
    isInitialized.value = false
    csrfFetched.value = false
  }

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,

    // Getters
    isAuthenticated,
    isVerified,
    userName,
    userEmail,
    userId,
    accountAge,
    userRole,
    isAdmin,
    isClient,

    // Methods
    setUser,
    clearUser,
    rehydrate,
    fetchCsrfCookie,
    register,
    login,
    logout,
    fetchUser,
    changePassword,
    checkAuth,
    init,
    reset
  }
})