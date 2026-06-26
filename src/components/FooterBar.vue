<template>
  <footer class="footer">
    <div class="footer-glow"></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <span class="logo-text">TSCL</span>
        </div>
        <p class="footer-tagline">Software Solutions for Business</p>
        <p class="footer-desc">
          Building enterprise-grade digital solutions for businesses across East Africa and beyond.
        </p>
      </div>

      <div class="footer-links" v-for="col in columns" :key="col.title">
        <h4 class="footer-col-title">{{ col.title }}</h4>
        <ul>
          <li v-for="link in col.links" :key="link.label">
            <a :href="link.href" class="footer-link">{{ link.label }}</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© {{ year }} Telesoft Company Limited. All rights reserved.</p>
      <p>Built with ❤️ in Dar es Salaam, Tanzania</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()

const columns = [
  {
    title: 'Services',
    links: [
      { label: 'Web Applications', href: '/#services' },
      { label: 'ERP Systems', href: '/#services' },
      { label: 'API Development', href: '/#services' },
      { label: 'Mobile Apps', href: '/#services' },
      { label: 'UI/UX Design', href: '/#services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'info@telesoft.co.tz', href: 'mailto:info@telesoft.co.tz' },
      { label: 'Dar es Salaam, TZ', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'WhatsApp', href: '#' },
    ],
  },
]
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(0,229,255,0.08);
  overflow: hidden;
}
.footer-glow {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 800px; height: 200px;
  background: radial-gradient(ellipse, rgba(0,196,212,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 72px 32px 48px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
}
.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.footer-tagline {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin: 8px 0 16px;
}
.footer-desc {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.65;
  max-width: 280px;
}
.footer-col-title {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 20px;
}
ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.footer-link {
  text-decoration: none;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.45);
  transition: color 0.2s;
}
.footer-link:hover { color: #00E5FF; }
.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.05);
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
}
@media (max-width: 900px) {
  .footer-inner { grid-template-columns: 1fr 1fr; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}
@media (max-width: 560px) {
  .footer-inner { grid-template-columns: 1fr; }
}
</style>
