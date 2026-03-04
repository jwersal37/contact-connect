import { create } from 'zustand'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'

export const useContactStore = create((set, get) => ({
  contacts: [],
  loading: false,
  error: null,
  unsubscribe: null,

  // Subscribe to contacts for current user
  subscribeToContacts: (userId) => {
    // Unsubscribe from previous listener if exists
    const currentUnsubscribe = get().unsubscribe
    if (currentUnsubscribe) {
      currentUnsubscribe()
    }

    set({ loading: true, error: null })

    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const contacts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to ISO strings
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          lastContact: doc.data().lastContact?.toDate?.()?.toISOString() || doc.data().lastContact,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
          interactions: (doc.data().interactions || []).map(interaction => ({
            ...interaction,
            timestamp: interaction.timestamp?.toDate?.()?.toISOString() || interaction.timestamp
          }))
        }))
        
        set({ contacts, loading: false, error: null })
      },
      (error) => {
        console.error('Error fetching contacts:', error)
        set({ error: error.message, loading: false })
      }
    )

    set({ unsubscribe })
    return unsubscribe
  },

  // Unsubscribe from contacts
  unsubscribeFromContacts: () => {
    const unsubscribe = get().unsubscribe
    if (unsubscribe) {
      unsubscribe()
      set({ unsubscribe: null, contacts: [] })
    }
  },

  // Add new contact
  addContact: async (userId, contactData) => {
    try {
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...contactData,
        userId,
        createdAt: serverTimestamp(),
        lastContact: serverTimestamp(),
        interactions: []
      })
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Error adding contact:', error)
      return { success: false, error: error.message }
    }
  },

  // Update contact
  updateContact: async (contactId, updates) => {
    try {
      const contactRef = doc(db, 'contacts', contactId)
      await updateDoc(contactRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating contact:', error)
      return { success: false, error: error.message }
    }
  },

  // Delete contact
  deleteContact: async (contactId) => {
    try {
      await deleteDoc(doc(db, 'contacts', contactId))
      return { success: true }
    } catch (error) {
      console.error('Error deleting contact:', error)
      return { success: false, error: error.message }
    }
  },

  // Log interaction
  logInteraction: async (contactId, interactionData) => {
    try {
      const contact = get().contacts.find(c => c.id === contactId)
      if (!contact) {
        return { success: false, error: 'Contact not found' }
      }

      const interaction = {
        ...interactionData,
        timestamp: Timestamp.now()
      }

      const contactRef = doc(db, 'contacts', contactId)
      await updateDoc(contactRef, {
        lastContact: serverTimestamp(),
        interactions: [...(contact.interactions || []), interaction]
      })

      return { success: true }
    } catch (error) {
      console.error('Error logging interaction:', error)
      return { success: false, error: error.message }
    }
  },
}))
