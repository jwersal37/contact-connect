# ContactConnect

A hybrid contact reminder app that helps you maintain relationships by reminding you when you haven't talked to someone in a while.

## Features

- 📝 Manual contact logging
- 📧 Email integration (Gmail, Outlook)
- ⏰ Customizable reminder intervals
- 🔔 Smart notifications
- 📊 Interaction history tracking

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- TypeScript

### Database & Services
- Firebase Firestore
- Firebase Authentication
- Firebase Cloud Messaging

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd ContactConnet
```

2. Install dependencies
```bash
npm run install:all
```

3. Set up Firebase
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Authentication (Email/Password and Google)
   - Download service account key for backend
   - Get web config for frontend

4. Configure environment variables

**Backend** (`backend/.env`):
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Run the development servers
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
ContactConnet/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.ts
│   └── package.json
└── package.json       # Root package.json
```

## Development

- Frontend runs on port 5173
- Backend runs on port 5000
- Hot reload enabled for both

## Future Enhancements

- [ ] Browser extension for social media tracking
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration
- [ ] Automated email parsing
- [ ] Contact importance scoring
- [ ] Analytics dashboard

## License

MIT
