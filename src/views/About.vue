<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const heroCanvasRef  = ref(null)
const focusCanvasRef = ref(null)
const domainsRef     = ref(null)
const focusRef       = ref(null)
const mvvRef         = ref(null)

const domainsVisible = ref(false)
const focusVisible   = ref(false)
const mvvVisible     = ref(false)
const activeFocus    = ref(null)
const spineHeight    = ref(0)
const tlVisible      = ref([])

let heroRenderer, heroAnimId, focusRenderer, focusAnimId

// CEO card tilt
const ceoTilt = reactive({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false })

function onCeoMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  ceoTilt.ry    = ((e.clientX - (rect.left + rect.width / 2))  / rect.width)  * 16
  ceoTilt.rx    = -((e.clientY - (rect.top  + rect.height / 2)) / rect.height) * 12
  ceoTilt.gx    = ((e.clientX - rect.left) / rect.width)  * 100
  ceoTilt.gy    = ((e.clientY - rect.top)  / rect.height) * 100
  ceoTilt.hover = true
}
function onCeoLeave() { Object.assign(ceoTilt, { rx: 0, ry: 0, hover: false }) }

const ceoCardStyle = computed(() => ({
  transform: `perspective(1000px) rotateX(${ceoTilt.rx}deg) rotateY(${ceoTilt.ry}deg) ${ceoTilt.hover ? 'scale(1.02)' : 'scale(1)'}`,
  transition: ceoTilt.hover ? 'transform 0.12s ease' : 'transform 0.55s ease',
  boxShadow: ceoTilt.hover
    ? '0 32px 80px rgba(0,0,0,0.55), 0 0 48px rgba(0,196,212,0.2)'
    : '0 12px 40px rgba(0,0,0,0.35)',
}))
const ceoGlareStyle = computed(() => ({
  opacity: ceoTilt.hover ? 0.1 : 0,
  background: `radial-gradient(circle at ${ceoTilt.gx}% ${ceoTilt.gy}%, rgba(255,255,255,0.85), transparent 55%)`,
  transition: 'opacity 0.3s',
}))

// Data
const ceoStats = [
  { value: '8+',  label: 'Years Experience' },
  { value: '50+', label: 'Projects Led' },
  { value: '2',   label: 'Engineering Fields' },
  { value: '30+', label: 'Clients Served' },
]
const ceoSocials = [
  { icon: '🔗', label: 'LinkedIn', href: '#' },
  { icon: '🐦', label: 'Twitter',  href: '#' },
  { icon: '💻', label: 'GitHub',   href: '#' },
  { icon: '✉️', label: 'Email',    href: 'mailto:victor@telesoft.co.tz' },
]

const telecomSkills = [
  {
    icon: '🔦', name: 'Fiber Optic & Transmission Systems', level: 94,
    detail: 'DWDM, SONET/SDH, OTN design; hands-on fiber splicing, OTDR testing and fault diagnosis across backbone and last-mile networks.',
  },
  {
    icon: '🗺️', name: 'Network Design & Planning', level: 91,
    detail: 'End-to-end topology planning; capacity analysis, link budget calculations, QoS architecture, and multi-site WAN design.',
  },
]
const telecomTags = ['DWDM', 'SDH/SONET', 'OTDR', 'Fiber Splicing', 'Link Budget', 'Network Topology', 'QoS', 'Transmission Planning', 'Last-Mile Design']

const softwareSkills = [
  {
    icon: '🏗️', name: 'Full-Stack Web Development (Laravel + Vue)', level: 96,
    detail: 'End-to-end web apps: RESTful Laravel APIs, Vue 3 SPAs, Inertia.js, Livewire, Sanctum/Passport auth, and queue workers.',
  },
  {
    icon: '🗄️', name: 'Database Architecture & Optimization', level: 90,
    detail: 'Relational schema design (MySQL/PostgreSQL); indexing strategies, query optimization, Redis caching, and migration planning.',
  },
  {
    icon: '☁️', name: 'Cloud Infrastructure & DevOps', level: 86,
    detail: 'Docker/Docker Compose, CI/CD with GitHub Actions, server provisioning on AWS/DigitalOcean, Nginx, SSL, and monitoring.',
  },
]
const softwareTags = ['Laravel', 'Vue 3', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'GitHub Actions', 'REST API', 'AWS', 'Nginx']

