import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContactStore } from './contactStore'
import { 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore'

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  arrayUnion: vi.fn((value) => value),
}))

describe('ContactStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useContactStore())
    act(() => {
      result.current.contacts = []
      result.current.loading = false
      result.current.error = null
    })
    vi.clearAllMocks()
  })

  describe('subscribeToContacts', () => {
    it('should set up real-time listener for user contacts', () => {
      const mockUnsubscribe = vi.fn()
      onSnapshot.mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useContactStore())

      act(() => {
        result.current.subscribeToContacts('user123')
      })

      expect(collection).toHaveBeenCalled()
      expect(query).toHaveBeenCalled()
      expect(where).toHaveBeenCalledWith('userId', '==', 'user123')
      expect(onSnapshot).toHaveBeenCalled()
    })

    it('should update contacts when snapshot changes', () => {
      const mockContacts = [
        { id: '1', data: () => ({ name: 'John Doe', email: 'john@example.com' }) },
        { id: '2', data: () => ({ name: 'Jane Smith', email: 'jane@example.com' }) },
      ]

      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockContacts })
        return vi.fn()
      })

      const { result } = renderHook(() => useContactStore())

      act(() => {
        result.current.subscribeToContacts('user123')
      })

      expect(result.current.contacts).toHaveLength(2)
      expect(result.current.contacts[0].name).toBe('John Doe')
      expect(result.current.contacts[1].name).toBe('Jane Smith')
    })

    it('should handle errors in snapshot listener', () => {
      onSnapshot.mockImplementation((query, callback, errorCallback) => {
        errorCallback(new Error('Failed to fetch contacts'))
        return vi.fn()
      })

      const { result } = renderHook(() => useContactStore())

      act(() => {
        result.current.subscribeToContacts('user123')
      })

      expect(result.current.error).toBe('Failed to fetch contacts')
    })
  })

  describe('addContact', () => {
    it('should add a new contact to Firestore', async () => {
      const mockDocRef = { id: 'new-contact-id' }
      addDoc.mockResolvedValue(mockDocRef)

      const { result } = renderHook(() => useContactStore())

      const newContact = {
        name: 'New Contact',
        email: 'new@example.com',
        phone: '123-456-7890',
        frequency: 7,
        notes: 'Test note',
      }

      await act(async () => {
        await result.current.addContact('user123', newContact)
      })

      expect(addDoc).toHaveBeenCalled()
      expect(result.current.error).toBeNull()
    })

    it('should handle errors when adding contact fails', async () => {
      addDoc.mockRejectedValue(new Error('Failed to add contact'))

      const { result } = renderHook(() => useContactStore())

      await act(async () => {
        await result.current.addContact('user123', { name: 'Test' })
      })

      expect(result.current.error).toBe('Failed to add contact')
    })

    it('should return error if database is not available', async () => {
      const { result } = renderHook(() => useContactStore())

      await act(async () => {
        await result.current.addContact('user123', { name: 'Test' })
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('updateContact', () => {
    it('should update an existing contact', async () => {
      updateDoc.mockResolvedValue()
      doc.mockReturnValue({ id: 'contact123' })

      const { result } = renderHook(() => useContactStore())

      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com',
      }

      await act(async () => {
        await result.current.updateContact('contact123', updates)
      })

      expect(doc).toHaveBeenCalled()
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(updates)
      )
      expect(result.current.error).toBeNull()
    })

    it('should handle update errors', async () => {
      updateDoc.mockRejectedValue(new Error('Failed to update'))

      const { result } = renderHook(() => useContactStore())

      await act(async () => {
        await result.current.updateContact('contact123', { name: 'Test' })
      })

      expect(result.current.error).toBe('Failed to update')
    })
  })

  describe('deleteContact', () => {
    it('should delete a contact from Firestore', async () => {
      deleteDoc.mockResolvedValue()
      doc.mockReturnValue({ id: 'contact123' })

      const { result } = renderHook(() => useContactStore())

      await act(async () => {
        await result.current.deleteContact('contact123')
      })

      expect(doc).toHaveBeenCalled()
      expect(deleteDoc).toHaveBeenCalled()
      expect(result.current.error).toBeNull()
    })

    it('should handle delete errors', async () => {
      deleteDoc.mockRejectedValue(new Error('Failed to delete'))

      const { result } = renderHook(() => useContactStore())

      await act(async () => {
        await result.current.deleteContact('contact123')
      })

      expect(result.current.error).toBe('Failed to delete')
    })
  })

  describe('logInteraction', () => {
    it('should log an interaction with a contact', async () => {
      updateDoc.mockResolvedValue()
      doc.mockReturnValue({ id: 'contact123' })

      const { result } = renderHook(() => useContactStore())

      await act(async () => {
        await result.current.logInteraction('contact123')
      })

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          lastInteraction: expect.anything(),
        })
      )
      expect(result.current.error).toBeNull()
    })

    it('should handle interaction logging errors', async () => {
      updateDoc.mockRejectedValue(new Error('Failed to log interaction'))

      const { result } = renderHook(() => useContactStore())

      await act(async () => {
        await result.current.logInteraction('contact123')
      })

      expect(result.current.error).toBe('Failed to log interaction')
    })
  })

  describe('clearError', () => {
    it('should clear the error state', () => {
      const { result } = renderHook(() => useContactStore())

      act(() => {
        result.current.error = 'Some error'
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
