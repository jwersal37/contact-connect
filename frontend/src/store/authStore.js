import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,

  // Initialize - check localStorage
  initialize: () => {
    const savedUser = localStorage.getItem('contactconnect_user')
    if (savedUser) {
      set({ user: JSON.parse(savedUser), loading: false })
    } else {
      set({ user: null, loading: false })
    }
  },

  // Sign in - just save name to localStorage
  signIn: async (name) => {
    if (!name || name.trim() === '') {
      return { success: false, error: 'Please enter your name' }
    }
    
    const user = {
      id: Date.now().toString(),
      displayName: name.trim(),
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('contactconnect_user', JSON.stringify(user))
    set({ user })
    return { success: true }
  },

  // Sign out
  signOut: async () => {
    localStorage.removeItem('contactconnect_user')
    set({ user: null })
    return { success: true }
  },
}))

// Initialize on load
useAuthStore.getState().initialize()