const focusAreas = [
  {
    icon: '🏪',
    title: 'E-Commerce & Retail Tech',
    bg: 'linear-gradient(135deg,rgba(0,196,212,0.15),rgba(37,99,196,0.15))',
    glow: 'linear-gradient(90deg,#00C4D4,#00E5FF)',
    desc: 'High-performance e-commerce platforms and retail management systems that handle everything from catalogue to checkout, inventory, and multi-branch reporting.',
    features: [
      'Multi-branch POS & inventory management',
      'Custom B2B / B2C storefronts',
      'Payment integrations: M-Pesa, Stripe, Flutterwave',
      'Real-time stock sync across branches',
      'Analytics dashboards & sales forecasting',
    ],
    clients: 'Retail chains, wholesalers, online marketplaces',
  },
  {
    icon: '📡',
    title: 'Telecom Software Solutions',
    bg: 'linear-gradient(135deg,rgba(45,43,127,0.2),rgba(0,151,167,0.15))',
    glow: 'linear-gradient(90deg,#2D2B7F,#00C4D4)',
    desc: "Leveraging Victor's telecom background, TSCL builds bespoke software for network operators and ISPs — bridging physical infrastructure and the digital tools that manage it.",
    features: [
      'Network inventory & asset management systems',
      'Fault ticketing & SLA tracking platforms',
      'ISP billing & subscriber management portals',
      'Fibre route planning & GIS integration',
      'NOC dashboards with real-time alerting',
    ],
    clients: 'ISPs, telcos, network operators, ICT agencies',
  },
  {
    icon: '📊',
    title: 'ERP & Business Systems',
    bg: 'linear-gradient(135deg,rgba(37,99,196,0.15),rgba(30,27,94,0.2))',
    glow: 'linear-gradient(90deg,#2563C4,#00E5FF)',
    desc: 'Fully integrated ERP platforms that unify finance, HR, procurement, and operations — replacing spreadsheets with a single, reliable source of truth.',
    features: [
      'Finance & accounting: GL, AP/AR modules',
      'Human resources & payroll management',
      'Procurement & supplier management',
      'Multi-branch / multi-currency support',
      'Custom reporting & executive dashboards',
    ],
    clients: 'SMEs, manufacturers, government agencies, NGOs',
  },
]

const timeline = [
  { year: '2016', icon: '🌱', title: 'TSCL Founded',             desc: 'Victor Zacharia founded Telesoft Company Limited in Dar es Salaam — building enterprise software tailored for African business realities.' },
  { year: '2017', icon: '🚀', title: 'First Enterprise Client',   desc: "Delivered the first major retail POS and inventory platform, establishing TSCL's reputation for production-grade systems." },
  { year: '2018', icon: '📡', title: 'Telecom Division Launched', desc: "Built on Victor's telecom engineering background, a dedicated telecom software practice was launched to serve ISPs and network operators." },
  { year: '2019', icon: '🌍', title: 'Regional Expansion',        desc: 'Extended delivery to Kenya and Uganda; cross-border logistics and finance platforms deployed across three countries.' },
  { year: '2021', icon: '📱', title: 'Mobile Practice Added',     desc: 'Added React Native mobile development — five production apps shipped in year one across retail, fintech, and field operations.' },
  { year: '2023', icon: '☁️', title: 'Cloud & DevOps Practice',  desc: 'Formalised cloud infrastructure services with full CI/CD pipelines, Docker deployments, and 24/7 managed hosting.' },
  { year: '2024', icon: '🤖', title: 'AI-Augmented Platforms',   desc: 'Integrated intelligent analytics, predictive dashboards, and AI-assisted decision engines into ERP and retail solutions.' },
]

