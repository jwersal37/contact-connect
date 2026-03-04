import admin from 'firebase-admin'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

let db: admin.firestore.Firestore

export const initializeFirebase = () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'
    const serviceAccount = require(path.resolve(serviceAccountPath))

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })

    db = admin.firestore()
    console.log('✅ Firebase Admin initialized successfully')
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed - running in demo mode')
    // Don't throw - allow server to start without Firebase
  }
}

export const getFirestore = () => {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.')
  }
  return db
}

export const verifyToken = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    return decodedToken
  } catch (error) {
    throw new Error('Invalid authentication token')
  }
}

export { admin }
