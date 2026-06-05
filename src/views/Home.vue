<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useArticlesStore } from '@/stores/articles'
import { CATEGORIES as APP_CATEGORIES, getCategoryMeta as catMeta } from '@/constants/categories'

const router        = useRouter()
const auth          = useAuthStore()
const articlesStore = useArticlesStore()
const search        = ref('')
const activeCategory = ref('Todos')
const sidebarOpen   = ref(false)
const mobileSearch  = ref(false)

// ── Conectar a Firestore al montar el componente ──────────────────────────────
let unsubscribe = null
onMounted(() => {
  unsubscribe = articlesStore.subscribeToArticles()
})
onUnmounted(() => {
  articlesStore.unsubscribeFromArticles()
})

// Alias para el template
const articles = computed(() => articlesStore.articles)

const categories = computed(() => ['Todos', ...APP_CATEGORIES])

const filteredArticles = computed(() => {
  let list = articles.value
  if (activeCategory.value !== 'Todos') list = list.filter(a => a.category === activeCategory.value)
  const q = search.value.toLowerCase().trim()
  if (q) list = list.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    a.tags?.some(t => t.includes(q))
  )
  return list
})

const stats = computed(() => [
  { label:'Artículos',  value: articles.value.length,                                      icon:'📄' },
  { label:'Categorías', value: categories.value.length - 1,                                icon:'🗂️' },
  { label:'Autores',    value: new Set(articles.value.map(a => a.author?.displayName)).size, icon:'👥' },
])

const categoryCounts = computed(() => {
  const counts = {}
  articles.value.forEach(a => {
    counts[a.category] = (counts[a.category] || 0) + 1
  })
  return counts
})

function formatDate(d) {
  if (!d) return ''
  const date = d.toDate ? d.toDate() : new Date(d)
  return date.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })
}