const mvv = [
  {
    label: 'Mission', icon: '🎯',
    title: 'Empower African Business Through Technology',
    body: 'We close the technology gap in East Africa by delivering world-class software purposefully designed for local infrastructure, workflows, and business realities.',
  },
  {
    label: 'Vision', icon: '🔭',
    title: 'East Africa\'s Most Trusted Tech Partner by 2030',
    body: 'We measure success by real-world impact — businesses that run smoother, networks that perform reliably, and communities that benefit from digital transformation.',
  },
  {
    label: 'Approach', icon: '⚙️',
    title: 'Engineering-Led, Business-Focused',
    body: "Victor's dual engineering background means every system is designed from infrastructure up — secure, scalable, and maintainable by default, always tied to a business outcome.",
  },
]

// 3D Hero — DNA Helix
function initHeroScene() {
  const el = heroCanvasRef.value
  if (!el) return
  const w = el.clientWidth, h = el.clientHeight
  heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  heroRenderer.setSize(w, h)
  heroRenderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  el.appendChild(heroRenderer.domElement)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 500)
  camera.position.z = 95

  const helix = new THREE.Group()
  scene.add(helix)
  const palette = [0x00E5FF, 0x2563C4, 0x00C4D4, 0x2D2B7F, 0x0097A7]
  const sGeo = new THREE.SphereGeometry(1.5, 14, 14)

  for (let i = 0; i < 56; i++) {
    const t = (i / 56) * Math.PI * 7
    ;[1, -1].forEach((side, si) => {
      const mat = new THREE.MeshPhongMaterial({
        color: palette[(i + si * 2) % palette.length],
        emissive: new THREE.Color(palette[(i + si) % palette.length]).multiplyScalar(0.18),
        shininess: 130, transparent: true, opacity: 0.88,
      })
      const m = new THREE.Mesh(sGeo, mat)
      m.position.set(Math.cos(t + side * Math.PI * 0.5) * 18, (i / 56) * 90 - 45, Math.sin(t + side * Math.PI * 0.5) * 18)
      helix.add(m)
    })
    const rGeo = new THREE.CylinderGeometry(0.18, 0.18, 36, 6)
    const rMat = new THREE.MeshBasicMaterial({ color: 0x00C4D4, transparent: true, opacity: 0.12 })
    const rod  = new THREE.Mesh(rGeo, rMat)
    rod.position.set(0, (i / 56) * 90 - 45, 0)
    rod.rotation.z = Math.cos(t) * Math.PI / 2 + Math.PI / 2
    rod.rotation.x = Math.sin(t) * 0.4
    helix.add(rod)
  }

  const floaterDefs = [
    { geo: new THREE.OctahedronGeometry(5, 0),  pos: [42, 18, -25], color: 0x00E5FF },
    { geo: new THREE.IcosahedronGeometry(4, 0), pos: [-42,-14,-20], color: 0x2563C4 },
    { geo: new THREE.TetrahedronGeometry(5, 0), pos: [38,-30,-15],  color: 0x00C4D4 },
  ]
  const floaters = floaterDefs.map(s => {
    const mat  = new THREE.MeshBasicMaterial({ color: s.color, wireframe: true, transparent: true, opacity: 0.28 })
    const mesh = new THREE.Mesh(s.geo, mat)
    mesh.position.set(...s.pos)
    mesh.userData = { rx: (Math.random()-0.5)*0.014, ry: (Math.random()-0.5)*0.018 }
    scene.add(mesh)
    return mesh
  })

  scene.add(new THREE.AmbientLight(0x334466, 1.4))
  const pl1 = new THREE.PointLight(0x00E5FF, 3, 300); pl1.position.set(50, 30, 60); scene.add(pl1)
  const pl2 = new THREE.PointLight(0x2D2B7F, 2, 300); pl2.position.set(-50,-20, 40); scene.add(pl2)

  let t2 = 0
  function animate() {
    heroAnimId = requestAnimationFrame(animate)
    t2 += 0.006
    helix.rotation.y += 0.005
    helix.position.y  = Math.sin(t2 * 0.4) * 3.5
    floaters.forEach(f => { f.rotation.x += f.userData.rx; f.rotation.y += f.userData.ry })
    heroRenderer.render(scene, camera)
  }
  animate()
}

