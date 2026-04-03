import pg from "pg";

const { Pool } = pg;

export function shouldUsePostgres() {
  return (
    (process.env.STORAGE_DRIVER || "").toLowerCase() === "postgres" ||
    Boolean(process.env.DATABASE_URL)
  );
}

export function createPostgresPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  return new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "StudyHub",
    password: process.env.POSTGRES_PASSWORD || "",
    port: Number(process.env.POSTGRES_PORT || 5432)
  });
}
