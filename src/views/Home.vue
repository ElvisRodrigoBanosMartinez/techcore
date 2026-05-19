<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()
const search = ref('')
const activeCategory = ref('Todos')

const articles = ref([
  { id:'1', title:'Proceso de Onboarding', category:'Incorporación', excerpt:'Guía paso a paso para la integración de nuevos colaboradores en la empresa.', author:'Ana García', date:'2024-05-10', readTime:'5 min', tags:['onboarding','proceso'] },
  { id:'2', title:'Política de Vacaciones 2024', category:'Beneficios', excerpt:'Reglas y procedimientos para la solicitud y aprobación de días de descanso.', author:'Carlos López', date:'2024-04-22', readTime:'3 min', tags:['vacaciones','política'] },
  { id:'3', title:'Evaluación de Desempeño', category:'Desarrollo', excerpt:'Marco de evaluación anual, criterios de calificación y proceso de retroalimentación.', author:'María Torres', date:'2024-03-15', readTime:'8 min', tags:['evaluación','KPIs'] },
  { id:'4', title:'Protocolo de Trabajo Remoto', category:'Operaciones', excerpt:'Lineamientos para el trabajo desde casa: horarios, herramientas y comunicación.', author:'Luis Martínez', date:'2024-02-28', readTime:'6 min', tags:['remoto','home office'] },
  { id:'5', title:'Plan de Capacitación Q2', category:'Desarrollo', excerpt:'Cursos, talleres y certificaciones disponibles para el segundo trimestre del año.', author:'Ana García', date:'2024-01-30', readTime:'4 min', tags:['capacitación','formación'] },
  { id:'6', title:'Código de Conducta Empresarial', category:'Cultura', excerpt:'Valores, ética y comportamiento esperado de todos los integrantes del equipo.', author:'RRHH', date:'2023-12-01', readTime:'10 min', tags:['cultura','valores'] },
  { id:'7', title:'Gestión del Clima Laboral', category:'Cultura', excerpt:'Encuestas, métricas y planes de acción para mantener un ambiente de trabajo positivo.', author:'Ana García', date:'2023-11-15', readTime:'7 min', tags:['clima','bienestar'] },
  { id:'8', title:'Reclutamiento y Selección', category:'Incorporación', excerpt:'Proceso estándar para la atracción, evaluación y contratación de talento.', author:'María Torres', date:'2023-10-20', readTime:'9 min', tags:['reclutamiento','talento'] },
  { id:'9', title:'Compensaciones y Beneficios', category:'Beneficios', excerpt:'Estructura salarial, bonos, seguros y prestaciones adicionales de la empresa.', author:'Carlos López', date:'2023-09-05', readTime:'6 min', tags:['salario','compensación'] },
])

const categories = computed(() => {
  const cats = ['Todos', ...new Set(articles.value.map(a => a.category))]
  return cats
})

const filteredArticles = computed(() => {
  let list = articles.value
  if (activeCategory.value !== 'Todos') list = list.filter(a => a.category === activeCategory.value)
  const q = search.value.toLowerCase().trim()
  if (q) list = list.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)))
  return list
})

const stats = computed(() => [
  { label: 'Artículos', value: articles.value.length, icon: '📄' },
  { label: 'Categorías', value: categories.value.length - 1, icon: '🗂️' },
  { label: 'Autores', value: new Set(articles.value.map(a => a.author)).size, icon: '👥' },
])

