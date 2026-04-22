import dotenv from "dotenv";
dotenv.config();

import session from "express-session";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import cloudinary from "./cloudinary.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "studyhub_fallback_secret",
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
   Authentication and Authorization Middleware
   ================================================== */

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

const supportedProfileImageColumns = [
  "profile_image_url",
  "avatar_url",
  "profile_image"
];

let profileImageColumnPromise;

async function getProfileImageColumn() {
  if (!profileImageColumnPromise) {
    profileImageColumnPromise = pool.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = ANY($1::text[])
      ORDER BY array_position($1::text[], column_name)
      LIMIT 1
      `,
      [supportedProfileImageColumns]
    )
      .then((result) => result.rows[0]?.column_name || null)
      .catch((error) => {
        console.error("Failed to inspect users table profile image column:", error);
        return null;
      });
  }

  return profileImageColumnPromise;
}

function normalizeProfileImageUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedValue);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function buildSessionUser(user, profileImageColumn) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    profileImageUrl: profileImageColumn ? user[profileImageColumn] || null : null
  };
}

/* ==================================================
   Sign-up, Login, Logout
   ================================================== */

// Sign-up route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password, profileImageUrl } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const resolvedProfileImageUrl = normalizeProfileImageUrl(profileImageUrl);

    if (profileImageUrl && !resolvedProfileImageUrl) {
      return res.status(400).json({
        message: "Profile image URL must be a valid http or https link"
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const profileImageColumn = await getProfileImageColumn();

    const result = profileImageColumn
      ? await pool.query(
          `
          INSERT INTO users (full_name, email, password_hash, role, ${profileImageColumn})
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, full_name, email, role, created_at, ${profileImageColumn}
          `,
          [
            fullName,
            email,
            passwordHash,
            "user",
            resolvedProfileImageUrl
          ]
        )
      : await pool.query(
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
    const sessionUser = buildSessionUser(user, profileImageColumn);

    if (!profileImageColumn) {
      sessionUser.profileImageUrl = resolvedProfileImageUrl;
    }

    req.session.user = sessionUser;

    res.status(201).json({
      message: "Signup successful",
      user: req.session.user
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to sign up" });
  }
});

// Login route
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
    const profileImageColumn = await getProfileImageColumn();

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.user = buildSessionUser(user, profileImageColumn);

    res.status(200).json({
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
});

// Logout route
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

app.put("/api/auth/profile", requireAuth, async (req, res) => {
  try {
    const { fullName, profileImageUrl } = req.body;
    const resolvedFullName = typeof fullName === "string" ? fullName.trim() : "";
    const resolvedProfileImageUrl = normalizeProfileImageUrl(profileImageUrl);

    if (!resolvedFullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (profileImageUrl && !resolvedProfileImageUrl) {
      return res.status(400).json({
        message: "Profile image URL must be a valid http or https link"
      });
    }

    const profileImageColumn = await getProfileImageColumn();

    const result = profileImageColumn
      ? await pool.query(
          `
          UPDATE users
          SET full_name = $1,
              ${profileImageColumn} = $2
          WHERE id = $3
          RETURNING id, full_name, email, role, ${profileImageColumn}
          `,
          [resolvedFullName, resolvedProfileImageUrl, req.session.user.id]
        )
      : await pool.query(
          `
          UPDATE users
          SET full_name = $1
          WHERE id = $2
          RETURNING id, full_name, email, role
          `,
          [resolvedFullName, req.session.user.id]
        );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const sessionUser = buildSessionUser(result.rows[0], profileImageColumn);

    if (!profileImageColumn) {
      sessionUser.profileImageUrl = resolvedProfileImageUrl || null;
    }

    req.session.user = sessionUser;

    res.status(200).json({
      message: "Profile updated successfully",
      user: req.session.user
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

app.put("/api/auth/password", requireAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const result = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [req.session.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, req.session.user.id]
    );

    req.session.destroy((err) => {
      if (err) {
        console.error("Password change logout error:", err);
        return res.status(500).json({ message: "Password changed, but logout failed" });
      }

      res.clearCookie("connect.sid");
      res.status(200).json({
        message: "Password changed successfully. Please log in again."
      });
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
});

/* ==================================================
   Dashboard Analytics Routes
   ================================================== */

function mapDashboardVideo(row) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    uploader: row.uploader_name,
    views: Number(row.view_count || 0),
    rating: Number(row.rating || 0),
    createdAt: row.created_at
  };
}

function mapDashboardInternship(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companyEmail: row.company_email,
    category: row.category,
    type: row.employment_type,
    location: row.location,
    deadline: row.deadline,
    createdAt: row.created_at
  };
}

app.get("/api/dashboard", requireAuth, async (req, res) => {
  try {
    const isAdmin = req.session.user.role === "admin";

    const [
      videoStatsResult,
      internshipStatsResult,
      eventStatsResult,
      topVideosResult,
      subjectPopularityResult,
      internshipInterestResult,
      recommendedVideosResult,
      recommendedInternshipsResult
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_videos,
          COALESCE(SUM(view_count), 0)::int AS total_views,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating
        FROM videos
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_internships,
          COUNT(*) FILTER (WHERE deadline IS NULL OR deadline >= CURRENT_DATE)::int AS active_internships
        FROM internships
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_events,
          COUNT(*) FILTER (WHERE date IS NULL OR date >= CURRENT_DATE)::int AS upcoming_events
        FROM events
      `),
      pool.query(`
        SELECT
          id,
          title,
          subject,
          description,
          thumbnail_url,
          uploader_name,
          view_count,
          rating,
          created_at
        FROM videos
        ORDER BY view_count DESC, rating DESC, id DESC
        LIMIT 3
      `),
      pool.query(`
        SELECT
          COALESCE(NULLIF(subject, ''), 'Uncategorized') AS subject,
          COUNT(*)::int AS video_count,
          COALESCE(SUM(view_count), 0)::int AS total_views,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating
        FROM videos
        GROUP BY COALESCE(NULLIF(subject, ''), 'Uncategorized')
        ORDER BY total_views DESC, video_count DESC, subject ASC
        LIMIT 8
      `),
      pool.query(`
        SELECT
          category,
          SUM(source_count)::int AS interest_count
        FROM (
          SELECT
            COALESCE(NULLIF(category, ''), 'Uncategorized') AS category,
            COUNT(*)::int AS source_count
          FROM internships
          GROUP BY COALESCE(NULLIF(category, ''), 'Uncategorized')

          UNION ALL

          SELECT
            COALESCE(NULLIF(category, ''), 'Uncategorized') AS category,
            COUNT(*)::int AS source_count
          FROM internship_notifications
          GROUP BY COALESCE(NULLIF(category, ''), 'Uncategorized')
        ) interest_sources
        GROUP BY category
        ORDER BY interest_count DESC, category ASC
        LIMIT 8
      `),
      pool.query(`
        SELECT
          id,
          title,
          subject,
          description,
          thumbnail_url,
          uploader_name,
          view_count,
          rating,
          created_at
        FROM videos
        ORDER BY rating DESC, view_count DESC, id DESC
        LIMIT 6
      `),
      pool.query(`
        SELECT
          id,
          title,
          company,
          company_email,
          category,
          employment_type,
          location,
          deadline,
          created_at
        FROM internships
        LIMIT 3
      `)
    ]);

    const pendingNotificationsResult = isAdmin
      ? await pool.query(`
          SELECT COUNT(*)::int AS pending_notifications
          FROM internship_notifications
          WHERE status IS NULL OR status != 'approved'
        `)
      : { rows: [{ pending_notifications: 0 }] };

    const usersResult = isAdmin
      ? await pool.query("SELECT COUNT(*)::int AS total_users FROM users")
      : { rows: [{ total_users: 0 }] };

    const hasUnrepliedCommentAlerts = isAdmin
      ? (await getUnrepliedCommentAlertCount()) > 0
      : false;

    const videoStats = videoStatsResult.rows[0] || {};
    const internshipStats = internshipStatsResult.rows[0] || {};
    const eventStats = eventStatsResult.rows[0] || {};

    res.status(200).json({
      viewer: {
        id: req.session.user.id,
        fullName: req.session.user.fullName,
        role: req.session.user.role
      },
      generatedAt: new Date().toISOString(),
      refreshIntervalMs: 300000,
      stats: {
        totalVideos: Number(videoStats.total_videos || 0),
        totalViews: Number(videoStats.total_views || 0),
        averageRating: Number(videoStats.average_rating || 0),
        totalInternships: Number(internshipStats.total_internships || 0),
        activeInternships: Number(internshipStats.active_internships || 0),
        totalEvents: Number(eventStats.total_events || 0),
        upcomingEvents: Number(eventStats.upcoming_events || 0),
        totalUsers: Number(usersResult.rows[0]?.total_users || 0),
        hasUnrepliedCommentAlerts,
        pendingInternshipNotifications: Number(
          pendingNotificationsResult.rows[0]?.pending_notifications || 0
        )
      },
      topVideos: topVideosResult.rows.map(mapDashboardVideo),
      subjectPopularity: subjectPopularityResult.rows.map((row) => ({
        subject: row.subject,
        videoCount: Number(row.video_count || 0),
        totalViews: Number(row.total_views || 0),
        averageRating: Number(row.average_rating || 0)
      })),
      internshipInterest: internshipInterestResult.rows.map((row) => ({
        category: row.category,
        interestCount: Number(row.interest_count || 0)
      })),
      recommendations: {
        videos: recommendedVideosResult.rows.map(mapDashboardVideo),
        internships: recommendedInternshipsResult.rows.map(mapDashboardInternship)
      }
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ message: "Failed to load dashboard analytics" });
  }
});

