// src/router/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Configuración del router con Navigation Guards para rutas protegidas.
// Usamos un patrón "await auth ready" para evitar el flash de redireccionamiento
// mientras Firebase resuelve la sesión persistida.
// ─────────────────────────────────────────────────────────────────────────────
import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

async function checkAdmin(email) {
  if (!email) return false
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || []
  if (adminEmails.length === 0 || adminEmails.includes(email)) return true
  try {
    const snap = await getDoc(doc(db, 'roles', email))
    return snap.exists() && snap.data().isAdmin === true
  } catch {
    return false
  }
}

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
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/articulo/:id',
    name: 'article-detail',
    component: () => import('@/views/ArticleDetail.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/articulo/:id/editar',
    name: 'article-edit',
    component: () => import('@/views/ArticleEdit.vue'),
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminPanel.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
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

  // Ruta requiere admin → consultar base de datos
  if (to.meta.requiresAdmin) {
    const email = auth.currentUser?.email
    const isAdmin = await checkAdmin(email)
    if (!isAdmin) {
      return { name: 'home' }
    }
  }
})

export default router
