import dotenv from "dotenv";
dotenv.config();

import session from "express-session";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import cloudinary from "./cloudinary.js";

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Middleware configuration
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Debug route to check session data
app.get("/api/auth/debug-session", (req, res) => {
  res.json({
    session: req.session,
    user: req.session.user || null
  });
});



/* ==================================================
   Authentification and Authorization Middleware for Admins & Users
   ================================================== */

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Middleware to check if user is an admin
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

const tableColumnCache = new Map();

async function getTableColumns(tableName) {
  if (tableColumnCache.has(tableName)) {
    return tableColumnCache.get(tableName);
  }

  const result = await pool.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
    `,
    [tableName]
  );

  const columns = new Set(result.rows.map((row) => row.column_name));
  tableColumnCache.set(tableName, columns);
  return columns;
}

async function getInternshipSchema() {
  const columns = await getTableColumns("internships");
  const emailColumn = columns.has("company_email")
    ? "company_email"
    : columns.has("gmail")
      ? "gmail"
      : null;
  const employmentTypeColumn = columns.has("employment_type")
    ? "employment_type"
    : columns.has("job_type")
      ? "job_type"
      : columns.has("type")
        ? "type"
        : null;

  if (!emailColumn) {
    throw new Error("Internships table is missing both company_email and gmail columns.");
  }

  return {
    emailColumn,
    employmentTypeColumn
  };
}

function mapInternshipRow(row, schema) {
  const emailValue = row[schema.emailColumn];
  const employmentTypeValue = schema.employmentTypeColumn
    ? row[schema.employmentTypeColumn]
    : null;

  return {
    id: row.id,
    title: row.title,
    company: row.company,
    gmail: emailValue,
    companyEmail: emailValue,
    category: row.category,
    type: employmentTypeValue,
    jobType: employmentTypeValue,
    employmentType: employmentTypeValue,
    location: row.location,
    description: row.description,
    deadline: row.deadline,
    created_at: row.created_at
  };
}



/* ==================================================
   Sign-up, Login, Logout
   ================================================== */

//sign-up route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role, created_at
      `,
      [
        fullName,
        email,
        passwordHash,
        "user"
      ]
    );

    const user = result.rows[0];

    req.session.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      message: "Signup successful",
      user: req.session.user
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to sign up" });
  }
});

//login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
});

//logout route
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to log out" });
    }

    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout successful" });
  });
});

// Get current user route
app.get("/api/auth/me", (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ user: null });
  }

  res.status(200).json({ user: req.session.user });
});


/* ==================================================
   Rating Routes for Videos
   ================================================== */

