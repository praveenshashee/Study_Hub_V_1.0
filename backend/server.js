import express from "express";
import cors from "cors";
import net from "net";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createVideo,
  deleteVideo,
  getAllVideos,
  getStorageDriver,
  getVideoById,
  incrementVideoViews,
  updateVideo
} from "./storage.js";

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 5001);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../frontend/dist");
const frontendIndexFile = path.join(frontendDir, "index.html");
const hasFrontendBuild = existsSync(frontendIndexFile);

app.use(cors());
app.use(express.json());

if (hasFrontendBuild) {
  app.use(express.static(frontendDir));
}

function parseVideoId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeVideoPayload(body) {
  return {
    title: body.title?.trim(),
    subject: body.subject?.trim(),
    description: body.description?.trim(),
    videoUrl: body.videoUrl?.trim(),
    slidesUrl: body.slidesUrl?.trim(),
    labSheetUrl: body.labSheetUrl?.trim(),
    modelPaperUrl: body.modelPaperUrl?.trim(),
    uploader: body.uploader?.trim()
  };
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateVideoPayload(video) {
  const requiredFields = [
    "title",
    "subject",
    "description",
    "videoUrl",
    "slidesUrl",
    "labSheetUrl",
    "modelPaperUrl",
    "uploader"
  ];

  for (const field of requiredFields) {
    if (!video[field]) {
      return { valid: false, message: "Missing required fields" };
    }
  }

  const urlFields = [
    video.videoUrl,
    video.slidesUrl,
    video.labSheetUrl,
    video.modelPaperUrl
  ];

  if (!urlFields.every(isValidHttpUrl)) {
    return { valid: false, message: "All resource links must be valid URLs" };
  }

  return { valid: true };
}

app.get("/api/videos", async (_req, res) => {
  try {
    const videos = await getAllVideos();
    res.status(200).json(videos);
  } catch (error) {
    console.error("Storage error while fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

app.get("/api/videos/:id", async (req, res) => {
  const id = parseVideoId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Invalid video id" });
  }

  try {
    const video = await getVideoById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (error) {
    console.error("Storage error while fetching one video:", error);
    res.status(500).json({ message: "Failed to fetch video" });
  }
});

app.patch("/api/videos/:id/view", async (req, res) => {
  const id = parseVideoId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Invalid video id" });
  }

  try {
    const video = await incrementVideoViews(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (error) {
    console.error("Storage error while updating view count:", error);
    res.status(500).json({ message: "Failed to update view count" });
  }
});

app.post("/api/videos", async (req, res) => {
  const videoInput = normalizeVideoPayload(req.body);
  const validation = validateVideoPayload(videoInput);

  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const video = await createVideo(videoInput);
    res.status(201).json({
      message: "Video uploaded successfully",
      video
    });
  } catch (error) {
    console.error("Storage error while uploading video:", error);
    res.status(500).json({ message: "Failed to upload video" });
  }
});

app.put("/api/videos/:id", async (req, res) => {
  const id = parseVideoId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Invalid video id" });
  }

  const videoInput = normalizeVideoPayload(req.body);
  const validation = validateVideoPayload(videoInput);

  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const video = await updateVideo(id, videoInput);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({
      message: "Video updated successfully",
      video
    });
  } catch (error) {
    console.error("Storage error while updating video:", error);
    res.status(500).json({ message: "Failed to update video" });
  }
});

app.delete("/api/videos/:id", async (req, res) => {
  const id = parseVideoId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Invalid video id" });
  }

  try {
    const deletedVideo = await deleteVideo(id);

    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Storage error while deleting video:", error);
    res.status(500).json({ message: "Failed to delete video" });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.get("*", (_req, res) => {
  if (!hasFrontendBuild) {
    res.status(503).send(
      "The React frontend is not built yet. Run `npm run dev` for local development or `npm run build` before starting the server."
    );
    return;
  }

  res.sendFile(frontendIndexFile);
});

function checkPortAvailability(port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }

      reject(error);
    });

    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port);
  });
}

async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const port = startPort + attempt;
    const isAvailable = await checkPortAvailability(port);

    if (isAvailable) {
      return port;
    }
  }

  throw new Error(`No available port found between ${startPort} and ${startPort + maxAttempts - 1}`);
}

async function startServer() {
  const port = await findAvailablePort(DEFAULT_PORT);

  if (port !== DEFAULT_PORT) {
    console.log(`Port ${DEFAULT_PORT} is already in use. Falling back to ${port}.`);
  }

  app.listen(port, () => {
    console.log(`Study Hub server is running on http://localhost:${port}`);
    console.log(`Storage driver: ${getStorageDriver()}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Study Hub server:", error);
  process.exit(1);
});
