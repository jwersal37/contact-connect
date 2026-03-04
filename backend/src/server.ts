import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeFirebase } from './config/firebase'
import contactRoutes from './routes/contacts'
import reminderRoutes from './routes/reminders'
import emailRoutes from './routes/email'
import { startReminderCron } from './services/reminderService'

// Load environment variables
dotenv.config()

// Initialize Express app
const app: Application = express()
const PORT = process.env.PORT || 5000

// Initialize Firebase Admin (non-blocking)
try {
  initializeFirebase()
} catch (error) {
  console.warn('⚠️  Firebase initialization failed. API will run in demo mode.')
  console.warn('   To enable Firebase features, configure valid credentials in backend/.env')
}

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'ContactConnect API is running' })
})

// Routes
app.use('/api/contacts', contactRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/email', emailRoutes)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err.stack)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}/api`)
  
  // Start cron jobs
  startReminderCron()
  console.log('⏰ Reminder cron job started')
})

export default app
