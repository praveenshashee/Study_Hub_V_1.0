# StudyHub Project

## Overview

StudyHub is a student support platform built to help students access academic video content and related study materials in one place.

This current implementation includes a React-based frontend for the video module, an Express backend, PostgreSQL database integration, Cloudinary video hosting, and Google Drive links for supporting study documents.

---

## Current Project Structure

- `frontend-react/` - Current React frontend
- `backend/` - Express backend and API routes
- `frontend/studyhub/` - Old plain HTML/CSS/JS frontend kept for reference or backup

---

## Main Technologies Used

### Frontend
- React (Vite)
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- Cloudinary
- dotenv

### External Storage / Hosting
- Cloudinary - video hosting and thumbnail handling
- Google Drive - lab sheet and model paper links

---

## Current Features Implemented

### Video Module
- Display all videos
- Search videos
- Sort videos
- View video details
- Embedded video player inside details page
- View count increment
- Upload new videos
- Edit video details
- Replace uploaded video
- Delete videos
- Real Cloudinary video upload
- Automatic video thumbnail generation
- Clean replacement flow with old Cloudinary video deletion

### Materials
- Lab Sheet link support
- Model Paper link support
- Google Drive document links open in a new tab
- Materials can be optional
- "Not available" message shown when a material is missing

### Admin Workflow
- Upload video content
- Edit video details
- Replace video with a new Cloudinary upload
- Delete videos
- Add or update Lab Sheet and Model Paper links

---

## Important Notes

- `frontend-react/` is the current active frontend.
- `frontend/studyhub/` is the older plain HTML/CSS/JS version and is no longer the main implementation.
- Videos are stored using Cloudinary.
- Lab sheets and model papers are currently stored externally using Google Drive links.
- Authentication, signup/login, and role-based access control are planned for later integration.

---

## Backend Files

- `server.js` - Express server and API routes
- `db.js` - PostgreSQL database connection
- `cloudinary.js` - Cloudinary backend configuration
- `.env` - Environment variables for backend secrets

---

## Frontend Pages

### React Frontend
- `Home` - Video listing page
- `VideoDetails` - Video details page with embedded player and materials
- `UploadVideo` - Upload page for new videos
- `EditVideo` - Edit and replace existing videos

---

## How to Run

### Backend
1. Open terminal in `backend`
2. Run:

```bash
npm install
npm run dev