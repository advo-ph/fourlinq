-- Migration 013: deactivate unsupported legacy knowledge and bound public copy.
--
-- This migration is intentionally conservative. It removes technical, pricing,
-- performance, lead-time, and warranty detail that the verified public sources
-- do not support. After applying it, run the revised generated-site seed and
-- embedding scripts so LinQ receives only the source-bounded knowledge set:
--
--   npx tsx server/scripts/seed-site-knowledge.ts
--   npx tsx server/scripts/seed-embeddings.ts

BEGIN;

-- Migration 004 seeded fabricated specifications, prices, service coverage,
-- performance figures, and warranty terms. Disable those bases. The generated
-- base is also disabled until the revised seed script reconciles and reactivates
-- its exact current source URLs.
UPDATE knowledge_base
SET is_active = false,
    updated_at = now()
WHERE name IN (
  'Product Facts',
  'Why uPVC',
  'FAQ',
  'Objection Handling',
  'Company Info',
  'Site Knowledge — Generated'
);

UPDATE knowledge_chunk
SET is_active = false,
    embedding = NULL,
    updated_at = now()
WHERE knowledge_base_id IN (
  SELECT knowledge_base_id
  FROM knowledge_base
  WHERE name IN (
    'Product Facts',
    'Why uPVC',
    'FAQ',
    'Objection Handling',
    'Company Info',
    'Site Knowledge — Generated'
  )
);

-- The product API is a browse surface, not a technical submittal. Clear legacy
-- option matrices and inferred numeric fields; the application now renders an
-- explicit confirmation boundary when these arrays are empty.
UPDATE product
SET short_description = 'Catalog orientation only; exact assembly requires FourlinQ confirmation.',
    description = name || ' is a public catalog record. Confirm the exact material, profile, operation, glass, hardware, finish, dimensions, ratings, availability, and price for the proposed opening.',
    technical_summary = NULL,
    min_width_mm = NULL,
    max_width_mm = NULL,
    min_height_mm = NULL,
    max_height_mm = NULL,
    lead_time_day = NULL,
    warranty_year = NULL,
    spec_labels = ARRAY[
      'Confirm the exact material, profile, operation, glass, hardware, finish, dimensions, ratings, availability, and price for the proposed opening.'
    ]::text[],
    finish_labels = ARRAY[]::text[],
    glass_labels = ARRAY[]::text[],
    updated_at = now()
WHERE organization_id = 1
  AND deleted_at IS NULL;

-- Preserve the historical join-table rows for audit/recovery. The non-null
-- editable arrays above intentionally prevent the public route from falling
-- back to those legacy bullets and option joins.

-- Correct stale CMS metadata. React owns the designed page bodies; these rows
-- must not reintroduce unsupported claims through metadata or future wiring.
UPDATE cms_page
SET meta_description = CASE route
      WHEN '/' THEN 'FourlinQ window and door catalog, project archive, published locations, and consultation pathways.'
      WHEN '/products' THEN 'Browse FourlinQ catalog names by opening type and profile material; confirm every exact assembly and option.'
      WHEN '/window-systems' THEN 'Window catalog names and operation summaries; request the exact proposed assembly and evidence.'
      WHEN '/door-systems' THEN 'Door catalog names and operation summaries; request the exact proposed assembly and evidence.'
      WHEN '/specialist-systems' THEN 'Specialist catalog names whose feasibility and technical evidence require project review.'
      WHEN '/why-upvc' THEN 'Brochure-listed uPVC labels and profile notes with explicit limits on unpublished ratings.'
      WHEN '/finishes' THEN 'The 12-entry uPVC sample library and separate client-supplied aluminium color names.'
      WHEN '/for-architects' THEN 'Technical-request checklist; drawings, tests, CAD, BIM, specifications, and warranty files require confirmation.'
      WHEN '/whats-new' THEN 'Published and fallback FourlinQ archive notes; unverified fallback dates are labeled.'
      WHEN '/brand' THEN 'Brochure promise, limited-warranty summary, published locations, and consultation pathway.'
      WHEN '/inspiration' THEN 'Project records compiled from FourlinQ published material; metadata remains under verification.'
      WHEN '/care' THEN 'Conservative public care checklist that defers to finish- and hardware-specific instructions.'
      WHEN '/warranty' THEN 'Bounded brochure summary of the 10-year label and four scope names; request current written terms.'
      WHEN '/design-tool' THEN 'Illustrative configuration brief; compatibility, ratings, price, and approval require review.'
      ELSE meta_description
    END,
    hero_heading = CASE route
      WHEN '/products' THEN 'Window, door, and specialist systems.'
      WHEN '/window-systems' THEN 'Window systems.'
      WHEN '/door-systems' THEN 'Door systems.'
      WHEN '/specialist-systems' THEN 'Specialist systems.'
      WHEN '/finishes' THEN 'Finish libraries.'
      WHEN '/for-architects' THEN 'Start with verified inputs.'
      WHEN '/brand' THEN 'Custom systems. Clear source boundaries.'
      WHEN '/inspiration' THEN 'Published project archive.'
      WHEN '/care' THEN 'Care starts with the installed system.'
      WHEN '/warranty' THEN 'The brochure states a 10-year limited warranty.'
      WHEN '/design-tool' THEN 'Sketch a window. Send it for review.'
      ELSE hero_heading
    END,
    hero_subheading = CASE route
      WHEN '/products' THEN 'Browse catalog names, then confirm the exact proposed assembly.'
      WHEN '/finishes' THEN 'Confirm physical sample, profile compatibility, and current availability.'
      WHEN '/inspiration' THEN 'Metadata is under verification; missing technical detail is not inferred.'
      WHEN '/warranty' THEN 'This is a brochure summary, not the complete written warranty.'
      WHEN '/design-tool' THEN 'An illustrative brief is not a quotation, rating, or approval.'
      ELSE hero_subheading
    END,
    updated_at = now()
WHERE organization_id = 1
  AND route IN (
    '/',
    '/products',
    '/window-systems',
    '/door-systems',
    '/specialist-systems',
    '/why-upvc',
    '/finishes',
    '/for-architects',
    '/whats-new',
    '/brand',
    '/inspiration',
    '/care',
    '/warranty',
    '/design-tool'
  );

COMMIT;