/* ==================================================
   Rating Routes for Videos
   ================================================== */

// Rate a video
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

// Get current user's rating for a video
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
   Video Comment Routes
   ================================================== */

function mapCommentRow(row) {
  return {
    id: row.id,
    videoId: row.video_id,
    userId: row.user_id,
    parentCommentId: row.parent_comment_id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    canEdit: Boolean(row.can_edit),
    canDelete: Boolean(row.can_delete),
    author: {
      id: row.user_id,
      fullName: row.full_name || "Deleted User",
      role: row.role || "user"
    }
  };
}

function mapCommentAlertRow(row) {
  return {
    id: row.id,
    videoId: row.video_id,
    videoTitle: row.video_title,
    videoSubject: row.video_subject,
    body: row.body,
    createdAt: row.created_at,
    adminSeenAt: row.admin_seen_at,
    replyCount: Number(row.reply_count || 0),
    author: {
      id: row.user_id,
      fullName: row.full_name || "Deleted User",
      role: row.role || "user"
    }
  };
}

function nestCommentRows(rows) {
  const topLevelComments = [];
  const commentMap = new Map();

  rows.forEach((row) => {
    const comment = {
      ...mapCommentRow(row),
      replies: []
    };

    commentMap.set(comment.id, comment);

    if (!comment.parentCommentId) {
      topLevelComments.push(comment);
    }
  });

  rows.forEach((row) => {
    if (!row.parent_comment_id) {
      return;
    }

    const reply = commentMap.get(row.id);
    const parent = commentMap.get(row.parent_comment_id);

    if (reply && parent) {
      parent.replies.push(reply);
    }
  });

  return topLevelComments;
}

