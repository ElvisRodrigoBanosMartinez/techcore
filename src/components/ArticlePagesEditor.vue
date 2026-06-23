<script setup>
import { ref, computed, watch } from 'vue'
import { createPage } from '@/utils/articlePages'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

const pages = defineModel({ type: Array, required: true })

defineProps({
  error: { type: String, default: '' },
  uploadingFile: { type: Boolean, default: false },
})

const emit = defineEmits(['upload-file'])

const activePageId = ref(pages.value[0]?.id ?? null)

watch(pages, (list) => {
  if (!list.find(p => p.id === activePageId.value)) {
    activePageId.value = list[0]?.id ?? null
  }
}, { deep: true })

const activePage = computed(() =>
  pages.value.find(p => p.id === activePageId.value) ?? pages.value[0]
)

function selectPage(id) {
  activePageId.value = id
}

function addPage() {
  const n = pages.value.length + 1
  const page = createPage(`Página ${n}`)
  pages.value = [...pages.value, page]
  activePageId.value = page.id
}

function removePage(id) {
  if (pages.value.length <= 1) return
  const idx = pages.value.findIndex(p => p.id === id)
  if (idx === -1) return
  const next = pages.value.filter(p => p.id !== id)
  pages.value = next
  if (activePageId.value === id) {
    activePageId.value = next[Math.max(0, idx - 1)]?.id ?? next[0]?.id
  }
}

function updatePageTitle(id, title) {
  pages.value = pages.value.map(p => p.id === id ? { ...p, title } : p)
}

function updatePageContent(id, content) {
  pages.value = pages.value.map(p => p.id === id ? { ...p, content } : p)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-3">
      <label class="text-[13px] font-semibold text-white/60 uppercase tracking-wide">Páginas *</label>
      <button
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-[12px] font-semibold rounded-lg transition-colors border border-violet-500/20"
        @click="addPage"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
        </svg>
        Agregar página
      </button>
    </div>

    <!-- Tabs de páginas -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(page, index) in pages"
        :key="page.id"
        type="button"
        class="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
        :class="activePage?.id === page.id
          ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
          : 'bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/[0.08] hover:text-white/80'"
        @click="selectPage(page.id)"
      >
        <span>{{ page.title?.trim() || `Página ${index + 1}` }}</span>
        <span
          v-if="pages.length > 1"
          class="w-4 h-4 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
          title="Eliminar página"
          @click.stop="removePage(page.id)"
        >×</span>
      </button>
    </div>

    <template v-if="activePage">
      <div class="flex flex-col gap-1.5">
        <label :for="`page-title-${activePage.id}`" class="text-[12px] font-medium text-white/45">
          Título de la página
        </label>
        <input
          :id="`page-title-${activePage.id}`"
          :value="activePage.title"
          type="text"
          placeholder="Ej. Introducción, Paso a paso, Anexos..."
          class="w-full px-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all"
          @input="updatePageTitle(activePage.id, $event.target.value)"
        />
      </div>

      <MarkdownEditor
        :model-value="activePage.content"
        placeholder="Escribe el contenido de esta página. Usa ## y ### para títulos que aparecerán en el índice lateral."
        :error="error"
        :uploading-file="uploadingFile"
        @update:model-value="updatePageContent(activePage.id, $event)"
        @upload-file="emit('upload-file', activePage.id)"
      />
    </template>

    <span v-if="error" class="text-red-400 text-xs">{{ error }}</span>
  </div>
</template>
