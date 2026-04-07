# StudyHub Project

StudyHub is a student support platform for academic videos, study materials, and internship listings. The active stack is a React frontend in `frontend-react/` and an Express/PostgreSQL backend in `backend/`.

## Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, PostgreSQL, Cloudinary
- Storage: Cloudinary for video assets, Google Drive links for study documents

## Project Structure

- `frontend-react/`: current frontend
- `backend/`: API server and PostgreSQL access
- `old-frontend/`: legacy HTML/CSS/JS version kept for reference

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ running locally
- Cloudinary account and unsigned upload preset for video uploads

## Initial Setup

1. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend-react
```

2. Create environment files:

```bash
copy backend\.env.example backend\.env
copy frontend-react\.env.example frontend-react\.env
```

3. Update the env files with your local values:

- `backend/.env`
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `frontend-react/.env`
  - `VITE_API_BASE_URL`
  - `VITE_CLOUDINARY_CLOUD_NAME`
  - `VITE_CLOUDINARY_UPLOAD_PRESET`

4. Create the database and tables:

```bash
psql -U postgres -c "CREATE DATABASE \"StudyHub\";"
psql -U postgres -d StudyHub -f backend/schema.sql
```

## Start The Project

From the repository root:

```bash
npm run dev
```

This starts:

- Backend API on `http://localhost:5001`
- Frontend Vite app on `http://localhost:5173`

## Available Features

- Browse videos
- Search and sort videos
- View video details and increment view counts
- Upload, edit, and delete videos
- Attach optional lab sheet and model paper links
- Manage internship listings

## Notes

- Video upload and replacement require the frontend and backend Cloudinary env values to be configured.
- If Cloudinary backend credentials are missing, the app still runs, but old video cleanup on replacement is skipped.
- The frontend API base URL defaults to `http://localhost:5001`.
