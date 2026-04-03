# StudyHub Project

StudyHub is a small full-stack learning resource app. The backend is an Express API and the frontend is now a React single-page application built with Vite.

## Quick Start

1. Open a terminal in the project root.
2. Install everything:

   ```bash
   npm install
   ```

3. Start the full development environment:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`

The React app runs on port `5173` and proxies API requests to the Node backend on `5001`.

## Production-style Local Run

To build the React frontend and serve it through Express:

```bash
npm start
```

Then open `http://localhost:5001`

If `5001` is already in use, the server automatically starts on the next free port such as `5002`.

## Default Local Setup

The project now runs out of the box with local JSON storage in:

- `backend/data/videos.json`

No PostgreSQL setup is required for local development.

## Development Mode

`npm run dev` starts both:

- the React frontend with Vite
- the Node backend with nodemon

## Optional PostgreSQL Setup

If you want to use PostgreSQL instead of the local JSON file:

1. Copy `backend/.env.example` values into your own environment.
2. Set `STORAGE_DRIVER=postgres`
3. Provide either:
   - `DATABASE_URL`
   - or `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
4. Create the table with `backend/schema.sql`.

## Current Features

- Display videos
- Search videos
- Sort videos
- View video details
- Increment view counts
- Upload new resources
- Edit resources
- Delete resources
- User dashboard
- Recently watched tracking
- Saved and bookmarked resources
- Recommended and popular content

## Project Structure

- `frontend/src/` - React components, pages, styles, and client-side utilities
- `frontend/vite.config.js` - Vite dev server and API proxy configuration
- `backend/server.js` - Express app and API routes
- `backend/storage.js` - Storage layer for JSON or PostgreSQL
- `backend/data/videos.json` - Default local data store
