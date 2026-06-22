// src/stores/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Store de Pinia para autenticación con Firebase.
// Maneja: login con email/password, logout y escucha en tiempo real el estado
// del usuario con onAuthStateChanged (persistencia automática de sesión).
// ─────────────────────────────────────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import { checkAdmin } from '@/utils/checkAdmin'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const user = ref(null)           // objeto User de Firebase o null
  const loading = ref(true)        // true mientras se verifica la sesión inicial
  const error = ref(null)          // mensaje de error legible por el usuario

  // ── Getters ─────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.email?.split('@')[0] ?? '')
  const isAdmin = ref(false)

  // ── Acciones ─────────────────────────────────────────────────────────────────

  /**
   * Inicia sesión con email y contraseña.
   * Lanza un string de error legible si algo sale mal.
   */
  async function login(email, password) {
    error.value = null
    loading.value = true
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      error.value = mapFirebaseError(e.code)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  async function logout() {
    error.value = null
    try {
      await signOut(auth)
      user.value = null
    } catch (e) {
      error.value = 'Error al cerrar sesión. Inténtalo de nuevo.'
      throw e
    }
  }

  /**
   * Cambia la contraseña del usuario actual pidiendo la antigua por seguridad.
   */
  async function changePassword(oldPassword, newPassword) {
    error.value = null
    try {
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.email) throw new Error('No hay usuario activo.')
      
      // 1. Reautenticar (Validar contraseña actual)
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword)
      await reauthenticateWithCredential(currentUser, credential)

      // 2. Actualizar contraseña
      await updatePassword(currentUser, newPassword)
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        error.value = 'La contraseña actual es incorrecta.'
      } else {
        error.value = mapFirebaseError(e.code)
      }
      throw e
    }
  }

  /**
   * Suscribe al listener de Firebase para mantener el estado sincronizado.
   * Llámalo una sola vez en App.vue o main.js.
   * Retorna la función de limpieza (unsubscribe) para evitar memory leaks.
   */
  function initAuthListener() {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        isAdmin.value = await checkAdmin(firebaseUser.email)
      } else {
        isAdmin.value = false
      }
      loading.value = false
    })
  }

  /**
   * Envía un correo de restablecimiento de contraseña.
   * @param {string} email
   */
  async function resetPassword(email) {
    error.value = null
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (e) {
      error.value = mapFirebaseError(e.code)
      throw e
    }
  }

  // ── Utilidades ───────────────────────────────────────────────────────────────
  function mapFirebaseError(code) {
    const messages = {
      'auth/user-not-found':     'No existe una cuenta con ese correo.',
      'auth/wrong-password':     'Contraseña incorrecta.',
      'auth/invalid-email':      'El formato del correo no es válido.',
      'auth/too-many-requests':  'Demasiados intentos. Espera un momento.',
      'auth/user-disabled':      'Esta cuenta ha sido deshabilitada.',
      'auth/invalid-credential': 'Credenciales incorrectas. Verifica tus datos.',
    }
    return messages[code] ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.'
  }

  return {
    // estado
    user,
    loading,
    error,
    // getters
    isAuthenticated,
    userDisplayName,
    isAdmin,
    // acciones
    login,
    logout,
    changePassword,
    resetPassword,
    initAuthListener,
  }
})
