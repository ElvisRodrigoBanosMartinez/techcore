<!-- src/App.vue -->
<!--
  Componente raíz: limpio, sin navbar propio.
  Inicia el listener de autenticación de Firebase UNA sola vez.
  Muestra un spinner de carga mientras Firebase verifica la sesión persistida.
-->
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// Registra el listener de Firebase Auth y guarda la función de limpieza
let unsubscribeAuth = null

onMounted(() => {
  unsubscribeAuth = auth.initAuthListener()
})

onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth()
})
</script>

<template>
  <!-- Pantalla de carga mientras Firebase resuelve la sesión inicial -->
  <div v-if="auth.loading" class="app-loading">
    <div class="loading-spinner"></div>
  </div>

  <!-- App lista -->
  <RouterView v-else />
</template>

<style>
/* Reset global */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #app {
  height: 100%;
  background: #0d0d14;
}

/* Pantalla de carga inicial */
.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d14;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(124, 58, 237, 0.2);
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
