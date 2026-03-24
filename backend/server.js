import express from "express";
import cors from "cors";

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

// get all videos
app.get("/api/videos", (req, res) => {
  res.status(200).json(videos);
});

// get one video by id
app.get("/api/videos/:id", (req, res) => {
  const id = Number(req.params.id);
  const video = videos.find((v) => v.id === id);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  res.status(200).json(video);
});

// Increase the view count of a selected video
app.patch("/api/videos/:id/view", (req, res) => {
  const id = Number(req.params.id);

  // Find the selected video by id
  const video = videos.find((v) => v.id === id);

  // If video is not found, return an error
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  // Increase views by 1
  video.views += 1;

  // Send back the updated video object
  res.status(200).json(video);
});

// upload a video
app.post("/api/videos", (req, res) => {
  const newVideo = req.body;

  if (!newVideo.title || !newVideo.subject || !newVideo.description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  newVideo.id = videos.length + 1;
  newVideo.views = 0;
  videos.push(newVideo);

  res.status(201).json({
    message: "Video uploaded successfully",
    video: newVideo
  });
});

// update video
app.put("/api/videos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = videos.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Video not found" });
  }

  videos[index] = { ...videos[index], ...req.body };

  res.status(200).json({
    message: "Video updated successfully",
    video: videos[index]
  });
});

// delete video
app.delete("/api/videos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = videos.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Video not found" });
  }

  const deletedVideo = videos.splice(index, 1);

  res.status(200).json({
    message: "Video deleted successfully",
    video: deletedVideo[0]
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});