<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AppHeader from '@/components/AppHeader.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const router = useRouter()
const adminStore = useAdminStore()

const newEmail = ref('')
const newPassword = ref('')
const roleEmail = ref('')
const roleIsAdmin = ref(false)

// Toast notification state
const toastMessage = ref('')
const toastType = ref('success')

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
}

async function handleCreateUser() {
  if (!newEmail.value || !newPassword.value) return
  await adminStore.createUser(newEmail.value, newPassword.value)
  if (!adminStore.error) {
    showToast('Usuario creado con éxito.', 'success')
    newEmail.value = ''
    newPassword.value = ''
  } else {
    showToast(adminStore.error, 'error')
  }
}

async function handleSetRole() {
  if (!roleEmail.value) return
  await adminStore.setRole(roleEmail.value, roleIsAdmin.value)
  if (!adminStore.error) {
    showToast('Rol actualizado con éxito.', 'success')
    roleEmail.value = ''
    roleIsAdmin.value = false
    adminStore.fetchRoles()
  } else {
    showToast(adminStore.error, 'error')
  }
}

onMounted(() => {
  adminStore.fetchRoles()
})
</script>

<template>
  <div class="min-h-[100dvh] bg-[#0a0a12] text-slate-200 font-sans">

    <AppHeader back-label="Volver al Inicio" back-to="/" />

    <div class="px-4 py-8 sm:px-6 max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Panel de Administración</h1>
        <p class="text-white/45 text-sm mt-1">Gestiona usuarios y permisos del sistema</p>
      </div>

      <div v-if="adminStore.error" class="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
        {{ adminStore.error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Crear Usuario -->
        <div class="bg-white/[0.03] border border-white/[0.05] p-6 rounded-2xl">
          <h2 class="text-xl font-semibold text-white mb-4">Crear Nueva Cuenta</h2>
          <form @submit.prevent="handleCreateUser" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs uppercase text-white/50 mb-1">Correo Electrónico</label>
              <input v-model="newEmail" type="email" class="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white outline-none focus:border-violet-500 transition-colors" required>
            </div>
            <div>
              <label class="block text-xs uppercase text-white/50 mb-1">Contraseña Temporal</label>
              <input v-model="newPassword" type="password" class="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white outline-none focus:border-violet-500 transition-colors" minlength="6" required>
            </div>
            <button type="submit" :disabled="adminStore.loading" class="mt-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ adminStore.loading ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </form>
        </div>

        <!-- Gestionar Roles -->
        <div class="bg-white/[0.03] border border-white/[0.05] p-6 rounded-2xl">
          <h2 class="text-xl font-semibold text-white mb-4">Gestionar Administradores</h2>
          <form @submit.prevent="handleSetRole" class="flex flex-col gap-4 mb-6">
            <div>
              <label class="block text-xs uppercase text-white/50 mb-1">Correo Electrónico</label>
              <input v-model="roleEmail" type="email" class="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white outline-none focus:border-violet-500 transition-colors" required>
            </div>
            <label class="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input v-model="roleIsAdmin" type="checkbox" class="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50">
              Otorgar permisos de Administrador
            </label>
            <button type="submit" :disabled="adminStore.loading" class="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ adminStore.loading ? 'Actualizando...' : 'Actualizar Rol' }}
            </button>
          </form>

          <h3 class="text-sm font-semibold text-white/60 uppercase mb-2">Administradores Actuales (Firestore)</h3>
          <ul class="text-sm text-white/80 space-y-1">
            <li v-for="r in adminStore.roles.filter(x => x.isAdmin)" :key="r.email" class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              {{ r.email }}
            </li>
            <li v-if="adminStore.roles.filter(x => x.isAdmin).length === 0" class="text-white/40 italic">Ninguno en base de datos.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Toast Notification (reemplaza alert nativo) -->
    <ToastNotification :message="toastMessage" :type="toastType" @close="toastMessage = ''" />
  </div>
</template>
