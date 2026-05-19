// src/firebase/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Inicialización de Firebase usando la API modular (tree-shakeable).
// Reemplaza los valores de firebaseConfig con los de tu proyecto en:
// https://console.firebase.google.com → Configuración del proyecto → Tus apps
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyDXIJrWoQix3ni2KyQx_dzO6wUK4DYxQlM",
  authDomain: "techcore-e0fbb.firebaseapp.com",
  projectId: "techcore-e0fbb",
  storageBucket: "techcore-e0fbb.firebasestorage.app",
  messagingSenderId: "1018208820692",
  appId: "1:1018208820692:web:9e9b3c24895e32959c4a41"
}

// Inicializa la app de Firebase (singleton)
const app = initializeApp(firebaseConfig)

// Exporta los servicios que usaremos en toda la aplicación
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
