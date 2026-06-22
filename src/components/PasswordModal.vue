<!-- src/components/PasswordModal.vue -->
<!--
  Modal para cambiar la contraseña del usuario autenticado.
  Pide contraseña actual, nueva y confirmación.
-->
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const auth = useAuthStore()

const oldPassword     = ref('')
const newPassword     = ref('')
const confirmPassword = ref('')
const passwordError   = ref('')
const passwordSuccess = ref(false)

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = false

  if (newPassword.value.length < 6) {
    passwordError.value = 'La contraseña nueva debe tener al menos 6 caracteres.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    await auth.changePassword(oldPassword.value, newPassword.value)
    passwordSuccess.value = true
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => {
      emit('close')
      passwordSuccess.value = false
    }, 2000)
  } catch {
    passwordError.value = auth.error || 'Error al actualizar la contraseña.'
  }
}

function handleClose() {
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
  passwordSuccess.value = false
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-[#12121e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <h3 class="text-xl font-semibold text-white mb-4">Cambiar Contraseña</h3>
      <form @submit.prevent="handleChangePassword" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs uppercase text-white/50 mb-1">Contraseña Actual</label>
          <input
            v-model="oldPassword"
            type="password"
            class="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white outline-none focus:border-violet-500 transition-colors"
            required
            placeholder="Ingresa tu contraseña actual"
          >
        </div>
        <div>
          <label class="block text-xs uppercase text-white/50 mb-1">Nueva Contraseña</label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white outline-none focus:border-violet-500 transition-colors"
            minlength="6"
            required
            placeholder="Mínimo 6 caracteres"
          >
        </div>
        <div>
          <label class="block text-xs uppercase text-white/50 mb-1">Confirmar Contraseña</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white outline-none focus:border-violet-500 transition-colors"
            minlength="6"
            required
            placeholder="Repite la nueva contraseña"
          >
        </div>
        <div v-if="passwordError" class="text-red-400 text-[13px] bg-red-500/10 p-2 rounded">{{ passwordError }}</div>
        <div v-if="passwordSuccess" class="text-green-400 text-[13px] bg-green-500/10 p-2 rounded">Contraseña actualizada con éxito.</div>
        <div class="flex gap-3 mt-2">
          <button type="button" @click="handleClose" class="flex-1 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/70 rounded-lg transition-colors">Cancelar</button>
          <button type="submit" class="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>
