<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/composables/api";

const authStore = useAuthStore();

// ── Dynamic State ──────────────────────────────────────────────────────────
const isLoading = ref(true);
const statsData = ref(null);
const monthlyEnquiries = ref([]);
const projectsByCategory = ref([]);
const recentMessages = ref([]);
const systemStatus = ref([]);
const certificates = ref([]);
const showCertificateModal = ref(false);
const selectedCertificate = ref(null);

// ── Computed ──────────────────────────────────────────────────────────────
const hour = new Date().getHours();
const timeGreeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
const todayDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const stats = computed(() => {
  if (!statsData.value) return [];
  return [
    {
      label: "Total Projects",
      value: statsData.value.total_projects || 0,
      sub: `${statsData.value.active_projects || 0} active this month`,
      trend: statsData.value.projects_trend || "+0%",
      trendUp: true,
      color: "#00C4D4",
      iconBg: "rgba(0,196,212,0.15)",
      icon: "fa-solid fa-briefcase",
      sparkline: statsData.value.projects_sparkline || [0],
    },
    {
      label: "Unread Messages",
      value: statsData.value.unread_messages || 0,
      sub: `${statsData.value.total_messages || 0} total this month`,
      trend: statsData.value.messages_trend || "+0",
      trendUp: true,
      color: "#00E5FF",
      iconBg: "rgba(0,229,255,0.12)",
      icon: "fa-regular fa-envelope",
      sparkline: statsData.value.messages_sparkline || [0],
    },
    {
      label: "Active Clients",
      value: statsData.value.active_clients || 0,
      sub: `${statsData.value.new_clients || 0} onboarded this quarter`,
      trend: statsData.value.clients_trend || "+0%",
      trendUp: true,
      color: "#2563C4",
      iconBg: "rgba(37,99,196,0.18)",
      icon: "fa-solid fa-users",
      sparkline: statsData.value.clients_sparkline || [0],
    },
    {
      label: "Testimonials",
      value: statsData.value.total_testimonials || 0,
      sub: `${statsData.value.pending_testimonials || 0} pending approval`,
      trend: statsData.value.testimonials_trend || "+0",
      trendUp: true,
      color: "#0097A7",
      iconBg: "rgba(0,151,167,0.15)",
      icon: "fa-solid fa-star",
      sparkline: statsData.value.testimonials_sparkline || [0],
    },
  ];
});

const totalProjects = computed(() => {
  return projectsByCategory.value.reduce((sum, d) => sum + d.count, 0);
});

const maxMonthly = computed(() => {
  if (!monthlyEnquiries.value.length) return 1;
  return Math.max(...monthlyEnquiries.value.map((m) => m.value));
});

const CIRC = 351.86;
const donutSegments = computed(() => {
  let offset = 0;
  return projectsByCategory.value.map((d) => {
    const dash = (d.count / totalProjects.value) * CIRC - 3;
    const seg = { ...d, dash, offset };
    offset += (d.count / totalProjects.value) * CIRC;
    return seg;
  });
});

// ── Animation State ──────────────────────────────────────────────────────
const statsVisible = ref(false);
const barVisible = ref(false);
const donutVisible = ref(false);
const systemVisible = ref(false);
const barChartRef = ref(null);
const activeMessage = ref(null);

// ── Helper Functions ──────────────────────────────────────────────────────
function sparklinePoints(data) {
  if (!data || data.length === 0) return "";
  const max = Math.max(...data),
    min = Math.min(...data);
  return data
    .map(
      (v, i) => `${(i / (data.length - 1)) * 80},${32 - ((v - min) / (max - min || 1)) * 26 - 3}`,
    )
    .join(" ");
}

function openMessage(msg) {
  activeMessage.value = msg;
  msg.read = true;
}

function openCertificate(cert) {
  selectedCertificate.value = cert;
  showCertificateModal.value = true;
}

function closeCertificate() {
  showCertificateModal.value = false;
  selectedCertificate.value = null;
}

