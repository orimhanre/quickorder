# Quick Setup Guide

## 🚀 Get Started Immediately

The app will work without any environment variables! Just run:

```bash
cd quickorder-web
npm run dev
```

The app will:
- ✅ Generate PDFs successfully
- ✅ Show the confirmation dialog for PDF download
- ⚠️ Skip Cloudinary upload (PDFs won't be stored in cloud)
- ⚠️ Skip Firestore order sending (orders won't appear in your iOS app)

## 🔧 Optional: Full Integration Setup

To enable automatic order sending to your iOS app and cloud storage:

### 1. Create `.env.local` file in `quickorder-web` directory:

```bash
# Firebase Configuration (for order sending to your iOS app)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration (for PDF cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Airtable Configuration (for products)
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
```

### 2. Get Firebase Configuration:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Click "Web app" or create new web app
6. Copy the configuration values

### 3. Get Cloudinary Configuration:
1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Copy your Cloud Name, API Key, and API Secret

### 4. Restart the development server:
```bash
npm run dev
```

## ✅ What Works Now

- **PDF Generation**: ✅ Always works
- **Product Catalog**: ✅ Always works (if Airtable configured)
- **Client Forms**: ✅ Always works
- **Order Summary**: ✅ Always works
- **PDF Download**: ✅ Always works (with confirmation dialog)

## 🔄 What Requires Setup

- **Cloud Storage**: Requires Cloudinary setup
- **Order Integration**: Requires Firebase setup
- **Product Sync**: Requires Airtable setup

The app is designed to work gracefully without these integrations! 