function selectCategory(cat) {
  activeCategory.value = cat
  sidebarOpen.value = false
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex flex-col h-[100dvh] w-full bg-[#0a0a12] text-slate-200 font-sans overflow-hidden">

    <!-- ════ NAVBAR ════ -->
    <header class="flex-none flex items-center gap-2 sm:gap-4 px-3 sm:px-6 h-14 bg-[#0a0a12]/95 backdrop-blur-xl border-b border-white/[0.07] z-50 w-full">

      <!-- Hamburger (solo móvil) -->
      <button
        id="btn-sidebar-toggle"
        class="lg:hidden flex-none w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.07] hover:text-white transition-colors"
        @click="sidebarOpen = true"
        aria-label="Abrir menú"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Brand -->
      <div class="flex items-center gap-2 flex-none">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="text-sm sm:text-base font-bold text-white">TechCore
          <span class="hidden sm:inline text-[10px] font-extrabold tracking-widest bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent ml-1">RRHH</span>
        </span>
      </div>

      <!-- Search — desktop siempre visible, móvil oculto por defecto -->
      <div class="hidden sm:flex flex-1 max-w-lg mx-auto relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
        </svg>
        <input
          id="search-input"
          v-model="search"
          type="search"
          placeholder="Buscar artículos, políticas..."
          autocomplete="off"
          class="w-full pl-9 pr-14 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all"
        />
        <kbd class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-white/25 font-mono">⌘K</kbd>
      </div>

      <!-- Icono de búsqueda en móvil -->
      <button
        class="sm:hidden flex-none w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.07] hover:text-white transition-colors"
        @click="mobileSearch = !mobileSearch"
        aria-label="Buscar"
      >
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Spacer móvil -->
      <div class="flex-1 sm:hidden"></div>

      <!-- Actions -->
      <div class="flex items-center gap-1.5 sm:gap-2.5 flex-none">
        <!-- Botón Nuevo — texto en desktop, solo ícono en móvil -->
        <RouterLink
          v-if="auth.isAdmin"
          to="/articulo/nuevo"
          id="btn-new-article"
          class="inline-flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-violet-900/40 hover:opacity-90 hover:-translate-y-px transition-all duration-150 no-underline"
        >
          <svg class="w-3.5 h-3.5 flex-none" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg>
          <span class="hidden sm:inline">Nuevo Artículo</span>
        </RouterLink>

        <!-- Avatar usuario -->
        <button
          id="btn-user-menu"
          class="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pr-3 py-1 bg-white/[0.05] border border-white/[0.09] rounded-full hover:bg-white/[0.09] transition-colors cursor-pointer"
          @click="handleLogout"
          title="Cerrar sesión"
        >
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-none">
            {{ auth.userDisplayName[0]?.toUpperCase() }}
          </div>
          <span class="hidden sm:inline text-[13px] font-medium text-white/70 pr-2">{{ auth.userDisplayName }}</span>
        </button>
      </div>
    </header>

    <!-- Search bar expandible móvil -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileSearch" class="sm:hidden flex-none px-3 py-2 bg-[#0f0f1a] border-b border-white/[0.07]">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
          </svg>
          <input
            id="mobile-search-input"
            v-model="search"
            type="search"
            placeholder="Buscar artículos..."
            autocomplete="off"
            autofocus
            class="w-full pl-9 pr-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all"
          />
        </div>
      </div>
    </Transition>

    <!-- ════ BODY ════ -->
    <div class="flex flex-1 overflow-hidden w-full relative">

      <!-- ── Overlay móvil ── -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="sidebarOpen"
          class="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          @click="sidebarOpen = false"
        ></div>
      </Transition>

      <!-- ── Sidebar ── -->
      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="-translate-x-full"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-to-class="-translate-x-full"
      >
        <aside
          v-show="sidebarOpen"
          class="fixed lg:static top-0 left-0 h-full lg:h-auto w-64 lg:w-52 flex-none border-r border-white/[0.06] bg-[#0e0e1c] lg:bg-white/[0.015] flex flex-col py-5 px-3 overflow-y-auto z-50 lg:z-auto lg:translate-x-0"
        >
          <!-- Cabecera del drawer (solo móvil) -->
          <div class="lg:hidden flex items-center justify-between px-2 mb-4">
            <span class="text-sm font-semibold text-white">Menú</span>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.07]" @click="sidebarOpen = false">
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
            </button>
          </div>

          <p class="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 mb-2">Categorías</p>

          <nav class="flex flex-col gap-0.5">
            <button
              v-for="cat in categories"
              :key="cat"
              class="flex items-center gap-2.5 px-2.5 py-2.5 lg:py-2 rounded-lg text-sm font-medium text-left w-full transition-colors"
              :class="activeCategory === cat
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'"
              @click="selectCategory(cat)"
            >
              <span class="text-base leading-none">{{ cat === 'Todos' ? '🏠' : catMeta(cat).icon }}</span>
              <span class="flex-1 truncate">{{ cat }}</span>
              <span
                class="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                :class="activeCategory === cat ? 'bg-violet-500/30 text-violet-300' : 'bg-white/[0.07] text-white/30'"
              >{{ cat === 'Todos' ? articles.length : (categoryCounts[cat] || 0) }}</span>
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
      </Transition>

      <!-- Sidebar estático desktop (siempre visible en lg+) -->
      <aside class="hidden lg:flex flex-none w-52 border-r border-white/[0.06] bg-white/[0.015] flex-col py-5 px-3 overflow-y-auto">
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
            >{{ cat === 'Todos' ? articles.length : (categoryCounts[cat] || 0) }}</span>
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

      <!-- ── Main content ── -->
      <main class="flex-1 overflow-y-auto min-w-0">

        <!-- Chips de categoría en scroll horizontal (solo móvil) -->
        <div class="lg:hidden flex gap-2 px-3 py-2.5 border-b border-white/[0.06] overflow-x-auto scrollbar-hide">
          <button
            v-for="cat in categories"
            :key="cat"
            class="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors whitespace-nowrap"
            :class="activeCategory === cat
              ? 'bg-violet-600/25 text-violet-300 border-violet-500/40'
              : 'bg-white/[0.05] text-white/40 border-white/10 hover:bg-white/[0.08]'"
            @click="activeCategory = cat"
          >
            <span>{{ cat === 'Todos' ? '🏠' : catMeta(cat).icon }}</span>
            {{ cat }}
          </button>
        </div>

        <div class="px-3 sm:px-6 py-4 sm:py-5">

          <!-- Page header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 sm:pb-5 border-b border-white/[0.06]">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                {{ activeCategory === 'Todos' ? 'Base de Conocimiento' : activeCategory }}
              </h1>
              <p class="text-sm text-white/40 mt-0.5">
                {{ filteredArticles.length }} artículo{{ filteredArticles.length !== 1 ? 's' : '' }}
                <span v-if="search"> para "{{ search }}"</span>
              </p>
            </div>
            <!-- Chips desktop -->
            <div class="hidden sm:flex flex-wrap gap-1.5">
              <span
                v-for="cat in categories.slice(1)"
                :key="cat"
                class="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                :class="catMeta(cat).bg"
              >{{ catMeta(cat).icon }} {{ cat }}</span>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="articlesStore.loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <div v-for="n in 6" :key="n" class="h-52 rounded-xl bg-white/[0.04] border border-white/[0.06] animate-pulse"></div>
          </div>

          <!-- Error de Firestore -->
          <div v-else-if="articlesStore.error" class="flex flex-col items-center py-20 gap-3">
            <span class="text-4xl">⚠️</span>
            <p class="text-red-400 text-sm">{{ articlesStore.error }}</p>
          </div>

          <!-- Grid de artículos -->
          <Transition v-else name="fade" mode="out-in">
            <div v-if="filteredArticles.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              <article
                v-for="article in filteredArticles"
                :key="article.id"
                class="group relative flex flex-col gap-3 p-4 sm:p-5 bg-white/[0.035] border border-white/[0.07] rounded-xl cursor-pointer overflow-hidden transition-all duration-200 hover:border-violet-500/35 hover:bg-white/[0.055] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 active:scale-[0.99]"
                @click="router.push(`/articulo/${article.id}`)"
              >
                <div class="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  :style="{ background: `linear-gradient(90deg, ${catMeta(article.category).color}, transparent)` }">
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold border rounded-full px-2 py-0.5" :class="catMeta(article.category).bg">
                    {{ catMeta(article.category).icon }} {{ article.category }}
                  </span>
                  <span class="text-[11px] text-white/30">{{ article.readTime }}</span>
                </div>

                <h2 class="text-[15px] sm:text-base font-semibold text-white leading-snug">{{ article.title }}</h2>
                <p class="text-[13px] text-white/45 leading-relaxed line-clamp-2">{{ article.excerpt }}</p>

                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in article.tags" :key="tag" class="text-[11px] text-white/28 bg-white/[0.05] px-1.5 py-0.5 rounded">
                    #{{ tag }}
                  </span>
                </div>

                <div class="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06]">
                  <div class="flex items-center gap-1.5">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-none"
                      :style="{ background: `linear-gradient(135deg, ${catMeta(article.category).color}, #2563eb)` }">
                      {{ article.author?.displayName?.[0] ?? '?' }}
                    </div>
                    <span class="text-[12px] text-white/45">{{ article.author?.displayName }}</span>
                  </div>
                  <span class="text-[11px] text-white/25">{{ formatDate(article.createdAt) }}</span>
                </div>
              </article>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-20 gap-3">
              <span class="text-5xl grayscale-[0.5]">🔍</span>
              <p class="text-white/35 text-base text-center px-4">
                No hay artículos para <strong class="text-white/55">"{{ search }}"</strong>
              </p>
              <button
                class="mt-1 px-4 py-1.5 text-sm bg-white/[0.07] border border-white/10 text-white/55 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                @click="search = ''; activeCategory = 'Todos'"
              >Limpiar filtros</button>
            </div>
          </Transition>

          <!-- Botón Cargar Más -->
          <div v-if="filteredArticles.length > 0 && articlesStore.hasMore && !search" class="mt-8 flex justify-center">
            <button
              class="px-6 py-2.5 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-semibold rounded-xl hover:bg-white/[0.08] hover:text-white transition-colors flex items-center gap-2"
              @click="articlesStore.loadMore()"
            >
              <svg v-if="articlesStore.loading" class="w-4 h-4 animate-spin text-violet-500" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Cargar más artículos
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Ocultar scrollbar en el carrusel de chips móvil */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
