/**
 * Configurator material-step invariants.
 *
 * The meeting asked for a "like Apple selection" flow (00:11:11–00:11:28):
 * type -> material -> finish -> glass -> size. Material decides the finish set,
 * so the two must never contradict — a uPVC finish must not survive a switch to
 * aluminium.
 */
import { describe, expect, it } from "vitest";
import { finishesForMaterial } from "@/hooks/useConfigurator";
import { ALUMINIUM_FINISHES, FRAME_FINISHES } from "@/data/fourlinq-data";

describe("material decides the finish set", () => {
  it("uPVC offers the full frame-finish set", () => {
    const upvc = finishesForMaterial("upvc");
    expect(upvc.length).toBe(FRAME_FINISHES.length);
    expect(upvc.length).toBeGreaterThan(ALUMINIUM_FINISHES.length);
  });

  it("aluminium offers exactly the powder-coat colours", () => {
    const alu = finishesForMaterial("aluminium");
    expect(alu.map((f) => f.id).sort()).toEqual(
      ALUMINIUM_FINISHES.map((f) => f.id).sort(),
    );
  });

  it("aluminium has no wood-grain finish — powder-coat is solid only", () => {
    expect(
      finishesForMaterial("aluminium").some((f) => f.finishType === "wood-grain"),
    ).toBe(false);
  });

  it("the two materials share no finish id, so a switch always re-scopes", () => {
    const upvc = new Set(finishesForMaterial("upvc").map((f) => f.id));
    const alu = finishesForMaterial("aluminium").map((f) => f.id);
    expect(alu.some((id) => upvc.has(id))).toBe(false);
  });

  it("an unknown material falls back to uPVC rather than an empty set", () => {
    expect(finishesForMaterial("titanium").length).toBeGreaterThan(0);
  });

  it("every finish carries a colour, so the swatch and preview can render", () => {
    for (const material of ["upvc", "aluminium"]) {
      for (const finish of finishesForMaterial(material)) {
        expect(finish.color).toMatch(/^#|^rgb/);
      }
    }
  });
});
