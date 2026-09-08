-- Migration 030: put Custom Shapes last among the specialist systems.
--
-- Why: Custom Shapes is the catch-all of that group — "any geometry to your
-- drawing" — so it reads as the closing item, not as a peer sitting between the
-- named systems. It was landing third, ahead of Glass Railing, purely because
-- seed-products.ts assigns sort_order from the static array index and Glass
-- Railing was added later (019). Client instruction, 2026-09-08.
--
-- Windows already follow this rule: Special Shapes is pinned last in its group
-- by QuietNavbar.tsx. This migration gives specialist the same shape on the
-- surface that the nav cannot control — /products reads its order straight from
-- product.sort_order (server/routes/products.ts: `ORDER BY p.sort_order`).
--
-- Before → after, specialist only:
--   arch-shapes   12 → 12
--   curtain-wall  13 → 13
--   custom-shapes 14 → 15
--   glass-railing 15 → 14
--
-- A swap of two adjacent values inside one category. No other product moves,
-- and the windows/doors blocks either side are untouched.
--
-- The matching source-side changes ship in the same commit:
--   src/data/taxonomy.ts       — specialist `item` array, drives the /products
--                                landing preview card (not DB-backed).
--   QuietNavbar.tsx            — pins custom-shapes last in the Systems panel,
--                                which reads the static catalog, not the API.
--
-- Idempotent: both UPDATEs write literal values keyed by slug, so re-running
-- lands on the same state.
--
-- Down path: explicit no-down, same reasoning as 019/020/022–029. To revert,
-- write 14/15 back the other way round in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/030_custom_shapes_last.sql

BEGIN;

UPDATE product SET sort_order = 14
WHERE organization_id = 1 AND slug = 'glass-railing';

UPDATE product SET sort_order = 15
WHERE organization_id = 1 AND slug = 'custom-shapes';

COMMIT;