function getFileIcon(fileType) {
  const icons = {
    pdf: 'fa-regular fa-file-pdf',
    image: 'fa-regular fa-file-image',
    doc: 'fa-regular fa-file-word',
    excel: 'fa-regular fa-file-excel',
  };
  return icons[fileType] || 'fa-regular fa-file';
}

function getFileColor(fileType) {
  const colors = {
    pdf: '#ff6b6b',
    image: '#00e5ff',
    doc: '#4dabf7',
    excel: '#51cf66',
  };
  return colors[fileType] || 'rgba(255,255,255,0.3)';
}

function getTypeBadgeClass(type) {
  const classes = {
    CSEE: 'csee',
    ACSEE: 'acsee',
    Degree: 'degree',
    Diploma: 'diploma',
    Certificate: 'certificate',
    Certification: 'certification',
    Professional: 'professional',
  };
  return classes[type] || '';
}

function getLevelLabel(level) {
  const labels = {
    secondary: 'Secondary',
    tertiary: 'Tertiary',
    professional: 'Professional',
    certificate: 'Certificate',
  };
  return labels[level] || level;
}

function getLevelBadgeClass(level) {
  const classes = {
    secondary: 'secondary',
    tertiary: 'tertiary',
    professional: 'professional',
    certificate: 'certificate',
  };
  return classes[level] || '';
}

function getTypeIcon(type) {
  const icons = {
    CSEE: 'fa-solid fa-graduation-cap',
    ACSEE: 'fa-solid fa-graduation-cap',
    Degree: 'fa-solid fa-university',
    Diploma: 'fa-regular fa-file',
    Certificate: 'fa-regular fa-file',
    Certification: 'fa-solid fa-award',
    Professional: 'fa-solid fa-badge',
  };
  return icons[type] || 'fa-regular fa-file';
}

// ── Quick Actions ────────────────────────────────────────────────────────
const quickActions = [
  {
    label: "Add Project",
    to: "/admin/projects",
    icon: "fa-solid fa-plus",
  },
  {
    label: "Messages",
    to: "/admin/contacts",
    icon: "fa-regular fa-envelope",
  },
  {
    label: "Testimonials",
    to: "/admin/testimonials",
    icon: "fa-solid fa-star",
  },
  {
    label: "View Website",
    to: "/",
    icon: "fa-solid fa-external-link-alt",
  },
];

// ── API Calls ──────────────────────────────────────────────────────────────

/**
 * Fetch dashboard statistics
 */
