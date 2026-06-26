<template>
  <section class="skills-section" ref="sectionRef">
    <div class="skills-inner">
      <div class="skills-text" ref="textRef">
        <p class="section-label">Expertise</p>
        <h2 class="skills-heading">
          Technologies We<br>
          <span class="gradient-text">Master</span>
        </h2>
        <p class="skills-sub">
          From robust backend systems to pixel-perfect frontends, our stack is built for scale,
          speed, and reliability — tailored to every business challenge.
        </p>

        <div class="skill-bars">
          <div v-for="skill in skills" :key="skill.name" class="skill-bar-item">
            <div class="skill-bar-label">
              <span>{{ skill.name }}</span>
              <span class="skill-pct">{{ skill.level }}%</span>
            </div>
            <div class="skill-bar-track">
              <div
                class="skill-bar-fill"
                :style="{ width: animated ? skill.level + '%' : '0%', background: skill.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3D Orbit Canvas -->
      <div class="orbit-canvas" ref="orbitRef"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const sectionRef = ref(null)
const orbitRef = ref(null)
const textRef = ref(null)
const animated = ref(false)

let renderer, scene, camera, animId

const skills = [
  { name: 'Laravel / PHP', level: 95, color: 'linear-gradient(90deg,#FF2D20,#FF6B6B)' },
  { name: 'Vue.js / Nuxt', level: 92, color: 'linear-gradient(90deg,#42b883,#00C4D4)' },
  { name: 'MySQL / PostgreSQL', level: 90, color: 'linear-gradient(90deg,#00C4D4,#00E5FF)' },
  { name: 'REST API / GraphQL', level: 88, color: 'linear-gradient(90deg,#2563C4,#00C4D4)' },
  { name: 'Docker / DevOps', level: 82, color: 'linear-gradient(90deg,#2D2B7F,#2563C4)' },
  { name: 'React / Next.js', level: 78, color: 'linear-gradient(90deg,#61DAFB,#00C4D4)' },
]

const techIcons = ['⚡', '🛡️', '🗄️', '🔗', '🐳', '⚛️', '🎨', '📱']

onMounted(() => {
  initOrbit()

  const observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { animated.value = true; observer.disconnect() }
  }, { threshold: 0.3 })
  if (sectionRef.value) observer.observe(sectionRef.value)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  renderer?.dispose()
})

function initOrbit() {
  const el = orbitRef.value
  if (!el) return
  const w = el.clientWidth, h = el.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500)
  camera.position.z = 90

  // Center sphere
  const coreGeo = new THREE.SphereGeometry(8, 32, 32)
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x00C4D4, emissive: 0x003344,
    transparent: true, opacity: 0.85, shininess: 200,
    wireframe: false,
  })
  const core = new THREE.Mesh(coreGeo, coreMat)
  scene.add(core)

  // Wireframe overlay on core
  const coreWireGeo = new THREE.SphereGeometry(8.2, 16, 16)
  const coreWireMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF, wireframe: true, transparent: true, opacity: 0.15 })
  scene.add(new THREE.Mesh(coreWireGeo, coreWireMat))

  // Orbit rings + orbiting nodes
  const orbitData = [
    { radius: 22, speed: 0.006, tilt: 0.3, color: 0x00E5FF },
    { radius: 32, speed: -0.004, tilt: 1.1, color: 0x2563C4 },
    { radius: 42, speed: 0.003, tilt: 0.7, color: 0x00C4D4 },
  ]

  const orbitGroups = []

  orbitData.forEach(od => {
    const group = new THREE.Group()
    group.rotation.x = od.tilt
    scene.add(group)

    // Ring
    const ringGeo = new THREE.TorusGeometry(od.radius, 0.2, 8, 100)
    const ringMat = new THREE.MeshBasicMaterial({ color: od.color, transparent: true, opacity: 0.2 })
    group.add(new THREE.Mesh(ringGeo, ringMat))

    // Orbiting node
    const nodeGeo = new THREE.OctahedronGeometry(2.2, 0)
    const nodeMat = new THREE.MeshPhongMaterial({ color: od.color, emissive: new THREE.Color(od.color).multiplyScalar(0.3), shininess: 150 })
    const node = new THREE.Mesh(nodeGeo, nodeMat)
    node.position.x = od.radius
    group.add(node)
    node.userData = { dist: od.radius }

    orbitGroups.push({ group, speed: od.speed, node })
  })

  const lights = [
    { color: 0x00E5FF, intensity: 2, pos: [40, 30, 50] },
    { color: 0x2D2B7F, intensity: 1.5, pos: [-30, -20, 30] },
  ]
  lights.forEach(l => {
    const pl = new THREE.PointLight(l.color, l.intensity, 300)
    pl.position.set(...l.pos)
    scene.add(pl)
  })
  scene.add(new THREE.AmbientLight(0x223355, 1))

  let t = 0
  function animate() {
    animId = requestAnimationFrame(animate)
    t += 0.01
    core.rotation.y += 0.005
    orbitGroups.forEach(o => { o.group.rotation.y += o.speed })
    renderer.render(scene, camera)
  }
  animate()
}
</script>

<style scoped>
.skills-section {
  padding: 120px 32px;
  position: relative;
  z-index: 1;
}
.skills-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.skills-heading {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 12px 0 20px;
}
.skills-sub {
  color: rgba(255,255,255,0.6);
  line-height: 1.7;
  max-width: 420px;
  margin-bottom: 40px;
}
.skill-bars { display: flex; flex-direction: column; gap: 18px; }
.skill-bar-item {}
.skill-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(255,255,255,0.85);
}
.skill-pct { color: #00E5FF; font-weight: 600; }
.skill-bar-track {
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  overflow: hidden;
}
.skill-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.orbit-canvas {
  width: 100%;
  height: 440px;
}
@media (max-width: 900px) {
  .skills-inner { grid-template-columns: 1fr; }
  .orbit-canvas { height: 320px; }
}
</style>
