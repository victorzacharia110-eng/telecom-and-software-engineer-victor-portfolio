<script setup>
import { ref } from 'vue'
import Hero3D from '../components/Hero3D.vue'
import SkillsOrbit from '../components/SkillsOrbit.vue'
import ProjectCard3D from '../components/ProjectCard3D.vue'

const activeService = ref(null)

const stats = [
  { value: '50+', label: 'Projects Delivered', icon: 'fa-solid fa-briefcase' },
  { value: '8+', label: 'Years Experience', icon: 'fa-solid fa-clock' },
  { value: '30+', label: 'Happy Clients', icon: 'fa-solid fa-users' },
  { value: '99%', label: 'Uptime SLA', icon: 'fa-solid fa-star' },
]

const marquee = [
  'Laravel', 'Vue.js', 'React', 'MySQL', 'Docker', 'REST APIs',
  'ERP Systems', 'Mobile Apps', 'Cloud Hosting', 'UI/UX Design',
]

const services = [
  {
    icon: 'fa-solid fa-briefcase',
    title: 'Enterprise Web Apps',
    desc: 'Custom web applications engineered for scale, security, and performance — tailored precisely to your business workflows.',
    features: ['Laravel Backend', 'Vue/React Frontend', 'Role-based Access'],
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'ERP & Business Systems',
    desc: 'Integrated ERP platforms that unify finance, inventory, HR, and operations into a single powerful dashboard.',
    features: ['Inventory Management', 'Financial Reporting', 'Multi-branch Support'],
  },
  {
    icon: 'fa-solid fa-plug',
    title: 'API Development',
    desc: 'Clean, documented REST and GraphQL APIs that connect your services, third-party tools, and mobile applications.',
    features: ['REST & GraphQL', 'OAuth2 Auth', 'Swagger Docs'],
  },
  {
    icon: 'fa-solid fa-mobile-alt',
    title: 'Mobile Solutions',
    desc: 'Cross-platform mobile apps built with React Native that deliver native-quality experiences on iOS and Android.',
    features: ['React Native', 'Offline Support', 'Push Notifications'],
  },
  {
    icon: 'fa-solid fa-cloud',
    title: 'Cloud & DevOps',
    desc: 'End-to-end deployment pipelines, CI/CD, containerized infrastructure, and monitoring for zero-downtime operations.',
    features: ['Docker & K8s', 'CI/CD Pipelines', 'Auto-scaling'],
  },
  {
    icon: 'fa-solid fa-palette',
    title: 'UI/UX Design',
    desc: 'Purposeful, brand-consistent interfaces that guide users intuitively and convert visitors into loyal customers.',
    features: ['Figma Prototypes', 'Design Systems', 'Accessibility'],
  },
]

const featuredProjects = [
  {
    icon: '🏪',
    title: 'RetailPro POS System',
    description: 'Multi-branch point-of-sale and inventory management platform serving 200+ retail outlets across East Africa.',
    tags: ['Laravel', 'Vue.js', 'MySQL'],
    team: '6 devs',
    year: '2024',
    link: '/projects',
  },
  {
    icon: '🏦',
    title: 'FinanceFlow ERP',
    description: 'Comprehensive financial management system with real-time reporting, payroll, and multi-currency support.',
    tags: ['PHP', 'React', 'PostgreSQL'],
    team: '4 devs',
    year: '2024',
    link: '/projects',
  },
  {
    icon: '🚚',
    title: 'LogiTrack Platform',
    description: 'Fleet tracking and logistics management system with live GPS, route optimization, and delivery analytics.',
    tags: ['Laravel', 'Vue.js', 'Redis'],
    team: '5 devs',
    year: '2023',
    link: '/projects',
  },
]
</script>

