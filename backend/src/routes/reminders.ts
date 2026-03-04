import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getOverdueContacts } from '../services/reminderService'

const router = Router()

// Get overdue contacts for authenticated user
router.get('/overdue', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.uid
    const overdueContacts = await getOverdueContacts(userId)
    
    res.json(overdueContacts)
  } catch (error: any) {
    console.error('Error fetching overdue contacts:', error)
    res.status(500).json({ error: 'Failed to fetch overdue contacts', message: error.message })
  }
})

export default router
