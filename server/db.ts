import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

export default pool;