<template>
  <div class="home">
    <!-- ── HERO ── -->
    <section class="hero" ref="heroRef">
      <Hero3D />

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          <span class="section-label">Telesoft Company Limited</span>
        </div>

        <h1 class="hero-title">
          <span class="line1">Software Solutions</span>
          <br>
          <span class="line2 gradient-text">Built for Business</span>
        </h1>

        <p class="hero-sub">
          We design and develop enterprise-grade web applications, ERP systems,
          and digital platforms that power modern businesses across Tanzania and beyond.
        </p>

        <div class="hero-actions">
          <RouterLink to="/projects" class="btn-primary">
            View Our Work
            <font-awesome-icon icon="fa-solid fa-arrow-right" />
          </RouterLink>
          <RouterLink to="/contact" class="btn-outline">
            <font-awesome-icon icon="fa-solid fa-rocket" />
            Get in Touch
          </RouterLink>
        </div>

        <div class="hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span class="stat-value gradient-text">{{ stat.value }}</span>
            <span class="stat-label">
              <font-awesome-icon :icon="stat.icon" class="stat-icon" />
              {{ stat.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="scroll-hint">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span>Scroll</span>
      </div>
    </section>

    <!-- ── MARQUEE STRIP ── -->
    <div class="marquee-strip">
      <div class="marquee-track">
        <span v-for="item in [...marquee, ...marquee]" :key="Math.random()" class="marquee-item">
          <font-awesome-icon icon="fa-solid fa-check-circle" class="marquee-dot" />
          {{ item }}
        </span>
      </div>
    </div>

    <!-- ── SERVICES ── -->
    <section class="services-section" ref="servicesRef">
      <div class="section-header">
        <p class="section-label">What We Do</p>
        <h2 class="section-title">Services That <span class="gradient-text">Scale</span></h2>
        <p class="section-sub">End-to-end digital solutions from ideation to deployment and beyond.</p>
      </div>

      <div class="services-grid">
        <div
          v-for="(svc, i) in services"
          :key="svc.title"
          class="service-card glass-card"
          :style="{ animationDelay: `${i * 0.1}s` }"
          @mouseenter="activeService = i"
          @mouseleave="activeService = null"
        >
          <div class="svc-glow" :class="{ visible: activeService === i }"></div>
          <div class="svc-icon">
            <font-awesome-icon :icon="svc.icon" />
          </div>
          <h3 class="svc-title">{{ svc.title }}</h3>
          <p class="svc-desc">{{ svc.desc }}</p>
          <div class="svc-features">
            <span v-for="f in svc.features" :key="f" class="svc-feat">
              <font-awesome-icon icon="fa-solid fa-check-circle" size="xs" />
              {{ f }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SKILLS ORBIT ── -->
    <SkillsOrbit />

    <!-- ── PROJECTS PREVIEW ── -->
    <section class="projects-preview">
      <div class="section-header">
        <p class="section-label">Portfolio</p>
        <h2 class="section-title">Recent <span class="gradient-text">Projects</span></h2>
      </div>
      <div class="projects-grid">
        <ProjectCard3D v-for="p in featuredProjects" :key="p.title" :project="p" />
      </div>
      <div style="text-align:center; margin-top:48px">
        <RouterLink to="/projects" class="btn-outline">
          See All Projects
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </RouterLink>
      </div>
    </section>

    <!-- ── CTA BANNER ── -->
    <section class="cta-banner">
      <div class="cta-inner glass-card">
        <div class="cta-glow-orb orb1"></div>
        <div class="cta-glow-orb orb2"></div>
        <p class="section-label">Ready to start?</p>
        <h2 class="cta-title">Let's Build Something <span class="gradient-text">Remarkable</span></h2>
        <p class="cta-sub">From concept to launch, we partner with you every step of the way.</p>
        <RouterLink to="/contact" class="btn-primary" style="font-size:1rem; padding:16px 40px">
          <font-awesome-icon icon="fa-solid fa-rocket" />
          Start a Project
        </RouterLink>
      </div>
    </section>
  </div>
</template>



<style scoped>
/* ── HERO ── */
.hero {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 32px 80px;
  max-width: 680px;
  margin-left: max(32px, calc(50vw - 580px));
}
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.eyebrow-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #00E5FF;
  box-shadow: 0 0 12px #00E5FF;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}
.hero-title {
  font-size: clamp(2.8rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.08;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}
.line1 { color: #fff; }
.hero-sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
  max-width: 520px;
  margin-bottom: 36px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 60px;
}
.hero-actions .btn-primary svg,
.hero-actions .btn-outline svg {
  margin-left: 4px;
}
.hero-stats {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}
.stat-item { display: flex; flex-direction: column; gap: 4px; }
.stat-value { font-size: 2rem; font-weight: 800; font-family: 'Syne', sans-serif; }
.stat-label { 
  font-size: 0.8rem; 
  color: rgba(255,255,255,0.5); 
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.stat-icon { font-size: 0.7rem; opacity: 0.6; }

.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.35);
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  z-index: 2;
}
.scroll-mouse {
  width: 22px; height: 36px;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 11px;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}
.scroll-wheel {
  width: 3px; height: 8px;
  background: #00E5FF;
  border-radius: 2px;
  animation: scrollAnim 1.6s infinite;
}
@keyframes scrollAnim {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(12px); opacity: 0; }
}

/* ── MARQUEE ── */
.marquee-strip {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-top: 1px solid rgba(0,229,255,0.1);
  border-bottom: 1px solid rgba(0,229,255,0.1);
  padding: 16px 0;
  background: rgba(0,196,212,0.04);
}
.marquee-track {
  display: flex;
  gap: 0;
  animation: marquee 30s linear infinite;
  width: max-content;
}
.marquee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
}
.marquee-dot { 
  color: #00C4D4; 
  font-size: 0.6rem;
  opacity: 0.7;
}
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ── SECTIONS ── */
.section-header {
  text-align: center;
  margin-bottom: 64px;
}
.section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 800;
  margin: 12px 0 16px;
}
.section-sub {
  color: rgba(255,255,255,0.55);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── SERVICES ── */
.services-section {
  padding: 100px 32px;
  position: relative;
  z-index: 1;
}
.services-section > * { max-width: 1200px; margin-left: auto; margin-right: auto; }
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.service-card {
  padding: 32px 28px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,196,212,0.1);
}
.svc-glow {
  position: absolute;
  top: -40px; right: -40px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(0,229,255,0.15), transparent);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.svc-glow.visible { opacity: 1; }