async function ensureVideoExists(videoId) {
  const result = await pool.query(
    "SELECT id FROM videos WHERE id = $1",
    [videoId]
  );

  return result.rows.length > 0;
}

async function getVideoComments(videoId, currentUser) {
  const result = await pool.query(
    `
    SELECT
      vc.id,
      vc.video_id,
      vc.user_id,
      vc.parent_comment_id,
      vc.body,
      vc.created_at,
      vc.updated_at,
      u.full_name,
      u.role,
      (vc.user_id = $2) AS can_edit,
      (vc.user_id = $2 OR $3 = 'admin') AS can_delete
    FROM video_comments vc
    LEFT JOIN users u ON u.id = vc.user_id
    WHERE vc.video_id = $1
    ORDER BY
      COALESCE(vc.parent_comment_id, vc.id) ASC,
      vc.parent_comment_id NULLS FIRST,
      vc.created_at ASC,
      vc.id ASC
    `,
    [videoId, currentUser.id, currentUser.role]
  );

  return nestCommentRows(result.rows);
}

async function getUnrepliedCommentAlertCount() {
  const result = await pool.query(`
    SELECT COUNT(*)::int AS unreplied_count
    FROM video_comments vc
    LEFT JOIN users u ON u.id = vc.user_id
    WHERE vc.parent_comment_id IS NULL
      AND COALESCE(u.role, 'user') != 'admin'
      AND NOT EXISTS (
        SELECT 1
        FROM video_comments replies
        INNER JOIN users reply_users ON reply_users.id = replies.user_id
        WHERE replies.parent_comment_id = vc.id
          AND reply_users.role = 'admin'
      )
  `);

  return Number(result.rows[0]?.unreplied_count || 0);
}

