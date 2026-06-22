<!-- src/components/ToastNotification.vue -->
<!--
  Notificación toast que aparece arriba a la derecha.
  Reemplaza los alert() nativos para mantener la estética dark-mode.
  
  Uso:
    <ToastNotification :message="msg" :type="'success'" @close="msg = ''" />
-->
<script setup>
import { watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  type:    { type: String, default: 'success' }, // 'success' | 'error' | 'info'
  duration: { type: Number, default: 3000 },
})

const emit = defineEmits(['close'])

watch(() => props.message, (val) => {
  if (val) {
    setTimeout(() => emit('close'), props.duration)
  }
})

const colors = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  error:   'bg-red-500/15 border-red-500/30 text-red-300',
  info:    'bg-blue-500/15 border-blue-500/30 text-blue-300',
}

const icons = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    leave-active-class="transition-all duration-200 ease-in"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="message"
      class="fixed top-4 right-4 z-[200] flex items-center gap-2.5 px-4 py-3 border rounded-xl shadow-xl text-sm font-medium max-w-sm"
      :class="colors[type] || colors.info"
      role="alert"
    >
      <span class="text-base font-bold flex-none">{{ icons[type] || icons.info }}</span>
      <span class="flex-1">{{ message }}</span>
      <button
        class="flex-none text-white/40 hover:text-white/70 transition-colors ml-2"
        @click="emit('close')"
        aria-label="Cerrar notificación"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>
