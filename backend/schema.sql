CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  video_public_id TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  labsheet_url TEXT,
  modelpaper_url TEXT
);

CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  category TEXT,
  type TEXT,
  job_type TEXT,
  location TEXT,
  description TEXT,
  deadline DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
