// src/stores/articles.js
// ─────────────────────────────────────────────────────────────────────────────
// Store de Pinia para CRUD de artículos contra Firestore.
// Usa onSnapshot para tiempo real en la lista y getDoc para el detalle.
// ─────────────────────────────────────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp, limit
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import { getCloudinaryResourceType } from '@/utils/markdownMedia'

const COLLECTION = 'articles'

export const useArticlesStore = defineStore('articles', () => {
  // ── Estado ───────────────────────────────────────────────────────────────────
  const articles     = ref([])
  const loading      = ref(false)
  const error        = ref(null)
  const currentLimit = ref(30)
  const hasMore      = ref(true)
  let   _unsub       = null   // función de limpieza del listener

  // ── Listener en tiempo real ───────────────────────────────────────────────────
  /**
   * Suscribe a la colección ordenada por fecha descendente con límite.
   * Retorna la función unsubscribe para llamar en onUnmounted.
   */
  function subscribeToArticles() {
    loading.value = true
    error.value   = null

    if (_unsub) _unsub() // limpiar listener previo si recargamos

    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(currentLimit.value)
    )

    _unsub = onSnapshot(
      q,
      (snapshot) => {
        articles.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        hasMore.value  = snapshot.docs.length === currentLimit.value
        loading.value  = false
        _invalidateSearchCache() // invalidar caché de búsqueda cuando cambian datos
      },
      (err) => {
        error.value   = 'Error al cargar los artículos.'
        loading.value = false
        console.error('[articles store]', err)
      }
    )

    return _unsub
  }

  function loadMore() {
    if (!hasMore.value) return
    currentLimit.value += 30
    subscribeToArticles()
  }

  function unsubscribeFromArticles() {
    if (_unsub) { _unsub(); _unsub = null }
  }

  // ── Búsqueda full-text local ───────────────────────────────────────────────
  // Para un sistema interno de RRHH (<1000 artículos), descargamos todos
  // y filtramos en el cliente cuando el usuario busca.
  const allArticlesCache = ref([])
  const searchLoading    = ref(false)

  async function searchAllArticles() {
    // Si ya tenemos todo cacheado, no recargar
    if (allArticlesCache.value.length > 0) return allArticlesCache.value

    searchLoading.value = true
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      allArticlesCache.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      return allArticlesCache.value
    } catch (err) {
      console.error('[articles store] search error', err)
      return articles.value // fallback a lo ya cargado
    } finally {
      searchLoading.value = false
    }
  }

  // Invalidar caché cuando cambian los artículos via snapshot
  function _invalidateSearchCache() {
    allArticlesCache.value = []
  }

  // ── Obtener un artículo por ID ────────────────────────────────────────────────
  async function fetchArticle(id) {
    error.value = null
    try {
      const snap = await getDoc(doc(db, COLLECTION, id))
      if (!snap.exists()) throw new Error('Artículo no encontrado.')
      return { id: snap.id, ...snap.data() }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // ── Crear artículo ────────────────────────────────────────────────────────────
  async function createArticle(payload) {
    const auth = useAuthStore()
    error.value = null
    try {
      // Calcular tiempo de lectura estimado
      const wordCount = payload.content.trim().split(/\s+/).length
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min lectura`

      const docRef = await addDoc(collection(db, COLLECTION), {
        title:     payload.title.trim(),
        excerpt:   payload.excerpt.trim(),
        content:   payload.content.trim(),
        category:  payload.category,
        tags:      payload.tags.map(t => t.trim().toLowerCase()).filter(Boolean),
        readTime,
        author: {
          uid:         auth.user.uid,
          displayName: auth.user.displayName || auth.user.email.split('@')[0],
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (e) {
      error.value = 'No se pudo guardar el artículo.'
      throw e
    }
  }

  // ── Actualizar artículo ───────────────────────────────────────────────────────
  async function updateArticle(id, payload) {
    error.value = null
    try {
      // Recalcular tiempo de lectura si se actualizó el contenido
      const updates = {
        ...payload,
        tags:      payload.tags?.map(t => t.trim().toLowerCase()).filter(Boolean),
        updatedAt: serverTimestamp(),
      }
      if (payload.content) {
        const wordCount = payload.content.trim().split(/\s+/).length
        updates.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min lectura`
      }
      await updateDoc(doc(db, COLLECTION, id), updates)
    } catch (e) {
      error.value = 'No se pudo actualizar el artículo.'
      throw e
    }
  }

  // ── Eliminar artículo ─────────────────────────────────────────────────────────
  async function deleteArticle(id) {
    error.value = null
    try {
      await deleteDoc(doc(db, COLLECTION, id))
    } catch (e) {
      error.value = 'No se pudo eliminar el artículo.'
      throw e
    }
  }

  // ── Subir archivo a Cloudinary ────────────────────────────────────────────────
  async function uploadFile(file) {
    error.value = null
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary no está configurado. Verifica las variables de entorno.')
      }
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const resourceType = getCloudinaryResourceType(file)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Error de Cloudinary')
      
      return data.secure_url // Devuelve la URL pública del archivo
    } catch (e) {
      error.value = 'Error al subir el archivo.'
      console.error('[Cloudinary Error]', e)
      throw e
    }
  }

  return {
    articles, loading, error, hasMore, searchLoading,
    subscribeToArticles, unsubscribeFromArticles, loadMore,
    searchAllArticles,
    fetchArticle, createArticle, updateArticle, deleteArticle, uploadFile,
  }
})
