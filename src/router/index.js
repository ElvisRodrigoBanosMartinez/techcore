// src/router/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Configuración del router con Navigation Guards para rutas protegidas.
// Usamos un patrón "await auth ready" para evitar el flash de redireccionamiento
// mientras Firebase resuelve la sesión persistida.
// ─────────────────────────────────────────────────────────────────────────────
import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'

// ── Definición de rutas ───────────────────────────────────────────────────────
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }, // solo para usuarios NO autenticados
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }, // ruta protegida
  },
  {
    path: '/articulo/nuevo',
    name: 'article-create',
    component: () => import('@/views/ArticleCreate.vue'),
    meta: { requiresAuth: true }, // ruta protegida
  },
  {
    path: '/articulo/:id',
    name: 'article-detail',
    component: () => import('@/views/ArticleDetail.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  // Ruta catch-all → redirige a home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

// ── Helper: esperar a que Firebase resuelva el estado inicial de auth ─────────
// Evita el "flicker" de redireccionamiento al refrescar la página.
let authResolved = false

function waitForAuth() {
  if (authResolved) return Promise.resolve()
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      authResolved = true
      unsubscribe()
      resolve()
    })
  })
}

// ── Navigation Guard global ───────────────────────────────────────────────────
router.beforeEach(async (to) => {
  await waitForAuth()

  const isAuthenticated = !!auth.currentUser

  // Ruta protegida y sin sesión → Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Ruta de invitado (ej. /login) y ya tiene sesión → Home
  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
