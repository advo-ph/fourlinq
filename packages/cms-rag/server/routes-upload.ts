/**
 * Media upload router factory. Saves files to a configurable directory and
 * registers a row in a configurable media table (default `cms_media_asset`).
 *
 *   const upload = createUploadRouter({ pool, organizationId, uploadDir, publicPrefix });
 *   app.use("/api/admin/cms/media", requireAuth, upload);
 *
 * `publicPrefix` must match an Express static mount or nginx alias so the
 * returned `file_path` is publicly retrievable.
 */
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import type { Pool } from "pg";

export interface UploadRouterConfig {
  pool: Pool;
  organizationId: number;
  /** Absolute path where files are written. Created if missing. */
  uploadDir: string;
  /** URL prefix prepended to filenames in the returned file_path (no trailing slash). */
  publicPrefix: string;
  /** Optional override for the media table. Default `cms_media_asset`. */
  table?: string;
  /** Max file size in bytes. Default 15 MB. */
  maxSizeBytes?: number;
  /** Mime regex. Default images only. */
  allowedMime?: RegExp;
}

export function createUploadRouter(config: UploadRouterConfig): Router {
  const {
    pool, organizationId, uploadDir, publicPrefix,
    table = "cms_media_asset",
    maxSizeBytes = 15 * 1024 * 1024,
    allowedMime = /^image\/(jpe?g|png|webp|gif|avif|svg\+xml)$/,
  } = config;

  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".bin";
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rand = crypto.randomBytes(5).toString("hex");
      cb(null, `${stamp}-${rand}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (_req, file, cb) => {
      if (!allowedMime.test(file.mimetype)) return cb(new Error(`Unsupported mime: ${file.mimetype}`));
      cb(null, true);
    },
  });

  const router = Router();

  router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "no file" });
    const publicPath = `${publicPrefix}/${req.file.filename}`;
    try {
      const { rows } = await pool.query(
        `INSERT INTO ${table}
          (organization_id, file_path, alt_text, byte_size, source)
         VALUES ($1, $2, $3, $4, 'upload')
         RETURNING cms_media_asset_id, file_path`,
        [organizationId, publicPath, req.body?.alt_text ?? null, req.file.size],
      );
      res.json({
        cms_media_asset_id: Number(rows[0].cms_media_asset_id),
        file_path: rows[0].file_path,
      });
    } catch (e) {
      fs.promises.unlink(req.file.path).catch(() => {});
      res.status(500).json({ error: `DB error: ${String(e)}` });
    }
  });

  return router;
}
