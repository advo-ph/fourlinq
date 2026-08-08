/**
 * Guards for the 3D window viewer's system config.
 *
 * The bug these exist to prevent: the original SYSTEMS map held the source
 * FBX's centimetre node translations (casement at [-225, 552, -12]) with a
 * scale of 0.0014, but Window3D applies both in loaded-scene space, which
 * already includes the Sketchfab_model root scale of 1/278.09. The viewer
 * therefore rendered an off-centre, invisible speck — and nothing caught it,
 * because the component was imported nowhere and no test referenced it.
 *
 * So these tests assert the *units*, not just the presence, of every number,
 * and that the config still agrees with the probe script that generates it.
 *
 * Deliberately importing from window-system.ts, never Window3D.tsx: the former
 * is pure data, the latter drags in three/fiber/drei and a WebGL context.
 */
import { describe, expect, it } from "vitest";
import {
  SYSTEMS,
  CATALOGUE_SYSTEM,
  SYSTEM_FOR_PRODUCT_TYPE,
  type SystemType,
} from "@/components/3d/window-system";
import { SYSTEM_ROOT } from "../../scripts/probe-window-glb.mjs";
import { productTypes } from "@/data/configurator";

/** Length of the model's single "Scene" clip, in seconds. */
const CLIP_SECONDS = 4;

const systemId = Object.keys(SYSTEMS) as SystemType[];

describe("Window3D system config", () => {
  it("every system names at least one subtree to show", () => {
    for (const id of systemId) {
      const cfg = SYSTEMS[id];
      const named = cfg.visibleRoot.length + (cfg.visibleRootPrefix?.length ?? 0);
      expect(named, `${id} shows nothing`).toBeGreaterThan(0);
    }
  });

  it("centers are in loaded-scene space, not the source FBX's centimetres", () => {
    // The whole model spans roughly +/-2 units once the root scale is applied.
    // A centimetre-space value (the original bug) is in the hundreds, so this
    // bound separates the two unambiguously.
    for (const id of systemId) {
      for (const axis of SYSTEMS[id].center) {
        expect(Number.isFinite(axis)).toBe(true);
        expect(
          Math.abs(axis),
          `${id} center ${axis} looks like FBX centimetres, not scene space`,
        ).toBeLessThan(10);
      }
    }
  });

  it("scales are plausible frame-fitting factors", () => {
    // Systems are ~0.4-1.2 units tall and must fill ~1.36 units of frame, so
    // every factor lands near 1. The original 0.0014 was ~1000x too small.
    for (const id of systemId) {
      const { scale } = SYSTEMS[id];
      expect(scale, `${id} scale`).toBeGreaterThan(0.5);
      expect(scale, `${id} scale`).toBeLessThan(5);
    }
  });

  it("openTime lies inside the clip", () => {
    for (const id of systemId) {
      const { openTime } = SYSTEMS[id];
      expect(openTime, `${id} openTime`).toBeGreaterThanOrEqual(0);
      expect(openTime, `${id} openTime`).toBeLessThanOrEqual(CLIP_SECONDS);
    }
  });

  it("openTime is not a shared constant — louvre peaks far earlier than a sash", () => {
    // Regression guard for the single global OPEN_TIME = 2.0. At t=2.0 the
    // louvre fins have already swung back toward shut, so a shared constant
    // renders the louvre as barely-open.
    expect(SYSTEMS.louvre.openTime).toBeLessThan(1.5);
    expect(SYSTEMS.casement.openTime).toBeGreaterThan(1.5);
    expect(SYSTEMS.revolving.openTime).toBe(CLIP_SECONDS);
  });

  it("fixed glazing is the only non-operable system, and carries no action labels", () => {
    const nonOperable = systemId.filter((id) => SYSTEMS[id].openTime === 0);
    expect(nonOperable).toEqual(["fixed"]);
    expect(SYSTEMS.fixed.openLabel).toBe("");
    expect(SYSTEMS.fixed.closeLabel).toBe("");
  });

  it("every operable system has both action labels", () => {
    for (const id of systemId) {
      if (SYSTEMS[id].openTime === 0) continue;
      expect(SYSTEMS[id].openLabel.trim().length, `${id} openLabel`).toBeGreaterThan(0);
      expect(SYSTEMS[id].closeLabel.trim().length, `${id} closeLabel`).toBeGreaterThan(0);
    }
  });

  it("no top-level node is claimed by two systems", () => {
    const owner = new Map<string, string>();
    for (const id of systemId) {
      for (const name of SYSTEMS[id].visibleRoot) {
        expect(owner.has(name), `${name} claimed by ${owner.get(name)} and ${id}`).toBe(false);
        owner.set(name, id);
      }
    }
  });

  it("exact node names are never used as prefixes of each other", () => {
    // "fixed" vs "fixed_lattice" is the trap: had visibility matched on
    // startsWith, selecting Fixed would also have shown the lattice variant.
    const all = systemId.flatMap((id) => SYSTEMS[id].visibleRoot);
    for (const a of all) {
      for (const b of all) {
        if (a === b) continue;
        expect(b.startsWith(a), `"${b}" starts with "${a}" — exact matching required`).toBe(false);
      }
    }
  });
});

