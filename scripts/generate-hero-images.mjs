/**
 * Enhance FourlinQ project photos using Vertex AI Imagen 3.
 *
 * Usage: node scripts/generate-hero-images.mjs
 */

import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// --- Config ---
const SA_KEY_PATH = "/Users/angelonrevelo/Downloads/bygelo-app-57792028448e.json";
const PROJECT_ID = "bygelo-app";
const REGION = "us-central1";
const OUTPUT_DIR = path.join(ROOT, "public", "images", "generated");

const ENHANCE_IMAGES = [
  {
    name: "hero-windows",
    source: "public/images/wp-export/FourlinQ_Project-3.jpg",
    prompt: "Enhance this real estate photo. Make the sky vivid blue, sharpen architectural details, make the landscaping lush green, improve lighting to warm golden hour, increase resolution and clarity. Keep the original building exactly the same.",
  },
  {
    name: "hero-doors",
    source: "public/images/wp-export/FourlinQ_Project-5.jpg",
    prompt: "Enhance this real estate photo. Make the sky vivid blue with white clouds, sharpen architectural details, improve color vibrancy, make the pool water crystal clear blue, warm natural lighting, increase resolution and clarity. Keep the original building exactly the same.",
  },
  {
    name: "hero-specialist",
    source: "public/images/wp-export/FourlinQ_Project-4.jpg",
    prompt: "Enhance this real estate photo. Sharpen architectural details, improve color vibrancy, make greenery lush, warm golden hour lighting, vivid blue sky, increase resolution and clarity. Keep the original building exactly the same.",
  },
];

async function enhanceImages() {
  const auth = new GoogleAuth({
    keyFile: SA_KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    console.error("Failed to get access token");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Imagen 3 editing endpoint
  const editEndpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/imagen-3.0-capability-001:predict`;

  for (const { name, source, prompt } of ENHANCE_IMAGES) {
    const sourcePath = path.join(ROOT, source);
    console.log(`\nEnhancing: ${name}`);
    console.log(`  Source: ${source}`);

    if (!fs.existsSync(sourcePath)) {
      console.error(`  Source file not found: ${sourcePath}`);
      continue;
    }

    const imageBytes = fs.readFileSync(sourcePath);
    const imageBase64 = imageBytes.toString("base64");
    console.log(`  Source size: ${(imageBytes.length / 1024).toFixed(0)} KB`);

    try {
      const res = await fetch(editEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt,
              referenceImages: [
                {
                  referenceType: "REFERENCE_TYPE_STYLE",
                  referenceId: 0,
                  referenceImage: {
                    bytesBase64Encoded: imageBase64,
                  },
                },
              ],
            },
          ],
          parameters: {
            sampleCount: 1,
            personGeneration: "dont_allow",
            safetySetting: "block_few",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`  ERROR ${res.status}: ${err}`);

        // Fallback: try upscale endpoint
        console.log("  Trying upscale fallback...");
        const upscaleEndpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/imagen-3.0-generate-001:predict`;

        const fallbackRes = await fetch(upscaleEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [
              {
                prompt,
                image: { bytesBase64Encoded: imageBase64 },
              },
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: "4:3",
              personGeneration: "dont_allow",
              safetySetting: "block_few",
            },
          }),
        });

        if (!fallbackRes.ok) {
          const fallbackErr = await fallbackRes.text();
          console.error(`  Fallback ERROR ${fallbackRes.status}: ${fallbackErr}`);
          continue;
        }

        const fallbackData = await fallbackRes.json();
        if (fallbackData.predictions?.[0]?.bytesBase64Encoded) {
          const buffer = Buffer.from(fallbackData.predictions[0].bytesBase64Encoded, "base64");
          const outPath = path.join(OUTPUT_DIR, `${name}.png`);
          fs.writeFileSync(outPath, buffer);
          console.log(`  Saved (fallback): ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
        }
        continue;
      }

      const data = await res.json();

      if (!data.predictions?.[0]?.bytesBase64Encoded) {
        console.error("  No predictions returned");
        console.log("  Response:", JSON.stringify(data).slice(0, 200));
        continue;
      }

      const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
      const outPath = path.join(OUTPUT_DIR, `${name}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`  Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`  Error enhancing ${name}:`, err.message);
    }
  }

  console.log("\nDone!");
}

enhanceImages();
