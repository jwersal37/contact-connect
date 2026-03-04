import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuthStore } from './authStore'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth'

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Call the callback immediately with null user
    callback(null)
    // Return unsubscribe function
    return vi.fn()
  }),
}))

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAuthStore())
    act(() => {
      result.current.user = null
      result.current.loading = false
      result.current.error = null
    })
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should successfully create a new user account', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' }
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })
      updateProfile.mockResolvedValue()

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test User')
      })

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      )
      expect(updateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User'
      })
      expect(result.current.error).toBeNull()
    })

    it('should handle signup errors', async () => {
      const error = new Error('Email already in use')
      createUserWithEmailAndPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test User')
      })

      expect(result.current.error).toBe('Email already in use')
    })

    it('should return error if auth is not available', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Simulate auth being null
      const originalAuth = result.current.auth
      result.current.auth = null

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test User')
      })

      expect(result.current.error).toBe('Authentication not available')
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' }
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      )
      expect(result.current.error).toBeNull()
    })

    it('should handle signin errors', async () => {
      const error = new Error('Invalid email or password')
      signInWithEmailAndPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signIn('test@example.com', 'wrongpassword')
      })

      expect(result.current.error).toBe('Invalid email or password')
    })
  })

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      signOut.mockResolvedValue()

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signOut()
      })

      expect(signOut).toHaveBeenCalled()
      expect(result.current.error).toBeNull()
    })

    it('should handle signout errors', async () => {
      const error = new Error('Signout failed')
      signOut.mockRejectedValue(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.error).toBe('Signout failed')
    })
  })

  describe('clearError', () => {
    it('should clear the error state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.error = 'Some error'
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
