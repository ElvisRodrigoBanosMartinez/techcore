<!-- src/components/AppHeader.vue -->
<!--
  Navbar reutilizable para páginas internas (crear, editar, detalle).
  Props:
    - backLabel: texto del botón de regreso (default "Volver")
    - backTo:    ruta a la que navega el botón (default "/")
-->
<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  backLabel: { type: String, default: 'Volver' },
  backTo:    { type: String, default: '/' },
})

const router = useRouter()
</script>

<template>
  <header class="sticky top-0 z-50 flex items-center gap-3 px-4 sm:px-6 h-14 bg-[#0a0a12]/95 backdrop-blur-xl border-b border-white/[0.07]">
    <button
      class="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
      @click="router.push(props.backTo)"
    >
      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
      </svg>
      {{ props.backLabel }}
    </button>
    <div class="flex-1"></div>
    <RouterLink to="/" class="flex items-center gap-2 flex-none no-underline cursor-pointer hover:opacity-90 transition-opacity">
      <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
        <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="text-sm font-bold text-white">TechCore <span class="text-[10px] font-extrabold tracking-widest bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">RRHH</span></span>
    </RouterLink>
  </header>
</template>
