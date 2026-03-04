# Getting Started with ContactConnect

## Quick Start Guide

Follow these steps to get ContactConnect running locally on your machine.

### Prerequisites

Make sure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git**
- A **Firebase account** (free tier is fine)

### Step 1: Install Dependencies

Open a terminal in the project root and run:

```bash
npm run install:all
```

This will install dependencies for both frontend and backend.

### Step 2: Firebase Setup

Follow the detailed instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to:

1. Create a Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password and Google)
4. Get your frontend config
5. Download service account key for backend
6. Deploy Firestore security rules

### Step 3: Configure Environment Variables

**Frontend** (`frontend/.env`):

Copy `frontend/.env.example` to `frontend/.env` and fill in your Firebase config:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` with your Firebase credentials from Step 2.

**Backend** (`backend/.env`):

Copy `backend/.env.example` to `backend/.env`:

```bash
cd ../backend
cp .env.example .env
```

Place your Firebase service account key file in `backend/serviceAccountKey.json`.

Edit `backend/.env` to configure:
- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to your service account key (default is fine)
- (Optional) SMTP settings for email reminders

### Step 4: Start Development Servers

From the project root:

```bash
npm run dev
```

This starts both servers:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

You can also run them separately:

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Step 5: Create Your First Account

1. Open http://localhost:5173
2. Click "Sign up"
3. Create an account with email/password or Google
4. Start adding contacts!

---

## Development Workflow

### Frontend Development

Located in `frontend/` directory.

**Structure**:
```
frontend/src/
├── components/     # Reusable React components
│   └── Layout.jsx  # Main layout with navigation
├── pages/          # Page components
│   ├── Dashboard.jsx
│   ├── Contacts.jsx
│   ├── Settings.jsx
│   ├── Login.jsx
│   └── Signup.jsx
├── store/          # Zustand state management
│   ├── authStore.js
│   └── contactStore.js
├── config/         # Configuration files
│   └── firebase.js
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

**Key Libraries**:
- React 18
- Vite (build tool)
- React Router (navigation)
- Zustand (state management)
- Tailwind CSS (styling)
- Firebase SDK (auth & firestore)
- Lucide React (icons)

**Hot Reload**: Changes to frontend files auto-reload the browser.

### Backend Development

Located in `backend/src/` directory.

**Structure**:
```
backend/src/
├── config/          # Configuration
│   └── firebase.ts  # Firebase Admin setup
├── middleware/      # Express middleware
│   └── auth.ts      # Authentication middleware
├── routes/          # API routes
│   ├── contacts.ts  # Contact CRUD operations
│   ├── reminders.ts # Reminder endpoints
│   └── email.ts     # Email integration
├── services/        # Business logic
│   ├── reminderService.ts  # Cron jobs & reminder logic
│   └── emailService.ts     # Email sending
└── server.ts        # Express server entry point
```

**Key Libraries**:
- Express (web framework)
- TypeScript
- Firebase Admin SDK
- node-cron (scheduled tasks)
- nodemailer (email sending)

**Auto-Restart**: Changes to backend files automatically restart the server (nodemon).

---

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Backend

```bash
cd backend
npm run build
```

Compiled JavaScript will be in `backend/dist/`

To run production backend:

```bash
npm start
```

---

## Project Features

### ✅ Currently Implemented

- User authentication (Email/Password + Google)
- Contact management (CRUD operations)
- Manual interaction logging
- Dashboard with overdue contacts
- Reminder interval configuration per contact
- Real-time updates via Firestore
- Automated daily reminder checks (cron job)
- Email reminders for overdue contacts

### 🚧 Coming Soon

- Gmail integration (OAuth + email parsing)
- Outlook integration
- Browser extension for social media tracking
- Advanced search and filtering
- Contact tags/categories
- Interaction analytics
- Import/export contacts
- Mobile app (React Native)

---

## Troubleshooting

### Firebase Initialization Error

**Problem**: "Firebase Admin not initialized" or similar errors.

**Solution**: 
1. Ensure `backend/serviceAccountKey.json` exists
2. Check `backend/.env` has correct `FIREBASE_SERVICE_ACCOUNT_PATH`
3. Verify the service account key is valid

### CORS Errors

**Problem**: Frontend can't connect to backend.

**Solution**: 
1. Verify backend is running on port 5000
2. Check `frontend/.env` has `VITE_API_URL=http://localhost:5000`
3. Try clearing browser cache

### Authentication Failed

**Problem**: Can't log in or "Invalid token" errors.

**Solution**:
1. Verify Firebase Authentication is enabled in Firebase Console
2. Check that Email/Password and Google providers are enabled
3. Ensure frontend Firebase config is correct in `frontend/.env`

### Frontend Won't Start

**Problem**: Port 5173 already in use.

**Solution**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or change the port in frontend/vite.config.js
```

### Backend Won't Start

**Problem**: Port 5000 already in use.

**Solution**: Change `PORT` in `backend/.env` to a different port (e.g., 5001).

---

## Testing

### Manual Testing Checklist

1. **Authentication**:
   - [ ] Sign up with email/password
   - [ ] Sign in with email/password
   - [ ] Sign in with Google
   - [ ] Sign out

2. **Contacts**:
   - [ ] Add a new contact
   - [ ] View all contacts
   - [ ] Search contacts
   - [ ] Edit a contact
   - [ ] Delete a contact

3. **Interactions**:
   - [ ] Log a manual interaction
   - [ ] Verify lastContact updates
   - [ ] Check interaction history

4. **Dashboard**:
   - [ ] View contact statistics
   - [ ] See overdue contacts
   - [ ] Verify counts are accurate

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## Support

For issues or questions:
1. Check [API_DOCS.md](API_DOCS.md) for API reference
2. Check [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for database structure
3. Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for Firebase setup
4. Open an issue on GitHub

---

## License

MIT License - see LICENSE file for details