// 3D Focus — Particle field
function initFocusScene() {
  const el = focusCanvasRef.value
  if (!el) return
  const w = el.clientWidth, h = el.clientHeight
  focusRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  focusRenderer.setSize(w, h)
  focusRenderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  el.appendChild(focusRenderer.domElement)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500)
  camera.position.z = 90

  const pCount = 200
  const positions = new Float32Array(pCount * 3)
  const colors    = new Float32Array(pCount * 3)
  const pal = [new THREE.Color(0x00E5FF), new THREE.Color(0x2563C4), new THREE.Color(0x00C4D4)]
  for (let i = 0; i < pCount; i++) {
    positions[i*3] = (Math.random()-0.5)*180; positions[i*3+1] = (Math.random()-0.5)*140; positions[i*3+2] = (Math.random()-0.5)*80
    const c = pal[i % pal.length]; colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
  scene.add(new THREE.Points(geo, mat))

  let t3 = 0
  function animate() {
    focusAnimId = requestAnimationFrame(animate)
    t3 += 0.003
    const pos = geo.attributes.position.array
    for (let i = 0; i < pCount; i++) pos[i*3+1] += Math.sin(t3 + i * 0.25) * 0.015
    geo.attributes.position.needsUpdate = true
    focusRenderer.render(scene, camera)
  }
  animate()
}

function watchIn(el, cb, threshold = 0.2) {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cb(); obs.disconnect() } }, { threshold })
  if (el) obs.observe(el)
}

onMounted(() => {
  initHeroScene()
  tlVisible.value = new Array(timeline.length).fill(false)

  const tlObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const i = +e.target.dataset.idx
        tlVisible.value[i] = true
        spineHeight.value  = Math.round(((i + 1) / timeline.length) * 100)
      }
    })
  }, { threshold: 0.3 })
  document.querySelectorAll('.tl-item').forEach(el => tlObs.observe(el))

  watchIn(domainsRef.value, () => { domainsVisible.value = true })
  watchIn(focusRef.value,   () => { focusVisible.value = true; initFocusScene() })
  watchIn(mvvRef.value,     () => { mvvVisible.value = true })
})

onUnmounted(() => {
  cancelAnimationFrame(heroAnimId)
  cancelAnimationFrame(focusAnimId)
  heroRenderer?.dispose()
  focusRenderer?.dispose()
})
</script>

