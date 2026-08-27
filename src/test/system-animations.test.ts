import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { products } from "@/data/products";
import { getSystemAnimation } from "@/data/systemAnimations";
import animVersions from "@/generated/anim-versions.json";

const PUBLIC = path.resolve(__dirname, "../../public");

/**
 * Frame URLs carry a ?v=<set hash> cache-busting token (see systemAnimations.ts).
 * The token is not part of the path on disk, so it has to come off before any
 * filesystem check or filename comparison.
 */
const pathOf = (url: string) => url.split("?")[0];

/**
 * A system id registered in systemAnimations.ts whose frames are not on disk
 * fails silently: the player requests 01.webp, gets a 404, and the card sits
 * there doing nothing on hover — exactly what an unregistered system looks
 * like. So the registration and the files have to be checked against each
 * other, not assumed.
 *
 * This bites hardest on the four rendered systems, whose frames come out of
 * `node scripts/bake-system-anim.mjs` rather than out of a commit of filmed
 * assets. Deleting .qa-film or re-running the bake with --dry leaves the map
 * pointing at nothing.
 */
describe("system hover animations", () => {
  const animated = products.map((p) => p.id).filter((id) => getSystemAnimation(id));

  it("registers every system that has a frame directory, and vice versa", () => {
    expect(animated.length).toBeGreaterThan(0);
  });

  it.each(animated)("%s has all of its frames on disk", (id) => {
    const anim = getSystemAnimation(id)!;
    const missing = anim.frames.filter((f) => !existsSync(path.join(PUBLIC, pathOf(f))));
    expect(missing).toEqual([]);
  });

  it.each(animated)("%s has 01.webp and 28.webp as its two endpoints (in whichever order)", (id) => {
    const anim = getSystemAnimation(id)!;
    // The player scrubs this array forward on hover and backward on un-hover,
    // so the order is the animation. A set that is 28 long but numbered from 00
    // or padded to three digits would resolve to 404s at the ends only, which
    // reads as a stutter rather than a break. Most systems go closed (01) →
    // open (28); reversed systems (e.g. automated-window, which rests on the
    // open pose) go 28 → 01. Either way the two filenames 01 and 28 must
    // appear at the endpoints — they just swap position for reversed systems.
    const endpoints = new Set([pathOf(anim.frames[0]), pathOf(anim.frames.at(-1)!)]);
    expect(endpoints).toContain(`/systems/anim/${id}/01.webp`);
    expect(endpoints).toContain(`/systems/anim/${id}/28.webp`);
  });

  it("automated-window is registered open → closed (resting on the open pose)", () => {
    const anim = getSystemAnimation("automated-window")!;
    // The card still for automated-window is the fully-open frame (28). The
    // array is therefore reversed so hover closes the window and un-hover
    // returns to the open resting state, matching the still exactly.
    expect(pathOf(anim.frames[0])).toBe("/systems/anim/automated-window/28.webp");
    expect(pathOf(anim.frames.at(-1)!)).toBe("/systems/anim/automated-window/01.webp");
  });

  it.each(animated)("%s carries a cache-busting ?v= token on every frame", (id) => {
    // Regression guard. The frame filenames are fixed (01.webp … 28.webp) and
    // are rewritten in place whenever a set is re-baked or re-imported, while
    // the server serves them with `max-age=365d, immutable`. Without a token
    // that changes with the bytes, a replaced set never reaches anyone who has
    // already hovered the card — they hold the old frames for a year and never
    // revalidate. That shipped once; this test is why it should not again.
    const anim = getSystemAnimation(id)!;
    const token = animVersions[id as keyof typeof animVersions];
    expect(token, `no manifest entry for ${id} — run prebuild`).toBeTruthy();
    const unversioned = anim.frames.filter((f) => !f.endsWith(`?v=${token}`));
    expect(unversioned).toEqual([]);
  });

  it("every frame directory on disk has a manifest entry", () => {
    // The manifest is generated from the directories, so a set added without a
    // prebuild run would silently serve unversioned (and therefore immutably
    // cached) URLs.
    const dirs = readdirSync(path.join(PUBLIC, "systems/anim"), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    const missing = dirs.filter((d) => !(d in animVersions));
    expect(missing).toEqual([]);
  });

  it("does not animate the categories that have no single honest mechanism", () => {
    // special-shapes and custom-shapes are catch-alls, and glass-railing is a
    // fixed balustrade. Animating any of them asserts a product behaviour the
    // customer did not choose — see the header of systemAnimations.ts.
    for (const id of ["special-shapes", "custom-shapes", "glass-railing"]) {
      expect(getSystemAnimation(id)).toBeNull();
    }
  });
});
