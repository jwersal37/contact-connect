import { create } from 'zustand'

const STORAGE_KEY = 'contactconnect_contacts'

// Helper to load contacts from localStorage
const loadContacts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error loading contacts:', error)
    return []
  }
}

// Helper to save contacts to localStorage
const saveContacts = (contacts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch (error) {
    console.error('Error saving contacts:', error)
  }
}

export const useContactStore = create((set, get) => ({
  contacts: loadContacts(),
  loading: false,
  error: null,

  // Load contacts (called on mount)
  loadContacts: () => {
    const contacts = loadContacts()
    set({ contacts, loading: false })
  },

  // Add new contact
  addContact: async (userId, contactData) => {
    const newContact = {
      id: Date.now().toString(),
      ...contactData,
      userId,
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      interactions: []
    }

    const contacts = [...get().contacts, newContact]
    saveContacts(contacts)
    set({ contacts })
    return { success: true, id: newContact.id }
  },

  // Update contact
  updateContact: async (contactId, updates) => {
    const contacts = get().contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
        : contact
    )
    
    saveContacts(contacts)
    set({ contacts })
    return { success: true }
  },

  // Delete contact
  deleteContact: async (contactId) => {
    const contacts = get().contacts.filter(contact => contact.id !== contactId)
    saveContacts(contacts)
    set({ contacts })
    return { success: true }
  },

  // Log interaction
  logInteraction: async (contactId, interactionData) => {
    const contacts = get().contacts.map(contact => {
      if (contact.id === contactId) {
        const interaction = {
          id: Date.now().toString(),
          ...interactionData,
          timestamp: new Date().toISOString(),
        }
        return {
          ...contact,
          lastContact: new Date().toISOString(),
          interactions: [...(contact.interactions || []), interaction]
        }
      }
      return contact
    })

    saveContacts(contacts)
    set({ contacts })
    return { success: true }
  },
}))