app.get("/api/admin/comment-alerts", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        vc.id,
        vc.video_id,
        vc.user_id,
        vc.body,
        vc.created_at,
        vc.admin_seen_at,
        u.full_name,
        u.role,
        v.title AS video_title,
        v.subject AS video_subject,
        COUNT(admin_reply_users.id)::int AS reply_count
      FROM video_comments vc
      LEFT JOIN users u ON u.id = vc.user_id
      INNER JOIN videos v ON v.id = vc.video_id
      LEFT JOIN video_comments admin_replies ON admin_replies.parent_comment_id = vc.id
      LEFT JOIN users admin_reply_users
        ON admin_reply_users.id = admin_replies.user_id
       AND admin_reply_users.role = 'admin'
      WHERE vc.parent_comment_id IS NULL
        AND COALESCE(u.role, 'user') != 'admin'
        AND NOT EXISTS (
          SELECT 1
          FROM video_comments replies
          INNER JOIN users reply_users ON reply_users.id = replies.user_id
          WHERE replies.parent_comment_id = vc.id
            AND reply_users.role = 'admin'
        )
      GROUP BY
        vc.id,
        vc.video_id,
        vc.user_id,
        vc.body,
        vc.created_at,
        vc.admin_seen_at,
        u.full_name,
        u.role,
        v.title,
        v.subject
      ORDER BY
        vc.created_at DESC,
        vc.id DESC
      LIMIT 10
    `);

    res.status(200).json({
      hasUnreplied: result.rows.length > 0,
      alerts: result.rows.map(mapCommentAlertRow)
    });
  } catch (error) {
    console.error("Error fetching admin comment alerts:", error);
    res.status(500).json({ message: "Failed to fetch comment alerts" });
  }
});

app.patch("/api/admin/comment-alerts/mark-seen", requireAdmin, async (req, res) => {
  try {
    await pool.query(`
      UPDATE video_comments vc
      SET admin_seen_at = CURRENT_TIMESTAMP
      WHERE vc.parent_comment_id IS NULL
        AND vc.admin_seen_at IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM users u
          WHERE u.id = vc.user_id
            AND u.role = 'admin'
        )
    `);

    res.status(200).json({
      message: "Comment alerts marked as seen",
      hasUnreplied: await getUnrepliedCommentAlertCount() > 0
    });
  } catch (error) {
    console.error("Error marking comment alerts as seen:", error);
    res.status(500).json({ message: "Failed to mark alerts as seen" });
  }
});

app.get("/api/videos/:id/comments", requireAuth, async (req, res) => {
  try {
    const videoId = Number(req.params.id);

    if (!Number.isInteger(videoId)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    res.status(200).json({
      comments: await getVideoComments(videoId, req.session.user)
    });
  } catch (error) {
    console.error("Error fetching video comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

app.post("/api/videos/:id/comments", requireAuth, async (req, res) => {
  try {
    const videoId = Number(req.params.id);
    const userId = req.session.user.id;
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";

    if (req.session.user.role === "admin") {
      return res.status(403).json({ message: "Admins can reply to comments, not create new comment threads" });
    }

    if (!Number.isInteger(videoId)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    if (!body) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (body.length > 1000) {
      return res.status(400).json({ message: "Comment must be 1000 characters or fewer" });
    }

    const videoExists = await ensureVideoExists(videoId);

    if (!videoExists) {
      return res.status(404).json({ message: "Video not found" });
    }

    await pool.query(
      `
      INSERT INTO video_comments (video_id, user_id, body)
      VALUES ($1, $2, $3)
      `,
      [videoId, userId, body]
    );

    res.status(201).json({
      message: "Comment added",
      comments: await getVideoComments(videoId, req.session.user)
    });
  } catch (error) {
    console.error("Error adding video comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

app.post("/api/videos/:id/comments/:commentId/replies", requireAdmin, async (req, res) => {
  try {
    const videoId = Number(req.params.id);
    const commentId = Number(req.params.commentId);
    const userId = req.session.user.id;
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";

    if (!Number.isInteger(videoId) || !Number.isInteger(commentId)) {
      return res.status(400).json({ message: "Invalid comment request" });
    }

    if (!body) {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    if (body.length > 1000) {
      return res.status(400).json({ message: "Reply must be 1000 characters or fewer" });
    }

    const parentResult = await pool.query(
      `
      SELECT id
      FROM video_comments
      WHERE id = $1
        AND video_id = $2
        AND parent_comment_id IS NULL
      `,
      [commentId, videoId]
    );

    if (parentResult.rows.length === 0) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const existingAdminReplyResult = await pool.query(
      `
      SELECT replies.id
      FROM video_comments replies
      INNER JOIN users reply_users ON reply_users.id = replies.user_id
      WHERE replies.parent_comment_id = $1
        AND replies.video_id = $2
        AND reply_users.role = 'admin'
      LIMIT 1
      `,
      [commentId, videoId]
    );

    if (existingAdminReplyResult.rows.length > 0) {
      return res.status(409).json({
        message: "This comment already has an admin reply. Edit the existing reply instead."
      });
    }

    await pool.query(
      `
      INSERT INTO video_comments (video_id, user_id, parent_comment_id, body)
      VALUES ($1, $2, $3, $4)
      `,
      [videoId, userId, commentId, body]
    );

    res.status(201).json({
      message: "Reply added",
      comments: await getVideoComments(videoId, req.session.user)
    });
  } catch (error) {
    console.error("Error adding video comment reply:", error);
    res.status(500).json({ message: "Failed to add reply" });
  }
});

app.put("/api/videos/:id/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const videoId = Number(req.params.id);
    const commentId = Number(req.params.commentId);
    const userId = req.session.user.id;
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";

    if (!Number.isInteger(videoId) || !Number.isInteger(commentId)) {
      return res.status(400).json({ message: "Invalid comment request" });
    }

    if (!body) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (body.length > 1000) {
      return res.status(400).json({ message: "Comment must be 1000 characters or fewer" });
    }

    const commentResult = await pool.query(
      `
      SELECT id, user_id
      FROM video_comments
      WHERE id = $1
        AND video_id = $2
      `,
      [commentId, videoId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    await pool.query(
      `
      UPDATE video_comments
      SET body = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND video_id = $3
      `,
      [body, commentId, videoId]
    );

    res.status(200).json({
      message: "Comment updated",
      comments: await getVideoComments(videoId, req.session.user)
    });
  } catch (error) {
    console.error("Error updating video comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
});

app.delete("/api/videos/:id/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const videoId = Number(req.params.id);
    const commentId = Number(req.params.commentId);
    const userId = req.session.user.id;
    const isAdmin = req.session.user.role === "admin";

    if (!Number.isInteger(videoId) || !Number.isInteger(commentId)) {
      return res.status(400).json({ message: "Invalid comment request" });
    }

    const commentResult = await pool.query(
      `
      SELECT id, user_id
      FROM video_comments
      WHERE id = $1
        AND video_id = $2
      `,
      [commentId, videoId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!isAdmin && commentResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await pool.query(
      `
      DELETE FROM video_comments
      WHERE id = $1
        AND video_id = $2
      `,
      [commentId, videoId]
    );

    res.status(200).json({
      message: "Comment deleted",
      comments: await getVideoComments(videoId, req.session.user)
    });
  } catch (error) {
    console.error("Error deleting video comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

/* ==================================================
   Video Routes (CRUD)
   ================================================== */

// Get all videos
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

// Get one video by id
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

// Increase view count
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

// Add a new video
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

// Update a video
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

// Delete a video
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

// Get all internships
app.get("/api/internships", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        company,
        company_email,
        category,
        employment_type,
        location,
        description,
        deadline,
        created_at
      FROM internships
      ORDER BY id DESC
    `);

    const internships = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      gmail: row.company_email,
      companyEmail: row.company_email,
      category: row.category,
      type: row.employment_type,
      jobType: row.employment_type,
      employmentType: row.employment_type,
      location: row.location,
      description: row.description,
      deadline: row.deadline,
      created_at: row.created_at
    }));

    res.status(200).json(internships);
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({ message: "Failed to fetch internships." });
  }
});

