/**
 * Generate benefit images for the "Why uPVC" section.
 * Usage: node scripts/generate-benefit-images.mjs
 */

import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SA_KEY_PATH = "/Users/angelonrevelo/Downloads/bygelo-app-57792028448e.json";
const PROJECT_ID = "bygelo-app";
const REGION = "us-central1";
const MODEL = "imagen-3.0-generate-001";
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "generated");

const PROMPTS = [
  {
    name: "benefit-sound",
    prompt: "Interior of a quiet peaceful modern high-rise condo bedroom with closed sealed white uPVC windows, view of busy BGC Bonifacio Global City Manila skyline and traffic below through the closed glass, the room is calm and serene, soft morning light, cozy bed with white linens, warm tones, lifestyle photography, no people, windows completely shut and sealed",
  },
];

async function generate() {
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

  const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:predict`;

  for (const { name, prompt } of PROMPTS) {
    console.log(`\nGenerating: ${name}...`);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "4:3",
            personGeneration: "dont_allow",
            safetySetting: "block_few",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`  ERROR ${res.status}: ${err}`);
        continue;
      }

      const data = await res.json();
      if (!data.predictions?.[0]?.bytesBase64Encoded) {
        console.error("  No predictions returned");
        continue;
      }

      const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
      const outPath = path.join(OUTPUT_DIR, `${name}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`  Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

generate();
