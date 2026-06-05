// src/stores/articles.js
// ─────────────────────────────────────────────────────────────────────────────
// Store de Pinia para CRUD de artículos contra Firestore.
// Usa onSnapshot para tiempo real en la lista y getDoc para el detalle.
// ─────────────────────────────────────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, query, orderBy, onSnapshot, serverTimestamp, limit
} from 'firebase/firestore'
import { db, storage } from '@/firebase/config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from '@/stores/auth'

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
      const ref = await addDoc(collection(db, COLLECTION), {
        title:     payload.title.trim(),
        excerpt:   payload.excerpt.trim(),
        content:   payload.content.trim(),
        category:  payload.category,
        tags:      payload.tags.map(t => t.trim().toLowerCase()).filter(Boolean),
        author: {
          uid:         auth.user.uid,
          displayName: auth.user.displayName || auth.user.email.split('@')[0],
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return ref.id
    } catch (e) {
      error.value = 'No se pudo guardar el artículo.'
      throw e
    }
  }

  // ── Actualizar artículo ───────────────────────────────────────────────────────
  async function updateArticle(id, payload) {
    error.value = null
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        ...payload,
        tags:      payload.tags?.map(t => t.trim().toLowerCase()).filter(Boolean),
        updatedAt: serverTimestamp(),
      })
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

  // ── Subir archivo a Storage ───────────────────────────────────────────────────
  async function uploadFile(file) {
    error.value = null
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileRef = storageRef(storage, `articles/${Date.now()}_${cleanName}`)
      await uploadBytes(fileRef, file)
      return await getDownloadURL(fileRef)
    } catch (e) {
      error.value = 'Error al subir el archivo.'
      throw e
    }
  }

  return {
    articles, loading, error, hasMore,
    subscribeToArticles, unsubscribeFromArticles, loadMore,
    fetchArticle, createArticle, updateArticle, deleteArticle, uploadFile,
  }
})
