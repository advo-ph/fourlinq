-- Migration 022: customer-facing copy for the automation products, and the
-- first real product photos for glass-railing and louvre.
--
-- Why (client review, 2026-08-12):
--
--   1. automated-window and automated-door shipped with descriptions written
--      for us, not for a customer. They cited the 2026-07-10 meeting by
--      timestamp ("00:21:11", "00:20:47") and argued about product filing
--      ("not a single SKU", "filed under doors"). That text is served straight
--      out of /api/products into the product drawer a customer reads. Rewritten
--      in plain language, no internal citations, no em dashes.
--
--   2. The "⚠️ Indicative only …" spec rows were an internal hedge shown as a
--      product specification. Dropped from all three products that carried one
--      (automated-window, automated-door, glass-railing). The consultation
--      point lives in the description, where it reads as an offer instead of a
--      warning.
--
--   3. glass-railing and louvre carried stand-in imagery (see
--      docs/AUG07_ASSET_REQUEST.md). thumbnail_url now points at the
--      client-approved renders under /images/products/render/. These are
--      RENDERS, not photographs — ROADMAP item 20 / R4 records the client
--      rejecting white-bg renders in general, and the client approved these two
--      specifically on 2026-08-12. The standing real-photography ask is
--      unchanged. The louvre entry supersedes the CG render added in 2e9f874.
--
-- Idempotent: every statement is an absolute UPDATE scoped by slug, safe to
-- re-run. No INSERT, no DELETE, no DROP.
--
-- Down path: explicit no-down, same reasoning as 019 and 020. To revert copy,
-- write the previous string back explicitly in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/022_customer_facing_product_copy.sql

BEGIN;

-- 1. Automated Windows: customer-facing description, hedge row removed.
UPDATE product
SET
  short_description = 'Open a high window without the ladder.',
  description = 'Motorised openers for windows that are hard to reach. Open and close a high or oversized sash from a wall switch, a remote, or your home automation system, so nobody needs a ladder or a pole. A good fit for stairwell windows, clerestory glazing, and tall living room openings. We match the opener and the power supply to your window during consultation.',
  spec_labels = ARRAY[
    'Motorised opener for operable windows',
    'Wall switch, remote, or smart home control',
    'Suited to high, large, or hard to reach windows'
  ]::text[]
WHERE organization_id = 1 AND slug = 'automated-window';

-- 2. Automated Door Access: customer-facing description, hedge row removed.
UPDATE product
SET
  short_description = 'Enter without a key. Close without a pull.',
  description = 'Keyless entry and powered opening for your doors. Get in with a keypad code, a card, a fob, or your phone, and add automatic opening where the door and frame allow it. A good fit for main entrances, offices, and shared lobbies where people arrive with their hands full. We match the lock, the power, and the controls to your door during consultation.',
  spec_labels = ARRAY[
    'Keypad, card, fob, or phone access',
    'Powered opening for compatible doors',
    'Works with multi-point locking',
    'Suited to main entries and shared entrances'
  ]::text[]
WHERE organization_id = 1 AND slug = 'automated-door';

-- 3. Glass Railing: hedge row removed, approved render replaces the schematic.
UPDATE product
SET
  thumbnail_url = '/images/products/render/glass-railing.webp',
  spec_labels = ARRAY[
    'Tempered safety glass panels',
    'Frameless or minimal-frame hardware options',
    'Balcony, mezzanine, and terrace applications',
    'Project-specified height and mounting'
  ]::text[]
WHERE organization_id = 1 AND slug = 'glass-railing';

-- 4. Louvre Windows: approved render replaces the CG render from 2e9f874.
UPDATE product
SET thumbnail_url = '/images/products/render/louvre.webp'
WHERE organization_id = 1 AND slug = 'louvre';

COMMIT;
