import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log unexpected pool errors (e.g. connection drops) instead of crashing
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err.message);
});

// Graceful shutdown
const shutdown = async () => {
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default pool;
