# ContactConnect API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

Get the token from Firebase Auth on the frontend:
```javascript
const token = await user.getIdToken()
```

---

## Endpoints

### Health Check

**GET** `/api/health`

Check if API is running.

**Response**:
```json
{
  "status": "ok",
  "message": "ContactConnect API is running"
}
```

---

## Contacts

### Get All Contacts

**GET** `/api/contacts`

Get all contacts for the authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
[
  {
    "id": "contact123",
    "userId": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "reminderInterval": 30,
    "notes": "Met at conference",
    "lastContact": "2024-03-01T10:00:00.000Z",
    "createdAt": "2024-02-01T09:00:00.000Z",
    "updatedAt": "2024-03-01T10:00:00.000Z"
  }
]
```

---

### Get Single Contact

**GET** `/api/contacts/:id`

Get a specific contact by ID.

**Headers**: `Authorization: Bearer <token>`

**Response**: Same as contact object above

---

### Create Contact

**POST** `/api/contacts`

Create a new contact.

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+0987654321",
  "reminderInterval": 45,
  "notes": "College friend"
}
```

**Response**:
```json
{
  "id": "newcontact456",
  "userId": "user123",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+0987654321",
  "reminderInterval": 45,
  "notes": "College friend",
  "lastContact": "2024-03-04T12:00:00.000Z",
  "createdAt": "2024-03-04T12:00:00.000Z",
  "updatedAt": "2024-03-04T12:00:00.000Z"
}
```

---

### Update Contact

**PUT** `/api/contacts/:id`

Update an existing contact.

**Headers**: `Authorization: Bearer <token>`

**Body**: Partial update (any fields from contact object)
```json
{
  "notes": "Updated notes",
  "reminderInterval": 60
}
```

**Response**: Updated contact object

---

### Delete Contact

**DELETE** `/api/contacts/:id`

Delete a contact.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "message": "Contact deleted successfully"
}
```

---

### Log Interaction

**POST** `/api/contacts/:id/interactions`

Log an interaction with a contact (automatically updates lastContact).

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "type": "manual",
  "note": "Had coffee and caught up",
  "source": "manual"
}
```

**Response**:
```json
{
  "type": "manual",
  "note": "Had coffee and caught up",
  "source": "manual",
  "timestamp": "2024-03-04T14:30:00.000Z"
}
```

---

### Get Interaction History

**GET** `/api/contacts/:id/interactions`

Get all interactions for a contact.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
[
  {
    "id": "interaction123",
    "type": "manual",
    "note": "Had coffee",
    "source": "manual",
    "timestamp": "2024-03-04T14:30:00.000Z"
  },
  {
    "id": "interaction456",
    "type": "email",
    "note": "Discussed project",
    "source": "gmail",
    "timestamp": "2024-02-15T09:00:00.000Z"
  }
]
```

---

## Reminders

### Get Overdue Contacts

**GET** `/api/reminders/overdue`

Get all contacts that haven't been contacted within their reminder interval.

**Headers**: `Authorization: Bearer <token>`

**Response**: Array of contact objects (same format as Get All Contacts)

---

## Email Integration

### Connect Gmail

**POST** `/api/email/connect/gmail`

Initiate Gmail OAuth connection.

**Headers**: `Authorization: Bearer <token>`

**Response**: OAuth URL or success message (implementation pending)

---

### OAuth Callback

**GET** `/api/email/google/callback`

Handle OAuth callback from Google (implementation pending)

---

## Error Responses

All endpoints may return these error responses:

**401 Unauthorized**:
```json
{
  "error": "No authentication token provided"
}
```

**403 Forbidden**:
```json
{
  "error": "Access denied"
}
```

**404 Not Found**:
```json
{
  "error": "Contact not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "message": "Detailed error message (dev mode only)"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

## CORS

CORS is enabled for all origins in development. Configure for production.