.svc-icon { 
  font-size: 2rem; 
  margin-bottom: 16px;
  color: #00E5FF;
}
.svc-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 12px; }
.svc-desc { font-size: 0.875rem; color: rgba(255,255,255,0.58); line-height: 1.65; margin-bottom: 20px; }
.svc-features { display: flex; flex-wrap: wrap; gap: 6px; }
.svc-feat {
  font-size: 0.7rem;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(37,99,196,0.2);
  border: 1px solid rgba(37,99,196,0.4);
  color: rgba(255,255,255,0.6);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.svc-feat svg { font-size: 0.5rem; color: #00C4D4; }

/* ── PROJECTS PREVIEW ── */
.projects-preview {
  padding: 100px 32px;
  position: relative;
  z-index: 1;
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── CTA BANNER ── */
.cta-banner {
  padding: 80px 32px 120px;
  position: relative;
  z-index: 1;
}
.cta-inner {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
  padding: 72px 48px;
  position: relative;
  overflow: hidden;
}
.cta-glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.orb1 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0,196,212,0.12), transparent);
  top: -80px; left: -80px;
}
.orb2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(45,43,127,0.2), transparent);
  bottom: -60px; right: -60px;
}
.cta-title {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  margin: 12px 0 16px;
}
.cta-sub {
  color: rgba(255,255,255,0.6);
  margin-bottom: 36px;
  line-height: 1.7;
}

@media (max-width: 1024px) {
  .services-grid, .projects-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .services-grid, .projects-grid { grid-template-columns: 1fr; }
  .hero-content { padding: 100px 24px 60px; margin-left: 0; }
  .hero-stats { gap: 24px; }
}
</style>