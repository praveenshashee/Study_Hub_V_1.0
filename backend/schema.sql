CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  slides_url TEXT NOT NULL,
  labsheet_url TEXT NOT NULL,
  modelpaper_url TEXT NOT NULL
);