// Get single internship by ID
app.get("/api/internships/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        company,
        company_email,
        category,
        employment_type,
        location,
        description,
        deadline,
        created_at
      FROM internships
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }

    const row = result.rows[0];

    res.status(200).json({
      id: row.id,
      title: row.title,
      company: row.company,
      gmail: row.company_email,
      companyEmail: row.company_email,
      category: row.category,
      type: row.employment_type,
      jobType: row.employment_type,
      employmentType: row.employment_type,
      location: row.location,
      description: row.description,
      deadline: row.deadline,
      created_at: row.created_at
    });
  } catch (error) {
    console.error("Error fetching internship by ID:", error);
    res.status(500).json({ message: "Failed to fetch internship details." });
  }
});

// Create internship (ADMIN ONLY)
app.post("/api/internships", requireAdmin, async (req, res) => {
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

    if (!title || !company || !resolvedEmail) {
      return res.status(400).json({
        message: "Title, company, and company email are required."
      });
    }

    const result = await pool.query(
      `
      INSERT INTO internships (
        title,
        company,
        company_email,
        category,
        employment_type,
        location,
        description,
        deadline
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        title,
        company,
        resolvedEmail,
        category || null,
        resolvedEmploymentType,
        location || null,
        description || null,
        deadline || null
      ]
    );

    const row = result.rows[0];

    res.status(201).json({
      id: row.id,
      title: row.title,
      company: row.company,
      gmail: row.company_email,
      companyEmail: row.company_email,
      category: row.category,
      type: row.employment_type,
      jobType: row.employment_type,
      employmentType: row.employment_type,
      location: row.location,
      description: row.description,
      deadline: row.deadline,
      created_at: row.created_at
    });
  } catch (error) {
    console.error("Error creating internship:", error);
    res.status(500).json({ message: "Failed to create internship." });
  }
});

// Update internship (ADMIN ONLY)
app.put("/api/internships/:id", requireAdmin, async (req, res) => {
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

    if (!title || !company || !resolvedEmail) {
      return res.status(400).json({
        message: "Title, company, and company email are required."
      });
    }

    const result = await pool.query(
      `
      UPDATE internships
      SET
        title = $1,
        company = $2,
        company_email = $3,
        category = $4,
        employment_type = $5,
        location = $6,
        description = $7,
        deadline = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        title,
        company,
        resolvedEmail,
        category || null,
        resolvedEmploymentType,
        location || null,
        description || null,
        deadline || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }

    const row = result.rows[0];

    res.status(200).json({
      id: row.id,
      title: row.title,
      company: row.company,
      gmail: row.company_email,
      companyEmail: row.company_email,
      category: row.category,
      type: row.employment_type,
      jobType: row.employment_type,
      employmentType: row.employment_type,
      location: row.location,
      description: row.description,
      deadline: row.deadline,
      created_at: row.created_at
    });
  } catch (error) {
    console.error("Error updating internship:", error);
    res.status(500).json({ message: "Failed to update internship." });
  }
});

