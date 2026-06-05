<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'

const router = useRouter()
const route  = useRoute()
const store  = useArticlesStore()

const id = route.params.id

const CATEGORIES = ['Incorporación', 'Beneficios', 'Desarrollo', 'Operaciones', 'Cultura']

// ── Formulario ────────────────────────────────────────────────────────────────
const form = ref({
  title:    '',
  excerpt:  '',
  content:  '',
  category: '',
  tags:     '',
})

const errors     = ref({})
const loading    = ref(true)
const saving     = ref(false)
const notFound   = ref(false)

const tagPreview = computed(() =>
  form.value.tags.split(',').map(t => t.trim()).filter(Boolean)
)

onMounted(async () => {
  try {
    const article = await store.fetchArticle(id)
    form.value = {
      title:    article.title || '',
      excerpt:  article.excerpt || '',
      content:  article.content || '',
      category: article.category || '',
      tags:     article.tags ? article.tags.join(', ') : ''
    }
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

// ── Validación ────────────────────────────────────────────────────────────────
function validate() {
  const e = {}
  if (!form.value.title.trim())    e.title    = 'El título es obligatorio.'
  if (!form.value.excerpt.trim())  e.excerpt  = 'El resumen es obligatorio.'
  if (!form.value.content.trim())  e.content  = 'El contenido no puede estar vacío.'
  if (!form.value.category)        e.category = 'Selecciona una categoría.'
  errors.value = e
  return Object.keys(e).length === 0
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate() || saving.value) return
  saving.value = true
  try {
    await store.updateArticle(id, {
      ...form.value,
      tags: form.value.tags.split(','),
    })
    router.push(`/articulo/${id}`)
  } catch {
    // error ya en store.error
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-[100dvh] bg-[#0a0a12] text-slate-200 font-sans">
    <!-- Navbar compacta -->
    <header class="sticky top-0 z-50 flex items-center gap-3 px-4 sm:px-6 h-14 bg-[#0a0a12]/95 backdrop-blur-xl border-b border-white/[0.07]">
      <button
        class="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
        @click="router.push(`/articulo/${id}`)"
      >
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
        </svg>
        Cancelar
      </button>
      <div class="flex-1"></div>
      <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
        <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="text-sm font-bold text-white">TechCore <span class="text-[10px] font-extrabold tracking-widest bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">RRHH</span></span>
    </header>

    <!-- Contenido -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <svg class="w-8 h-8 animate-spin text-violet-500" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
      
      <div v-else-if="notFound" class="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <span class="text-6xl">😕</span>
        <h2 class="text-xl font-bold text-white">Artículo no encontrado</h2>
        <button
          class="mt-4 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          @click="router.push('/')"
        >Ir al inicio</button>
      </div>
      
      <div v-else>
        <div class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Editar Artículo</h1>
          <p class="text-white/45 text-sm mt-1">Actualiza el contenido de tu artículo</p>
        </div>

        <div v-if="store.error" class="mb-6 flex items-center gap-2.5 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
          <svg class="w-4 h-4 flex-none" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
          {{ store.error }}
        </div>

        <form class="flex flex-col gap-6" @submit.prevent="handleSubmit" novalidate>
          <div class="flex flex-col gap-1.5">
            <label for="art-title" class="text-[13px] font-semibold text-white/60 uppercase tracking-wide">Título *</label>
            <input id="art-title" v-model="form.title" type="text" placeholder="Ej. Proceso de Incorporación 2025" class="w-full px-4 py-3 bg-white/[0.06] border rounded-xl text-white placeholder-white/25 text-base outline-none transition-all" :class="errors.title ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15'" />
            <span v-if="errors.title" class="text-red-400 text-xs">{{ errors.title }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-white/60 uppercase tracking-wide">Categoría *</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="cat in CATEGORIES" :key="cat" type="button" class="px-3.5 py-2 rounded-xl text-sm font-medium border transition-all" :class="form.category === cat ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/[0.08] hover:text-white/80'" @click="form.category = cat">{{ cat }}</button>
            </div>
            <span v-if="errors.category" class="text-red-400 text-xs">{{ errors.category }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="art-excerpt" class="text-[13px] font-semibold text-white/60 uppercase tracking-wide">Resumen *</label>
            <textarea id="art-excerpt" v-model="form.excerpt" placeholder="Una descripción breve que aparecerá en la tarjeta del artículo..." rows="2" class="w-full px-4 py-3 bg-white/[0.06] border rounded-xl text-white placeholder-white/25 text-sm outline-none resize-none transition-all leading-relaxed" :class="errors.excerpt ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15'"></textarea>
            <span v-if="errors.excerpt" class="text-red-400 text-xs">{{ errors.excerpt }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="art-content" class="text-[13px] font-semibold text-white/60 uppercase tracking-wide">Contenido *</label>
            <textarea id="art-content" v-model="form.content" placeholder="Escribe el contenido completo del artículo aquí..." rows="10" class="w-full px-4 py-3 bg-white/[0.06] border rounded-xl text-white placeholder-white/25 text-sm outline-none resize-y transition-all leading-relaxed font-mono" :class="errors.content ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15'"></textarea>
            <span v-if="errors.content" class="text-red-400 text-xs">{{ errors.content }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="art-tags" class="text-[13px] font-semibold text-white/60 uppercase tracking-wide">Etiquetas <span class="normal-case font-normal">(separadas por coma)</span></label>
            <input id="art-tags" v-model="form.tags" type="text" placeholder="onboarding, proceso, RRHH" class="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all" />
            <div v-if="tagPreview.length" class="flex flex-wrap gap-1.5 mt-1">
              <span v-for="tag in tagPreview" :key="tag" class="text-[11px] text-white/40 bg-white/[0.06] px-2 py-0.5 rounded-md">#{{ tag }}</span>
            </div>
          </div>

          <div class="border-t border-white/[0.06] mt-2 mb-2"></div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button type="submit" :disabled="saving" class="flex-1 sm:flex-none sm:min-w-[180px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-900/40 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
              <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg>
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <button type="button" class="flex-1 sm:flex-none px-6 py-3 bg-white/[0.05] border border-white/10 text-white/60 font-medium rounded-xl hover:bg-white/[0.09] hover:text-white transition-colors" @click="router.push(`/articulo/${id}`)">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
