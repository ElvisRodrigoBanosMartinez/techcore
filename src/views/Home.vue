<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useArticlesStore } from '@/stores/articles'
import { CATEGORIES as APP_CATEGORIES, getCategoryMeta as catMeta } from '@/constants/categories'

// Componentes extraídos
import SidebarCategories from '@/components/SidebarCategories.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import PasswordModal from '@/components/PasswordModal.vue'

const router        = useRouter()
const auth          = useAuthStore()
const articlesStore = useArticlesStore()
const search        = ref('')
const activeCategory = ref('Todos')
const sidebarOpen   = ref(false)
const mobileSearch  = ref(false)
const userMenuOpen  = ref(false)

// ── Conectar a Firestore al montar el componente ──────────────────────────────
onMounted(() => {
  articlesStore.subscribeToArticles()
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  articlesStore.unsubscribeFromArticles()
  window.removeEventListener('keydown', handleKeydown)
})

// ── Atajo de teclado ⌘K / Ctrl+K para buscar ─────────────────────────────────
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    document.getElementById('search-input')?.focus()
  }
}

// Alias para el template
const articles = computed(() => articlesStore.articles)
const categories = computed(() => ['Todos', ...APP_CATEGORIES])

// ── Modal de Contraseña ───────────────────────────────────────────────────────
const showPasswordModal = ref(false)

// ── Búsqueda mejorada ─────────────────────────────────────────────────────────
// Normaliza texto: quita acentos y pasa a minúsculas para búsqueda fuzzy en español
function normalize(str) {
  return str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? ''
}

const searchResults = ref(null) // null = usar articles, array = resultados de búsqueda global

// Cuando el usuario escribe, buscar en TODOS los artículos si hay más por cargar
const searchDebounce = ref(null)
watch(search, (q) => {
  clearTimeout(searchDebounce.value)
  if (!q.trim()) {
    searchResults.value = null
    return
  }
  searchDebounce.value = setTimeout(async () => {
    if (articlesStore.hasMore) {
      // Hay artículos no cargados → buscar en todos
      const allArticles = await articlesStore.searchAllArticles()
      searchResults.value = allArticles
    } else {
      searchResults.value = null // todos ya están cargados
    }
  }, 300)
})

const filteredArticles = computed(() => {
  const source = searchResults.value ?? articles.value
  let list = source
  if (activeCategory.value !== 'Todos') list = list.filter(a => a.category === activeCategory.value)
  const q = normalize(search.value.trim())
  if (q) list = list.filter(a =>
    normalize(a.title).includes(q) ||
    normalize(a.excerpt).includes(q) ||
    a.tags?.some(t => normalize(t).includes(q)) ||
    normalize(a.category).includes(q) ||
    normalize(a.author?.displayName).includes(q)
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
      <RouterLink to="/" @click="search = ''; activeCategory = 'Todos'" class="flex items-center gap-2 flex-none no-underline cursor-pointer hover:opacity-90 transition-opacity">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="text-sm sm:text-base font-bold text-white">TechCore
          <span class="hidden sm:inline text-[10px] font-extrabold tracking-widest bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent ml-1">RRHH</span>
        </span>
      </RouterLink>

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
        <!-- Botón Panel Admin -->
        <RouterLink
          v-if="auth.isAdmin"
          to="/admin"
          class="inline-flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-semibold rounded-lg hover:bg-white/[0.08] hover:text-white transition-all duration-150 no-underline"
          title="Panel de Administración"
        >
          <span class="hidden sm:inline">Panel Admin</span>
          <svg class="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </RouterLink>

        <!-- Botón Nuevo -->
        <RouterLink
          v-if="auth.isAdmin"
          to="/articulo/nuevo"
          id="btn-new-article"
          class="inline-flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-violet-900/40 hover:opacity-90 hover:-translate-y-px transition-all duration-150 no-underline"
        >
          <svg class="w-3.5 h-3.5 flex-none" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg>
          <span class="hidden sm:inline">Nuevo Artículo</span>
        </RouterLink>

        <!-- Avatar usuario (Dropdown) -->
        <div class="relative flex items-center border-l border-white/10 pl-3 sm:pl-4">
          <button
            id="btn-user-menu"
            class="relative z-50 flex items-center gap-1.5 sm:gap-2 pl-1 sm:pr-3 py-1 bg-white/[0.05] border border-white/[0.09] rounded-full hover:bg-white/[0.09] transition-colors cursor-pointer"
            @click="userMenuOpen = !userMenuOpen"
            title="Abrir menú de usuario"
          >
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-none">
              {{ auth.userDisplayName[0]?.toUpperCase() }}
            </div>
            <span class="hidden sm:inline text-[13px] font-medium text-white/70">{{ auth.userDisplayName }}</span>
            <svg class="w-3.5 h-3.5 text-white/50 hidden sm:block pr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div v-if="userMenuOpen" class="absolute right-0 top-full mt-2 w-48 bg-[#12121e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <button
                @click="showPasswordModal = true; userMenuOpen = false"
                class="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
              >Cambiar contraseña</button>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/[0.06] hover:text-red-300 transition-colors border-t border-white/5"
              >Cerrar sesión</button>
            </div>
          </Transition>

          <!-- Overlay para cerrar el menú al dar clic afuera -->
          <div v-if="userMenuOpen" @click="userMenuOpen = false" class="fixed inset-0 z-40"></div>
        </div>
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

      <!-- ── Sidebar móvil (drawer) ── -->
      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="-translate-x-full"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-to-class="-translate-x-full"
      >
        <aside
          v-show="sidebarOpen"
          class="fixed lg:hidden top-0 left-0 h-full w-64 flex-none border-r border-white/[0.06] bg-[#0e0e1c] flex flex-col py-5 px-3 overflow-y-auto z-50"
        >
          <!-- Cabecera del drawer -->
          <div class="flex items-center justify-between px-2 mb-4">
            <span class="text-sm font-semibold text-white">Menú</span>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.07]" @click="sidebarOpen = false">
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
            </button>
          </div>

          <SidebarCategories
            :categories="categories"
            :active-category="activeCategory"
            :articles="articles"
            :category-counts="categoryCounts"
            :stats="stats"
            @select="selectCategory"
          />
        </aside>
      </Transition>

      <!-- ── Sidebar desktop (siempre visible en lg+) ── -->
      <aside class="hidden lg:flex flex-none w-52 border-r border-white/[0.06] bg-white/[0.015] flex-col py-5 px-3 overflow-y-auto">
        <SidebarCategories
          :categories="categories"
          :active-category="activeCategory"
          :articles="articles"
          :category-counts="categoryCounts"
          :stats="stats"
          @select="selectCategory"
        />
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
              <ArticleCard
                v-for="article in filteredArticles"
                :key="article.id"
                :article="article"
              />
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

    <!-- Modal Cambiar Contraseña -->
    <PasswordModal :visible="showPasswordModal" @close="showPasswordModal = false" />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Ocultar scrollbar en el carrusel de chips móvil */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