<template>
  <div class="about-page">
    <!-- HERO - Victor Zacharia CEO Profile -->
    <section class="about-hero">
      <div class="hero-bg-glow"></div>

      <div class="hero-left">
        <div
          class="ceo-card glass-card"
          @mousemove="onCeoMove"
          @mouseleave="onCeoLeave"
          :style="ceoCardStyle"
        >
          <div class="ceo-glare" :style="ceoGlareStyle"></div>

          <div class="ceo-avatar-wrap">
            <div class="ceo-avatar">
              <span class="ceo-initials">VZ</span>
              <div class="ceo-ring ring1"></div>
              <div class="ceo-ring ring2"></div>
            </div>
            <div class="ceo-badge"><span class="badge-dot"></span> CEO &amp; Founder</div>
          </div>

          <h1 class="ceo-name">Victor Zacharia</h1>
          <p class="ceo-tagline gradient-text">Engineer · Architect · Visionary</p>
          <p class="ceo-bio">
            Victor Zacharia is a dual-discipline engineer combining deep expertise in
            <strong>Telecommunications Engineering</strong> and
            <strong>Full-Stack Software Development</strong>. As the founder of Telesoft Company
            Limited, he leads a team dedicated to delivering enterprise-grade digital solutions
            across East Africa — uniquely bridging physical network infrastructure and modern
            software systems.
          </p>

          <div class="ceo-stats">
            <div class="ceo-stat" v-for="s in ceoStats" :key="s.label">
              <span class="ceo-stat-val gradient-text">{{ s.value }}</span>
              <span class="ceo-stat-label">{{ s.label }}</span>
            </div>
          </div>

          <div class="ceo-accent-line"></div>
        </div>

        <div class="ceo-socials">
          <a v-for="s in ceoSocials" :key="s.label" :href="s.href" class="ceo-social-chip">
            <span>{{ s.icon }}</span> {{ s.label }}
          </a>
        </div>
      </div>

      <div class="hero-canvas" ref="heroCanvasRef"></div>
    </section>

    <!-- DUAL SKILL DOMAINS -->
    <section class="skills-domains" ref="domainsRef">
      <div class="domains-header">
        <p class="section-label">Expertise</p>
        <h2 class="section-title">
          Two Disciplines, <span class="gradient-text">One Vision</span>
        </h2>
        <p class="section-sub">
          Victor's rare combination of telecom and software engineering gives TSCL an unmatched
          advantage — designing systems that are as rock-solid at the network layer as they are at
          the application layer.
        </p>
      </div>

      <div class="domains-grid">
        <!-- Telecom -->
        <div class="domain-card glass-card" :class="{ visible: domainsVisible }">
          <div class="domain-icon-wrap telecom"><span class="domain-icon">📡</span></div>
          <h3 class="domain-title">Telecommunications Engineering</h3>
          <p class="domain-desc">
            With formal training and hands-on field experience, Victor architects networks that are
            robust, low-latency, and designed for enterprise-scale demands.
          </p>
          <div class="skill-list">
            <div v-for="sk in telecomSkills" :key="sk.name" class="skill-row">
              <div class="skill-row-header">
                <span class="skill-icon">{{ sk.icon }}</span>
                <span class="skill-name">{{ sk.name }}</span>
                <span class="skill-pct">{{ sk.level }}%</span>
              </div>
              <div class="skill-track">
                <div
                  class="skill-fill telecom-fill"
                  :style="{ width: domainsVisible ? sk.level + '%' : '0%' }"
                ></div>
              </div>
              <p class="skill-detail">{{ sk.detail }}</p>
            </div>
          </div>
          <div class="domain-tags">
            <span v-for="t in telecomTags" :key="t" class="domain-tag telecom-tag">{{ t }}</span>
          </div>
        </div>

        <!-- Software -->
        <div
          class="domain-card glass-card"
          :class="{ visible: domainsVisible }"
          style="transition-delay: 0.18s"
        >
          <div class="domain-icon-wrap software"><span class="domain-icon">⚙️</span></div>
          <h3 class="domain-title">Software Engineering</h3>
          <p class="domain-desc">
            From architecting Laravel backends to deploying containerised cloud infrastructure,
            Victor engineers complete digital solutions that scale from startup to enterprise.
          </p>
          <div class="skill-list">
            <div v-for="sk in softwareSkills" :key="sk.name" class="skill-row">
              <div class="skill-row-header">
                <span class="skill-icon">{{ sk.icon }}</span>
                <span class="skill-name">{{ sk.name }}</span>
                <span class="skill-pct">{{ sk.level }}%</span>
              </div>
              <div class="skill-track">
                <div
                  class="skill-fill software-fill"
                  :style="{ width: domainsVisible ? sk.level + '%' : '0%' }"
                ></div>
              </div>
              <p class="skill-detail">{{ sk.detail }}</p>
            </div>
          </div>
          <div class="domain-tags">
            <span v-for="t in softwareTags" :key="t" class="domain-tag software-tag">{{ t }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- COMPANY FOCUS AREAS -->
    <section class="focus-section" ref="focusRef">
      <div class="focus-canvas" ref="focusCanvasRef"></div>
      <div class="focus-content">
        <div class="focus-header">
          <p class="section-label">What We Build</p>
          <h2 class="section-title">Company <span class="gradient-text">Focus Areas</span></h2>
          <p class="section-sub">
            Three pillars that define every solution we engineer at Telesoft Company Limited.
          </p>
        </div>
        <div class="focus-cards">
          <div
            v-for="(area, i) in focusAreas"
            :key="area.title"
            class="focus-card glass-card"
            :class="{ visible: focusVisible }"
            :style="{ transitionDelay: i * 0.14 + 's' }"
            @mouseenter="activeFocus = i"
            @mouseleave="activeFocus = null"
          >
            <div class="focus-number">{{ String(i + 1).padStart(2, "0") }}</div>
            <div class="focus-icon-wrap" :style="{ background: area.bg }">
              <span class="focus-icon">{{ area.icon }}</span>
            </div>
            <h3 class="focus-title">{{ area.title }}</h3>
            <p class="focus-desc">{{ area.desc }}</p>
            <ul class="focus-features">
              <li v-for="f in area.features" :key="f"><span class="feat-dot">◆</span> {{ f }}</li>
            </ul>
            <div class="focus-clients">
              <span class="clients-label">Typical clients:</span>
              <span class="clients-val">{{ area.clients }}</span>
            </div>
            <div
              class="focus-glow-bar"
              :style="{ background: area.glow, opacity: activeFocus === i ? 1 : 0 }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- TIMELINE -->
    <section class="timeline-section">
      <div class="tl-header">
        <p class="section-label">Our Journey</p>
        <h2 class="section-title">Built Over <span class="gradient-text">Years of Craft</span></h2>
      </div>
      <div class="timeline" ref="timelineRef">
        <div class="tl-spine">
          <div class="tl-spine-fill" :style="{ height: spineHeight + '%' }"></div>
        </div>
        <div
          v-for="(ev, i) in timeline"
          :key="ev.year"
          class="tl-item"
          :class="{ left: i % 2 === 0, right: i % 2 !== 0, visible: tlVisible[i] }"
          :data-idx="i"
        >
          <div class="tl-card glass-card">
            <div class="tl-year gradient-text">{{ ev.year }}</div>
            <div class="tl-ev-icon">{{ ev.icon }}</div>
            <h3 class="tl-title">{{ ev.title }}</h3>
            <p class="tl-desc">{{ ev.desc }}</p>
          </div>
          <div class="tl-dot"><div class="tl-dot-core"></div></div>
        </div>
      </div>
    </section>

    <!-- MISSION / VISION / VALUES -->
    <section class="mvv-section" ref="mvvRef">
      <div class="mvv-inner">
        <div
          v-for="(item, i) in mvv"
          :key="item.label"
          class="mvv-card glass-card"
          :class="{ visible: mvvVisible }"
          :style="{ transitionDelay: i * 0.15 + 's' }"
        >
          <span class="mvv-icon">{{ item.icon }}</span>
          <p class="section-label">{{ item.label }}</p>
          <h3 class="mvv-title">{{ item.title }}</h3>
          <p class="mvv-body">{{ item.body }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="about-cta">
      <div class="cta-inner glass-card">
        <div class="cta-orb orb1"></div>
        <div class="cta-orb orb2"></div>
        <p class="section-label">Let's Connect</p>
        <h2 class="cta-title">Ready to Build <span class="gradient-text">Together?</span></h2>
        <p class="cta-sub">
          Whether you need a full ERP system, a telecom management platform, or a scalable
          e-commerce solution — Victor and the TSCL team are ready to engineer it.
        </p>
        <div class="cta-actions">
          <RouterLink to="/contact" class="btn-primary">Start a Project</RouterLink>
          <RouterLink to="/projects" class="btn-outline">View Our Work</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>



<style scoped>
.about-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}
.section-label {
  font-size: 0.73rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--bright-cyan, #00e5ff);
  font-weight: 600;
}
.section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 800;
  margin: 12px 0 16px;
}
.section-sub {
  color: rgba(255, 255, 255, 0.55);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.72;
}
.gradient-text {
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* HERO */
.about-hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 60px;
  padding: 120px 32px 80px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}
