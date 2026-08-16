import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { products } from "@/data/products";
import { getSystemAnimation } from "@/data/systemAnimations";

const PUBLIC = path.resolve(__dirname, "../../public");

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
    const missing = anim.frames.filter((f) => !existsSync(path.join(PUBLIC, f)));
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
    const endpoints = new Set([anim.frames[0], anim.frames.at(-1)]);
    expect(endpoints).toContain(`/systems/anim/${id}/01.webp`);
    expect(endpoints).toContain(`/systems/anim/${id}/28.webp`);
  });

  it("automated-window is registered open → closed (resting on the open pose)", () => {
    const anim = getSystemAnimation("automated-window")!;
    // The card still for automated-window is the fully-open frame (28). The
    // array is therefore reversed so hover closes the window and un-hover
    // returns to the open resting state, matching the still exactly.
    expect(anim.frames[0]).toBe("/systems/anim/automated-window/28.webp");
    expect(anim.frames.at(-1)).toBe("/systems/anim/automated-window/01.webp");
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
