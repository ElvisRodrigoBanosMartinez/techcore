<script setup>
const props = defineProps({
  pages: { type: Array, required: true },
  headings: { type: Array, default: () => [] },
  activePageId: { type: String, required: true },
  hasMultiplePages: { type: Boolean, default: false },
})

const emit = defineEmits(['select-page', 'scroll-to'])

function scrollToHeading(id) {
  emit('scroll-to', id)
}
</script>

<template>
  <aside class="hidden lg:block w-56 xl:w-64 flex-none">
    <nav class="sticky top-20 space-y-6">
      <!-- Páginas -->
      <div v-if="hasMultiplePages">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-2 px-2">Páginas</p>
        <ul class="space-y-0.5">
          <li v-for="page in pages" :key="page.id">
            <button
              type="button"
              class="w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors truncate"
              :class="page.id === activePageId
                ? 'bg-violet-500/15 text-violet-300 font-medium'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'"
              @click="emit('select-page', page.id)"
            >
              {{ page.title }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Índice de títulos -->
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-2 px-2">
          {{ hasMultiplePages ? 'En esta página' : 'Contenido' }}
        </p>
        <ul v-if="headings.length" class="space-y-0.5 border-l border-white/[0.08] ml-2">
          <li v-for="heading in headings" :key="heading.id">
            <button
              type="button"
              class="block w-full text-left py-1 text-sm text-white/45 hover:text-violet-300 transition-colors truncate"
              :class="heading.level === 3 ? 'pl-5' : 'pl-3'"
              @click="scrollToHeading(heading.id)"
            >
              {{ heading.text }}
            </button>
          </li>
        </ul>
        <p v-else class="px-2 text-xs text-white/25 italic">
          Usa ## o ### en el contenido para crear títulos
        </p>
      </div>
    </nav>
  </aside>
</template>