describe("catalogue exposure", () => {
  it("the tab rail lists only real systems, without duplicates", () => {
    expect(new Set(CATALOGUE_SYSTEM).size).toBe(CATALOGUE_SYSTEM.length);
    for (const id of CATALOGUE_SYSTEM) {
      expect(SYSTEMS[id], `${id} is exposed but not configured`).toBeDefined();
    }
  });

  it("withholds systems FourlinQ has not confirmed it sells", () => {
    // These render fine from the licensed model but must not be advertised
    // until the client confirms the product exists. Promoting one is a
    // deliberate edit to CATALOGUE_SYSTEM, not an accident.
    for (const id of ["hung", "pivot", "revolving"] as SystemType[]) {
      expect(SYSTEMS[id], `${id} should stay configured`).toBeDefined();
      expect(CATALOGUE_SYSTEM, `${id} must not be exposed yet`).not.toContain(id);
    }
  });

  it("louvre is exposed — it is a shipped product whose only art is a placeholder", () => {
    expect(CATALOGUE_SYSTEM).toContain("louvre");
  });
});

describe("configurator product type mapping", () => {
  it("maps only to configured systems", () => {
    for (const [type, system] of Object.entries(SYSTEM_FOR_PRODUCT_TYPE)) {
      expect(SYSTEMS[system], `${type} -> ${system} is not a system`).toBeDefined();
    }
  });

  it("maps only from real configurator product types", () => {
    const known = new Set(productTypes.map((t) => t.id));
    for (const type of Object.keys(SYSTEM_FOR_PRODUCT_TYPE)) {
      expect(known.has(type), `${type} is not a configurator product type`).toBe(true);
    }
  });

  it("never maps a type to a merely similar system", () => {
    // A wrong model reads as authoritative, which is worse than a schematic.
    // tilt-turn is not a pivot window; a sliding door is not a window sash.
    expect(SYSTEM_FOR_PRODUCT_TYPE["tilt-turn"]).toBeUndefined();
    expect(SYSTEM_FOR_PRODUCT_TYPE["sliding-door"]).toBeUndefined();
    expect(SYSTEM_FOR_PRODUCT_TYPE["lift-slide"]).toBeUndefined();
  });

  it("every mapped system is one the tab rail also offers", () => {
    for (const system of Object.values(SYSTEM_FOR_PRODUCT_TYPE)) {
      expect(CATALOGUE_SYSTEM).toContain(system);
    }
  });
});

describe("parity with scripts/probe-window-glb.mjs", () => {
  it("both files describe the same set of systems", () => {
    expect(Object.keys(SYSTEM_ROOT).sort()).toEqual([...systemId].sort());
  });

  it("each system's subtree list matches the probe's", () => {
    // The probe measures whatever SYSTEM_ROOT says; the component renders
    // whatever SYSTEMS says. If they drift, the pinned center and scale
    // silently describe a different set of meshes than the ones on screen.
    for (const id of systemId) {
      const spec = (SYSTEM_ROOT as Record<string, string | string[]>)[id];
      const cfg = SYSTEMS[id];
      if (typeof spec === "string") {
        expect(spec.startsWith("@"), `${id} probe spec must be a @prefix`).toBe(true);
        expect(cfg.visibleRootPrefix, `${id} prefix`).toEqual([spec.slice(1)]);
        expect(cfg.visibleRoot, `${id} should use the prefix alone`).toEqual([]);
      } else {
        expect([...cfg.visibleRoot].sort(), `${id} roots`).toEqual([...spec].sort());
        expect(cfg.visibleRootPrefix, `${id} should not also use a prefix`).toBeUndefined();
      }
    }
  });
});
