import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/global.css'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Solid Icons
import { 
  faArrowRight, 
  faBriefcase, 
  faChartLine, 
  faPlug, 
  faMobileAlt, 
  faCloud, 
  faPalette,
  faStar,
  faUsers,
  faClock,
  faCheckCircle,
  faRocket,
  faPhone,
  faLocationDot,
  faBuilding,
  faCog,
  faCoin,
  faStore,
  faBuildingColumns,
  faTruck,
  faStoreAlt,
  faChartPie,
  faMobileScreenButton,
  faHospital,
  faCodeBranch,
  faGraduationCap,
  faShoppingCart,
  faChartBar,
  faTag
} from '@fortawesome/free-solid-svg-icons'

// Regular Icons
import { 
  faEnvelope as farEnvelope,
  faUser as farUser,
  faComment as farComment,
  faPaperPlane as farPaperPlane,
  faCircleCheck as farCircleCheck,
  faCalendar as farCalendar
} from '@fortawesome/free-regular-svg-icons'

// Brand Icons
import { 
  faLaravel, 
  faVuejs, 
  faReact, 
  faDocker, 
  faPhp, 
  faNodeJs,
  faGithub,
  faLinkedinIn,
  faTwitter,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons'

// Add all icons to library
library.add(
  // Solid
  faArrowRight, faBriefcase, faChartLine, faPlug, faMobileAlt, 
  faCloud, faPalette, faStar, faUsers, faClock, faCheckCircle, 
  faRocket, faPhone, faLocationDot, faBuilding, faCog, faCoin,
  faStore, faBuildingColumns, faTruck, faStoreAlt, faChartPie,
  faMobileScreenButton, faHospital, faCodeBranch, faGraduationCap,
  faShoppingCart, faChartBar, faTag,
  // Regular
  farEnvelope, farUser, farComment, farPaperPlane, farCircleCheck, farCalendar,
  // Brands
  faLaravel, faVuejs, faReact, faDocker, faPhp, faNodeJs,
  faGithub, faLinkedinIn, faTwitter, faWhatsapp
)

// Views
import Home from './views/Home.vue'
import About from './views/About.vue'
import Projects from './views/Projects.vue'
import Contact from './views/Contact.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/projects', component: Projects },
    { path: '/contact', component: Contact },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')