import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Projects from '../views/Projects.vue'
import Contact from '../views/Contact.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public Routes ──────────────────────────────────────────────────────
    { 
      path: '/', 
      component: Home,
      meta: { title: 'Home', hideNavBar: false, public: true }
    },
    { 
      path: '/about', 
      component: About,
      meta: { title: 'About Us', hideNavBar: false, public: true }
    },
    { 
      path: '/projects', 
      component: Projects,
      meta: { title: 'Projects', hideNavBar: false, public: true }
    },
    { 
      path: '/contact', 
      component: Contact,
      meta: { title: 'Contact', hideNavBar: false, public: true }
    },
    
    // ── Auth Routes (Guest only) ──────────────────────────────────────────
    { 
      path: '/auth/login', 
      component: () => import('../views/auth/Login.vue'),
      meta: { 
        guest: true,
        title: 'Login',
        hideNavBar: false
      }
    },
    { 
      path: '/auth/register', 
      component: () => import('../views/auth/Register.vue'),
      meta: { 
        guest: true,
        title: 'Register',
        hideNavBar: false
      }
    },
    
    // ── Client Dashboard (Protected) ──────────────────────────────────────
    {
      path: '/dashboard',
      component: () => import('../views/client/ClientLayout.vue'),
      meta: { 
        requiresAuth: true, 
        role: 'client',
        title: 'Dashboard',
        hideNavBar: true,
        hideFooter: true
      },
      children: [
        { 
          path: '', 
          component: () => import('../views/client/ClientDashboard.vue'),
          meta: { title: 'Client Dashboard' }
        },
        { 
          path: 'projects', 
          component: () => import('../views/client/ClientProjects.vue'),
          meta: { title: 'My Projects' }
        },
        { 
          path: 'messages', 
          component: () => import('../views/client/ClientMessages.vue'),
          meta: { title: 'Messages' }
        },
        { 
          path: 'profile', 
          component: () => import('../views/client/ClientProfile.vue'),
          meta: { title: 'Profile' }
        },
      ],
    },
    
    // ── Admin Routes (Protected - Admin only) ─────────────────────────────
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { 
        requiresAuth: true, 
        role: 'admin',
        title: 'Admin Dashboard',
        hideNavBar: true,
        hideFooter: true
      },
      children: [
        { 
          path: '', 
          component: () => import('../views/admin/AdminDashboard.vue'),
          meta: { title: 'Dashboard' }
        },
        { 
          path: 'contacts', 
          component: () => import('../views/admin/Contacts.vue'),
          meta: { title: 'Contacts' }
        },
        { 
          path: 'projects', 
          component: () => import('../views/admin/AdminProjects.vue'),
          meta: { title: 'Projects' }
        },
        { 
          path: 'testimonials', 
          component: () => import('../views/admin/Testimonials.vue'),
          meta: { title: 'Testimonials' }
        },
        //  Added Certificates route
        { 
          path: 'certificates', 
          component: () => import('../views/admin/AdminCertificates.vue'),
          meta: { title: 'Certificates' }
        },
        { 
          path: 'users', 
          component: () => import('../views/admin/Users.vue'),
          meta: { title: 'Users' }
        },
        { 
          path: 'settings', 
          component: () => import('../views/admin/Settings.vue'),
          meta: { title: 'Settings' }
        },
      ],
    },
    
    // ── 404 Not Found ──────────────────────────────────────────────────────
    { 
      path: '/:pathMatch(.*)*', 
      component: () => import('../views/NotFound.vue'),
      meta: { 
        title: 'Page Not Found',
        hideNavBar: true 
      }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

// ── Navigation Guard ──────────────────────────────────────────────────────
router.beforeEach(async (to, from) => {
  // Set page title
  document.title = to.meta.title ? `TSCL - ${to.meta.title}` : 'TSCL - Telesoft Company Limited'
  
  // Lazy import auth store inside the guard
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  
  // Wait for auth to initialize if not already
  if (!authStore.isInitialized) {
    await authStore.init()
  }
  
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  // ── If authenticated, prevent access to guest pages ──────────────────
  if (isAuthenticated && to.meta.guest) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return '/admin'
    } else if (userRole === 'client') {
      return '/dashboard'
    } else {
      return '/'
    }
  }

  // ── If not authenticated, prevent access to protected pages ──────────
  if (!isAuthenticated && to.meta.requiresAuth) {
    return { 
      path: '/auth/login', 
      query: { redirect: to.fullPath } 
    }
  }

  // ── Check role-based access for authenticated users ──────────────────
  if (isAuthenticated && to.meta.role) {
    if (to.meta.role !== userRole) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'admin') return '/admin'
      if (userRole === 'client') return '/dashboard'
      return '/'
    }
  }

  return true
})

export default router