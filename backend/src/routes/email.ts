import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// OAuth callback placeholder for Gmail integration
router.get('/google/callback', async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement Gmail OAuth flow
    // 1. Exchange authorization code for tokens
    // 2. Store tokens in Firestore for the user
    // 3. Set up webhook/polling for new emails
    
    res.json({ message: 'Email integration coming soon!' })
  } catch (error: any) {
    console.error('Error in OAuth callback:', error)
    res.status(500).json({ error: 'OAuth callback failed', message: error.message })
  }
})

// Connect Gmail account
router.post('/connect/gmail', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement Gmail connection
    // Generate OAuth URL and return to frontend
    
    res.json({ message: 'Gmail connection coming soon!' })
  } catch (error: any) {
    console.error('Error connecting Gmail:', error)
    res.status(500).json({ error: 'Failed to connect Gmail', message: error.message })
  }
})

export default router