async function fetchStats() {
  try {
    const response = await api.get("/admin/dashboard/stats");
    if (response.data.success) {
      statsData.value = response.data.data;
      console.log("Dashboard stats loaded:");
      console.log("Total Projects:", statsData.value.total_projects);
      console.log("Unread Messages:", statsData.value.unread_messages);
      console.log("Active Clients:", statsData.value.active_clients);
      console.log("Total Testimonials:", statsData.value.total_testimonials);
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }
}

/**
 * Fetch monthly enquiries data
 */
async function fetchMonthlyEnquiries() {
  try {
    const response = await api.get("/admin/dashboard/enquiries");
    if (response.data.success) {
      monthlyEnquiries.value = response.data.data;
      console.log("Monthly enquiries loaded:", monthlyEnquiries.value);
    }
  } catch (error) {
    console.error("Failed to fetch enquiries:", error);
    monthlyEnquiries.value = [
      { month: "Jun", value: 8 },
      { month: "Jul", value: 14 },
      { month: "Aug", value: 11 },
      { month: "Sep", value: 18 },
      { month: "Oct", value: 15 },
      { month: "Nov", value: 21 },
      { month: "Dec", value: 12 },
    ];
  }
}

/**
 * Fetch projects by category for donut chart
 */
async function fetchProjectsByCategory() {
  try {
    const response = await api.get("/admin/dashboard/categories");
    if (response.data.success) {
      projectsByCategory.value = response.data.data;
      console.log("Projects by category loaded:", projectsByCategory.value);
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    projectsByCategory.value = [
      { label: "ERP Systems", count: 9, color: "#00C4D4" },
      { label: "E-Commerce", count: 7, color: "#2563C4" },
      { label: "Telecom", count: 5, color: "#0097A7" },
      { label: "Mobile", count: 3, color: "#2D2B7F" },
    ];
  }
}

/**
 * Fetch recent messages
 */
async function fetchRecentMessages() {
  try {
    const response = await api.get("/admin/dashboard/messages?limit=5");
    if (response.data.success) {
      recentMessages.value = response.data.data.map((msg) => ({
        id: msg.id,
        initials: msg.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        avatarBg: getAvatarGradient(msg.id),
        name: msg.name,
        email: msg.email,
        company: msg.company || "—",
        service: msg.service || "General",
        budget: msg.budget || "—",
        time: msg.time_ago || "Just now",
        read: msg.read || false,
        preview: msg.preview || msg.message.substring(0, 60) + "...",
        fullMessage: msg.message,
      }));
      console.log("Recent messages loaded:", recentMessages.value.length);
    }
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    recentMessages.value = [];
  }
}

/**
 * Fetch system status
 */
async function fetchSystemStatus() {
  try {
    const response = await api.get("/admin/dashboard/system");
    if (response.data.success) {
      systemStatus.value = response.data.data.map((item) => ({
        ...item,
        status: item.percent >= 90 ? "good" : item.percent >= 60 ? "neutral" : "warning",
      }));
      console.log("System status loaded:", systemStatus.value);
    }
  } catch (error) {
    console.error("Failed to fetch system status:", error);
    systemStatus.value = [
      { label: "API Response", value: "94ms", pct: 94, status: "good", color: "#00C4D4" },
      { label: "Database", value: "99.9%", pct: 99, status: "good", color: "#00E5FF" },
      { label: "Storage", value: "47%", pct: 47, status: "neutral", color: "#2563C4" },
      { label: "Memory", value: "62%", pct: 62, status: "neutral", color: "#0097A7" },
      { label: "CPU Load", value: "18%", pct: 18, status: "good", color: "#2D2B7F" },
    ];
  }
}

/**
 * Fetch certificates from API
 */
async function fetchCertificates() {
  try {
    const response = await api.get("/admin/certificates");
    if (response.data.success) {
      certificates.value = response.data.data;
      console.log("✅ Certificates loaded:", certificates.value.length);
    } else {
      console.warn("No certificates found, using fallback data");
      // Fallback data if API returns empty
      certificates.value = getFallbackCertificates();
    }
  } catch (error) {
    console.error("Failed to fetch certificates:", error);
    // Use fallback data if API fails
    certificates.value = getFallbackCertificates();
  }
}

/**
 * Fallback certificate data
 */
function getFallbackCertificates() {
  return [
    {
      id: 1,
      title: "Certificate of Secondary Education Examination (CSEE)",
      institution: "Juhudi Secondary School",
      year: "2012",
      type: "CSEE",
      level: "secondary",
      fileUrl: "/certificates/csee.pdf",
      fileType: "pdf",
      thumbnail: null,
    },
    {
      id: 2,
      title: "Advanced Certificate of Secondary Education (ACSEE)",
      institution: "Kibiti High School",
      year: "2019",
      type: "ACSEE",
      level: "secondary",
      fileUrl: "/certificates/acsee.pdf",
      fileType: "pdf",
      thumbnail: null,
    },
    {
      id: 3,
      title: "Bachelor of Science in Telecommunications Engineering",
      institution: "University of Dodoma",
      year: "2025",
      type: "Degree",
      level: "tertiary",
      fileUrl: "/certificates/telecom-degree.pdf",
      fileType: "pdf",
      thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Full-Stack Web Development Certification",
      institution: "Laravel Academy",
      year: "2019",
      type: "Certificate",
      level: "certificate",
      fileUrl: "/certificates/laravel-cert.pdf",
      fileType: "pdf",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: "AWS Certified Solutions Architect",
      institution: "Amazon Web Services",
      year: "2020",
      type: "Certification",
      level: "professional",
      fileUrl: "/certificates/aws-cert.pdf",
      fileType: "pdf",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Diploma in Project Management",
      institution: "Project Management Institute",
      year: "2021",
      type: "Diploma",
      level: "tertiary",
      fileUrl: "/certificates/pmp-diploma.pdf",
      fileType: "pdf",
      thumbnail: null,
    },
    {
      id: 7,
      title: "Professional Scrum Master (PSM I)",
      institution: "Scrum.org",
      year: "2022",
      type: "Professional",
      level: "professional",
      fileUrl: "/certificates/psm-cert.pdf",
      fileType: "pdf",
      thumbnail: null,
    },
  ];
}

/**
 * Get consistent avatar gradient based on ID
 */
function getAvatarGradient(id) {
  const gradients = [
    "linear-gradient(135deg,#1E1B5E,#00C4D4)",
    "linear-gradient(135deg,#2563C4,#00E5FF)",
    "linear-gradient(135deg,#0097A7,#2563C4)",
    "linear-gradient(135deg,#2D2B7F,#0097A7)",
    "linear-gradient(135deg,#1E1B5E,#2563C4)",
  ];
  return gradients[id % gradients.length] || gradients[0];
}

// ── Load Dashboard Data ────────────────────────────────────────────────────
async function loadDashboard() {
  isLoading.value = true;

  try {
    await Promise.all([
      fetchStats(),
      fetchMonthlyEnquiries(),
      fetchProjectsByCategory(),
      fetchRecentMessages(),
      fetchSystemStatus(),
      fetchCertificates(),
    ]);
  } catch (error) {
    console.error("Error loading dashboard:", error);
  } finally {
    isLoading.value = false;

    setTimeout(() => {
      statsVisible.value = true;
    }, 80);
    setTimeout(() => {
      donutVisible.value = true;
      systemVisible.value = true;
    }, 420);
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  loadDashboard();

  const obs = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        barVisible.value = true;
        obs.disconnect();
      }
    },
    { threshold: 0.2 },
  );
  if (barChartRef.value) obs.observe(barChartRef.value);
  else barVisible.value = true;
});
</script>