.hero-bg-glow {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 700px;
  background: radial-gradient(ellipse at 65% 0%, rgba(0, 196, 212, 0.07), transparent 65%);
  pointer-events: none;
  z-index: 0;
}
.hero-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.ceo-card {
  padding: 36px 32px;
  position: relative;
  overflow: hidden;
  will-change: transform;
  cursor: default;
}
.ceo-glare {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 10;
}

.ceo-avatar-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.ceo-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e1b5e, #00c4d4);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}
.ceo-initials {
  font-family: "Syne", sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  position: relative;
  z-index: 1;
}
.ceo-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(0, 229, 255, 0.4);
  inset: -4px;
  animation: ceoRing 2.8s ease-in-out infinite;
}
.ceo-ring.ring2 {
  inset: -10px;
  opacity: 0.35;
  animation-delay: 0.8s;
}
@keyframes ceoRing {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

.ceo-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 30px;
  background: rgba(0, 196, 212, 0.12);
  border: 1px solid rgba(0, 229, 255, 0.25);
  font-size: 0.78rem;
  font-weight: 600;
  color: #00e5ff;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 6px #00e5ff;
  animation: bdot 1.8s infinite;
}
@keyframes bdot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.4);
  }
}

.ceo-name {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}
.ceo-tagline {
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.ceo-bio {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.75;
  margin-bottom: 26px;
}
.ceo-bio strong {
  color: #00c4d4;
  font-weight: 600;
}

.ceo-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.ceo-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: center;
}
.ceo-stat-val {
  font-family: "Syne", sans-serif;
  font-size: 1.45rem;
  font-weight: 800;
}
.ceo-stat-label {
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.38);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ceo-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00c4d4, #00e5ff, transparent);
  opacity: 0.7;
}

