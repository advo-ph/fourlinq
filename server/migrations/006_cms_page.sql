-- Migration 006: cms_page — editable page metadata (hero, SEO, body slot).
-- Each row is bound to a route. The React components for these pages render
-- the row's hero + body when present and fall back to component defaults.

BEGIN;

CREATE TABLE cms_page (
    cms_page_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id    BIGINT NOT NULL REFERENCES organization (organization_id),
    route              TEXT NOT NULL UNIQUE,
    title              TEXT NOT NULL,
    meta_description   TEXT,
    meta_keywords      TEXT,
    hero_eyebrow       TEXT,
    hero_heading       TEXT,
    hero_subheading    TEXT,
    hero_cta_label     TEXT,
    hero_cta_href      TEXT,
    hero_image_path    TEXT,
    body               TEXT,                              -- markdown
    is_published       BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

COMMENT ON TABLE cms_page IS
    'Page-level editable metadata + hero content. React components render these when present and fall back to defaults otherwise.';

CREATE INDEX idx_cms_page_org   ON cms_page (organization_id);
CREATE INDEX idx_cms_page_route ON cms_page (route) WHERE deleted_at IS NULL AND is_published;

CREATE TRIGGER trg_cms_page_touch BEFORE UPDATE ON cms_page FOR EACH ROW EXECUTE FUNCTION cms_touch_updated_at();

-- Seed with the existing site routes so admins start with rows to edit, not blanks.
INSERT INTO cms_page (organization_id, route, title, meta_description, hero_eyebrow, hero_heading, hero_subheading)
VALUES
    (1, '/',                 'FourlinQ — Windows & Doors',  'Custom-made uPVC and aluminum windows and doors. 10-year warranty. Manila, Cebu, Alabang, Ortigas showrooms.', NULL, NULL, NULL),
    (1, '/products',         'Products',                    'Browse all 5 FourlinQ window and door systems.', 'Products', 'Custom-made windows & doors.', 'Five systems. Two materials. Eleven finishes. Built around your project.'),
    (1, '/window-systems',   'Window Systems',              'Casement, Sliding, Awning, and Special Shapes windows.', 'Window Systems', 'Windows engineered for the Philippines.', NULL),
    (1, '/door-systems',     'Door Systems',                'Swing, sliding, and slide & fold doors in uPVC and aluminum.', 'Door Systems', 'Doors that frame the way you live.', NULL),
    (1, '/specialist-systems','Specialist Systems',         'Curtain walls and large-span installations.', 'Specialist', 'Specialist systems.', 'For ambitious projects beyond the standard catalog.'),
    (1, '/why-upvc',         'Why uPVC',                    'uPVC vs aluminum vs timber: thermal, maintenance, security, cost.', 'Why uPVC', 'The case for uPVC.', NULL),
    (1, '/finishes',         'Finishes',                    'All 11 brochure-verified frame finishes.', 'Finishes', 'Eleven finishes.', 'From classic White to Walnut and Golden Oak.'),
    (1, '/how-to-choose',    'How To Choose',               'Decision guide for picking a FourlinQ window or door.', 'Guide', 'How to choose.', NULL),
    (1, '/faq',              'FAQ',                         'Common questions on products, materials, ordering, installation, warranty, and care.', 'FAQ', 'Questions, answered.', NULL),
    (1, '/for-architects',   'For Architects',              'Technical resources for architects and designers.', 'For Architects', 'Specify FourlinQ.', NULL),
    (1, '/whats-new',        'What''s New',                  'News feed: project turnovers, product launches, events.', 'What''s New', 'From the workshop.', 'New projects, new systems, and quiet updates from FourlinQ.'),
    (1, '/brand',            'Brand',                       'Brand story and design philosophy.', 'Brand', 'A lifetime of satisfaction.', NULL),
    (1, '/inspiration',      'Inspiration',                 'Project gallery — completed FourlinQ installations across the Philippines.', 'Inspiration', 'Real projects, real homes.', 'Every FourlinQ install is custom-fabricated and project-specified.'),
    (1, '/care',             'Care & Maintenance',          'Maintain your uPVC windows for lifetime performance.', 'Care', 'Built to last. Cared for properly.', NULL),
    (1, '/warranty',         'Warranty',                    'Full 10-year warranty terms.', 'Warranty', 'Ten-year warranty.', NULL),
    (1, '/design-tool',      'Design Tool',                 'Interactive configurator.', 'Design Tool', 'Configure your window.', NULL);

COMMIT;
