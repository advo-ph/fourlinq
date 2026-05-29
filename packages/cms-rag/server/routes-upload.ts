/**
 * Media upload router factory. Saves files to a configurable directory and
 * registers a row in a configurable media table (default `cms_media_asset`).
 *
 *   const upload = createUploadRouter({ pool, organizationId, uploadDir, publicPrefix });
 *   app.use("/api/admin/cms/media", requireAuth, upload);
 *
 * `publicPrefix` must match an Express static mount or nginx alias so the
 * returned `file_path` is publicly retrievable.
 *
 * When `resize` is configured (with `sharp` installed), uploads larger than
 * `resize.maxWidth` get downscaled to that width and a thumbnail at
 * `resize.thumbWidth` is written alongside. The thumbnail filename is
 * `{stem}-thumb{ext}` next to the main file.
 *
 * When `aspectRatioRange` is configured, the upload is rejected if the
 * aspect ratio falls outside the [min, max] range. Use this to keep
 * obviously-wrong-shape images (extreme panoramas, vertical strips) out of
 * product card slots.
 */
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import type { Pool } from "pg";

export interface UploadResizeConfig {
  /** Resize images wider than this (px). Default 1600. */
  maxWidth?: number;
  /** Thumbnail width (px). Default 480. */
  thumbWidth?: number;
  /** JPEG / WebP quality (1-100). Default 82. */
  quality?: number;
}

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
  /** Enable sharp-based downscale + thumbnail generation. Off by default. */
  resize?: UploadResizeConfig;
  /** [minRatio, maxRatio] = width / height. Outside this range → reject. */
  aspectRatioRange?: [number, number];
}

export function createUploadRouter(config: UploadRouterConfig): Router {
  const {
    pool, organizationId, uploadDir, publicPrefix,
    table = "cms_media_asset",
    maxSizeBytes = 15 * 1024 * 1024,
    allowedMime = /^image\/(jpe?g|png|webp|gif|avif|svg\+xml)$/,
    resize,
    aspectRatioRange,
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

    // --- Sharp post-processing (resize + thumbnail + aspect check) ---
    // Lazy-import so the package doesn't hard-require sharp when consumers
    // don't configure resize/aspect-checking.
    let finalBytes = req.file.size;
    if (resize || aspectRatioRange) {
      try {
        const sharpMod = await import("sharp");
        const sharp = sharpMod.default;

        // Skip processing for GIF + SVG — sharp loses animation on GIF and
        // doesn't reflow SVG meaningfully. Save them as uploaded.
        const skipFormat = /^image\/(gif|svg\+xml)$/.test(req.file.mimetype);

        if (!skipFormat) {
          const inputPath = req.file.path;
          const metadata = await sharp(inputPath).metadata();
          const w = metadata.width ?? 0;
          const h = metadata.height ?? 0;

          // Aspect-ratio guard
          if (aspectRatioRange && w && h) {
            const ratio = w / h;
            const [minR, maxR] = aspectRatioRange;
            if (ratio < minR || ratio > maxR) {
              await fs.promises.unlink(inputPath).catch(() => {});
              return res.status(400).json({
                error: `Image aspect ratio ${ratio.toFixed(2)}:1 (${w}×${h}) is outside the allowed range ${minR}:1 to ${maxR}:1. Crop the image and try again.`,
              });
            }
          }

          // Resize main file in-place if oversized
          const maxWidth = resize?.maxWidth ?? 1600;
          const quality = resize?.quality ?? 82;
          if (resize && w > maxWidth) {
            const tmpPath = inputPath + ".tmp";
            await sharp(inputPath)
              .rotate() // honor EXIF orientation, then strip
              .resize({ width: maxWidth, withoutEnlargement: true })
              .toFile(tmpPath);
            await fs.promises.rename(tmpPath, inputPath);
            const stat = await fs.promises.stat(inputPath);
            finalBytes = stat.size;
          }

          // Generate thumbnail
          if (resize) {
            const thumbWidth = resize.thumbWidth ?? 480;
            const ext = path.extname(req.file.filename);
            const stem = req.file.filename.slice(0, -ext.length);
            const thumbName = `${stem}-thumb${ext}`;
            const thumbPath = path.join(uploadDir, thumbName);
            await sharp(inputPath)
              .resize({ width: thumbWidth, withoutEnlargement: true })
              .toFormat(ext === ".png" ? "png" : "jpeg", { quality })
              .toFile(thumbPath);
          }
        }
      } catch (e) {
        // Sharp failure should not abort upload — log + serve original.
        console.warn("[upload] sharp post-process failed; serving original.", e);
      }
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO ${table}
          (organization_id, file_path, alt_text, byte_size, source)
         VALUES ($1, $2, $3, $4, 'upload')
         RETURNING cms_media_asset_id, file_path`,
        [organizationId, publicPath, req.body?.alt_text ?? null, finalBytes],
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
