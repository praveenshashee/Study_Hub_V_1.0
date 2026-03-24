// Import the Pool class from the pg package
// Pool is used to manage PostgreSQL connections more efficiently
import pg from "pg";

const { Pool } = pg;

// Create a connection pool
// Replace the password and database name with your own PostgreSQL details
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "StudyHub",
  password: "root",
  port: 5432
});

// Export the pool so we can use it in server.js
export default pool;