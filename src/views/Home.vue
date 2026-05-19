<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()
const search = ref('')
const activeCategory = ref('Todos')

const articles = ref([
  { id:'1', title:'Proceso de Onboarding',         category:'Incorporación', excerpt:'Guía paso a paso para la integración de nuevos colaboradores en la empresa.',                              author:'Ana García',    date:'2024-05-10', readTime:'5 min', tags:['onboarding','proceso'] },
  { id:'2', title:'Política de Vacaciones 2024',    category:'Beneficios',    excerpt:'Reglas y procedimientos para la solicitud y aprobación de días de descanso.',                             author:'Carlos López',  date:'2024-04-22', readTime:'3 min', tags:['vacaciones','política'] },
  { id:'3', title:'Evaluación de Desempeño',        category:'Desarrollo',    excerpt:'Marco de evaluación anual, criterios de calificación y proceso de retroalimentación.',                    author:'María Torres',  date:'2024-03-15', readTime:'8 min', tags:['evaluación','KPIs'] },
  { id:'4', title:'Protocolo de Trabajo Remoto',    category:'Operaciones',   excerpt:'Lineamientos para el trabajo desde casa: horarios, herramientas y comunicación efectiva.',              author:'Luis Martínez', date:'2024-02-28', readTime:'6 min', tags:['remoto','home office'] },
  { id:'5', title:'Plan de Capacitación Q2',        category:'Desarrollo',    excerpt:'Cursos, talleres y certificaciones disponibles para el segundo trimestre del año.',                       author:'Ana García',    date:'2024-01-30', readTime:'4 min', tags:['capacitación','formación'] },
  { id:'6', title:'Código de Conducta Empresarial', category:'Cultura',       excerpt:'Valores, ética y comportamiento esperado de todos los integrantes del equipo.',                           author:'RRHH',          date:'2023-12-01', readTime:'10 min', tags:['cultura','valores'] },
  { id:'7', title:'Gestión del Clima Laboral',      category:'Cultura',       excerpt:'Encuestas, métricas y planes de acción para mantener un ambiente de trabajo positivo.',                  author:'Ana García',    date:'2023-11-15', readTime:'7 min', tags:['clima','bienestar'] },
  { id:'8', title:'Reclutamiento y Selección',      category:'Incorporación', excerpt:'Proceso estándar para la atracción, evaluación y contratación de nuevo talento.',                        author:'María Torres',  date:'2023-10-20', readTime:'9 min', tags:['reclutamiento','talento'] },
  { id:'9', title:'Compensaciones y Beneficios',    category:'Beneficios',    excerpt:'Estructura salarial, bonos, seguros y prestaciones adicionales de la empresa.',                           author:'Carlos López',  date:'2023-09-05', readTime:'6 min', tags:['salario','compensación'] },
])

