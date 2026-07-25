/**
 * verify-gallery-fix-curl.mjs
 *
 * API-level verification for the project-detail gallery fix.
 * Does NOT require puppeteer — verifies the server response is correct.
 * Also verifies the sarangani scenario works as expected.
 */

const BASE = "http://localhost:3001";
const PROJECT_ID = "sarangani-s-residence";

const EXPECTED_GALLERY = [
  "/uploads/cms/test-replace-1.png",
  "/uploads/cms/test-replace-2.png",
];

const FORBIDDEN_ORIGINALS = [
  "/images/projects-fb/sarangani-s-residence.jpg",
  "/images/projects-fb/sarangani-s-residence-2.jpg",
  "/images/projects-fb/sarangani-s-residence-3.jpg",
  "/images/projects-fb/sarangani-s-residence-4.jpg",
];

async function main() {
  console.log("=== ProjectDetail Gallery Fix — API Verification ===\n");

  // Force refresh to bypass server cache
  const res = await fetch(`${BASE}/api/project-images/merged?_r=1`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const gallery = data.projectGalleryImages?.[PROJECT_ID] ?? null;
  const cover = data.projectCoverImages?.[PROJECT_ID] ?? null;
  const hidden = data.hiddenImages?.[PROJECT_ID] ?? [];
  const replaced = data.replacedImages?.[PROJECT_ID] ?? {};

  let allPassed = true;

  console.log("1. projectGalleryImages present in response?");
  const hasField = "projectGalleryImages" in data;
  console.log(`   ${hasField ? "[PASS]" : "[FAIL]"} projectGalleryImages in response`);
  if (!hasField) allPassed = false;

  console.log("\n2. Gallery count = 2 (only the replacement images)?");
  const countOk = gallery !== null && gallery.length === 2;
  console.log(`   ${countOk ? "[PASS]" : "[FAIL]"} count=${gallery?.length ?? "null"} expected=2`);
  console.log(`   gallery: ${JSON.stringify(gallery)}`);
  if (!countOk) allPassed = false;

  console.log("\n3. Expected replacement paths present in gallery?");
  for (const exp of EXPECTED_GALLERY) {
    const found = gallery?.includes(exp) ?? false;
    console.log(`   ${found ? "[PASS]" : "[FAIL]"} ${exp}`);
    if (!found) allPassed = false;
  }

  console.log("\n4. No original paths in gallery?");
  for (const orig of FORBIDDEN_ORIGINALS) {
    const present = gallery?.includes(orig) ?? false;
    console.log(`   ${present ? "[FAIL]" : "[PASS]"} ${orig}`);
    if (present) allPassed = false;
  }

  console.log("\n5. Cover image = first replacement path?");
  const coverOk = cover === EXPECTED_GALLERY[0];
  console.log(`   ${coverOk ? "[PASS]" : "[FAIL]"} cover="${cover}" expected="${EXPECTED_GALLERY[0]}"`);
  if (!coverOk) allPassed = false;

  console.log("\n6. Hidden images correctly recorded?");
  const hiddenOk = hidden.length === 2;
  console.log(`   ${hiddenOk ? "[PASS]" : "[FAIL]"} hidden count=${hidden.length} (expected 2)`);
  console.log(`   hidden: ${JSON.stringify(hidden)}`);
  if (!hiddenOk) allPassed = false;

  console.log("\n7. Replaced map correctly recorded?");
  const replacedOk = Object.keys(replaced).length === 2;
  console.log(`   ${replacedOk ? "[PASS]" : "[FAIL]"} replaced entries=${Object.keys(replaced).length} (expected 2)`);
  console.log(`   replaced: ${JSON.stringify(replaced)}`);
  if (!replacedOk) allPassed = false;

  console.log("\n8. First gallery entry === cover (consistency check)?");
  const consistentOk = gallery?.[0] === cover;
  console.log(`   ${consistentOk ? "[PASS]" : "[FAIL]"} gallery[0]="${gallery?.[0]}" === cover="${cover}"`);
  if (!consistentOk) allPassed = false;

  console.log(`\n=== OVERALL: ${allPassed ? "ALL PASS" : "SOME FAILURES"} ===`);
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