const categoryMeta = {
  'Incorporación': { color: '#7c3aed', icon: '🚀' },
  'Beneficios':    { color: '#2563eb', icon: '🎁' },
  'Desarrollo':    { color: '#059669', icon: '📈' },
  'Operaciones':   { color: '#d97706', icon: '⚙️' },
  'Cultura':       { color: '#db2777', icon: '🌟' },
}
function catColor(cat) { return (categoryMeta[cat]?.color) ?? '#6b7280' }
function catIcon(cat)  { return (categoryMeta[cat]?.icon)  ?? '📁' }
function catCount(cat) { return articles.value.filter(a => a.category === cat).length }

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">

    <!-- ════ NAVBAR ════ -->
    <header class="navbar">
      <div class="nav-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <span class="brand-name">TechCore</span>
          <span class="brand-tag">RRHH</span>
        </div>
      </div>

      <div class="nav-search">
        <svg viewBox="0 0 20 20" fill="currentColor" class="ns-icon">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
        </svg>
        <input id="search-input" v-model="search" type="search" placeholder="Buscar artículos, políticas..." autocomplete="off" class="ns-input"/>
        <kbd class="ns-kbd">⌘K</kbd>
      </div>

      <div class="nav-right">
        <RouterLink to="/articulo/nuevo" id="btn-new-article" class="btn-primary">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg>
          Nuevo Artículo
        </RouterLink>
        <button id="btn-user-menu" class="user-pill" @click="handleLogout" title="Cerrar sesión">
          <div class="user-avatar">{{ auth.userDisplayName[0]?.toUpperCase() }}</div>
          <span class="user-name">{{ auth.userDisplayName }}</span>
          <svg viewBox="0 0 16 16" fill="currentColor" style="width:14px;opacity:.4"><path d="M8 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
        </button>
      </div>
    </header>

    <!-- ════ BODY ════ -->
    <div class="body-layout">

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <p class="sidebar-label">Categorías</p>
        <nav class="sidebar-nav">
          <button
            v-for="cat in categories"
            :key="cat"
            class="cat-btn"
            :class="{ active: activeCategory === cat }"
            @click="activeCategory = cat"
          >
            <span class="cat-icon">{{ cat === 'Todos' ? '🏠' : catIcon(cat) }}</span>
            <span class="cat-name">{{ cat }}</span>
            <span class="cat-count">{{ cat === 'Todos' ? articles.length : catCount(cat) }}</span>
          </button>
        </nav>

        <!-- Stats -->
        <div class="sidebar-stats">
          <p class="sidebar-label" style="margin-top:1.5rem">Resumen</p>
          <div v-for="s in stats" :key="s.label" class="stat-row">
            <span class="stat-icon">{{ s.icon }}</span>
            <span class="stat-label">{{ s.label }}</span>
            <span class="stat-value">{{ s.value }}</span>
          </div>
        </div>
      </aside>

      <!-- ── Main content ── -->
      <main class="main-content">

        <!-- Hero compacto -->
        <div class="page-header">
          <div>
            <h1 class="page-title">
              {{ activeCategory === 'Todos' ? 'Base de Conocimiento' : activeCategory }}
            </h1>
            <p class="page-subtitle">
              {{ filteredArticles.length }} artículo{{ filteredArticles.length !== 1 ? 's' : '' }}
              {{ search ? `para "${search}"` : '' }}
            </p>
          </div>
          <div class="header-pills">
            <span v-for="cat in categories.slice(1)" :key="cat" class="header-pill" :style="{ background: catColor(cat) + '18', color: catColor(cat), borderColor: catColor(cat) + '35' }">
              {{ catIcon(cat) }} {{ cat }}
            </span>
          </div>
        </div>

        <!-- Grid -->
        <Transition name="fade" mode="out-in">
          <div v-if="filteredArticles.length" class="articles-grid">
            <article
              v-for="article in filteredArticles"
              :key="article.id"
              class="article-card"
              @click="router.push(`/articulo/${article.id}`)"
            >
              <div class="card-top">
                <span class="cat-badge" :style="{ background: catColor(article.category)+'18', color: catColor(article.category), borderColor: catColor(article.category)+'35' }">
                  {{ catIcon(article.category) }} {{ article.category }}
                </span>
                <span class="read-time">{{ article.readTime }}</span>
              </div>

              <h2 class="card-title">{{ article.title }}</h2>
              <p class="card-excerpt">{{ article.excerpt }}</p>

              <div class="card-tags">
                <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
              </div>

              <div class="card-footer">
                <div class="card-author">
                  <div class="author-av" :style="{ background: `linear-gradient(135deg, ${catColor(article.category)}, #2563eb)` }">
                    {{ article.author[0] }}
                  </div>
                  <span>{{ article.author }}</span>
                </div>
                <span class="card-date">
                  {{ new Date(article.date).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) }}
                </span>
              </div>

              <!-- Hover accent -->
              <div class="card-accent" :style="{ background: `linear-gradient(90deg, ${catColor(article.category)}, transparent)` }"></div>
            </article>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>No hay artículos para <strong>"{{ search }}"</strong></p>
            <button class="btn-ghost-sm" @click="search = ''; activeCategory = 'Todos'">Limpiar filtros</button>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

