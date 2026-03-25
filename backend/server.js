import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use(express.json());

const videos = [
  {
    id: 1,
    title: "DBMS Normalization Explained",
    subject: "Database Systems",
    description: "A simple explanation of 1NF, 2NF, and 3NF.",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    thumbnailUrl: "https://via.placeholder.com/300x180",
    uploader: "Praveen",
    views: 120,
    rating: 4.5,
    createdAt: "2026-03-24",
    materials: {
      slides: "https://example.com/slides1.pdf",
      labSheet: "https://example.com/lab1.pdf",
      modelPaper: "https://example.com/model1.pdf"
    }
  },
  {
    id: 2,
    title: "Operating Systems Deadlock Tutorial",
    subject: "Operating Systems",
    description: "Introduction to deadlock and prevention methods.",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    thumbnailUrl: "https://via.placeholder.com/300x180",
    uploader: "Alex",
    views: 85,
    rating: 4.2,
    createdAt: "2026-03-20",
    materials: {
      slides: "https://example.com/slides2.pdf",
      labSheet: "https://example.com/lab2.pdf",
      modelPaper: "https://example.com/model2.pdf"
    }
  }
];

// Get all videos from PostgreSQL and map column names for frontend compatibility
app.get("/api/videos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM videos ORDER BY id ASC");

    const videos = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      uploader: row.uploader_name,
      views: row.view_count,
      rating: Number(row.rating),
      createdAt: row.created_at
    }));

    res.status(200).json(videos);
  } catch (error) {
    console.error("Database error while fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos from database" });
  }
});



// Get one video by id from PostgreSQL and map column names for frontend compatibility
app.get("/api/videos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query("SELECT * FROM videos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const row = result.rows[0];

    const video = {
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      uploader: row.uploader_name,
      views: row.view_count,
      rating: Number(row.rating),
      createdAt: row.created_at,
      materials: {
        slides: row.slides_url,
        labSheet: row.labsheet_url,
        modelPaper: row.modelpaper_url
      }
    };

    res.status(200).json(video);
  } catch (error) {
    console.error("Database error while fetching one video:", error);
    res.status(500).json({ message: "Failed to fetch video from database" });
  }
});



// Increase view count and return frontend-friendly field names
app.patch("/api/videos/:id/view", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      "UPDATE videos SET view_count = view_count + 1 WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const row = result.rows[0];

    const video = {
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      uploader: row.uploader_name,
      views: row.view_count,
      rating: Number(row.rating),
      createdAt: row.created_at,
      materials: {
        slides: row.slides_url,
        labSheet: row.labsheet_url,
        modelPaper: row.modelpaper_url
      }
    };

    res.status(200).json(video);
  } catch (error) {
    console.error("Database error while updating view count:", error);
    res.status(500).json({ message: "Failed to update view count" });
  }
});



// Add a new video to PostgreSQL
app.post("/api/videos", async (req, res) => {
  try {
    // Get data sent from the frontend
    const {
      title,
      subject,
      description,
      videoUrl,
      slidesUrl,
      labSheetUrl,
      modelPaperUrl,
      uploader
    } = req.body;

    // Basic backend validation
    if (
      !title ||
      !subject ||
      !description ||
      !videoUrl ||
      !slidesUrl ||
      !labSheetUrl ||
      !modelPaperUrl ||
      !uploader
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert the new video into the database
    const result = await pool.query(
      `
  INSERT INTO videos
  (
    title,
    subject,
    description,
    video_url,
    thumbnail_url,
    uploader_name,
    view_count,
    rating,
    created_at,
    slides_url,
    labsheet_url,
    modelpaper_url
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10, $11)
  RETURNING *
  `,
      [
        title,
        subject,
        description,
        videoUrl,
        "https://via.placeholder.com/300x180", // temporary thumbnail
        uploader,
        0,      // default view count
        0.0,    // default rating
        slidesUrl,
        labSheetUrl,
        modelPaperUrl
      ]
    );

    const row = result.rows[0];

    // Send back frontend-friendly field names
    const video = {
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      uploader: row.uploader_name,
      views: row.view_count,
      rating: Number(row.rating),
      createdAt: row.created_at
    };

    res.status(201).json({
      message: "Video uploaded successfully",
      video
    });
  } catch (error) {
    console.error("Database error while uploading video:", error);
    res.status(500).json({ message: "Failed to upload video" });
  }
});



// Update an existing video in PostgreSQL
app.put("/api/videos/:id", async (req, res) => {
  try {
    // Read id from URL
    const id = Number(req.params.id);

    // Read updated values from frontend
    const {
      title,
      subject,
      description,
      videoUrl,
      slidesUrl,
      labSheetUrl,
      modelPaperUrl,
      uploader
    } = req.body;

    // Basic backend validation
    if (
      !title ||
      !subject ||
      !description ||
      !videoUrl ||
      !slidesUrl ||
      !labSheetUrl ||
      !modelPaperUrl ||
      !uploader
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Update row in PostgreSQL and return updated row
    const result = await pool.query(
      `
      UPDATE videos
      SET
        title = $1,
        subject = $2,
        description = $3,
        video_url = $4,
        uploader_name = $5,
        slides_url = $6,
        labsheet_url = $7,
        modelpaper_url = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        title,
        subject,
        description,
        videoUrl,
        uploader,
        slidesUrl,
        labSheetUrl,
        modelPaperUrl,
        id
      ]
    );

    // If no video matched the id
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const row = result.rows[0];

    // Send frontend-friendly object
    const video = {
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      uploader: row.uploader_name,
      views: row.view_count,
      rating: Number(row.rating),
      createdAt: row.created_at,
      materials: {
        slides: row.slides_url,
        labSheet: row.labsheet_url,
        modelPaper: row.modelpaper_url
      }
    };

    res.status(200).json({
      message: "Video updated successfully",
      video
    });
  } catch (error) {
    console.error("Database error while updating video:", error);
    res.status(500).json({ message: "Failed to update video" });
  }
});




// Delete one video from PostgreSQL by id
app.delete("/api/videos/:id", async (req, res) => {
  try {
    // Read the id from the URL
    const id = Number(req.params.id);

    // Delete the row and return the deleted row
    const result = await pool.query(
      "DELETE FROM videos WHERE id = $1 RETURNING *",
      [id]
    );

    // If nothing was deleted, that id does not exist
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Database error while deleting video:", error);
    res.status(500).json({ message: "Failed to delete video" });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});