// Rate a video (create or update rating)
app.post("/api/videos/:id/rate", requireAuth, async (req, res) => {
  try {
    const videoId = Number(req.params.id);
    const userId = req.session.user.id;
    const { ratingValue } = req.body;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const videoCheck = await pool.query(
      "SELECT * FROM videos WHERE id = $1",
      [videoId]
    );

    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    await pool.query(
      `
      INSERT INTO video_ratings (user_id, video_id, rating_value, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, video_id)
      DO UPDATE
      SET
        rating_value = EXCLUDED.rating_value,
        updated_at = CURRENT_TIMESTAMP
      `,
      [userId, videoId, ratingValue]
    );

    const averageResult = await pool.query(
      `
      SELECT ROUND(AVG(rating_value)::numeric, 1) AS average_rating
      FROM video_ratings
      WHERE video_id = $1
      `,
      [videoId]
    );

    const averageRating = averageResult.rows[0].average_rating || 0;

    const updatedVideoResult = await pool.query(
      `
      UPDATE videos
      SET rating = $1
      WHERE id = $2
      RETURNING *
      `,
      [averageRating, videoId]
    );

    const row = updatedVideoResult.rows[0];

    res.status(200).json({
      message: "Rating submitted successfully",
      video: {
        id: row.id,
        title: row.title,
        subject: row.subject,
        description: row.description,
        videoUrl: row.video_url,
        thumbnailUrl: row.thumbnail_url,
        videoPublicId: row.video_public_id,
        uploader: row.uploader_name,
        views: row.view_count,
        rating: Number(row.rating),
        createdAt: row.created_at,
        materials: {
          labSheet: row.labsheet_url,
          modelPaper: row.modelpaper_url
        }
      }
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Failed to submit rating" });
  }
});

// Get the current user's rating for a specific video
app.get("/api/videos/:id/my-rating", requireAuth, async (req, res) => {
  try {
    const videoId = Number(req.params.id);
    const userId = req.session.user.id;

    const result = await pool.query(
      `
      SELECT rating_value
      FROM video_ratings
      WHERE user_id = $1 AND video_id = $2
      `,
      [userId, videoId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ ratingValue: null });
    }

    res.status(200).json({
      ratingValue: Number(result.rows[0].rating_value)
    });
  } catch (error) {
    console.error("Error fetching user rating:", error);
    res.status(500).json({ message: "Failed to fetch user rating" });
  }
});


/* ==================================================
    Video Routes (CRUD) with PostgreSQL
   ================================================== */

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
      videoPublicId: row.video_public_id,
      uploader: row.uploader_name,
      views: row.view_count,
      rating: Number(row.rating),
      createdAt: row.created_at,
      materials: {
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
app.post("/api/videos", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      videoUrl,
      thumbnailUrl,
      videoPublicId,
      labSheetUrl,
      modelPaperUrl,
      uploader
    } = req.body;

    if (
      !title ||
      !subject ||
      !description ||
      !videoUrl ||
      !uploader ||
      !videoPublicId ||
      !thumbnailUrl
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `
      INSERT INTO videos
      (
        title,
        subject,
        description,
        video_url,
        thumbnail_url,
        video_public_id,
        uploader_name,
        view_count,
        rating,
        created_at,
        labsheet_url,
        modelpaper_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, $10, $11)
      RETURNING *
      `,
      [
        title,
        subject,
        description,
        videoUrl,
        thumbnailUrl,
        videoPublicId,
        uploader,
        0,
        0.0,
        labSheetUrl || null,
        modelPaperUrl || null
      ]
    );

    const row = result.rows[0];

    const video = {
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      videoPublicId: row.video_public_id,
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
app.put("/api/videos/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      title,
      subject,
      description,
      videoUrl,
      thumbnailUrl,
      videoPublicId,
      labSheetUrl,
      modelPaperUrl,
      uploader
    } = req.body;

    if (
      !title ||
      !subject ||
      !description ||
      !videoUrl ||
      !thumbnailUrl ||
      !videoPublicId ||
      !uploader
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingResult = await pool.query(
      "SELECT * FROM videos WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const existingVideo = existingResult.rows[0];
    const oldPublicId = existingVideo.video_public_id;

    const isVideoReplaced =
      oldPublicId &&
      videoPublicId &&
      oldPublicId !== videoPublicId;

    if (isVideoReplaced) {
      try {
        console.log("Deleting old Cloudinary video:", oldPublicId);

        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "video",
          invalidate: true
        });

        console.log("Old Cloudinary video delete request sent successfully");
      } catch (cloudinaryError) {
        console.error("Failed to delete old Cloudinary video:", cloudinaryError);
      }
    }

    const result = await pool.query(
      `
      UPDATE videos
      SET
        title = $1,
        subject = $2,
        description = $3,
        video_url = $4,
        thumbnail_url = $5,
        video_public_id = $6,
        uploader_name = $7,
        labsheet_url = $8,
        modelpaper_url = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        title,
        subject,
        description,
        videoUrl,
        thumbnailUrl,
        videoPublicId,
        uploader,
        labSheetUrl || null,
        modelPaperUrl || null,
        id
      ]
    );

    const row = result.rows[0];

    const video = {
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      videoPublicId: row.video_public_id,
      uploader: row.uploader_name,
      views: row.view_count,
      rating: Number(row.rating),
      createdAt: row.created_at,
      materials: {
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
app.delete("/api/videos/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      "DELETE FROM videos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Database error while deleting video:", error);
    res.status(500).json({ message: "Failed to delete video" });
  }
});

/* ==================================================
   INTERNSHIP ROUTES
   ================================================== */

// GET all internships
app.get("/api/internships", async (req, res) => {
  try {
    const schema = await getInternshipSchema();
    const employmentTypeSelect = schema.employmentTypeColumn
      ? `, ${schema.employmentTypeColumn} AS employment_type_value`
      : "";
    const result = await pool.query(`
      select
        id,
        title,
        company,
        ${schema.emailColumn} AS company_email_value,
        category,
        location,
        description,
        deadline,
        created_at
        ${employmentTypeSelect}
      from internships
      order by id desc
    `);

    const internships = result.rows.map((row) =>
      mapInternshipRow(
        {
          ...row,
          [schema.emailColumn]: row.company_email_value,
          ...(schema.employmentTypeColumn
            ? { [schema.employmentTypeColumn]: row.employment_type_value }
            : {})
        },
        schema
      )
    );

    res.status(200).json(internships);
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({ message: "Failed to fetch internships." });
  }
});

// GET single internship by ID
app.get("/api/internships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const schema = await getInternshipSchema();
    const employmentTypeSelect = schema.employmentTypeColumn
      ? `, ${schema.employmentTypeColumn} AS employment_type_value`
      : "";

    const result = await pool.query(
      `
      select
        id,
        title,
        company,
        ${schema.emailColumn} AS company_email_value,
        category,
        location,
        description,
        deadline,
        created_at
        ${employmentTypeSelect}
      from internships
      where id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }

    const row = result.rows[0];

    res.status(200).json(
      mapInternshipRow(
        {
          ...row,
          [schema.emailColumn]: row.company_email_value,
          ...(schema.employmentTypeColumn
            ? { [schema.employmentTypeColumn]: row.employment_type_value }
            : {})
        },
        schema
      )
    );
  } catch (error) {
    console.error("Error fetching internship by ID:", error);
    res.status(500).json({ message: "Failed to fetch internship details." });
  }
});

