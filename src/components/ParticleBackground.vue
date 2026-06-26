<template>
  <canvas ref="canvas" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvas = ref(null)
let renderer, scene, camera, animId
let particles, lines, mouse = { x: 0, y: 0 }

onMounted(() => {
  initThree()
  window.addEventListener('resize', onResize)
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  renderer.dispose()
})

function initThree() {
  const w = window.innerWidth, h = window.innerHeight

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
  camera.position.z = 80

  // --- Particles ---
  const COUNT = 280
  const positions = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const sizes = new Float32Array(COUNT)
  const particleData = []

  const palette = [
    new THREE.Color('#00E5FF'),
    new THREE.Color('#2563C4'),
    new THREE.Color('#00C4D4'),
    new THREE.Color('#2D2B7F'),
    new THREE.Color('#0097A7'),
  ]

  for (let i = 0; i < COUNT; i++) {
    const x = (Math.random() - 0.5) * 200
    const y = (Math.random() - 0.5) * 200
    const z = (Math.random() - 0.5) * 100
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    const c = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
    sizes[i] = Math.random() * 3 + 1

    particleData.push({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.04,
        (Math.random() - 0.5) * 0.04,
        (Math.random() - 0.5) * 0.02
      ),
      initialPos: new THREE.Vector3(x, y, z)
    })
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const mat = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  particles = new THREE.Points(geo, mat)
  scene.add(particles)

  // --- Connection Lines ---
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00C4D4,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  // Build lines between close particles
  const lineGeo = new THREE.BufferGeometry()
  const linePositions = []
  const maxDist = 28
  for (let i = 0; i < COUNT; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      const dx = positions[i*3] - positions[j*3]
      const dy = positions[i*3+1] - positions[j*3+1]
      const dz = positions[i*3+2] - positions[j*3+2]
      if (Math.sqrt(dx*dx+dy*dy+dz*dz) < maxDist) {
        linePositions.push(positions[i*3], positions[i*3+1], positions[i*3+2])
        linePositions.push(positions[j*3], positions[j*3+1], positions[j*3+2])
      }
    }
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3))
  lines = new THREE.LineSegments(lineGeo, lineMat)
  scene.add(lines)

  // --- Glowing sphere core ---
  const sphereGeo = new THREE.SphereGeometry(6, 32, 32)
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00C4D4,
    transparent: true,
    opacity: 0.06,
    wireframe: true,
  })
  const sphere = new THREE.Mesh(sphereGeo, sphereMat)
  sphere.position.set(30, -10, -20)
  scene.add(sphere)

  // --- Floating ring ---
  const ringGeo = new THREE.TorusGeometry(18, 0.3, 16, 100)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x2563C4,
    transparent: true,
    opacity: 0.15,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 3
  ring.position.set(-30, 10, -30)
  scene.add(ring)

  let t = 0
  function animate() {
    animId = requestAnimationFrame(animate)
    t += 0.005

    // Rotate whole particle field slowly
    particles.rotation.y += 0.0008
    particles.rotation.x += 0.0003

    // Camera parallax with mouse
    camera.position.x += (mouse.x * 12 - camera.position.x) * 0.03
    camera.position.y += (-mouse.y * 8 - camera.position.y) * 0.03
    camera.lookAt(scene.position)

    // Animate positions
    const pos = particles.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      pos[i*3+1] += Math.sin(t + i * 0.3) * 0.006
      pos[i*3] += Math.cos(t + i * 0.2) * 0.004
    }
    particles.geometry.attributes.position.needsUpdate = true

    sphere.rotation.y += 0.004
    ring.rotation.z += 0.003

    renderer.render(scene, camera)
  }
  animate()
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1
}
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