/* ══ Shell ══ */
.app-shell {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #0a0a12;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* ══ Navbar ══ */
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1.5rem;
  background: rgba(10,10,18,0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  position: sticky;
  top: 0;
  z-index: 200;
  flex-shrink: 0;
}

.nav-brand { display: flex; align-items: center; gap: 0.625rem; flex-shrink: 0; }
.brand-icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.brand-icon svg { width: 17px; height: 17px; color: #fff; }
.brand-name { font-size: 1rem; font-weight: 700; color: #fff; }
.brand-tag {
  font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: 5px;
}

/* Buscador central */
.nav-search {
  flex: 1;
  max-width: 520px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
}
.ns-icon {
  position: absolute; left: 0.75rem;
  width: 1rem; height: 1rem;
  color: rgba(255,255,255,0.3);
  pointer-events: none;
}
.ns-input {
  width: 100%;
  padding: 0.5rem 3rem 0.5rem 2.5rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.625rem;
  color: #fff; font-size: 0.875rem; font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ns-input::placeholder { color: rgba(255,255,255,0.2); }
.ns-input:focus {
  border-color: rgba(124,58,237,0.5);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
}
.ns-kbd {
  position: absolute; right: 0.625rem;
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.25rem;
  color: rgba(255,255,255,0.25);
  font-family: inherit;
}

/* Nav derecha */
.nav-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.4375rem 0.875rem;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff; font-size: 0.8125rem; font-weight: 600;
  border-radius: 0.5rem; text-decoration: none; border: none; cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(124,58,237,0.35);
}
.btn-primary svg { width: 0.875rem; height: 0.875rem; }
.btn-primary:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(124,58,237,0.45); }

.user-pill {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.3125rem 0.75rem 0.3125rem 0.3125rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 999px; cursor: pointer; font-family: inherit;
  transition: background 0.2s;
}
.user-pill:hover { background: rgba(255,255,255,0.09); }
.user-avatar {
  width: 26px; height: 26px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6875rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.user-name { font-size: 0.8125rem; font-weight: 500; color: rgba(255,255,255,0.75); }

/* ══ Body layout ══ */
.body-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ══ Sidebar ══ */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 1.5rem 0.75rem;
  overflow-y: auto;
  background: rgba(255,255,255,0.015);
}
.sidebar-label {
  font-size: 0.6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.25);
  padding: 0 0.5rem;
  margin: 0 0 0.5rem;
}
.sidebar-nav { display: flex; flex-direction: column; gap: 2px; }

.cat-btn {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border: none; background: transparent;
  border-radius: 0.5rem; cursor: pointer; font-family: inherit;
  color: rgba(255,255,255,0.5);
  font-size: 0.875rem; font-weight: 500;
  transition: background 0.15s, color 0.15s;
  width: 100%; text-align: left;
}
.cat-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
.cat-btn.active { background: rgba(124,58,237,0.18); color: #c4b5fd; }
.cat-icon { font-size: 0.875rem; flex-shrink: 0; }
.cat-name { flex: 1; }
.cat-count {
  font-size: 0.75rem; font-weight: 600;
  background: rgba(255,255,255,0.08);
  padding: 0.1rem 0.4rem; border-radius: 999px;
  color: rgba(255,255,255,0.35);
}
.cat-btn.active .cat-count { background: rgba(124,58,237,0.3); color: #c4b5fd; }

.stat-row {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.4375rem 0.5rem;
  border-radius: 0.375rem;
}
.stat-icon { font-size: 0.875rem; }
.stat-label { flex: 1; font-size: 0.8125rem; color: rgba(255,255,255,0.4); }
.stat-value { font-size: 0.875rem; font-weight: 700; color: rgba(255,255,255,0.7); }

/* ══ Main content ══ */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 2rem 3rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.625rem; font-weight: 700;
  color: #fff; letter-spacing: -0.025em; margin: 0 0 0.25rem;
}
.page-subtitle { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0; }

.header-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.header-pill {
  font-size: 0.75rem; font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 999px; border: 1px solid;
}

/* ══ Grid ══ */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 1200px) { .articles-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 800px)  { .articles-grid { grid-template-columns: 1fr; } }

/* ══ Card ══ */
.article-card {
  position: relative;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 0.875rem;
  padding: 1.25rem;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 0.75rem;
  transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}
.article-card:hover {
  border-color: rgba(124,58,237,0.35);
  background: rgba(255,255,255,0.055);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}
.card-accent {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; opacity: 0;
  transition: opacity 0.2s;
}
.article-card:hover .card-accent { opacity: 1; }

.card-top { display: flex; align-items: center; justify-content: space-between; }
.cat-badge {
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 0.2rem 0.5rem; border-radius: 999px; border: 1px solid;
}
.read-time { font-size: 0.6875rem; color: rgba(255,255,255,0.3); }

.card-title {
  font-size: 1rem; font-weight: 600; color: #fff; margin: 0; line-height: 1.45;
}
.card-excerpt {
  font-size: 0.8125rem; color: rgba(255,255,255,0.45); margin: 0; line-height: 1.65;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.tag {
  font-size: 0.6875rem; color: rgba(255,255,255,0.28);
  background: rgba(255,255,255,0.05);
  padding: 0.15rem 0.45rem; border-radius: 0.3rem;
}
.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto; padding-top: 0.625rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.card-author { display: flex; align-items: center; gap: 0.4375rem; font-size: 0.75rem; color: rgba(255,255,255,0.45); }
.author-av {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.625rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.card-date { font-size: 0.6875rem; color: rgba(255,255,255,0.25); }

/* ══ Empty state ══ */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 6rem 1rem; gap: 0.875rem;
}
.empty-icon { font-size: 3rem; filter: grayscale(0.5); }
.empty-state p { color: rgba(255,255,255,0.35); font-size: 1rem; text-align: center; }
.empty-state strong { color: rgba(255,255,255,0.6); }
.btn-ghost-sm {
  margin-top: 0.25rem;
  padding: 0.4rem 1rem; font-size: 0.8125rem; font-family: inherit;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.6); border-radius: 0.5rem; cursor: pointer;
  transition: background 0.2s;
}
.btn-ghost-sm:hover { background: rgba(255,255,255,0.12); color: #fff; }

/* ══ Transitions ══ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
