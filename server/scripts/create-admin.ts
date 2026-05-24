/**
 * Bootstrap an admin user. Reads ADMIN_EMAIL + ADMIN_PASSWORD from env,
 * hashes with bcrypt, and inserts into auth_user + profile (role=admin).
 * Idempotent: if the email already exists, updates the password instead.
 *
 *   ADMIN_EMAIL=tita@fourlinq.ph ADMIN_PASSWORD=xxx \
 *     npx tsx server/scripts/create-admin.ts
 */
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import pool from "../db.js";

const ORG_ID = 1;

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "tita@fourlinq.ph").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error("ADMIN_PASSWORD env var required");
    process.exit(1);
  }
  const firstName = process.env.ADMIN_FIRST_NAME ?? "Tita";
  const lastName = process.env.ADMIN_LAST_NAME ?? "Soriano";

  const hash = await bcrypt.hash(password, 12);

  // Look up admin role
  const { rows: roleRows } = await pool.query(
    `SELECT role_id FROM role WHERE organization_id = $1 AND name = 'admin' LIMIT 1`,
    [ORG_ID]
  );
  if (!roleRows[0]) {
    console.error("admin role not found — run migration 007 first");
    process.exit(1);
  }
  const roleId = Number(roleRows[0].role_id);

  // Upsert auth_user
  const existing = await pool.query(
    `SELECT auth_user_id FROM auth_user WHERE email = $1`, [email]
  );
  let authUserId: number;
  if (existing.rowCount && existing.rowCount > 0) {
    authUserId = Number(existing.rows[0].auth_user_id);
    await pool.query(
      `UPDATE auth_user SET password_hash = $1, is_active = true, updated_at = NOW()
       WHERE auth_user_id = $2`,
      [hash, authUserId]
    );
    console.log(`♻️  Updated password for ${email} (auth_user_id=${authUserId})`);
  } else {
    const ins = await pool.query(
      `INSERT INTO auth_user (email, password_hash, is_verified, is_active)
       VALUES ($1, $2, true, true) RETURNING auth_user_id`,
      [email, hash]
    );
    authUserId = Number(ins.rows[0].auth_user_id);
    console.log(`✨ Created auth_user ${email} (auth_user_id=${authUserId})`);
  }

  // Upsert profile
  const profileExists = await pool.query(
    `SELECT profile_id FROM profile WHERE auth_user_id = $1 AND organization_id = $2`,
    [authUserId, ORG_ID]
  );
  if (profileExists.rowCount && profileExists.rowCount > 0) {
    await pool.query(
      `UPDATE profile SET role_id = $1, first_name = $2, last_name = $3,
       is_active = true, updated_at = NOW()
       WHERE auth_user_id = $4 AND organization_id = $5`,
      [roleId, firstName, lastName, authUserId, ORG_ID]
    );
    console.log(`♻️  Updated profile (role=admin)`);
  } else {
    await pool.query(
      `INSERT INTO profile (auth_user_id, organization_id, role_id, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [authUserId, ORG_ID, roleId, firstName, lastName]
    );
    console.log(`✨ Created profile (role=admin) for ${firstName} ${lastName}`);
  }

  await pool.end();
  console.log(`\n✅ Login at /admin with ${email}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
