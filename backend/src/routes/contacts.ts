import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getFirestore } from '../config/firebase'

const router = Router()

// Get all contacts for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getFirestore()
    const userId = req.user!.uid

    const snapshot = await db
      .collection('contacts')
      .where('userId', '==', userId)
      .orderBy('lastContact', 'desc')
      .get()

    const contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    res.json(contacts)
  } catch (error: any) {
    console.error('Error fetching contacts:', error)
    res.status(500).json({ error: 'Failed to fetch contacts', message: error.message })
  }
})

// Get single contact
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getFirestore()
    const userId = req.user!.uid
    const contactId = req.params.id

    const doc = await db.collection('contacts').doc(contactId).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const contact = doc.data()
    
    // Ensure user owns this contact
    if (contact?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ id: doc.id, ...contact })
  } catch (error: any) {
    console.error('Error fetching contact:', error)
    res.status(500).json({ error: 'Failed to fetch contact', message: error.message })
  }
})

// Create new contact
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getFirestore()
    const userId = req.user!.uid
    const { name, email, phone, reminderInterval, notes } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const contactData = {
      userId,
      name,
      email: email || null,
      phone: phone || null,
      reminderInterval: reminderInterval || 30,
      notes: notes || '',
      lastContact: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await db.collection('contacts').add(contactData)

    res.status(201).json({
      id: docRef.id,
      ...contactData,
    })
  } catch (error: any) {
    console.error('Error creating contact:', error)
    res.status(500).json({ error: 'Failed to create contact', message: error.message })
  }
})

// Update contact
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getFirestore()
    const userId = req.user!.uid
    const contactId = req.params.id

    const doc = await db.collection('contacts').doc(contactId).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const contact = doc.data()
    
    if (contact?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    }

    // Remove fields that shouldn't be updated
    delete updates.userId
    delete updates.createdAt

    await db.collection('contacts').doc(contactId).update(updates)

    res.json({ id: contactId, ...updates })
  } catch (error: any) {
    console.error('Error updating contact:', error)
    res.status(500).json({ error: 'Failed to update contact', message: error.message })
  }
})

// Delete contact
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getFirestore()
    const userId = req.user!.uid
    const contactId = req.params.id

    const doc = await db.collection('contacts').doc(contactId).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const contact = doc.data()
    
    if (contact?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await db.collection('contacts').doc(contactId).delete()

    res.json({ message: 'Contact deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting contact:', error)
    res.status(500).json({ error: 'Failed to delete contact', message: error.message })
  }
})

// Log interaction with contact
router.post('/:id/interactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getFirestore()
    const userId = req.user!.uid
    const contactId = req.params.id
    const { type, note, source } = req.body

    const doc = await db.collection('contacts').doc(contactId).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const contact = doc.data()
    
    if (contact?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const interactionData = {
      type: type || 'manual',
      note: note || '',
      source: source || 'manual',
      timestamp: new Date().toISOString(),
    }

    // Add interaction to subcollection
    await db
      .collection('contacts')
      .doc(contactId)
      .collection('interactions')
      .add(interactionData)

    // Update lastContact on the contact
    await db.collection('contacts').doc(contactId).update({
      lastContact: new Date().toISOString(),
    })

    res.status(201).json(interactionData)
  } catch (error: any) {
    console.error('Error logging interaction:', error)
    res.status(500).json({ error: 'Failed to log interaction', message: error.message })
  }
})

// Get interaction history for contact
router.get('/:id/interactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getFirestore()
    const userId = req.user!.uid
    const contactId = req.params.id

    const doc = await db.collection('contacts').doc(contactId).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const contact = doc.data()
    
    if (contact?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const snapshot = await db
      .collection('contacts')
      .doc(contactId)
      .collection('interactions')
      .orderBy('timestamp', 'desc')
      .get()

    const interactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    res.json(interactions)
  } catch (error: any) {
    console.error('Error fetching interactions:', error)
    res.status(500).json({ error: 'Failed to fetch interactions', message: error.message })
  }
})

export default router
