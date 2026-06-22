// src/utils/checkAdmin.js
// ─────────────────────────────────────────────────────────────────────────────
// Lógica centralizada para verificar si un usuario es administrador.
// Se consulta primero la lista de VITE_ADMIN_EMAILS (sin fallback peligroso)
// y luego la colección 'roles' en Firestore.
// ─────────────────────────────────────────────────────────────────────────────
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * Verifica si el email proporcionado corresponde a un administrador.
 *
 * Orden de verificación:
 * 1. Si el email está en la lista VITE_ADMIN_EMAILS → admin
 * 2. Si existe un documento en Firestore 'roles/{email}' con isAdmin === true → admin
 * 3. En cualquier otro caso → NO admin
 *
 * NOTA: Si VITE_ADMIN_EMAILS está vacío o no definido, NO se otorga admin
 * a todos (a diferencia del comportamiento anterior que era peligroso).
 *
 * @param {string|null|undefined} email
 * @returns {Promise<boolean>}
 */
export async function checkAdmin(email) {
  if (!email) return false

  // 1. Verificar contra la lista de emails en variables de entorno
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS
    ?.split(',')
    .map(e => e.trim())
    .filter(Boolean) || []

  if (adminEmails.includes(email)) return true

  // 2. Verificar en Firestore (colección 'roles')
  try {
    const snap = await getDoc(doc(db, 'roles', email))
    return snap.exists() && snap.data().isAdmin === true
  } catch {
    return false
  }
}