.ceo-socials {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.ceo-social-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s;
  font-weight: 500;
}
.ceo-social-chip:hover {
  background: rgba(0, 196, 212, 0.1);
  border-color: rgba(0, 229, 255, 0.3);
  color: #fff;
}

.hero-canvas {
  width: 100%;
  height: 560px;
}

/* SKILL DOMAINS */
.skills-domains {
  padding: 100px 32px;
  max-width: 1200px;
  margin: 0 auto;
}
.domains-header {
  text-align: center;
  margin-bottom: 64px;
}
.domains-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}
.domain-card {
  padding: 36px 30px;
  opacity: 0;
  transform: translateY(36px);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
}
.domain-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.domain-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.telecom {
  background: linear-gradient(135deg, rgba(0, 196, 212, 0.2), rgba(0, 151, 167, 0.15));
  border: 1px solid rgba(0, 196, 212, 0.3);
}
.software {
  background: linear-gradient(135deg, rgba(37, 99, 196, 0.2), rgba(45, 43, 127, 0.15));
  border: 1px solid rgba(37, 99, 196, 0.3);
}
.domain-icon {
  font-size: 1.7rem;
}
.domain-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 12px;
}
.domain-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.68;
  margin-bottom: 28px;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-bottom: 24px;
}
.skill-row {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.skill-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.skill-icon {
  font-size: 0.95rem;
}
.skill-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  flex: 1;
}
.skill-pct {
  font-size: 0.78rem;
  font-weight: 700;
  color: #00e5ff;
}
.skill-track {
  height: 5px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 3px;
  overflow: hidden;
}
.skill-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.telecom-fill {
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
}
.software-fill {
  background: linear-gradient(90deg, #2563c4, #00e5ff);
}
.skill-detail {
  font-size: 0.775rem;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.55;
}

.domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.domain-tag {
  font-size: 0.7rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}
.telecom-tag {
  background: rgba(0, 196, 212, 0.1);
  border: 1px solid rgba(0, 196, 212, 0.3);
  color: #00c4d4;
}
.software-tag {
  background: rgba(37, 99, 196, 0.12);
  border: 1px solid rgba(37, 99, 196, 0.35);
  color: #7bb3ff;
}

/* FOCUS AREAS */
.focus-section {
  padding: 100px 32px;
  position: relative;
  overflow: hidden;
}
.focus-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.3;
}
.focus-canvas canvas {
  width: 100% !important;
  height: 100% !important;
}
.focus-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}
.focus-header {
  text-align: center;
  margin-bottom: 64px;
}
.focus-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.focus-card {
  padding: 32px 26px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease,
    box-shadow 0.3s;
}
.focus-card.visible {
  opacity: 1;
  transform: translateY(0);
}
.focus-card:hover {
  box-shadow:
    0 20px 56px rgba(0, 0, 0, 0.45),
    0 0 30px rgba(0, 196, 212, 0.12);
}