// CREATE internship
app.post("/api/internships", async (req, res) => {
  try {
    const {
      title,
      company,
      gmail,
      companyEmail,
      category,
      type,
      job_type,
      jobType,
      employmentType,
      location,
      description,
      deadline
    } = req.body;

    const resolvedEmail = companyEmail || gmail || null;
    const resolvedEmploymentType =
      employmentType || jobType || job_type || type || null;
    const schema = await getInternshipSchema();

    if (!title || !company || !resolvedEmail) {
      return res.status(400).json({
        message: "Title, company, and company email are required."
      });
    }

    const insertColumns = [
      "title",
      "company",
      schema.emailColumn,
      "category",
      "location",
      "description",
      "deadline"
    ];
    const insertValues = [
      title,
      company,
      resolvedEmail,
      category || null,
      location || null,
      description || null,
      deadline || null
    ];

    if (schema.employmentTypeColumn) {
      insertColumns.splice(4, 0, schema.employmentTypeColumn);
      insertValues.splice(4, 0, resolvedEmploymentType);
    }

    const insertPlaceholders = insertColumns.map((_, index) => `$${index + 1}`).join(", ");

    const result = await pool.query(
      `
      insert into internships (
        ${insertColumns.join(", ")}
      )
      values (${insertPlaceholders})
      returning *
      `,
      insertValues
    );

    const row = result.rows[0];

    res.status(201).json(mapInternshipRow(row, schema));
  } catch (error) {
    console.error("Error creating internship:", error);
    res.status(500).json({ message: "Failed to create internship." });
  }
});

// UPDATE internship
app.put("/api/internships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      company,
      gmail,
      companyEmail,
      category,
      type,
      job_type,
      jobType,
      employmentType,
      location,
      description,
      deadline
    } = req.body;

    const resolvedEmail = companyEmail || gmail || null;
    const resolvedEmploymentType =
      employmentType || jobType || job_type || type || null;
    const schema = await getInternshipSchema();

    if (!title || !company || !resolvedEmail) {
      return res.status(400).json({
        message: "Title, company, and company email are required."
      });
    }

    const updateAssignments = [
      "title = $1",
      "company = $2",
      `${schema.emailColumn} = $3`,
      "category = $4",
      "location = $5",
      "description = $6",
      "deadline = $7"
    ];
    const updateValues = [
      title,
      company,
      resolvedEmail,
      category || null,
      location || null,
      description || null,
      deadline || null
    ];

    if (schema.employmentTypeColumn) {
      updateAssignments.splice(4, 0, `${schema.employmentTypeColumn} = $5`);
      updateValues.splice(4, 0, resolvedEmploymentType);
      updateAssignments[5] = "location = $6";
      updateAssignments[6] = "description = $7";
      updateAssignments[7] = "deadline = $8";
    }

    const idPlaceholder = `$${updateValues.length + 1}`;
    updateValues.push(id);

    const result = await pool.query(
      `
      update internships
      set
        ${updateAssignments.join(",\n        ")}
      where id = ${idPlaceholder}
      returning *
      `,
      updateValues
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }

    const row = result.rows[0];

    res.status(200).json(mapInternshipRow(row, schema));
  } catch (error) {
    console.error("Error updating internship:", error);
    res.status(500).json({ message: "Failed to update internship." });
  }
});

// DELETE internship
app.delete("/api/internships/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      delete from internships
      where id = $1
      returning *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }

    res.status(200).json({ message: "Internship deleted successfully." });
  } catch (error) {
    console.error("Error deleting internship:", error);
    res.status(500).json({ message: "Failed to delete internship." });
  }
});

app.post("/api/internship-notifications", async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      company,
      companyEmail,
      internshipTitle,
      category,
      jobType,
      location,
      deadline,
      description,
      notes
    } = req.body;

    if (!studentName || !studentEmail || !company || !companyEmail || !internshipTitle) {
      return res.status(400).json({
        message: "Missing required fields."
      });
    }

    const result = await pool.query(
      `
      INSERT INTO internship_notifications (
        student_name,
        student_email,
        company,
        company_email,
        internship_title,
        category,
        employment_type,
        location,
        deadline,
        description,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        studentName,
        studentEmail,
        company,
        companyEmail,
        internshipTitle,
        category || null,
        jobType || null,
        location || null,
        deadline || null,
        description || null,
        notes || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating internship notification:", error);
    res.status(500).json({ message: "Failed to submit internship notification." });
  }
});

// GET all internship notifications for admin table
app.get("/api/internship-notifications", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        student_name,
        student_email,
        company,
        company_email,
        internship_title,
        category,
        employment_type,
        location,
        deadline,
        description,
        notes,
        created_at
      FROM internship_notifications
      ORDER BY id DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching internship notifications:", error);
    res.status(500).json({ message: "Failed to fetch internship notifications." });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
