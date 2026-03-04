import cron from 'node-cron'
import { getFirestore } from '../config/firebase'
import { sendReminderEmail } from './emailService'

export interface Contact {
  id: string
  userId: string
  name: string
  email?: string
  phone?: string
  reminderInterval: number
  lastContact: string
  notes?: string
}

/**
 * Get contacts that are overdue for a check-in
 */
export const getOverdueContacts = async (userId: string): Promise<Contact[]> => {
  const db = getFirestore()
  const now = new Date()

  try {
    const snapshot = await db
      .collection('contacts')
      .where('userId', '==', userId)
      .get()

    const overdueContacts: Contact[] = []

    snapshot.forEach(doc => {
      const contact = { id: doc.id, ...doc.data() } as Contact
      const lastContactDate = new Date(contact.lastContact)
      const daysSinceContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceContact > contact.reminderInterval) {
        overdueContacts.push(contact)
      }
    })

    return overdueContacts
  } catch (error) {
    console.error('Error fetching overdue contacts:', error)
    throw error
  }
}

/**
 * Check all users for overdue contacts and send reminders
 */
export const checkAndSendReminders = async () => {
  console.log('🔍 Checking for overdue contacts...')
  
  try {
    const db = getFirestore()
    
    // Get all unique user IDs with contacts
    const contactsSnapshot = await db.collection('contacts').get()
    const userIds = new Set<string>()
    
    contactsSnapshot.forEach(doc => {
      const contact = doc.data()
      if (contact.userId) {
        userIds.add(contact.userId)
      }
    })

    console.log(`Found ${userIds.size} users with contacts`)

    // Check each user's contacts
    for (const userId of userIds) {
      try {
        // Get user email from Firebase Auth
        const userRecord = await require('./firebase').admin.auth().getUser(userId)
        const userEmail = userRecord.email

        if (!userEmail) {
          console.log(`⚠️ User ${userId} has no email, skipping`)
          continue
        }

        // Get overdue contacts for this user
        const overdueContacts = await getOverdueContacts(userId)

        if (overdueContacts.length > 0) {
          console.log(`📧 User ${userEmail} has ${overdueContacts.length} overdue contacts`)
          
          // Send reminder email
          await sendReminderEmail(userEmail, overdueContacts)
          
          console.log(`✅ Sent reminder to ${userEmail}`)
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error)
      }
    }

    console.log('✅ Reminder check completed')
  } catch (error) {
    console.error('❌ Error in reminder cron job:', error)
  }
}

/**
 * Start the cron job to check for reminders daily at 9 AM
 */
export const startReminderCron = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', checkAndSendReminders, {
    timezone: 'America/New_York' // Adjust to your timezone
  })

  console.log('⏰ Reminder cron job scheduled for 9:00 AM daily')

  // For testing: also run every hour
  if (process.env.NODE_ENV === 'development') {
    cron.schedule('0 * * * *', checkAndSendReminders)
    console.log('🧪 Development mode: Also checking every hour')
  }
}
