<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <RouterLink to="/" class="btn-primary">
      <font-awesome-icon icon="fa-solid fa-arrow-left" />
      Go Home
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0a0818;
  padding: 24px;
  text-align: center;
}

.not-found h1 {
  font-family: 'Syne', sans-serif;
  font-size: 6rem;
  font-weight: 800;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.not-found h2 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 12px;
}

.not-found p {
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 32px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 229, 255, 0.25);
}
</style>