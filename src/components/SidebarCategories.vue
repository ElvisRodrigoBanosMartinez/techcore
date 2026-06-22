<!-- src/components/SidebarCategories.vue -->
<!--
  Sidebar de categorías y resumen estadístico.
  Se usa tanto en el drawer móvil como en la barra lateral fija de desktop.
-->
<script setup>
import { getCategoryMeta as catMeta } from '@/constants/categories'

const props = defineProps({
  categories:     { type: Array,  required: true },
  activeCategory: { type: String, required: true },
  articles:       { type: Array,  required: true },
  categoryCounts: { type: Object, required: true },
  stats:          { type: Array,  required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div>
    <p class="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 mb-2">Categorías</p>

    <nav class="flex flex-col gap-0.5">
      <button
        v-for="cat in categories"
        :key="cat"
        class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-left w-full transition-colors"
        :class="activeCategory === cat
          ? 'bg-violet-600/20 text-violet-300'
          : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'"
        @click="emit('select', cat)"
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
  </div>
</template>
