import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Debug: Check if env vars are loaded
console.log('🔍 Firebase config check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  apiKeyPreview: firebaseConfig.apiKey?.substring(0, 10) + '...'
})

// Initialize Firebase with error handling
let app = null
let auth = null
let db = null

try {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    const errorMsg = import.meta.env.PROD 
      ? 'Firebase environment variables not found in Vercel. Redeploy after setting VITE_* env vars.'
      : 'Firebase config missing. Make sure .env file exists and dev server was restarted.'
    throw new Error(errorMsg)
  }
  
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
  if (import.meta.env.PROD) {
    console.error('💡 In Vercel: Set environment variables with VITE_ prefix and redeploy')
  } else {
    console.error('💡 Locally: Make sure frontend/.env exists and restart dev server (Ctrl+C then npm run dev)')
  }
}

// Export services (will be null if initialization failed)
export { auth, db }
export default app
