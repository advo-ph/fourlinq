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

  it.each(animated)("%s starts closed at 01 and ends open at the last frame", (id) => {
    const anim = getSystemAnimation(id)!;
    // The player scrubs this array forward on hover and backward on un-hover,
    // so the order is the animation. A set that is 28 long but numbered from 00
    // or padded to three digits would resolve to 404s at the ends only, which
    // reads as a stutter rather than a break.
    expect(anim.frames[0]).toBe(`/systems/anim/${id}/01.webp`);
    expect(anim.frames.at(-1)).toBe(`/systems/anim/${id}/28.webp`);
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
