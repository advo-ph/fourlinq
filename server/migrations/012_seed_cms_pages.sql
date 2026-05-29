-- Migration 012: seed cms_page rows for /brand and /why-upvc
--
-- Why: Phase 5 (constrained MVP) — Tita can edit a "body" markdown block
-- that renders BELOW the existing design-locked hero on each page. Empty
-- body = nothing extra is rendered, so the page is unchanged by default.
--
-- The hero columns (hero_eyebrow, hero_heading, hero_image_path) are NOT
-- wired into the React render. They live in cms_page for future use but
-- the current pages render their hero from code. Tita editing them is a
-- no-op today.
--
-- Apply on the VPS:
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/012_seed_cms_pages.sql

BEGIN;

INSERT INTO cms_page (organization_id, route, title, meta_description, is_published, body)
VALUES
  (1, '/brand',
   'Our Brand — FourlinQ',
   'European-engineered uPVC and aluminium systems, custom-fabricated in our Manila workshop for Philippine homes.',
   true,
   ''),
  (1, '/why-upvc',
   'Why uPVC — FourlinQ',
   'Why FourlinQ specifies uPVC for most Philippine residential projects: heat, humidity, salt air, and storm performance.',
   true,
   '')
ON CONFLICT (route) DO NOTHING;

COMMIT;
