import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, getDocs, collection } from 'firebase/firestore'
import { secondaryAuth, db } from '@/firebase/config'

export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false)
  const error = ref(null)

  async function createUser(email, password) {
    loading.value = true
    error.value = null
    try {
      await createUserWithEmailAndPassword(secondaryAuth, email, password)
      await signOut(secondaryAuth)
    } catch (e) {
      error.value = 'Error al crear usuario: ' + e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function setRole(email, isAdmin) {
    loading.value = true
    error.value = null
    try {
      await setDoc(doc(db, 'roles', email), { isAdmin }, { merge: true })
    } catch (e) {
      error.value = 'Error al actualizar rol.'
      throw e
    } finally {
      loading.value = false
    }
  }

  const roles = ref([])
  async function fetchRoles() {
    loading.value = true
    try {
      const snap = await getDocs(collection(db, 'roles'))
      roles.value = snap.docs.map(d => ({ email: d.id, ...d.data() }))
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return { loading, error, roles, createUser, setRole, fetchRoles }
})
