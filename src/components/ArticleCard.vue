<!-- src/components/ArticleCard.vue -->
<!--
  Tarjeta individual de artículo para el grid del Home.
  Muestra categoría, título, extracto, tags, autor y fecha.
-->
<script setup>
import { useRouter } from 'vue-router'
import { getCategoryMeta as catMeta } from '@/constants/categories'

const props = defineProps({
  article: { type: Object, required: true },
})

const router = useRouter()

function formatDate(d) {
  if (!d) return ''
  const date = d.toDate ? d.toDate() : new Date(d)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <article
    class="group relative flex flex-col gap-3 p-4 sm:p-5 bg-white/[0.035] border border-white/[0.07] rounded-xl cursor-pointer overflow-hidden transition-all duration-200 hover:border-violet-500/35 hover:bg-white/[0.055] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 active:scale-[0.99]"
    @click="router.push(`/articulo/${article.id}`)"
  >
    <div
      class="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      :style="{ background: `linear-gradient(90deg, ${catMeta(article.category).color}, transparent)` }"
    ></div>

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
        <div
          class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-none"
          :style="{ background: `linear-gradient(135deg, ${catMeta(article.category).color}, #2563eb)` }"
        >{{ article.author?.displayName?.[0] ?? '?' }}</div>
        <span class="text-[12px] text-white/45">{{ article.author?.displayName }}</span>
      </div>
      <span class="text-[11px] text-white/25">{{ formatDate(article.createdAt) }}</span>
    </div>
  </article>
</template>
