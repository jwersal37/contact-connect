import { create } from 'zustand'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../firebase/config'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  // Initialize - listen to Firebase auth state
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({ 
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          },
          loading: false 
        })
      } else {
        set({ user: null, loading: false })
      }
    })
    
    return unsubscribe
  },

  // Sign up with email and password
  signUp: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName })
      
      set({ 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          displayName,
        }
      })
      
      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      let errorMessage = 'Failed to create account'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      }
      
      return { success: false, error: errorMessage }
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      set({ 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        }
      })
      
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      let errorMessage = 'Failed to sign in'
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later'
      }
      
      return { success: false, error: errorMessage }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await firebaseSignOut(auth)
      set({ user: null })
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: 'Failed to sign out' }
    }
  },
}))

// Initialize on load
useAuthStore.getState().initialize()