const categoryMeta = {
  'Incorporación': { color: '#7c3aed', bg: 'bg-violet-500/10 text-violet-400 border-violet-500/30', icon: '🚀' },
  'Beneficios':    { color: '#2563eb', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',       icon: '🎁' },
  'Desarrollo':    { color: '#059669', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: '📈' },
  'Operaciones':   { color: '#d97706', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',    icon: '⚙️' },
  'Cultura':       { color: '#db2777', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',       icon: '🌟' },
}

const categories = computed(() => ['Todos', ...new Set(articles.value.map(a => a.category))])

const filteredArticles = computed(() => {
  let list = articles.value
  if (activeCategory.value !== 'Todos') list = list.filter(a => a.category === activeCategory.value)
  const q = search.value.toLowerCase().trim()
  if (q) list = list.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    a.tags.some(t => t.includes(q))
  )
  return list
})

const stats = computed(() => [
  { label:'Artículos',  value: articles.value.length,                                    icon:'📄' },
  { label:'Categorías', value: categories.value.length - 1,                              icon:'🗂️' },
  { label:'Autores',    value: new Set(articles.value.map(a => a.author)).size,          icon:'👥' },
])

function catMeta(cat) { return categoryMeta[cat] ?? { color:'#6b7280', bg:'bg-slate-500/10 text-slate-400 border-slate-500/30', icon:'📁' } }
function catCount(cat) { return articles.value.filter(a => a.category === cat).length }
function formatDate(d) { return new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) }

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex flex-col h-screen w-full bg-[#0a0a12] text-slate-200 font-sans overflow-hidden">

    <!-- ══════ NAVBAR ══════ -->
    <header class="flex-none flex items-center gap-4 px-6 h-14 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/[0.07] z-50 w-full">

      <!-- Brand -->
      <div class="flex items-center gap-2.5 flex-none">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="text-base font-bold text-white">TechCore
          <span class="text-[10px] font-extrabold tracking-widest bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent ml-1">RRHH</span>
        </span>
      </div>

      <!-- Search -->
      <div class="flex-1 max-w-lg mx-auto relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
        </svg>
        <input
          id="search-input"
          v-model="search"
          type="search"
          placeholder="Buscar artículos, políticas..."
          autocomplete="off"
          class="w-full pl-9 pr-16 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all"
        />
        <kbd class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-white/25 font-mono">⌘K</kbd>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 flex-none">
        <RouterLink
          to="/articulo/nuevo"
          id="btn-new-article"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-violet-900/40 hover:opacity-90 hover:-translate-y-px transition-all duration-150 no-underline"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg>
          Nuevo Artículo
        </RouterLink>

        <button
          id="btn-user-menu"
          class="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/[0.05] border border-white/[0.09] rounded-full hover:bg-white/[0.09] transition-colors cursor-pointer"
          @click="handleLogout"
          title="Cerrar sesión"
        >
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-none">
            {{ auth.userDisplayName[0]?.toUpperCase() }}
          </div>
          <span class="text-[13px] font-medium text-white/70">{{ auth.userDisplayName }}</span>
        </button>
      </div>
    </header>

    <!-- ══════ BODY ══════ -->
    <div class="flex flex-1 overflow-hidden w-full">

      <!-- ── Sidebar ── -->
      <aside class="flex-none w-52 border-r border-white/[0.06] bg-white/[0.015] flex flex-col py-5 px-3 overflow-y-auto">

        <p class="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 mb-2">Categorías</p>

        <nav class="flex flex-col gap-0.5">
          <button
            v-for="cat in categories"
            :key="cat"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-left w-full transition-colors"
            :class="activeCategory === cat
              ? 'bg-violet-600/20 text-violet-300'
              : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'"
            @click="activeCategory = cat"
          >
            <span class="text-base leading-none">{{ cat === 'Todos' ? '🏠' : catMeta(cat).icon }}</span>
            <span class="flex-1 truncate">{{ cat }}</span>
            <span
              class="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
              :class="activeCategory === cat ? 'bg-violet-500/30 text-violet-300' : 'bg-white/[0.07] text-white/30'"
            >{{ cat === 'Todos' ? articles.length : catCount(cat) }}</span>
          </button>
        </nav>

        <div class="mt-6 pt-5 border-t border-white/[0.06]">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 mb-3">Resumen</p>
          <div v-for="s in stats" :key="s.label" class="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <span class="text-base leading-none">{{ s.icon }}</span>
            <span class="flex-1 text-[13px] text-white/40">{{ s.label }}</span>
            <span class="text-sm font-bold text-white/65">{{ s.value }}</span>
          </div>
        </div>
      </aside>

      <!-- ── Main ── -->
      <main class="flex-1 overflow-y-auto">
        <div class="px-6 py-5">

          <!-- Page header -->
          <div class="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.06]">
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight leading-tight">
                {{ activeCategory === 'Todos' ? 'Base de Conocimiento' : activeCategory }}
              </h1>
              <p class="text-sm text-white/40 mt-0.5">
                {{ filteredArticles.length }} artículo{{ filteredArticles.length !== 1 ? 's' : '' }}
                <span v-if="search"> para "{{ search }}"</span>
              </p>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="cat in categories.slice(1)"
                :key="cat"
                class="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                :class="catMeta(cat).bg"
              >{{ catMeta(cat).icon }} {{ cat }}</span>
            </div>
          </div>

          <!-- Articles grid -->
          <Transition name="fade" mode="out-in">
            <div v-if="filteredArticles.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <article
                v-for="article in filteredArticles"
                :key="article.id"
                class="group relative flex flex-col gap-3 p-5 bg-white/[0.035] border border-white/[0.07] rounded-xl cursor-pointer overflow-hidden transition-all duration-200 hover:border-violet-500/35 hover:bg-white/[0.055] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
                @click="router.push(`/articulo/${article.id}`)"
              >
                <!-- Color accent bottom bar -->
                <div
                  class="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  :style="{ background: `linear-gradient(90deg, ${catMeta(article.category).color}, transparent)` }"
                ></div>

                <!-- Top row -->
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold border rounded-full px-2 py-0.5" :class="catMeta(article.category).bg">
                    {{ catMeta(article.category).icon }} {{ article.category }}
                  </span>
                  <span class="text-[11px] text-white/30">{{ article.readTime }}</span>
                </div>

                <h2 class="text-base font-semibold text-white leading-snug">{{ article.title }}</h2>

                <p class="text-[13px] text-white/45 leading-relaxed line-clamp-2">{{ article.excerpt }}</p>

                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in article.tags" :key="tag" class="text-[11px] text-white/28 bg-white/[0.05] px-1.5 py-0.5 rounded">
                    #{{ tag }}
                  </span>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06]">
                  <div class="flex items-center gap-1.5">
                    <div
                      class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-none"
                      :style="{ background: `linear-gradient(135deg, ${catMeta(article.category).color}, #2563eb)` }"
                    >{{ article.author[0] }}</div>
                    <span class="text-[12px] text-white/45">{{ article.author }}</span>
                  </div>
                  <span class="text-[11px] text-white/25">{{ formatDate(article.date) }}</span>
                </div>
              </article>
            </div>

            <!-- Empty state -->
            <div v-else class="flex flex-col items-center justify-center py-24 gap-3">
              <span class="text-5xl grayscale-[0.5]">🔍</span>
              <p class="text-white/35 text-base text-center">
                No hay artículos para <strong class="text-white/55">"{{ search }}"</strong>
              </p>
              <button
                class="mt-1 px-4 py-1.5 text-sm bg-white/[0.07] border border-white/10 text-white/55 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                @click="search = ''; activeCategory = 'Todos'"
              >Limpiar filtros</button>
            </div>
          </Transition>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
