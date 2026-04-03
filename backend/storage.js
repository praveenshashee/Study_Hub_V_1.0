import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createPostgresPool, shouldUsePostgres } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_THUMBNAIL_URL = "https://via.placeholder.com/300x180";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "videos.json");
const STORAGE_DRIVER = shouldUsePostgres() ? "postgres" : "json";

const seedVideos = [
  {
    id: 1,
    title: "DBMS Normalization Explained",
    subject: "Database Systems",
    description: "A simple explanation of 1NF, 2NF, and 3NF with examples and common mistakes.",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
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
    description: "Introduction to deadlock, prevention methods, and practical exam-focused examples.",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: "Alex",
    views: 85,
    rating: 4.2,
    createdAt: "2026-03-20",
    materials: {
      slides: "https://example.com/slides2.pdf",
      labSheet: "https://example.com/lab2.pdf",
      modelPaper: "https://example.com/model2.pdf"
    }
  },
  {
    id: 3,
    title: "SQL Joins Crash Course",
    subject: "Database Systems",
    description: "Inner join, left join, right join, and full join explained with clear table examples.",
    videoUrl: "https://www.youtube.com/watch?v=example3",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: "Nimali",
    views: 214,
    rating: 4.8,
    createdAt: "2026-03-26",
    materials: {
      slides: "https://example.com/slides3.pdf",
      labSheet: "https://example.com/lab3.pdf",
      modelPaper: "https://example.com/model3.pdf"
    }
  },
  {
    id: 4,
    title: "CPU Scheduling Algorithms Made Easy",
    subject: "Operating Systems",
    description: "FCFS, SJF, Round Robin, and priority scheduling with solved turnaround time examples.",
    videoUrl: "https://www.youtube.com/watch?v=example4",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: "Kavindu",
    views: 176,
    rating: 4.6,
    createdAt: "2026-03-22",
    materials: {
      slides: "https://example.com/slides4.pdf",
      labSheet: "https://example.com/lab4.pdf",
      modelPaper: "https://example.com/model4.pdf"
    }
  },
  {
    id: 5,
    title: "Stacks and Queues for Beginners",
    subject: "Data Structures",
    description: "Core stack and queue operations, applications, and linked list implementation basics.",
    videoUrl: "https://www.youtube.com/watch?v=example5",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: "Hashini",
    views: 201,
    rating: 4.7,
    createdAt: "2026-03-25",
    materials: {
      slides: "https://example.com/slides5.pdf",
      labSheet: "https://example.com/lab5.pdf",
      modelPaper: "https://example.com/model5.pdf"
    }
  },
  {
    id: 6,
    title: "Binary Search Trees Explained",
    subject: "Data Structures",
    description: "Insertion, deletion, traversal, and balanced tree intuition for exams and coding labs.",
    videoUrl: "https://www.youtube.com/watch?v=example6",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: "Sajith",
    views: 162,
    rating: 4.4,
    createdAt: "2026-03-18",
    materials: {
      slides: "https://example.com/slides6.pdf",
      labSheet: "https://example.com/lab6.pdf",
      modelPaper: "https://example.com/model6.pdf"
    }
  },
  {
    id: 7,
    title: "TCP vs UDP in 15 Minutes",
    subject: "Computer Networks",
    description: "Compare TCP and UDP using reliability, flow control, and real-world networking scenarios.",
    videoUrl: "https://www.youtube.com/watch?v=example7",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: "Ishara",
    views: 143,
    rating: 4.3,
    createdAt: "2026-03-19",
    materials: {
      slides: "https://example.com/slides7.pdf",
      labSheet: "https://example.com/lab7.pdf",
      modelPaper: "https://example.com/model7.pdf"
    }
  },
  {
    id: 8,
    title: "IP Addressing and Subnetting Practice",
    subject: "Computer Networks",
    description: "Step-by-step subnetting walkthroughs for CIDR, masks, and host calculation practice.",
    videoUrl: "https://www.youtube.com/watch?v=example8",
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: "Tharushi",
    views: 189,
    rating: 4.6,
    createdAt: "2026-03-27",
    materials: {
      slides: "https://example.com/slides8.pdf",
      labSheet: "https://example.com/lab8.pdf",
      modelPaper: "https://example.com/model8.pdf"
    }
  }
];

let pool = null;

if (STORAGE_DRIVER === "postgres") {
  pool = createPostgresPool();
}

function mapVideoRow(row) {
  return {
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
}

async function ensureJsonDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seedVideos, null, 2));
  }
}

