<template>
  <div class="hero-3d-container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let renderer, scene, camera, animId
let meshGroup, floatingRings = []

onMounted(() => {
  init()
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})

function init() {
  const el = container.value
  const w = el.clientWidth, h = el.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500)
  camera.position.set(0, 0, 120)

  meshGroup = new THREE.Group()
  scene.add(meshGroup)

  // --- Arrow / chevron shape (TSCL logo motif) ---
  const arrowShape = new THREE.Shape()
  arrowShape.moveTo(0, 30)
  arrowShape.lineTo(20, 0)
  arrowShape.lineTo(12, 0)
  arrowShape.lineTo(12, -20)
  arrowShape.lineTo(-12, -20)
  arrowShape.lineTo(-12, 0)
  arrowShape.lineTo(-20, 0)
  arrowShape.closePath()

  const extrudeSettings = { depth: 6, bevelEnabled: true, bevelThickness: 1, bevelSize: 0.5, bevelSegments: 3 }
  const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings)
  arrowGeo.center()

  const arrowMat = new THREE.MeshPhongMaterial({
    color: 0x00C4D4,
    emissive: 0x003344,
    shininess: 120,
    transparent: true,
    opacity: 0.9,
  })
  const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat)
  arrowMesh.position.set(0, 10, 0)
  meshGroup.add(arrowMesh)

  // --- Letter T shape ---
  const tShape = new THREE.Shape()
  tShape.moveTo(-18, 20)
  tShape.lineTo(18, 20)
  tShape.lineTo(18, 14)
  tShape.lineTo(7, 14)
  tShape.lineTo(7, -20)
  tShape.lineTo(-7, -20)
  tShape.lineTo(-7, 14)
  tShape.lineTo(-18, 14)
  tShape.closePath()

  const letterGeo = new THREE.ExtrudeGeometry(tShape, { depth: 5, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.3 })
  letterGeo.center()
  const letterMat = new THREE.MeshPhongMaterial({
    color: 0x2D2B7F,
    emissive: 0x111040,
    shininess: 80,
  })
  const letterMesh = new THREE.Mesh(letterGeo, letterMat)
  letterMesh.position.set(-38, -10, 0)
  meshGroup.add(letterMesh)

  // --- Floating torus rings ---
  const ringConfigs = [
    { r: 22, tube: 0.4, color: 0x00E5FF, x: 50, y: 20, z: -20, rx: 0.8, ry: 0.3, speed: 0.012 },
    { r: 14, tube: 0.3, color: 0x2563C4, x: -55, y: -15, z: -15, rx: 1.2, ry: 0.6, speed: 0.018 },
    { r: 9,  tube: 0.2, color: 0x00C4D4, x: 30, y: -35, z: 10, rx: 0.4, ry: 1.1, speed: 0.025 },
  ]
  ringConfigs.forEach(cfg => {
    const geo = new THREE.TorusGeometry(cfg.r, cfg.tube, 16, 80)
    const mat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.4 })
    const ring = new THREE.Mesh(geo, mat)
    ring.position.set(cfg.x, cfg.y, cfg.z)
    ring.rotation.x = cfg.rx
    ring.rotation.y = cfg.ry
    ring.userData = { speed: cfg.speed }
    scene.add(ring)
    floatingRings.push(ring)
  })

  // --- Lights ---
  const ambient = new THREE.AmbientLight(0x334466, 1.2)
  scene.add(ambient)
  const point1 = new THREE.PointLight(0x00E5FF, 2.5, 200)
  point1.position.set(40, 40, 60)
  scene.add(point1)
  const point2 = new THREE.PointLight(0x2D2B7F, 2, 200)
  point2.position.set(-40, -20, 40)
  scene.add(point2)

  // --- Floating particles ---
  const pGeo = new THREE.BufferGeometry()
  const pCount = 80
  const pPos = new Float32Array(pCount * 3)
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random()-0.5)*160
    pPos[i*3+1] = (Math.random()-0.5)*120
    pPos[i*3+2] = (Math.random()-0.5)*60
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  const pMat = new THREE.PointsMaterial({ color: 0x00C4D4, size: 0.8, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
  scene.add(new THREE.Points(pGeo, pMat))

  let t = 0
  function animate() {
    animId = requestAnimationFrame(animate)
    t += 0.01

    meshGroup.rotation.y = Math.sin(t * 0.4) * 0.25
    meshGroup.rotation.x = Math.sin(t * 0.3) * 0.1
    meshGroup.position.y = Math.sin(t * 0.5) * 3

    floatingRings.forEach(r => {
      r.rotation.z += r.userData.speed
      r.rotation.x += r.userData.speed * 0.5
    })

    renderer.render(scene, camera)
  }
  animate()
}

function onResize() {
  const el = container.value
  if (!el) return
  const w = el.clientWidth, h = el.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}
</script>

<style scoped>
.hero-3d-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0; left: 0;
}
.hero-3d-container canvas {
  display: block;
}
</style>