// Delete internship (ADMIN ONLY)
app.delete("/api/internships/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM internships
      WHERE id = $1
      RETURNING *
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

/* ==================================================
   INTERNSHIP NOTIFICATIONS
   ================================================== */

// Student submits internship notification
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

// Approve internship notification and add to internships table
app.post("/api/internship-notifications/:id/approve", requireAdmin, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const notificationResult = await client.query(
      `
      SELECT
        id,
        company,
        company_email,
        internship_title,
        category,
        employment_type,
        location,
        deadline,
        description,
        status
      FROM internship_notifications
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (notificationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Internship notification not found." });
    }

    const notification = notificationResult.rows[0];

    if (notification.status === "approved") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This notification is already approved." });
    }

    const internshipInsertResult = await client.query(
      `
      INSERT INTO internships (
        title,
        company,
        company_email,
        category,
        employment_type,
        location,
        description,
        deadline
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        notification.internship_title,
        notification.company,
        notification.company_email,
        notification.category || null,
        notification.employment_type || null,
        notification.location || null,
        notification.description || null,
        notification.deadline || null
      ]
    );

    await client.query(
      `
      UPDATE internship_notifications
      SET status = 'approved'
      WHERE id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Internship notification approved and added to internships.",
      internship: internshipInsertResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error approving internship notification:", error);
    res.status(500).json({ message: "Failed to approve internship notification." });
  } finally {
    client.release();
  }
});

// Admin gets all internship notifications
app.get("/api/internship-notifications", requireAdmin, async (req, res) => {
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
        status,
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

/* ==================================================
   EVENTS ROUTES
   ================================================== */

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        organizer,
        location,
        date,
        description,
        created_at
      FROM events
      ORDER BY id DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});

// Get single event
app.get("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM events WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event." });
  }
});

// Create event (ADMIN ONLY)
app.post("/api/events", requireAdmin, async (req, res) => {
  try {
    const { title, organizer, location, date, description } = req.body;

    if (!title || !organizer) {
      return res.status(400).json({ message: "Title and organizer required" });
    }

    const result = await pool.query(
      `
      INSERT INTO events (title, organizer, location, date, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [title, organizer, location, date, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// Update event (ADMIN ONLY)
app.put("/api/events/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, organizer, location, date, description } = req.body;

    const result = await pool.query(
      `
      UPDATE events
      SET title = $1,
          organizer = $2,
          location = $3,
          date = $4,
          description = $5
      WHERE id = $6
      RETURNING *
      `,
      [title, organizer, location, date, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// Delete event (ADMIN ONLY)
app.delete("/api/events/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM events WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
