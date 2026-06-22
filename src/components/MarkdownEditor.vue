<!-- src/components/MarkdownEditor.vue -->
<!--
  Editor de Markdown con tabs Escribir / Vista Previa.
  Renderiza Markdown en tiempo real con marked + DOMPurify.
  Incluye botón de adjuntar archivo y helper de sintaxis.
-->
<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  modelValue:    { type: String, default: '' },
  placeholder:   { type: String, default: 'Escribe aquí...' },
  error:         { type: String, default: '' },
  uploadingFile: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'upload-file'])

const activeTab = ref('write') // 'write' | 'preview'

const renderedPreview = computed(() => {
  if (!props.modelValue) return '<p class="text-white/30 italic">Nada que previsualizar aún...</p>'
  const rawHtml = marked.parse(props.modelValue)
  return DOMPurify.sanitize(rawHtml)
})

const wordCount = computed(() => {
  if (!props.modelValue.trim()) return 0
  return props.modelValue.trim().split(/\s+/).length
})

const readTimeEstimate = computed(() => {
  return Math.max(1, Math.ceil(wordCount.value / 200))
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <!-- Toolbar -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1">
        <label class="text-[13px] font-semibold text-white/60 uppercase tracking-wide mr-3">Contenido *</label>

        <!-- Tabs -->
        <button
          type="button"
          class="px-3 py-1 text-[12px] font-semibold rounded-lg transition-colors"
          :class="activeTab === 'write'
            ? 'bg-white/[0.1] text-white'
            : 'text-white/40 hover:text-white/60'"
          @click="activeTab = 'write'"
        >
          <svg class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.629-.629z"/></svg>
          Escribir
        </button>
        <button
          type="button"
          class="px-3 py-1 text-[12px] font-semibold rounded-lg transition-colors"
          :class="activeTab === 'preview'
            ? 'bg-white/[0.1] text-white'
            : 'text-white/40 hover:text-white/60'"
          @click="activeTab = 'preview'"
        >
          <svg class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
          Vista Previa
        </button>
      </div>

      <!-- Adjuntar archivo -->
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-white/30 hidden sm:inline">{{ wordCount }} palabras · {{ readTimeEstimate }} min lectura</span>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-[12px] font-semibold rounded-lg transition-colors border border-violet-500/20"
          @click="emit('upload-file')"
          :disabled="uploadingFile"
        >
          <svg v-if="uploadingFile" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          <svg v-else class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03l2.955-3.129v8.614z"/><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/></svg>
          {{ uploadingFile ? 'Subiendo...' : 'Adjuntar' }}
        </button>
      </div>
    </div>

    <!-- Write tab -->
    <textarea
      v-show="activeTab === 'write'"
      id="art-content"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      rows="12"
      class="w-full px-4 py-3 bg-white/[0.06] border rounded-xl text-white placeholder-white/25 text-sm outline-none resize-y transition-all leading-relaxed font-mono"
      :class="error ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15'"
    ></textarea>

    <!-- Preview tab -->
    <div
      v-show="activeTab === 'preview'"
      class="w-full min-h-[18rem] px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl overflow-y-auto prose prose-invert prose-violet max-w-none text-white/80 text-sm leading-relaxed"
      v-html="renderedPreview"
    ></div>

    <!-- Helper -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-white/35">Soporta formato <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" class="text-violet-400 hover:underline">Markdown</a>. Usa <code class="text-[11px] bg-white/[0.08] px-1 rounded">## Títulos</code>, <code class="text-[11px] bg-white/[0.08] px-1 rounded">**negritas**</code>, <code class="text-[11px] bg-white/[0.08] px-1 rounded">- listas</code></p>
    </div>
    <span v-if="error" class="text-red-400 text-xs">{{ error }}</span>
  </div>
</template>
