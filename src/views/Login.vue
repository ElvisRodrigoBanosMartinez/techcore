<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const email       = ref('')
const password    = ref('')
const isSubmitting = ref(false)

// ── Forgot Password ──────────────────────────────────────────────────────────
const showForgotPassword = ref(false)
const resetEmail         = ref('')
const resetSent          = ref(false)
const resetLoading       = ref(false)
const resetError         = ref('')

async function handleLogin() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)
    router.push(route.query.redirect || '/')
  } catch { /* error manejado en el store */ }
  finally { isSubmitting.value = false }
}

async function handleResetPassword() {
  if (resetLoading.value) return
  resetError.value = ''
  resetSent.value = false

  if (!resetEmail.value.trim()) {
    resetError.value = 'Ingresa tu correo electrónico.'
    return
  }

  resetLoading.value = true
  try {
    await auth.resetPassword(resetEmail.value.trim())
    resetSent.value = true
  } catch {
    resetError.value = auth.error || 'No se pudo enviar el correo.'
  } finally {
    resetLoading.value = false
  }
}

function openForgotPassword() {
  showForgotPassword.value = true
  resetEmail.value = email.value // pre-llenar con el email del login
  resetSent.value = false
  resetError.value = ''
  auth.error = null
}
</script>

<template>
  <!-- Fondo con gradiente y círculos decorativos -->
  <div class="relative min-h-screen flex items-center justify-center bg-[#0d0c1d] p-6 overflow-hidden font-sans">

    <!-- Orbes decorativos -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-700/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
    <div class="absolute top-1/2 left-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl animate-pulse [animation-delay:4s]"></div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-md bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-8 shadow-2xl shadow-black/40">

      <!-- Header -->
      <div class="flex flex-col items-center text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-900/50">
          <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">TechCore RRHH</h1>
        <p class="text-sm text-white/45 mt-1">Base de Conocimiento Empresarial</p>
      </div>

      <!-- ══ Login Form ══ -->
      <form v-if="!showForgotPassword" id="login-form" class="flex flex-col gap-4" @submit.prevent="handleLogin" novalidate>

        <!-- Error alert -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-1"
          leave-active-class="transition-all duration-150"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="auth.error"
            id="login-error-alert"
            class="flex items-center gap-2.5 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm"
            role="alert"
          >
            <svg class="w-4 h-4 flex-none" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            {{ auth.error }}
          </div>
        </Transition>

        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-[13px] font-medium text-white/60">Correo electrónico</label>
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
            </svg>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="tu@empresa.com"
              required
              class="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/10 rounded-xl text-white text-sm placeholder-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label for="password" class="text-[13px] font-medium text-white/60">Contraseña</label>
            <button
              type="button"
              class="text-[12px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
              @click="openForgotPassword"
            >¿Olvidaste tu contraseña?</button>
          </div>
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/>
            </svg>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              required
              class="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/10 rounded-xl text-white text-sm placeholder-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        <!-- Submit -->
        <button
          id="login-submit-btn"
          type="submit"
          :disabled="isSubmitting"
          class="mt-1 w-full py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-900/40 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
        >
          <span v-if="!isSubmitting">Iniciar Sesión</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Verificando...
          </span>
        </button>
      </form>

      <!-- ══ Forgot Password Form ══ -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex items-center gap-3 mb-2">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.12] transition-colors"
            @click="showForgotPassword = false; auth.error = null"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
            </svg>
          </button>
          <h2 class="text-lg font-semibold text-white">Restablecer contraseña</h2>
        </div>

        <p class="text-sm text-white/45 -mt-2">Te enviaremos un enlace para restablecer tu contraseña por correo electrónico.</p>

        <!-- Success message -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-1"
        >
          <div v-if="resetSent" class="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300 text-sm">
            <svg class="w-4 h-4 flex-none" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
            </svg>
            ¡Correo enviado! Revisa tu bandeja de entrada (y spam).
          </div>
        </Transition>

        <!-- Error message -->
        <div v-if="resetError" class="flex items-center gap-2.5 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
          <svg class="w-4 h-4 flex-none" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
          {{ resetError }}
        </div>

        <form @submit.prevent="handleResetPassword" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="reset-email" class="text-[13px] font-medium text-white/60">Correo electrónico</label>
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
              </svg>
              <input
                id="reset-email"
                v-model="resetEmail"
                type="email"
                autocomplete="email"
                placeholder="tu@empresa.com"
                required
                autofocus
                class="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/10 rounded-xl text-white text-sm placeholder-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="resetLoading || resetSent"
            class="w-full py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-900/40 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            <span v-if="resetLoading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Enviando...
            </span>
            <span v-else-if="resetSent">Correo enviado ✓</span>
            <span v-else>Enviar enlace de restablecimiento</span>
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-[11px] text-white/20">Sistema interno · Solo personal autorizado</p>
    </div>
  </div>
</template>
