<!-- src/views/Login.vue -->
<!--
  Vista de Login conectada al auth store de Pinia.
  Diseño con glassmorphism, gradiente de fondo y animaciones suaves.
  Usa Tailwind CSS utility classes.
-->
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const email    = ref('')
const password = ref('')
const isSubmitting = ref(false)

async function handleLogin() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    await auth.login(email.value, password.value)
    // Redirige a la ruta original si venía de un guard, si no al home
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch {
    // El error ya lo maneja el store en auth.error
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Fondo decorativo con círculos animados -->
    <div class="bg-decoration">
      <span class="circle circle-1"></span>
      <span class="circle circle-2"></span>
      <span class="circle circle-3"></span>
    </div>

    <!-- Tarjeta de login -->
    <div class="login-card">
      <!-- Logo / Encabezado -->
      <div class="login-header">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="login-title">TechCore RRHH</h1>
        <p class="login-subtitle">Base de Conocimiento Empresarial</p>
      </div>

      <!-- Formulario -->
      <form id="login-form" class="login-form" @submit.prevent="handleLogin" novalidate>
        <!-- Alerta de error -->
        <Transition name="fade">
          <div v-if="auth.error" id="login-error-alert" class="error-alert" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            <span>{{ auth.error }}</span>
          </div>
        </Transition>

        <!-- Campo email -->
        <div class="form-group">
          <label for="email" class="form-label">Correo electrónico</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="input-icon">
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
            </svg>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="tu@empresa.com"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Campo contraseña -->
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="input-icon">
              <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/>
            </svg>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Botón de submit -->
        <button
          id="login-submit-btn"
          type="submit"
          class="login-btn"
          :class="{ loading: isSubmitting }"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Iniciar Sesión</span>
          <span v-else class="btn-loading">
            <span class="spinner"></span>
            Verificando...
          </span>
        </button>
      </form>

      <p class="login-footer">
        Sistema interno · Solo personal autorizado
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ── Fuente ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ── Página completa ── */
.login-page {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

/* ── Decoración de fondo ── */
.bg-decoration { position: absolute; inset: 0; pointer-events: none; }

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
  animation: float 8s ease-in-out infinite;
}
.circle-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #7c3aed, transparent);
  top: -100px; left: -100px;
  animation-delay: 0s;
}
.circle-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #2563eb, transparent);
  bottom: -80px; right: -80px;
  animation-delay: -3s;
}
.circle-3 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, #7c3aed, transparent);
  top: 60%; left: 60%;
  animation-delay: -6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(-20px) scale(1.05); }
}

/* ── Tarjeta ── */
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* ── Encabezado ── */
.login-header { text-align: center; margin-bottom: 2rem; }

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px; height: 64px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  border-radius: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
}
.logo-icon svg {
  width: 32px; height: 32px;
  color: white;
  stroke: white;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}
.login-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* ── Formulario ── */
.login-form { display: flex; flex-direction: column; gap: 1.25rem; }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.02em;
}

.input-wrapper { position: relative; }

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem; height: 1rem;
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
  flex-shrink: 0;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.875rem 0.75rem 2.625rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  color: #fff;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}
.form-input::placeholder { color: rgba(255, 255, 255, 0.25); }
.form-input:focus {
  border-color: rgba(124, 58, 237, 0.7);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
}

/* ── Alerta de error ── */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #fca5a5;
  font-size: 0.875rem;
}
.alert-icon { width: 1rem; height: 1rem; flex-shrink: 0; }

/* ── Botón ── */
.login-btn {
  margin-top: 0.5rem;
  padding: 0.875rem;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
}
.login-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(124, 58, 237, 0.5);
}
.login-btn:active:not(:disabled) { transform: translateY(0); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.spinner {
  display: inline-block;
  width: 1rem; height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Footer ── */
.login-footer {
  margin: 1.5rem 0 0;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.25);
}

/* ── Transición fade para error ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