.focus-number {
  font-family: "Syne", sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  color: rgba(0, 229, 255, 0.07);
  position: absolute;
  top: 12px;
  right: 20px;
  line-height: 1;
  pointer-events: none;
}
.focus-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.focus-icon {
  font-size: 1.6rem;
}
.focus-title {
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 12px;
}
.focus-desc {
  font-size: 0.855rem;
  color: rgba(255, 255, 255, 0.57);
  line-height: 1.68;
  margin-bottom: 20px;
}
.focus-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.focus-features li {
  font-size: 0.815rem;
  color: rgba(255, 255, 255, 0.62);
  display: flex;
  align-items: baseline;
  gap: 7px;
  line-height: 1.5;
}
.feat-dot {
  color: #00c4d4;
  font-size: 0.45rem;
  flex-shrink: 0;
}
.focus-clients {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.35);
}
.clients-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  margin-right: 4px;
}
.clients-val {
  font-style: italic;
}
.focus-glow-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  transition: opacity 0.35s;
}

/* TIMELINE */
.timeline-section {
  padding: 100px 32px;
}
.tl-header {
  text-align: center;
  margin-bottom: 80px;
}
.timeline {
  max-width: 940px;
  margin: 0 auto;
  position: relative;
  padding: 0 24px;
}
.tl-spine {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 229, 255, 0.08);
}
.tl-spine-fill {
  width: 100%;
  background: linear-gradient(180deg, #00c4d4, #00e5ff);
  transition: height 1.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 1px;
}

.tl-item {
  display: flex;
  align-items: center;
  margin-bottom: 52px;
  opacity: 0;
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.tl-item.left {
  flex-direction: row;
  transform: translateX(-36px);
}
.tl-item.right {
  flex-direction: row-reverse;
  transform: translateX(36px);
}
.tl-item.visible {
  opacity: 1;
  transform: translateX(0);
}
.tl-card {
  width: calc(50% - 44px);
  padding: 24px 22px;
  flex-shrink: 0;
}
.tl-item.left .tl-card {
  margin-right: auto;
}
.tl-item.right .tl-card {
  margin-left: auto;
}
.tl-year {
  font-family: "Syne", sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 4px;
}
.tl-ev-icon {
  font-size: 1.3rem;
  margin-bottom: 8px;
}
.tl-title {
  font-size: 0.98rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.tl-desc {
  font-size: 0.815rem;
  color: rgba(255, 255, 255, 0.54);
  line-height: 1.65;
}
.tl-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00c4d4, #00e5ff);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tl-dot-core {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0a0818;
}

/* MVV */
.mvv-section {
  padding: 80px 32px;
}
.mvv-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.mvv-card {
  padding: 36px 28px;
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.mvv-card.visible {
  opacity: 1;
  transform: translateY(0);
}
.mvv-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 12px;
}
.mvv-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 8px 0 12px;
}
.mvv-body {
  font-size: 0.87rem;
  color: rgba(255, 255, 255, 0.57);
  line-height: 1.72;
}

/* CTA */
.about-cta {
  padding: 80px 32px 120px;
}
.cta-inner {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  padding: 72px 48px;
  position: relative;
  overflow: hidden;
}
.cta-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.orb1 {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(0, 196, 212, 0.1), transparent);
  top: -80px;
  left: -80px;
}
.orb2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(45, 43, 127, 0.18), transparent);
  bottom: -60px;
  right: -60px;
}
.cta-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin: 12px 0 16px;
}
.cta-sub {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.72;
  margin-bottom: 36px;
}
.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .about-hero {
    grid-template-columns: 1fr;
  }
  .hero-canvas {
    height: 360px;
  }
  .domains-grid {
    grid-template-columns: 1fr;
  }
  .focus-cards {
    grid-template-columns: 1fr 1fr;
  }
  .mvv-inner {
    grid-template-columns: 1fr;
  }
  .ceo-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 700px) {
  .focus-cards {
    grid-template-columns: 1fr;
  }
  .tl-item.left,
  .tl-item.right {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 36px;
  }
  .tl-spine {
    left: 18px;
    transform: none;
  }
  .tl-dot {
    left: 18px;
  }
  .tl-card {
    width: 100%;
  }
  .cta-inner {
    padding: 48px 24px;
  }
  .about-hero {
    padding: 100px 24px 60px;
  }
}
</style>
