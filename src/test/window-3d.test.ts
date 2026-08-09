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
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SYSTEMS,
  CATALOGUE_SYSTEM,
  GRILLE_VARIANT,
  SYSTEM_FOR_PRODUCT_TYPE,
  type SystemType,
} from "@/components/3d/window-system";
import { SYSTEM_ROOT, probe } from "../../scripts/probe-window-glb.mjs";
import { productTypes } from "@/data/configurator";

/**
 * Materials Window3D recolours to the chosen frame finish.
 *
 * Read out of the component's SOURCE rather than imported, because importing
 * Window3D drags three/fiber/drei and a WebGL context into the test run — but
 * a hand-copied duplicate would assert nothing about the component, which is
 * exactly the shape of the bug being guarded (the config and the renderer
 * disagreeing). Parsing the literal keeps one source of truth.
 */
const FRAME_MATERIAL = (() => {
  const source = readFileSync(
    resolve(__dirname, "../components/3d/Window3D.tsx"),
    "utf8",
  );
  const match = source.match(/const FRAME_MATERIAL = new Set\(\[([^\]]*)\]\)/);
  if (!match) throw new Error("could not find FRAME_MATERIAL in Window3D.tsx");
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
})();

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
    // Windows land near 1: ~0.4-1.2 units tall, fitted to ~1.36 of frame.
    // Doors and curtain walls legitimately go lower — a 9.6 m three-storey
    // curtain wall fits at 0.14 — so the floor here is loose. It still
    // separates a real factor from the original 0.0014, which was ~1000x out
    // because the numbers were in the wrong space entirely. The exact value is
    // checked against the model in the parity suite below.
    for (const id of systemId) {
      const { scale } = SYSTEMS[id];
      expect(scale, `${id} scale`).toBeGreaterThan(0.05);
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

  it("non-operable systems carry no action labels, and say why", () => {
    const nonOperable = systemId.filter((id) => SYSTEMS[id].openTime === 0);
    expect([...nonOperable].sort()).toEqual([
      "combination-bay",
      "combination-bow",
      "combination-corner",
      "fixed",
      "fixed-lattice",
      "special-arch",
      "special-triangle",
    ]);
    for (const id of nonOperable) {
      expect(SYSTEMS[id].openLabel, `${id} openLabel`).toBe("");
      expect(SYSTEMS[id].closeLabel, `${id} closeLabel`).toBe("");
      expect(SYSTEMS[id].staticNote?.length, `${id} needs a static note`).toBeGreaterThan(0);
    }
  });

  it("only truly fixed glazing claims it does not open", () => {
    // A bay window's flanking casements DO open in reality — our model just
    // does not animate them. Saying "Fixed — does not open" over a bay is a
    // false product claim, so the combination assemblies say something else.
    for (const id of ["fixed", "fixed-lattice"] as SystemType[]) {
      expect(SYSTEMS[id].staticNote).toMatch(/does not open/i);
    }
    for (const id of systemId) {
      if (!id.startsWith("combination-")) continue;
      expect(SYSTEMS[id].staticNote, `${id} must not claim it cannot open`).not.toMatch(
        /does not open/i,
      );
    }
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

  it("no two systems sharing a model claim the same node", () => {
    // Visibility is matched by node name within whichever file is loaded, so a
    // collision only matters between systems in the SAME model. Across files
    // it is harmless — several baked GLBs would otherwise be barred from
    // reusing a sensible name.
    const byModel = new Map<string, Map<string, string>>();
    for (const id of systemId) {
      const model = SYSTEMS[id].model ?? "licensed";
      const owner = byModel.get(model) ?? new Map<string, string>();
      byModel.set(model, owner);
      for (const name of SYSTEMS[id].visibleRoot) {
        expect(
          owner.has(name),
          `"${name}" claimed by ${owner.get(name)} and ${id} in ${model}`,
        ).toBe(false);
        owner.set(name, id);
      }
    }
  });

  it("no prefix escape hatch can reach another system's nodes", () => {
    // visibleRootPrefix is the one place startsWith is still used, so it is
    // the one place a collision would actually mis-render. Exact names may
    // safely share a prefix with each other; a prefix may not.
    const exactName = systemId.flatMap((id) => SYSTEMS[id].visibleRoot);
    for (const id of systemId) {
      for (const prefix of SYSTEMS[id].visibleRootPrefix ?? []) {
        for (const name of exactName) {
          expect(
            name.startsWith(prefix),
            `${id}'s prefix "${prefix}" also matches the exact node "${name}"`,
          ).toBe(false);
        }
        for (const other of systemId) {
          if (other === id) continue;
          for (const otherPrefix of SYSTEMS[other].visibleRootPrefix ?? []) {
            expect(
              otherPrefix.startsWith(prefix) || prefix.startsWith(otherPrefix),
              `prefixes "${prefix}" (${id}) and "${otherPrefix}" (${other}) overlap`,
            ).toBe(false);
          }
        }
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

  it("exposes every plain system except the two deliberately withheld", () => {
    const plain = systemId.filter((id) => !SYSTEMS[id].grilleOf);
    const withheld: SystemType[] = ["pivot", "revolving"];
    expect([...CATALOGUE_SYSTEM].sort()).toEqual(
      plain.filter((id) => !withheld.includes(id)).sort(),
    );
  });

  it("keeps pivot and revolving configured but unlisted", () => {
    // Both exist only in the licensed model and neither is a confirmed
    // FourlinQ product — a revolving door is not a uPVC window at all — so
    // they are the cheapest systems to give up while shrinking the licence's
    // footprint. Still configured, so promoting one is a one-line edit.
    for (const id of ["pivot", "revolving"] as SystemType[]) {
      expect(SYSTEMS[id], `${id} should stay configured`).toBeDefined();
      expect(CATALOGUE_SYSTEM, `${id} must not be exposed`).not.toContain(id);
    }
  });

  it("never puts a grille variant in the tab rail", () => {
    // A grille is an option on a sliding window, not a tenth kind of window.
    // Listing "Sliding" and "Sliding · grille" side by side would read as two
    // products; the Grille toggle is the correct surface.
    for (const id of systemId) {
      if (!SYSTEMS[id].grilleOf) continue;
      expect(CATALOGUE_SYSTEM, `${id} belongs on the toggle, not the rail`).not.toContain(id);
    }
  });

  it("louvre is exposed — it is a shipped product whose only art is a placeholder", () => {
    expect(CATALOGUE_SYSTEM).toContain("louvre");
  });
});

describe("grille variants", () => {
  it("every grille points at a real plain system, and never at another grille", () => {
    for (const id of systemId) {
      const base = SYSTEMS[id].grilleOf;
      if (!base) continue;
      expect(SYSTEMS[base], `${id} -> ${base} is not a system`).toBeDefined();
      expect(SYSTEMS[base].grilleOf, `${base} is itself a grille`).toBeUndefined();
    }
  });

  it("GRILLE_VARIANT is the exact inverse of grilleOf", () => {
    const expected = Object.fromEntries(
      systemId.filter((id) => SYSTEMS[id].grilleOf).map((id) => [SYSTEMS[id].grilleOf, id]),
    );
    expect(GRILLE_VARIANT).toEqual(expected);
  });

  it("no plain system has two grille variants", () => {
    const base = systemId.filter((id) => SYSTEMS[id].grilleOf).map((id) => SYSTEMS[id].grilleOf);
    expect(new Set(base).size).toBe(base.length);
  });

  it("a grille keeps its base system's operability", () => {
    // Toggling a grille on must not turn a fixed lite into something that
    // claims to open, or silence a sash's control.
    for (const [base, grille] of Object.entries(GRILLE_VARIANT)) {
      const baseOperable = SYSTEMS[base as SystemType].openTime > 0;
      const grilleOperable = SYSTEMS[grille as SystemType].openTime > 0;
      expect(grilleOperable, `${grille} vs ${base}`).toBe(baseOperable);
    }
  });

  it("a grille's label names its base system", () => {
    for (const [base, grille] of Object.entries(GRILLE_VARIANT)) {
      const baseLabel = SYSTEMS[base as SystemType].label;
      expect(SYSTEMS[grille as SystemType].label).toContain(baseLabel);
    }
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
    expect(SYSTEM_FOR_PRODUCT_TYPE["tilt-turn"], "no tilt-turn art exists").toBeUndefined();

    // "French Sliding Door" is the product; the baked french-door model is a
    // hinged pair from buildSwingDoor. Right name, wrong mechanism.
    expect(SYSTEM_FOR_PRODUCT_TYPE["french-door"]).toBeUndefined();

    // Catch-all types: any single model claims a geometry the customer did
    // not choose.
    expect(SYSTEM_FOR_PRODUCT_TYPE["special-shapes"]).toBeUndefined();
    expect(SYSTEM_FOR_PRODUCT_TYPE["custom-shapes"]).toBeUndefined();
  });

  it("maps the door and curtain-wall types the baked models genuinely depict", () => {
    // These fell back to a flat SVG before the handoff builders were baked.
    expect(SYSTEM_FOR_PRODUCT_TYPE["sliding-door"]).toBe("sliding-door");
    expect(SYSTEM_FOR_PRODUCT_TYPE["lift-slide"]).toBe("lift-slide");
    expect(SYSTEM_FOR_PRODUCT_TYPE["large-panel-doors"]).toBe("multislide");
    expect(SYSTEM_FOR_PRODUCT_TYPE["90-series"]).toBe("ninety-series");
    expect(SYSTEM_FOR_PRODUCT_TYPE["curtain-wall"]).toBe("curtain-wall");
    expect(SYSTEM_FOR_PRODUCT_TYPE["arch-shapes"]).toBe("special-arch");
    // `entrance` is labelled "Casement Door" in the configurator.
    expect(SYSTEM_FOR_PRODUCT_TYPE["entrance"]).toBe("casement-door");
  });

  it("every mapped system is one the tab rail also offers", () => {
    for (const system of Object.values(SYSTEM_FOR_PRODUCT_TYPE)) {
      expect(CATALOGUE_SYSTEM).toContain(system);
    }
  });
});

describe("frame finish reaches every system", () => {
  // Measured from the GLB, not asserted from memory: the finish picker was
  // dead on louvre and pivot because FRAME_MATERIAL omitted `frame3`, and
  // nothing noticed. These read the binary so the same class of miss fails.
  const { report, materialName } = probe();

  it("every frame slot in every model is one the finish picker recolours", () => {
    // The real invariant, and the one the original bug broke: a material named
    // like a frame slot that FRAME_MATERIAL does not know about is a part the
    // picker silently cannot recolour. Stated as a pattern rather than a fixed
    // list so it still holds when a new model arrives.
    const frameSlot = materialName.filter((m: string) => /^frame\d+$/.test(m));
    expect(frameSlot.length, "no frame materials found — check the probe").toBeGreaterThan(0);
    for (const slot of frameSlot) {
      expect(FRAME_MATERIAL, `${slot} exists in a model but takes no finish`).toContain(slot);
    }
  });

  it("every system carries at least one material the finish picker recolours", () => {
    for (const id of systemId) {
      const used = (report as Record<string, { material: string[] } | null>)[id];
      expect(used, `${id} matched no mesh`).not.toBeNull();
      const finishable = used!.material.filter((m) => FRAME_MATERIAL.includes(m));
      expect(finishable.length, `${id} has no finishable material`).toBeGreaterThan(0);
    }
  });

  it("uses no material the viewer has no policy for", () => {
    // Everything not in FRAME_MATERIAL keeps its authored colour. That is
    // correct for glazing, hardware and gaskets, and wrong for anything else,
    // so an unrecognised name has to fail rather than quietly stay grey.
    const known = new Set([...FRAME_MATERIAL, "glass", "parts", "parts2", "gasket"]);
    for (const id of systemId) {
      const used = (report as Record<string, { material: string[] } | null>)[id];
      for (const m of used?.material ?? []) {
        expect(known.has(m), `${id} uses unknown material "${m}"`).toBe(true);
      }
    }
  });

  it("every grille bar takes the finish — grilles are frame3", () => {
    // The grille geometry is `frame3` in every variant. Were frame3 dropped
    // from FRAME_MATERIAL again, grilles would stay factory white while the
    // frame around them changed colour.
    expect(FRAME_MATERIAL).toContain("frame3");
    for (const grille of Object.values(GRILLE_VARIANT)) {
      const used = (report as Record<string, { material: string[] } | null>)[grille as string];
      expect(used?.material, `${grille} should carry frame3`).toContain("frame3");
    }
  });
});

describe("parity with scripts/probe-window-glb.mjs", () => {
  it("every pinned number still matches what the model measures", () => {
    // The bug in the header of this file was hand-typed numbers drifting from
    // the binary. Now that the prober is importable, assert it directly:
    // regenerate with `npm run probe:glb`, never edit SYSTEMS by hand.
    const { report } = probe();
    for (const id of systemId) {
      const measured = (report as Record<string, {
        center: number[]; scale: number; openTime: number;
      } | null>)[id];
      expect(measured, `${id} matched no mesh in the GLB`).not.toBeNull();
      expect(SYSTEMS[id].center, `${id} center`).toEqual(measured!.center);
      expect(SYSTEMS[id].scale, `${id} scale`).toBe(measured!.scale);
      expect(SYSTEMS[id].openTime, `${id} openTime`).toBe(measured!.openTime);
    }
  });

  it("the only unclaimed licensed nodes are the ones we replaced with our own", () => {
    // Eight systems moved off the licensed model onto GLBs FourlinQ owns, so
    // their assemblies are still in that file but nothing points at them any
    // more. That is the goal, not a leak — but it must stay an exact list, so
    // a future model drop that adds unreachable art still fails here.
    expect([...probe().unclaimed].sort()).toEqual([
      "awning_armature",
      "awning_frame",
      "casement_bridged_frame",
      "casement_bridged_panelL",
      "casement_bridged_panelR",
      "casement_frame",
      "casement_panelL",
      "casement_panelR",
      "fixed",
      "fixed_lattice",
      "holding_frame",
      "holding_panels",
      "sliding_horizontal_frame",
      "sliding_horizontal_windowL",
      "sliding_horizontal_windowR",
      "sliding_vertical_frame",
      "sliding_vertical_windowB",
      "sliding_vertical_windowT",
    ]);
  });

  it("counts how much of the site still depends on the licensed model", () => {
    // The attribution and the fourlinq.ph-only restriction come from this
    // file. Every system moved off it is progress toward dropping both, so
    // this states the remaining debt out loud rather than leaving it implicit.
    const licensed = systemId.filter((id) => !SYSTEMS[id].model);
    expect([...licensed].sort()).toEqual([
      "awning-lattice",
      "hung-lattice",
      "louvre",
      "louvre-wide",
      "pivot",
      "pivot-lattice",
      "revolving",
      "sliding-4panel",
      "sliding-lattice",
    ]);

    // Of those, only these are actually reachable in the UI. Louvre is the
    // blocker: a shipped product with no builder.
    // Reachable = a tab, or a grille whose base system has a tab. A grille of
    // a withheld system (pivot-lattice) can never be shown.
    const reachable = licensed.filter((id) => {
      const base = SYSTEMS[id].grilleOf;
      return base ? CATALOGUE_SYSTEM.includes(base) : CATALOGUE_SYSTEM.includes(id);
    });
    expect([...reachable].sort()).toEqual([
      "awning-lattice",
      "hung-lattice",
      "louvre",
      "louvre-wide",
      "sliding-4panel",
      "sliding-lattice",
    ]);
  });

  it("the licensed model's systems are exactly those SYSTEM_ROOT describes", () => {
    // SYSTEM_ROOT only covers the multi-assembly licensed file; baked systems
    // each own their whole file and are discovered from disk instead.
    const licensed = systemId.filter((id) => !SYSTEMS[id].model);
    expect(Object.keys(SYSTEM_ROOT).sort()).toEqual([...licensed].sort());
  });

  it("every baked system points at a file that exists and holds it", () => {
    const { source } = probe();
    for (const id of systemId) {
      const model = SYSTEMS[id].model;
      if (!model) continue;
      // `model` is a public/ URL; the probe reports the file it measured from.
      expect(source[id], `${id} was not measured from any model`).toBeDefined();
      expect(
        source[id].replace(/\\/g, "/").endsWith(model),
        `${id} declares ${model} but was measured from ${source[id]}`,
      ).toBe(true);
    }
  });

  it("a baked system shows its whole file", () => {
    // Each baked GLB wraps everything in one node named for the system id, so
    // visibleRoot is that id and the visibility pass has nothing to hide.
    for (const id of systemId) {
      if (!SYSTEMS[id].model) continue;
      expect(SYSTEMS[id].visibleRoot, `${id} roots`).toEqual([id]);
      expect(SYSTEMS[id].visibleRootPrefix).toBeUndefined();
    }
  });

  it("each system's subtree list matches the probe's", () => {
    // The probe measures whatever SYSTEM_ROOT says; the component renders
    // whatever SYSTEMS says. If they drift, the pinned center and scale
    // silently describe a different set of meshes than the ones on screen.
    for (const id of systemId) {
      const cfg = SYSTEMS[id];
      if (cfg.model) continue; // baked systems own their file; covered above
      const spec = (SYSTEM_ROOT as Record<string, string | string[]>)[id];
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
