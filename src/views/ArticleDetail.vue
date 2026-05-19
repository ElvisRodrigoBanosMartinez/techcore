<!-- src/views/ArticleDetail.vue - Stub (se implementará en la siguiente fase) -->
<script setup>
import { useRouter } from 'vue-router'
defineProps({ id: String })
const router = useRouter()
</script>

<template>
  <div style="font-family:Inter,sans-serif;min-height:100vh;background:#0d0d14;color:#e2e8f0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;">
    <h1 style="font-size:1.75rem;font-weight:700;color:#fff;">📄 Detalle del Artículo</h1>
    <p style="color:rgba(255,255,255,0.45);">ID: <code style="color:#a78bfa;">{{ id }}</code> — Se implementará en la Fase 2.</p>
    <button @click="router.push('/')" style="padding:.6rem 1.4rem;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;border:none;border-radius:.75rem;cursor:pointer;font-size:.9rem;">← Volver al inicio</button>
  </div>
</template>