async function readJsonVideos() {
  await ensureJsonDataFile();
  const fileContents = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(fileContents);
}

async function writeJsonVideos(videos) {
  await fs.writeFile(DATA_FILE, JSON.stringify(videos, null, 2));
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function getStorageDriver() {
  return STORAGE_DRIVER;
}

export async function getAllVideos() {
  if (STORAGE_DRIVER === "postgres") {
    const result = await pool.query("SELECT * FROM videos ORDER BY id ASC");
    return result.rows.map(mapVideoRow);
  }

  const videos = await readJsonVideos();
  return videos.sort((a, b) => a.id - b.id);
}

export async function getVideoById(id) {
  if (STORAGE_DRIVER === "postgres") {
    const result = await pool.query("SELECT * FROM videos WHERE id = $1", [id]);
    return result.rows[0] ? mapVideoRow(result.rows[0]) : null;
  }

  const videos = await readJsonVideos();
  return videos.find((video) => video.id === id) || null;
}

export async function incrementVideoViews(id) {
  if (STORAGE_DRIVER === "postgres") {
    const result = await pool.query(
      "UPDATE videos SET view_count = view_count + 1 WHERE id = $1 RETURNING *",
      [id]
    );

    return result.rows[0] ? mapVideoRow(result.rows[0]) : null;
  }

  const videos = await readJsonVideos();
  const video = videos.find((item) => item.id === id);

  if (!video) {
    return null;
  }

  video.views += 1;
  await writeJsonVideos(videos);
  return video;
}

export async function createVideo(videoInput) {
  if (STORAGE_DRIVER === "postgres") {
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
        videoInput.title,
        videoInput.subject,
        videoInput.description,
        videoInput.videoUrl,
        DEFAULT_THUMBNAIL_URL,
        videoInput.uploader,
        0,
        0.0,
        videoInput.slidesUrl,
        videoInput.labSheetUrl,
        videoInput.modelPaperUrl
      ]
    );

    return mapVideoRow(result.rows[0]);
  }

  const videos = await readJsonVideos();
  const nextId = videos.length === 0 ? 1 : Math.max(...videos.map((video) => video.id)) + 1;

  const newVideo = {
    id: nextId,
    title: videoInput.title,
    subject: videoInput.subject,
    description: videoInput.description,
    videoUrl: videoInput.videoUrl,
    thumbnailUrl: DEFAULT_THUMBNAIL_URL,
    uploader: videoInput.uploader,
    views: 0,
    rating: 0,
    createdAt: getTodayDateString(),
    materials: {
      slides: videoInput.slidesUrl,
      labSheet: videoInput.labSheetUrl,
      modelPaper: videoInput.modelPaperUrl
    }
  };

  videos.push(newVideo);
  await writeJsonVideos(videos);
  return newVideo;
}

export async function updateVideo(id, videoInput) {
  if (STORAGE_DRIVER === "postgres") {
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
        videoInput.title,
        videoInput.subject,
        videoInput.description,
        videoInput.videoUrl,
        videoInput.uploader,
        videoInput.slidesUrl,
        videoInput.labSheetUrl,
        videoInput.modelPaperUrl,
        id
      ]
    );

    return result.rows[0] ? mapVideoRow(result.rows[0]) : null;
  }

  const videos = await readJsonVideos();
  const videoIndex = videos.findIndex((video) => video.id === id);

  if (videoIndex === -1) {
    return null;
  }

  const existingVideo = videos[videoIndex];

  videos[videoIndex] = {
    ...existingVideo,
    title: videoInput.title,
    subject: videoInput.subject,
    description: videoInput.description,
    videoUrl: videoInput.videoUrl,
    uploader: videoInput.uploader,
    materials: {
      slides: videoInput.slidesUrl,
      labSheet: videoInput.labSheetUrl,
      modelPaper: videoInput.modelPaperUrl
    }
  };

  await writeJsonVideos(videos);
  return videos[videoIndex];
}

export async function deleteVideo(id) {
  if (STORAGE_DRIVER === "postgres") {
    const result = await pool.query(
      "DELETE FROM videos WHERE id = $1 RETURNING *",
      [id]
    );

    return result.rows[0] ? mapVideoRow(result.rows[0]) : null;
  }

  const videos = await readJsonVideos();
  const videoIndex = videos.findIndex((video) => video.id === id);

  if (videoIndex === -1) {
    return null;
  }

  const [deletedVideo] = videos.splice(videoIndex, 1);
  await writeJsonVideos(videos);
  return deletedVideo;
}
