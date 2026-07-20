-- Migration 013: cms_document table for the /for-architects technical library
--
-- Why: the technical library on /for-architects is a hardcoded list where
-- almost every row says "Available on request". This table backs a CMS
-- entity so the team can upload the actual PDFs (system catalog, drawings,
-- manuals) from /admin > Content > Documents and each row flips from
-- "on request" to a real download without a code change.
--
-- Display logic lives on the page: file_path → downloadable PDF,
-- link_url → live page, neither → note (default "Available on request").
--
-- Apply on the VPS:
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/013_cms_document.sql

BEGIN;

CREATE TABLE IF NOT EXISTS cms_document (
  cms_document_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id  bigint NOT NULL REFERENCES organization(organization_id) ON DELETE CASCADE,
  slug             text NOT NULL,
  title            text NOT NULL,
  doc_type         text NOT NULL DEFAULT 'PDF',  -- badge on the card: PDF | DWG | RFA | ZIP | DOC
  description      text,
  file_path        text,          -- uploaded PDF (/uploads/docs/…) or bundled asset (/docs/…)
  link_url         text,          -- fallback link when the resource is a page, not a file (e.g. /finishes)
  note             text,          -- status label when there is no file and no link (e.g. 'In progress')
  display_order    integer NOT NULL DEFAULT 0,
  is_published     boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW(),
  deleted_at       timestamptz,
  UNIQUE (organization_id, slug)
);

COMMENT ON TABLE cms_document IS
  'Technical-library rows on /for-architects. Seeded from the previously hardcoded list; uploading a PDF via /admin > Content > Documents turns a row into a public download.';

CREATE INDEX IF NOT EXISTS idx_cms_document_org_published
  ON cms_document (organization_id, display_order)
  WHERE deleted_at IS NULL AND is_published = true;

-- Seed the eight rows that were hardcoded on /for-architects. The system
-- catalog ships with a generated PDF built strictly from the
-- brochure-verified data (scripts/generate-system-catalog.ts →
-- public/docs/, bundled into dist), so its description states what that
-- file actually contains.
INSERT INTO cms_document
  (organization_id, slug, title, doc_type, description, file_path, link_url, note, display_order, is_published)
VALUES
  (1, 'system-catalog', 'System catalog', 'PDF',
   'Complete catalog of all window and door systems with the uPVC profile engineering features, the twelve verified finishes, materials, warranty scope, and showroom directory.',
   '/docs/fourlinq-system-catalog.pdf', NULL, NULL, 1, true),
  (1, 'casement-drawings', 'Casement drawings', 'DWG',
   '2D AutoCAD blocks with profile sections, glazing options, and standard configurations for the Casement system.',
   NULL, NULL, NULL, 2, true),
  (1, 'sliding-drawings', 'Sliding drawings', 'DWG',
   '2D AutoCAD blocks for Sliding Door, Lift & Slide, and Slide & Fold systems with track details.',
   NULL, NULL, NULL, 3, true),
  (1, 'large-panel-engineering-data', 'Large-panel engineering data', 'PDF',
   'Maximum spans, glazing weight limits, reinforcement requirements for door openings up to 6 metres wide.',
   NULL, NULL, NULL, 4, true),
  (1, 'curtain-wall-manual', 'Curtain wall manual', 'PDF',
   'Full curtain wall system specifications, structural calculations, and installation methodology.',
   NULL, NULL, NULL, 5, true),
  (1, 'revit-family-library', 'Revit family library', 'RFA',
   'BIM family files for FourlinQ window and door systems, ready to drop into your Revit project.',
   NULL, NULL, 'In progress', 6, true),
  (1, 'finish-palette', 'Finish palette', 'PDF',
   'All twelve brochure-verified finishes with hex values, swatches, and recommended pairings for residential and commercial use.',
   NULL, '/finishes', NULL, 7, true),
  (1, 'care-specification', 'Care specification', 'PDF',
   'Standard cleaning protocols, recommended hardware service intervals, and warranty registration requirements for client handover packages.',
   NULL, '/care', NULL, 8, true)
ON CONFLICT (organization_id, slug) DO NOTHING;

GRANT ALL ON cms_document TO fourlinq;
GRANT ALL ON SEQUENCE cms_document_cms_document_id_seq TO fourlinq;

COMMIT;
