# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "ContactConnect" (or your choice)
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location close to your users
5. Click "Enable"

## Step 3: Enable Authentication

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Enable "Email/Password" provider
4. Enable "Google" provider
   - Enter support email
   - Click "Save"

## Step 4: Get Frontend Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (</>)
4. Register app with nickname "ContactConnect Web"
5. Copy the firebaseConfig object
6. Create `frontend/.env` file and add:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Get Backend Service Account

1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Save the JSON file as `backend/serviceAccountKey.json`
4. **IMPORTANT**: Add this file to .gitignore (already done)

## Step 6: Configure Backend Environment

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Email Configuration (optional, for reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Getting Gmail App Password (for email reminders):

1. Go to Google Account settings
2. Security > 2-Step Verification (enable if not already)
3. App passwords
4. Select "Mail" and your device
5. Copy the generated password and use it as SMTP_PASS

## Step 7: Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase init
# Select Firestore and Hosting
# Use existing project
# Accept default files (firestore.rules, firestore.indexes.json)
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Step 8: Security Rules Testing

After deploying rules, test them in Firebase Console:
1. Go to Firestore Database
2. Click "Rules" tab
3. Click "Rules Playground"
4. Test various operations

Your Firebase setup is complete! 🎉
