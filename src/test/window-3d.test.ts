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
import { readFileSync, readdirSync } from "node:fs";
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

  it("openTime is measured, not assumed — the licensed leftovers still differ", () => {
    // This began as a guard against a single global OPEN_TIME = 2.0, because the
    // licensed model's authored clips peak at different instants and louvre at
    // t=2.0 had already swung back toward shut.
    //
    // Every system the site shows is now baked by export-glb.mjs, which writes
    // the open pose at exactly OPEN_AT = 2, so 2 is now the correct answer for
    // all of them — including louvre, which has its own builder. That makes the
    // old assertion untrue rather than unmet, so it is restated instead of
    // deleted: the numbers must still come from probe:glb, and the systems still
    // read out of the licensed binary must still carry their own measured times.
    for (const id of systemId) {
      if (SYSTEMS[id].model) expect(SYSTEMS[id].openTime, `${id}`).toBeOneOf([0, 2]);
    }
    expect(SYSTEMS.revolving.openTime).toBe(CLIP_SECONDS);
    expect(SYSTEMS.pivot.openTime).not.toBe(2);
  });

  it("non-operable systems carry no action labels, and say why", () => {
    const nonOperable = systemId.filter((id) => SYSTEMS[id].openTime === 0);
    expect([...nonOperable].sort()).toEqual([
      // Bay and bow left this list once combination-model.js grew a real
      // setOpen — their flanking lites are outswing casements and now animate.
      // Corner stays: scripts/handoff/spec/combination.json describes it as
      // "two fixed lites mitred at 90°" and specifies no sash or handing, so
      // no mechanism was invented for it.
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
    // A bay window's flanking casements DO open in reality — and now animate.
    // Corner still bakes static, but "Fixed — does not open" over any
    // combination assembly would be a product claim we cannot support, so they
    // all say something else.
    for (const id of ["fixed", "fixed-lattice"] as SystemType[]) {
      expect(SYSTEMS[id].staticNote).toMatch(/does not open/i);
    }
    for (const id of systemId) {
      if (!id.startsWith("combination-")) continue;
      // Bay and bow now animate and so carry no note at all — an absent note is
      // the correct state for an operable system, not a missing one.
      const note = SYSTEMS[id].staticNote ?? "";
      expect(note, `${id} must not claim it cannot open`).not.toMatch(/does not open/i);
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

  it("every grille bar takes the finish — asserted at the builder, not the binary", () => {
    // This used to assert `frame3` on every grille variant, which held only while
    // fixed-lattice was the sole grille: it is alu-clad, so its bars are aluDark
    // -> frame3. The uPVC grilles that followed correctly use the uPVC rebate
    // profile instead (upvcInner -> frame2), because an alu-clad bar on a uPVC
    // window would be the wrong part.
    //
    // The material SET of a baked GLB cannot catch the bug that matters here.
    // sliding-lattice declares exactly the same six materials as plain sliding,
    // so bars authored on the hardware material — which never recolours — would
    // produce an identical set and sail through. That is precisely how grille
    // bars once shipped black under a White finish. So assert at the source: the
    // material every grid mesh is built from must map to a frame slot.
    const FRAME_MAPPED = new Set(["upvc", "upvcInner", "aluDark", "aluClad"]);
    const modelDir = resolve(__dirname, "../../scripts/handoff/model");
    const withGrid = readdirSync(modelDir).filter((f) =>
      readFileSync(resolve(modelDir, f), "utf8").includes("opts.grid"),
    );
    // Every grille the site can REACH needs a builder that can actually make one.
    // pivot-lattice is excluded on purpose: pivot is withheld from the tab rail as
    // an unconfirmed product, so its grille is unreachable and has no builder.
    const reachableGrille = Object.values(GRILLE_VARIANT).filter(
      (g) => SYSTEMS[g as SystemType].model,
    );
    expect(withGrid.length, "a reachable grille has no builder").toBeGreaterThanOrEqual(
      new Set(reachableGrille).size,
    );

    for (const file of withGrid) {
      const src = readFileSync(resolve(modelDir, file), "utf8");
      // Line-based on purpose: builders name their bars by concatenation
      // (`name + '_grid_bar_v_' + side`) as well as by template literal, so a
      // regex anchored on a quote right after the material silently matched
      // nothing in slider-model.js and the check passed while testing zero bars.
      const barMaterial = src
        .split(/\r?\n/)
        .filter((line) => line.includes("mesh(") && /grid|bar_[vh]|spacer/.test(line))
        .flatMap((line) => [...line.matchAll(/M\.(\w+)/g)].map((m) => m[1]));
      expect(barMaterial.length, `${file}: found no grid bar meshes to check`).toBeGreaterThan(0);
      for (const mat of barMaterial) {
        expect(FRAME_MAPPED.has(mat), `${file}: grid bar uses M.${mat}, which the finish picker never reaches`).toBe(true);
      }
    }
    // And the slots those materials bake into must all still be recoloured.
    expect(FRAME_MATERIAL).toContain("frame2");
    expect(FRAME_MATERIAL).toContain("frame3");
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

  it("the makinwhat credit renders exactly when the licensed model does", () => {
    // The grant requires the attribution wherever that model shows — and equally,
    // crediting makinwhat for geometry FourlinQ authored would be wrong in the
    // other direction. The component gates the credit on `config.model` being
    // absent, which is true only for the licensed systems, so both directions
    // hold automatically. Asserted against the source because this is a licence
    // obligation, not a rendering preference.
    const source = readFileSync(
      resolve(__dirname, "../components/3d/Window3D.tsx"),
      "utf8",
    );
    expect(source, "credit must be conditional").toMatch(/\{!config\.model && \(/);
    expect(source).toContain("sketchfab.com/makinwhat");
    // And the licensed file must not be preloaded: nothing renders it, so pulling
    // it on every visit is 4.89 MB of dead weight.
    expect(source).not.toMatch(/useGLTF\.preload\(MODEL_LICENSED\)/);
  });

  it("the licensed model is claimed only by the two withheld products", () => {
    // Sixty-two of the seventy top-level nodes in the makinwhat file are now
    // unreachable, because every assembly the site actually shows was replaced
    // by a builder FourlinQ owns. Pinning all sixty-two names would be brittle
    // and would say nothing; what matters is the inverse — which nodes are STILL
    // claimed. Only pivot, pivot-lattice and revolving are, and all three are
    // withheld from CATALOGUE_SYSTEM as unconfirmed products, so nothing draws
    // from this file on any page.
    const claimed = Object.entries(SYSTEM_ROOT).map(([id]) => id);
    expect([...claimed].sort()).toEqual(["pivot", "pivot-lattice", "revolving"]);
    for (const id of claimed) {
      expect(CATALOGUE_SYSTEM, `${id} must stay off the rail`).not.toContain(id);
    }

    // Stated as a number so it can only move deliberately. It went 0 -> 18 -> 62
    // as systems migrated; it can never go down without a system moving BACK
    // onto the licence.
    expect(probe().unclaimed.length).toBe(62);
  });

  it("counts how much of the site still depends on the licensed model", () => {
    // The attribution and the fourlinq.ph-only restriction come from this
    // file. Every system moved off it is progress toward dropping both, so
    // this states the remaining debt out loud rather than leaving it implicit.
    const licensed = systemId.filter((id) => !SYSTEMS[id].model);
    expect([...licensed].sort()).toEqual(["pivot", "pivot-lattice", "revolving"]);

    // Of those, these are reachable in the UI. Reachable = a tab, or a grille
    // whose base system has a tab.
    //
    // It is EMPTY, and that is the headline: no page on this site renders the
    // licensed model any more. Louvre was the last shipped product drawn from
    // it and now has its own builder. The three above stay configured but
    // withheld, so neither the attribution nor the fourlinq.ph-only restriction
    // binds anything that ships. If this list is ever non-empty again, the
    // makinwhat credit has to go back under the viewer.
    const reachable = licensed.filter((id) => {
      const base = SYSTEMS[id].grilleOf;
      return base ? CATALOGUE_SYSTEM.includes(base) : CATALOGUE_SYSTEM.includes(id);
    });
    expect(reachable).toEqual([]);
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
