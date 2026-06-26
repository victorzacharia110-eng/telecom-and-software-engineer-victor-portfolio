<script setup>
import { ref, computed } from "vue";
import ProjectCard3D from "../components/ProjectCard3D.vue";

const activeFilter = ref("All");

const categories = ["All", "ERP", "E-Commerce", "Mobile", "API", "Analytics"];

// Category icon mapping - USE SIMPLE STRINGS
const categoryIcons = {
  ERP: "chart-line",
  "E-Commerce": "shopping-cart",
  Mobile: "mobile-alt",
  API: "plug",
  Analytics: "chart-bar",
};

const getCategoryIcon = (cat) => categoryIcons[cat] || "tag";

const allProjects = [
  {
    icon: "store",
    title: "RetailPro POS",
    description:
      "Multi-branch point-of-sale with inventory tracking for 200+ East African retail outlets.",
    tags: ["Laravel", "Vue.js", "MySQL"],
    team: "6 devs",
    year: "2024",
    link: "#",
    cat: "ERP",
  },
  {
    icon: "building-columns",
    title: "FinanceFlow ERP",
    description:
      "Full-cycle financial ERP with payroll, budgeting, and multi-currency real-time reporting.",
    tags: ["PHP", "React", "PostgreSQL"],
    team: "4 devs",
    year: "2024",
    link: "#",
    cat: "ERP",
  },
  {
    icon: "truck",
    title: "LogiTrack",
    description:
      "Fleet and logistics management with live GPS tracking, route optimization, and delivery analytics.",
    tags: ["Laravel", "Vue.js", "Redis"],
    team: "5 devs",
    year: "2023",
    link: "#",
    cat: "Analytics",
  },
  {
    icon: "store-alt",
    title: "MarketHub",
    description:
      "Full-featured B2B e-commerce marketplace with vendor management and escrow payments.",
    tags: ["Nuxt.js", "Laravel", "Stripe"],
    team: "7 devs",
    year: "2023",
    link: "#",
    cat: "E-Commerce",
  },
  {
    icon: "chart-pie",
    title: "InsightBoard",
    description:
      "Executive analytics dashboard with AI-powered forecasting and interactive data visualizations.",
    tags: ["Vue.js", "Python", "D3.js"],
    team: "3 devs",
    year: "2024",
    link: "#",
    cat: "Analytics",
  },
  {
    icon: "mobile-screen-button",
    title: "PayEase Mobile",
    description:
      "Cross-platform mobile payment app with QR code payments and wallet management for Tanzania.",
    tags: ["React Native", "Node.js", "MongoDB"],
    team: "4 devs",
    year: "2023",
    link: "#",
    cat: "Mobile",
  },
  {
    icon: "hospital",
    title: "MedTrack HMS",
    description:
      "Hospital management system covering patient records, appointments, billing, and pharmacy.",
    tags: ["Laravel", "Vue.js", "MySQL"],
    team: "6 devs",
    year: "2022",
    link: "#",
    cat: "ERP",
  },
  {
    icon: "code-branch",
    title: "UnifyAPI Gateway",
    description:
      "Centralized API gateway for microservices with rate limiting, auth, and traffic analytics.",
    tags: ["Node.js", "Redis", "Docker"],
    team: "3 devs",
    year: "2024",
    link: "#",
    cat: "API",
  },
  {
    icon: "graduation-cap",
    title: "EduPortal LMS",
    description:
      "Learning management system with video streaming, quizzes, certificates, and live sessions.",
    tags: ["Laravel", "Vue.js", "AWS S3"],
    team: "5 devs",
    year: "2023",
    link: "#",
    cat: "E-Commerce",
  },
];

const filteredProjects = computed(() =>
  activeFilter.value === "All"
    ? allProjects
    : allProjects.filter((p) => p.cat === activeFilter.value),
);
</script>

<template>
  <div class="projects-page">
    <div class="page-header">
      <div class="page-header-inner">
        <p class="section-label">Our Work</p>
        <h1 class="page-title">Projects That <span class="gradient-text">Define Us</span></h1>
        <p class="page-sub">
          A curated collection of enterprise solutions we've crafted with precision.
        </p>

        <!-- Filters -->
        <div class="filters">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="['filter-btn', { active: activeFilter === cat }]"
            @click="activeFilter = cat"
          >
            <font-awesome-icon v-if="cat !== 'All'" :icon="['fas', getCategoryIcon(cat)]" size="xs" />
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <div class="projects-grid-wrap">
      <TransitionGroup name="cards" tag="div" class="projects-grid">
        <ProjectCard3D
          v-for="project in filteredProjects"
          :key="project.title"
          :project="project"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}
.page-header {
  padding: 140px 32px 80px;
  text-align: center;
  position: relative;
}
.page-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(0, 196, 212, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
.page-header-inner {
  position: relative;
  z-index: 1;
}
.page-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  margin: 12px 0 16px;
}
.page-sub {
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 40px;
  line-height: 1.7;
}
.filters {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 8px 20px;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  font-family: "Space Grotesk", sans-serif;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-btn:hover {
  border-color: rgba(0, 229, 255, 0.4);
  color: #fff;
}
.filter-btn.active {
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  color: #0a0818;
  border-color: transparent;
  font-weight: 700;
}
.filter-btn.active svg {
  color: #0a0818;
}
.projects-grid-wrap {
  padding: 0 32px 100px;
}
.projects-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.cards-enter-active,
.cards-leave-active {
  transition: all 0.4s ease;
}
.cards-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.cards-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>