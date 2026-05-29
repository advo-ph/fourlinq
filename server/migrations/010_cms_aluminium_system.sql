-- Migration 010: cms_aluminium_system table for editable /aluminium content
--
-- Why: /aluminium currently has three hardcoded React cards (thermal-break,
-- non-thermal-break, alu-slim). Tita asked for the aluminium line to be
-- visible on the site, and needs a way to add spec sheets / photos per
-- system without our involvement. This table backs a CMS entity so she
-- can do all of that from /admin > Content > Aluminium.
--
-- Apply on the VPS:
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/010_cms_aluminium_system.sql

BEGIN;

CREATE TABLE IF NOT EXISTS cms_aluminium_system (
  cms_aluminium_system_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id          bigint NOT NULL REFERENCES organization(organization_id) ON DELETE CASCADE,
  slug                     text NOT NULL,
  name                     text NOT NULL,
  summary                  text,
  best_for                 text,
  hero_image_url           text,
  spec_sheet_url           text,
  display_order            integer NOT NULL DEFAULT 0,
  is_published             boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT NOW(),
  updated_at               timestamptz NOT NULL DEFAULT NOW(),
  deleted_at               timestamptz,
  UNIQUE (organization_id, slug)
);

COMMENT ON TABLE cms_aluminium_system IS
  'Editable cards on /aluminium. Three brochure-defined systems today (thermal-break, non-thermal-break, alu-slim) but the table is open so Tita can add more without a code change.';

CREATE INDEX IF NOT EXISTS idx_cms_aluminium_system_org_published
  ON cms_aluminium_system (organization_id, display_order)
  WHERE deleted_at IS NULL AND is_published = true;

-- Seed the three sub-products from the static content already on /aluminium.
INSERT INTO cms_aluminium_system
  (organization_id, slug, name, summary, best_for, display_order, is_published)
VALUES
  (1, 'thermal-break',
   'Thermal Break',
   'Aluminium profile with a non-conductive polyamide strip between the inner and outer halves of the frame. Cuts heat transfer from outside in (and condensation in air-conditioned interiors). The default choice for high-end residential and any space that''s cooled year-round.',
   'Air-conditioned interiors, west-facing facades, climate-controlled commercial.',
   1, true),
  (1, 'non-thermal-break',
   'Non-Thermal Break',
   'Solid aluminium profile without the thermal isolator. Slimmer sightlines, lower cost, simpler fabrication. Standard for projects where conducted heat is not the primary concern.',
   'Naturally ventilated spaces, covered lanais, secondary structures.',
   2, true),
  (1, 'alu-slim',
   'Alu Slim',
   'Minimum-sightline aluminium system engineered for maximum glass area. The frame nearly disappears against the glazing. For projects where the architecture is the view and the window should not be.',
   'Floor-to-ceiling glazing, panoramic openings, contemporary residential.',
   3, true)
ON CONFLICT (organization_id, slug) DO NOTHING;

GRANT ALL ON cms_aluminium_system TO fourlinq;
GRANT ALL ON SEQUENCE cms_aluminium_system_cms_aluminium_system_id_seq TO fourlinq;

COMMIT;
