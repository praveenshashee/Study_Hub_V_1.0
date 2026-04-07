import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const isSslEnabled = process.env.DB_SSL === "true";
const ssl = isSslEnabled ? { rejectUnauthorized: false } : undefined;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl
    })
  : new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "StudyHub",
      password: process.env.DB_PASSWORD || "root",
      port: Number(process.env.DB_PORT || 5432),
      ssl
    });

export default pool;
