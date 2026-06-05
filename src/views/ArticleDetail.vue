<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { getCategoryMeta as catMeta } from '@/constants/categories'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({ id: { type: String, required: true } })

const router   = useRouter()
const store    = useArticlesStore()
const auth     = useAuthStore()

const article    = ref(null)
const loading    = ref(true)
const notFound   = ref(false)
const deleting   = ref(false)
const showDelete = ref(false)

// Comprueba si el usuario actual es el autor del artículo
const isOwner = computed(() =>
  article.value && auth.user && article.value.author?.uid === auth.user.uid
)

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Renderiza Markdown de forma segura a HTML
const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  const rawHtml = marked.parse(article.value.content)
  return DOMPurify.sanitize(rawHtml)
})

onMounted(async () => {
  try {
    article.value = await store.fetchArticle(props.id)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

async function confirmDelete() {
  deleting.value = true
  try {
    await store.deleteArticle(props.id)
    router.push('/')
  } catch {
    deleting.value = false
    showDelete.value = false
  }
}
</script>

<template>
  <div class="min-h-[100dvh] bg-[#0a0a12] text-slate-200 font-sans">

    <!-- Navbar compacta -->
    <header class="sticky top-0 z-50 flex items-center gap-3 px-4 sm:px-6 h-14 bg-[#0a0a12]/95 backdrop-blur-xl border-b border-white/[0.07]">
      <button
        class="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
        @click="router.push('/')"
      >
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
        </svg>
        Volver
      </button>
      <div class="flex-1"></div>
      <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
        <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="text-sm font-bold text-white">TechCore</span>
    </header>

    <!-- ── Loading ── -->
    <div v-if="loading" class="flex items-center justify-center py-40">
      <svg class="w-8 h-8 animate-spin text-violet-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>

    <!-- ── Not found ── -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center py-40 gap-4 text-center px-4">
      <span class="text-6xl">😕</span>
      <h2 class="text-xl font-bold text-white">Artículo no encontrado</h2>
      <p class="text-white/40 text-sm">El artículo que buscas no existe o fue eliminado.</p>
      <button
        class="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        @click="router.push('/')"
      >Ir al inicio</button>
    </div>

    <!-- ── Artículo ── -->
    <template v-else-if="article">
      <!-- Hero del artículo -->
      <div class="border-b border-white/[0.06]" :style="{ background: `linear-gradient(160deg, ${catMeta(article.category).color}15 0%, transparent 60%)` }">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          <!-- Meta superior -->
          <div class="flex flex-wrap items-center gap-2 mb-5">
            <span class="text-[12px] font-bold border rounded-full px-2.5 py-1" :class="catMeta(article.category).bg">
              {{ catMeta(article.category).icon }} {{ article.category }}
            </span>
            <span class="text-white/30 text-xs">·</span>
            <span class="text-white/40 text-xs">{{ formatDate(article.createdAt) }}</span>
          </div>

          <!-- Título -->
          <h1 class="text-2xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            {{ article.title }}
          </h1>

          <!-- Excerpt -->
          <p class="text-white/55 text-base sm:text-lg leading-relaxed mb-6">{{ article.excerpt }}</p>

          <!-- Autor + acciones -->
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-none"
                :style="{ background: `linear-gradient(135deg, ${catMeta(article.category).color}, #2563eb)` }"
              >{{ article.author?.displayName?.[0]?.toUpperCase() }}</div>
              <div>
                <p class="text-sm font-semibold text-white">{{ article.author?.displayName }}</p>
                <p class="text-xs text-white/35">Autor</p>
              </div>
            </div>

            <!-- Acciones de propietario -->
            <div v-if="isOwner" class="flex items-center gap-2">
              <RouterLink
                :to="`/articulo/${id}/editar`"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.07] border border-white/10 text-white/60 text-sm font-medium rounded-lg hover:bg-white/[0.12] hover:text-white transition-colors no-underline"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.629-.629z"/>
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"/>
                </svg>
                Editar
              </RouterLink>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors"
                @click="showDelete = true"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div class="prose prose-invert prose-violet max-w-none text-white/80" v-html="renderedContent"></div>

        <!-- Tags -->
        <div v-if="article.tags?.length" class="mt-10 pt-6 border-t border-white/[0.06] flex flex-wrap gap-2">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="text-xs text-white/40 bg-white/[0.06] border border-white/[0.07] px-2.5 py-1 rounded-full"
          >#{{ tag }}</span>
        </div>

        <!-- Última actualización -->
        <p v-if="article.updatedAt" class="mt-4 text-xs text-white/25">
          Última actualización: {{ formatDate(article.updatedAt) }}
        </p>
      </div>
    </template>

    <!-- ── Modal de confirmación de borrado ── -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="showDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showDelete = false">
        <div class="w-full max-w-sm bg-[#13131f] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div class="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">¿Eliminar artículo?</h3>
          <p class="text-white/45 text-sm mb-6">Esta acción es permanente y no se puede deshacer.</p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-2.5 bg-red-500/20 border border-red-500/35 text-red-300 font-semibold text-sm rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
              :disabled="deleting"
              @click="confirmDelete"
            >{{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}</button>
            <button
              class="flex-1 py-2.5 bg-white/[0.06] border border-white/10 text-white/60 font-medium text-sm rounded-xl hover:bg-white/[0.1] transition-colors"
              @click="showDelete = false"
            >Cancelar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
