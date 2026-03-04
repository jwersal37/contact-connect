import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase with error handling
let app = null
let auth = null
let db = null
let messaging = null

try {
  // Check if we have valid config
  if (firebaseConfig.apiKey && firebaseConfig.projectId && !firebaseConfig.apiKey.includes('demo')) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    
    // Initialize Firebase Cloud Messaging (only if supported)
    isSupported().then(supported => {
      if (supported) {
        messaging = getMessaging(app)
      }
    }).catch(() => {
      console.warn('Firebase Messaging not supported')
    })
    
    console.log('✅ Firebase initialized successfully')
  } else {
    console.warn('⚠️ Firebase not configured. Using demo mode. Add real Firebase credentials to enable authentication.')
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error.message)
  console.warn('   The app will run in demo mode. Configure Firebase credentials to enable full functionality.')
}

export { auth, db, messaging }
export default app
