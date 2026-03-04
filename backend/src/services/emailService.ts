import nodemailer from 'nodemailer'
import { Contact } from './reminderService'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Send reminder email to user about overdue contacts
 */
export const sendReminderEmail = async (
  userEmail: string,
  overdueContacts: Contact[]
): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured, skipping email')
    return
  }

  try {
    const transporter = createTransporter()

    const contactsList = overdueContacts
      .map(contact => {
        const daysSince = Math.floor(
          (new Date().getTime() - new Date(contact.lastContact).getTime()) / (1000 * 60 * 60 * 24)
        )
        return `• ${contact.name}${contact.email ? ` (${contact.email})` : ''} - ${daysSince} days ago`
      })
      .join('\n')

    const mailOptions = {
      from: `ContactConnect <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `📱 ${overdueContacts.length} contact${overdueContacts.length > 1 ? 's' : ''} need${overdueContacts.length === 1 ? 's' : ''} your attention`,
      text: `Hi there!

You haven't talked to these contacts in a while:

${contactsList}

Don't let these relationships fade! Take a few minutes today to reach out.

Login to ContactConnect: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

---
ContactConnect - Stay connected with the people who matter
`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .contact-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .contact-item { padding: 12px; border-left: 4px solid #667eea; margin-bottom: 12px; background: #f9fafb; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📱 Time to Reconnect!</h1>
    </div>
    <div class="content">
      <p>Hi there!</p>
      <p>You haven't talked to these contacts in a while:</p>
      <div class="contact-list">
        ${overdueContacts.map(contact => {
          const daysSince = Math.floor(
            (new Date().getTime() - new Date(contact.lastContact).getTime()) / (1000 * 60 * 60 * 24)
          )
          return `
            <div class="contact-item">
              <strong>${contact.name}</strong>
              ${contact.email ? `<br><small>${contact.email}</small>` : ''}
              <br><small style="color: #dc2626;">${daysSince} days since last contact</small>
            </div>
          `
        }).join('')}
      </div>
      <p>Don't let these relationships fade! Take a few minutes today to reach out.</p>
      <center>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
          Open ContactConnect
        </a>
      </center>
    </div>
    <div class="footer">
      <p>ContactConnect - Stay connected with the people who matter</p>
    </div>
  </div>
</body>
</html>
`,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Reminder email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending reminder email:', error)
    throw error
  }
}