<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Loading dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <template v-else>
      <!-- PAGE HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Good {{ timeGreeting }}, {{ authStore.userName || "Admin" }} 
          </h1>
          <p class="page-sub">Here's what's happening with TSCL today — {{ todayDate }}</p>
        </div>
        <RouterLink to="/admin/projects" class="header-cta">
          <font-awesome-icon icon="fa-solid fa-plus" />
          New Project
        </RouterLink>
      </div>

      <!-- STAT CARDS -->
      <div class="stats-grid">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="stat-card"
          :class="{ visible: statsVisible }"
          :style="{ transitionDelay: `${i * 0.08}s` }"
        >
          <div class="stat-card-inner">
            <div class="stat-top">
              <div class="stat-icon-wrap" :style="{ background: stat.iconBg }">
                <font-awesome-icon :icon="stat.icon" />
              </div>
              <div class="stat-trend" :class="stat.trendUp ? 'up' : 'down'">
                <font-awesome-icon
                  :icon="stat.trendUp ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"
                  size="xs"
                />
                {{ stat.trend }}
              </div>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-sub">{{ stat.sub }}</div>
          </div>
          <div class="stat-sparkline">
            <svg viewBox="0 0 80 32" preserveAspectRatio="none">
              <polyline
                :points="sparklinePoints(stat.sparkline)"
                fill="none"
                :stroke="stat.color"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- CHARTS ROW -->
      <div class="charts-row">
        <!-- Bar chart -->
        <div class="chart-card" ref="barChartRef">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Monthly Enquiries</h3>
              <p class="chart-sub">Contact form submissions — last 7 months</p>
            </div>
            <div class="chart-legend">
              <span class="legend-dot" style="background: #00c4d4"></span>
              <font-awesome-icon icon="fa-regular fa-envelope" size="xs" />
              Messages
            </div>
          </div>
          <div v-if="monthlyEnquiries.length > 0" class="bar-chart">
            <div class="bar-group" v-for="(m, i) in monthlyEnquiries" :key="m.month">
              <div class="bar-wrap">
                <div
                  class="bar"
                  :style="{
                    height: barVisible ? (m.value / maxMonthly) * 100 + '%' : '0%',
                    transitionDelay: `${i * 0.07}s`,
                    background:
                      i === monthlyEnquiries.length - 1
                        ? 'linear-gradient(180deg,#00E5FF,#00C4D4)'
                        : 'rgba(0,196,212,0.3)',
                  }"
                >
                  <span class="bar-val">{{ m.value }}</span>
                </div>
              </div>
              <span class="bar-label">{{ m.month }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>No enquiry data available</p>
          </div>
        </div>

        <!-- Donut chart -->
        <div class="chart-card donut-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Projects by Category</h3>
              <p class="chart-sub">Distribution across service lines</p>
            </div>
          </div>
          <div v-if="projectsByCategory.length > 0" class="donut-wrap">
            <svg viewBox="0 0 160 160" class="donut-svg">
              <g transform="translate(80,80)">
                <circle r="56" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="20" />
                <circle
                  v-for="(seg, i) in donutSegments"
                  :key="i"
                  r="56"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="20"
                  :stroke-dasharray="`${donutVisible ? seg.dash : 0} 351.86`"
                  :stroke-dashoffset="-seg.offset"
                  :style="{
                    transition: `stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
                  }"
                />
                <text
                  x="0"
                  y="-8"
                  text-anchor="middle"
                  fill="#fff"
                  font-size="22"
                  font-weight="700"
                  font-family="Syne,sans-serif"
                >
                  {{ totalProjects }}
                </text>
                <text
                  x="0"
                  y="12"
                  text-anchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  font-size="9"
                  font-family="Space Grotesk,sans-serif"
                >
                  PROJECTS
                </text>
              </g>
            </svg>
            <div class="donut-legend">
              <div v-for="seg in donutSegments" :key="seg.label" class="donut-legend-item">
                <span class="donut-dot" :style="{ background: seg.color }"></span>
                <span class="donut-lname">{{ seg.label }}</span>
                <span class="donut-lval">{{ seg.count }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>No category data available</p>
          </div>
        </div>
      </div>

      <!-- CERTIFICATES SECTION -->
      <section class="certificates-section">
        <div class="certificates-header">
          <div>
            <h2 class="section-title">Educational Certificates</h2>
            <p class="section-sub">Academic and professional certifications</p>
          </div>
        </div>

        <div class="certificates-grid">
          <div
            v-for="cert in certificates"
            :key="cert.id"
            class="certificate-card"
            @click="openCertificate(cert)"
          >
            <div class="certificate-thumbnail">
              <img v-if="cert.thumbnail" :src="cert.thumbnail" :alt="cert.title" />
              <div v-else class="certificate-placeholder">
                <font-awesome-icon :icon="getTypeIcon(cert.type)" size="3x" />
              </div>
              <div class="certificate-overlay">
                <font-awesome-icon icon="fa-regular fa-eye" />
                <span>Preview</span>
              </div>
            </div>
            <div class="certificate-info">
              <div class="certificate-header">
                <h3 class="certificate-title">{{ cert.title }}</h3>
                <span class="type-badge" :class="getTypeBadgeClass(cert.type)">
                  {{ cert.type }}
                </span>
              </div>
              <p class="certificate-institution">{{ cert.institution }}</p>
              <div class="certificate-meta">
                <span class="certificate-year">
                  <font-awesome-icon icon="fa-regular fa-calendar" size="xs" />
                  {{ cert.year }}
                </span>
                <span class="level-badge" :class="getLevelBadgeClass(cert.level)">
                  {{ getLevelLabel(cert.level) }}
                </span>
                <span v-if="cert.is_active === false" class="badge-inactive">Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- BOTTOM ROW -->
      <div class="bottom-row">
        <!-- Recent messages -->
        <div class="panel messages-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              <font-awesome-icon icon="fa-regular fa-envelope" size="xs" />
              Recent Messages
            </h3>
            <RouterLink to="/admin/contacts" class="panel-link">
              View all <font-awesome-icon icon="fa-solid fa-arrow-right" size="xs" />
            </RouterLink>
          </div>
          <div v-if="recentMessages.length > 0" class="messages-list">
            <div
              v-for="msg in recentMessages"
              :key="msg.id"
              class="message-row"
              :class="{ unread: !msg.read }"
              @click="openMessage(msg)"
            >
              <div class="msg-avatar" :style="{ background: msg.avatarBg }">{{ msg.initials }}</div>
              <div class="msg-body">
                <div class="msg-top">
                  <span class="msg-name">{{ msg.name }}</span>
                  <span class="msg-time">
                    <font-awesome-icon icon="fa-regular fa-clock" size="xs" />
                    {{ msg.time }}
                  </span>
                </div>
                <div class="msg-service">{{ msg.service }}</div>
                <div class="msg-preview">{{ msg.preview }}</div>
              </div>
              <div v-if="!msg.read" class="unread-dot"></div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>No recent messages</p>
          </div>
        </div>

        <!-- Side panels -->
        <div class="side-panels">
          <!-- Quick actions -->
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title">
                <font-awesome-icon icon="fa-solid fa-bolt" size="xs" />
                Quick Actions
              </h3>
            </div>
            <div class="actions-grid">
              <RouterLink
                v-for="action in quickActions"
                :key="action.label"
                :to="action.to"
                class="action-btn"
              >
                <span class="action-icon">
                  <font-awesome-icon :icon="action.icon" />
                </span>
                <span>{{ action.label }}</span>
              </RouterLink>
            </div>
          </div>

          <!-- System status -->
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title">
                <font-awesome-icon icon="fa-solid fa-server" size="xs" />
                System Status
              </h3>
              <span class="all-good">
                <span class="all-good-dot"></span>
                <font-awesome-icon icon="fa-solid fa-check-circle" size="xs" />
                All operational
              </span>
            </div>
            <div class="status-list">
              <div v-for="item in systemStatus" :key="item.label" class="status-row">
                <div class="status-info">
                  <span class="status-label">{{ item.label }}</span>
                  <span class="status-val" :class="item.status">{{ item.value }}</span>
                </div>
                <div class="status-bar-track">
                  <div
                    class="status-bar-fill"
                    :style="{
                      width: systemVisible ? item.pct + '%' : '0%',
                      background: item.color,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- MESSAGE MODAL -->
    <Transition name="modal">
      <div v-if="activeMessage" class="modal-overlay" @click.self="activeMessage = null">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="modal-title">Message from {{ activeMessage.name }}</h3>
            <button class="modal-close" @click="activeMessage = null">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <div class="modal-meta">
            <span><font-awesome-icon icon="fa-regular fa-envelope" /> {{ activeMessage.email }}</span>
            <span><font-awesome-icon icon="fa-solid fa-building" /> {{ activeMessage.company || "—" }}</span>
            <span><font-awesome-icon icon="fa-solid fa-cog" /> {{ activeMessage.service }}</span>
            <span><font-awesome-icon icon="fa-solid fa-coins" /> {{ activeMessage.budget }}</span>
            <span><font-awesome-icon icon="fa-regular fa-clock" /> {{ activeMessage.time }}</span>
          </div>
          <p class="modal-message">{{ activeMessage.fullMessage }}</p>
          <div class="modal-actions">
            <a :href="`mailto:${activeMessage.email}`" class="btn-primary">
              <font-awesome-icon icon="fa-regular fa-paper-plane" />
              Reply by Email
            </a>
            <button class="btn-outline" @click="activeMessage = null">
              <font-awesome-icon icon="fa-solid fa-times" />
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- CERTIFICATE PREVIEW MODAL -->
    <Transition name="modal">
      <div v-if="showCertificateModal && selectedCertificate" class="modal-overlay" @click.self="closeCertificate">
        <div class="modal-box certificate-preview-modal">
          <div class="modal-header">
            <h3 class="modal-title">{{ selectedCertificate.title }}</h3>
            <button class="modal-close" @click="closeCertificate">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          
          <div class="certificate-preview-content">
            <div class="certificate-preview-image">
              <img v-if="selectedCertificate.thumbnail" :src="selectedCertificate.thumbnail" :alt="selectedCertificate.title" />
              <div v-else class="certificate-preview-placeholder">
                <font-awesome-icon :icon="getTypeIcon(selectedCertificate.type)" size="5x" />
                <p>{{ selectedCertificate.type }}</p>
              </div>
            </div>
            
            <div class="certificate-details">
              <h4>{{ selectedCertificate.title }}</h4>
              <p class="cert-detail-institution">
                <font-awesome-icon icon="fa-solid fa-building" />
                {{ selectedCertificate.institution }}
              </p>
              <p class="cert-detail-year">
                <font-awesome-icon icon="fa-regular fa-calendar" />
                {{ selectedCertificate.year }}
              </p>
              <p class="cert-detail-type">
                <font-awesome-icon icon="fa-solid fa-award" />
                Type: {{ selectedCertificate.type }}
              </p>
              <p class="cert-detail-level">
                <font-awesome-icon icon="fa-solid fa-graduation-cap" />
                Level: {{ getLevelLabel(selectedCertificate.level) }}
              </p>
              
              <div class="certificate-actions">
                <a :href="selectedCertificate.fileUrl" target="_blank" class="btn-primary" v-if="selectedCertificate.fileUrl">
                  <font-awesome-icon icon="fa-regular fa-file-pdf" />
                  Download Certificate
                </a>
                <button @click="closeCertificate" class="btn-outline">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Dashboard Layout ──────────────────────────────────────────────────── */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ── Loading ───────────────────────────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 196, 212, 0.1);
  border-top-color: #00c4d4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Header ────────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-family: "Syne", sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.page-sub {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.38);
}

.header-cta {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.82rem;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: box-shadow 0.2s, transform 0.2s;
}

.header-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(0, 229, 255, 0.35);
}

/* ── Stats Grid ────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.2s;
  cursor: default;
}

.stat-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-card:hover {
  border-color: rgba(0, 196, 212, 0.2);
}

.stat-card-inner {
  padding: 18px 18px 12px;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.stat-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00e5ff;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
}

.stat-trend.up {
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.1);
}

.stat-trend.down {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.stat-value {
  font-family: "Syne", sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
}

.stat-sub {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.28);
}

.stat-sparkline {
  height: 34px;
}

.stat-sparkline svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ── Charts ────────────────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 14px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 22px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22px;
}

.chart-title {
  font-size: 0.93rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 3px;
}

.chart-sub {
  font-size: 0.73rem;
  color: rgba(255, 255, 255, 0.33);
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.73rem;
  color: rgba(255, 255, 255, 0.42);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 150px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  height: 100%;
}

.bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  border-radius: 5px 5px 0 0;
  position: relative;
  transition: height 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 3px;
}

.bar-val {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.bar-label {
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.28);
}

.donut-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
}

.donut-svg {
  width: 136px;
  height: 136px;
  flex-shrink: 0;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.donut-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.donut-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.donut-lname {
  font-size: 0.77rem;
  color: rgba(255, 255, 255, 0.58);
  flex: 1;
}

.donut-lval {
  font-size: 0.77rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
}

/* ── Certificates Section ──────────────────────────────────────────────── */
.certificates-section {
  margin: 32px 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
}

.certificates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.certificate-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.certificate-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 229, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.certificate-thumbnail {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.certificate-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.certificate-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.2);
}

.certificate-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
}

.certificate-card:hover .certificate-overlay {
  opacity: 1;
}

.certificate-overlay svg {
  font-size: 1.5rem;
}

.certificate-overlay span {
  font-size: 0.8rem;
  font-weight: 500;
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.certificate-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
  flex: 1;
}

.type-badge {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.type-badge.csee {
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
}

.type-badge.acsee {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.type-badge.degree {
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
}

.type-badge.diploma {
  background: rgba(0, 229, 255, 0.15);
  color: #00E5FF;
}

.type-badge.certificate {
  background: rgba(37, 99, 196, 0.15);
  color: #2563C4;
}

.type-badge.certification {
  background: rgba(45, 43, 127, 0.2);
  color: #6C63FF;
}

.type-badge.professional {
  background: rgba(0, 151, 167, 0.15);
  color: #0097A7;
}

.certificate-institution {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.certificate-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.certificate-year {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
}

.level-badge {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-badge.secondary {
  background: rgba(255, 217, 61, 0.1);
  color: #FFD93D;
}

.level-badge.tertiary {
  background: rgba(0, 196, 212, 0.1);
  color: #00C4D4;
}

.level-badge.professional {
  background: rgba(45, 43, 127, 0.15);
  color: #6C63FF;
}

.level-badge.certificate {
  background: rgba(37, 99, 196, 0.1);
  color: #2563C4;
}

.badge-inactive {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

/* ── Bottom Row ────────────────────────────────────────────────────────── */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 14px;
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-link {
  font-size: 0.73rem;
  color: #00c4d4;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-link:hover {
  color: #00e5ff;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 11px 9px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.message-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.message-row.unread {
  background: rgba(0, 196, 212, 0.04);
}

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
}

.msg-body {
  flex: 1;
  min-width: 0;
}

.msg-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.msg-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
}

.msg-time {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.26);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 3px;
}

.msg-service {
  font-size: 0.68rem;
  color: #00c4d4;
  margin-bottom: 2px;
  font-weight: 500;
}

.msg-preview {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.38);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-dot {
  position: absolute;
  top: 13px;
  right: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 6px rgba(0, 229, 255, 0.5);
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  text-decoration: none;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.77rem;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(0, 196, 212, 0.1);
  border-color: rgba(0, 196, 212, 0.25);
  color: #fff;
}

.action-icon {
  color: #00c4d4;
  display: flex;
}

.all-good {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  color: #00c4d4;
}

.all-good-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00c4d4;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.status-label {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.5);
}

.status-val {
  font-size: 0.76rem;
  font-weight: 600;
}

.status-val.good {
  color: #00e5ff;
}

.status-val.neutral {
  color: rgba(255, 255, 255, 0.55);
}

.status-val.warning {
  color: #ffd93d;
}

.status-bar-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Modals ────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-box {
  background: #13102a;
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 530px;
}

.certificate-preview-modal {
  max-width: 700px !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.modal-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.modal-close {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  margin-bottom: 18px;
}

.modal-meta span {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
}

.modal-message {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.72;
  margin-bottom: 22px;
}

.certificate-preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.certificate-preview-image {
  width: 100%;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.certificate-preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.certificate-preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.certificate-details {
  padding: 0 4px;
}

.certificate-details h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.cert-detail-institution,
.cert-detail-year,
.cert-detail-type,
.cert-detail-level {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.cert-detail-institution svg,
.cert-detail-year svg,
.cert-detail-type svg,
.cert-detail-level svg {
  color: #00C4D4;
  width: 16px;
}

.certificate-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.84rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  text-decoration: none;
  font-family: "Space Grotesk", sans-serif;
}

.btn-outline {
  padding: 10px 22px;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.84rem;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  font-family: "Space Grotesk", sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}

/* ── Transitions ────────────────────────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* ── Responsive ────────────────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
  .bottom-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .donut-wrap {
    flex-direction: column;
  }
  .certificates-grid {
    grid-template-columns: 1fr;
  }
}
</style>