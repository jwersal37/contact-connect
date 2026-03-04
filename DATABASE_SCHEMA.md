# Firestore Database Schema

## Collections

### contacts

Stores user contacts and their interaction tracking information.

**Collection Path**: `/contacts/{contactId}`

**Fields**:
- `userId` (string, required): Firebase Auth UID of the user who owns this contact
- `name` (string, required): Contact's full name
- `email` (string, optional): Contact's email address
- `phone` (string, optional): Contact's phone number
- `reminderInterval` (number, default: 30): Number of days before reminder triggers
- `notes` (string, optional): Additional notes about the contact
- `lastContact` (string, required): ISO 8601 timestamp of last interaction
- `createdAt` (string, required): ISO 8601 timestamp of creation
- `updatedAt` (string, required): ISO 8601 timestamp of last update

**Example**:
```json
{
  "userId": "abc123uid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "reminderInterval": 30,
  "notes": "Met at conference 2024",
  "lastContact": "2024-03-01T10:00:00.000Z",
  "createdAt": "2024-02-01T09:00:00.000Z",
  "updatedAt": "2024-03-01T10:00:00.000Z"
}
```

**Indexes**:
- Composite: `userId` (ASC) + `lastContact` (DESC)

---

### contacts/{contactId}/interactions

Subcollection storing interaction history for each contact.

**Collection Path**: `/contacts/{contactId}/interactions/{interactionId}`

**Fields**:
- `type` (string, required): Type of interaction ('manual', 'email', 'call', 'sms', etc.)
- `note` (string, optional): Notes about the interaction
- `source` (string, required): Source of the interaction ('manual', 'gmail', 'outlook', etc.)
- `timestamp` (string, required): ISO 8601 timestamp of the interaction
- `emailSubject` (string, optional): Subject line if interaction is an email
- `metadata` (object, optional): Additional metadata specific to interaction type

**Example**:
```json
{
  "type": "manual",
  "note": "Had coffee and discussed project ideas",
  "source": "manual",
  "timestamp": "2024-03-01T14:30:00.000Z"
}
```

**Indexes**:
- Single: `timestamp` (DESC)

---

### users (optional, for future use)

Stores user-specific settings and preferences.

**Collection Path**: `/users/{userId}`

**Fields**:
- `email` (string): User's email
- `defaultReminderInterval` (number): Default reminder interval for new contacts
- `emailRemindersEnabled` (boolean): Whether to send email reminders
- `browserNotificationsEnabled` (boolean): Whether to show browser notifications
- `connectedEmails` (array): List of connected email accounts
- `createdAt` (string): ISO 8601 timestamp
- `updatedAt` (string): ISO 8601 timestamp

**Example**:
```json
{
  "email": "user@example.com",
  "defaultReminderInterval": 30,
  "emailRemindersEnabled": true,
  "browserNotificationsEnabled": false,
  "connectedEmails": [
    {
      "provider": "gmail",
      "email": "user@gmail.com",
      "connectedAt": "2024-02-01T09:00:00.000Z"
    }
  ],
  "createdAt": "2024-02-01T09:00:00.000Z",
  "updatedAt": "2024-03-01T10:00:00.000Z"
}
```

---

## Security Rules

See `firestore.rules` for detailed security rules.

**Key Rules**:
- Users can only read/write their own contacts
- All operations require authentication
- Users identified by Firebase Auth UID
- Subcollections inherit parent document permissions

---

## Queries

### Common Queries

**Get all contacts for a user (ordered by last contact)**:
```javascript
db.collection('contacts')
  .where('userId', '==', userId)
  .orderBy('lastContact', 'desc')
  .get()
```

**Get overdue contacts**:
```javascript
// Done programmatically - fetch all user contacts and filter by:
// (now - lastContact) > reminderInterval
```

**Get interaction history for a contact**:
```javascript
db.collection('contacts')
  .doc(contactId)
  .collection('interactions')
  .orderBy('timestamp', 'desc')
  .get()
```

**Search contacts by name or email**:
```javascript
// Done client-side after fetching all contacts
// Firebase doesn't support full-text search natively
// For production, consider Algolia or similar
```

---

## Future Enhancements

### Potential Additional Collections:

1. **emailTokens**: Store OAuth tokens for email integrations
2. **notifications**: Store notification history
3. **analytics**: Track user engagement metrics
4. **tags**: Allow tagging/categorizing contacts
5. **groups**: Create contact groups (family, work, friends, etc.)

### Potential Additional Fields:

For contacts:
- `tags` (array): Custom tags/categories
- `importance` (number): Priority/importance score (1-5)
- `birthday` (string): Birthday for automatic reminders
- `company` (string): Company/organization
- `relationship` (string): Type of relationship
- `socialLinks` (object): Social media profiles

For interactions:
- `attachments` (array): File references
- `duration` (number): Length of call/meeting in minutes
- `location` (string): Location of meeting
- `participants` (array): Other people involved
