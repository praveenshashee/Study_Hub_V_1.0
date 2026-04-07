import dotenv from "dotenv";
dotenv.config();

import pg from "pg";

// Create a connection pool to the PostgreSQL database
const { Pool } = pg;

// Determine if SSL should be used based on the environment variable
const useSSL = process.env.DB_SSL === "true";

// Create a new pool instance with the connection string and SSL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

// Test the database connection
pool.connect()
  .then(() => console.log("PostgreSQL connected successfully"))
  .catch((err) => console.error("PostgreSQL connection error:", err));

export default pool;