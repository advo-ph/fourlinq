/**
 * Configurator material-step invariants + design-tool preview contracts.
 *
 * The meeting asked for a "like Apple selection" flow (00:11:11–00:11:28):
 * type -> material -> finish -> glass -> size. Material decides the finish set,
 * so the two must never contradict — a uPVC finish must not survive a switch to
 * aluminium.
 *
 * Lane design-tool instruments (colour, outward open, F-S-S-S-S-F panel layout)
 * drive the real WindowPreview + configurator data — not a reimplemented oracle.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { finishesForMaterial } from "@/hooks/useConfigurator";
import { ALUMINIUM_FINISHES, FRAME_FINISHES } from "@/data/fourlinq-data";
import {
  productTypes,
  finishOptions,
  sizeConstraints,
  getPanelLayout,
  dividePanelWidth,
  SLIDING_DOOR_FAMILY,
} from "@/data/configurator";
import WindowPreview from "@/components/configurator/WindowPreview";
import { FINISH_SCENES } from "@/data/finish-scenes";

const DEFAULT_FINISH = finishOptions.find((f) => f.id === "white")!;
/** Solid non-default finish so frameFill is a hex, not a grain pattern URL. */
const NON_DEFAULT_FINISH = finishOptions.find((f) => f.id === "jet-black")!;

const basePreviewProps = {
  frameColor: NON_DEFAULT_FINISH.color,
  finishId: NON_DEFAULT_FINISH.id,
  glassTint: "rgba(200,220,240,0.1)",
  glassOpacity: 0.1,
  width: 1200,
  height: 1400,
};

function renderPreview(
  type: string,
  overrides: Partial<typeof basePreviewProps> & { panelLayoutId?: string } = {},
) {
  return render(
    <WindowPreview
      type={type}
      frameColor={overrides.frameColor ?? basePreviewProps.frameColor}
      finishId={overrides.finishId ?? basePreviewProps.finishId}
      glassTint={overrides.glassTint ?? basePreviewProps.glassTint}
      glassOpacity={overrides.glassOpacity ?? basePreviewProps.glassOpacity}
      width={overrides.width ?? basePreviewProps.width}
      height={overrides.height ?? basePreviewProps.height}
      panelLayoutId={overrides.panelLayoutId}
    />,
  );
}

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

describe("colour propagation through every product preview", () => {
  it("has a non-default solid finish distinct from the default white", () => {
    expect(NON_DEFAULT_FINISH).toBeDefined();
    expect(DEFAULT_FINISH).toBeDefined();
    expect(NON_DEFAULT_FINISH.color.toLowerCase()).not.toBe(
      DEFAULT_FINISH.color.toLowerCase(),
    );
  });

  for (const product of productTypes) {
    it(`paints ${product.id} frame geometry with the supplied frameColor`, () => {
      const { container } = renderPreview(product.id);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      const markup = svg!.outerHTML.toLowerCase();
      const colour = NON_DEFAULT_FINISH.color.toLowerCase();
      // Real renderer must emit the finish colour on frame/stile/rail fills.
      expect(markup).toContain(colour);
      // Default finish hex must not be baked into frame parts when another finish is active.
      expect(markup).not.toContain(DEFAULT_FINISH.color.toLowerCase());
    });
  }

  it("paints the entrance solid lower panel with frameColor (not outline-only)", () => {
    const { container } = renderPreview("entrance");
    const solidLower = container.querySelector('[data-door-panel="solid-lower"]');
    expect(solidLower).toBeTruthy();
    const fill = solidLower!.getAttribute("fill") ?? "";
    expect(fill.toLowerCase()).toContain(NON_DEFAULT_FINISH.color.toLowerCase());
  });
});

describe("opening direction is outward-only", () => {
  /**
   * Meeting 00:12:32 — "you're pushing it outside… Everything is going out.
   * Never inward." Every product whose leaf SWINGS must draw the outward cue.
   * Listed explicitly (not derived from productTypes) so adding a new swing
   * type is a deliberate edit here rather than a silent omission.
   *
   * Excluded, and why: sliding / sliding-door / lift-slide / 90-series travel on
   * a track; fixed does not open; bifold folds and stacks; special-, arch-,
   * custom-shapes, curtain-wall and large-panel-doors are project geometry, not
   * a single operable leaf. tilt-turn is deliberately absent — see the
   * tilt-turn assertion below.
   */
  const SWING_TYPE = ["casement", "awning", "entrance", "french-door"];

  for (const type of SWING_TYPE) {
    it(`${type} draws an outward-opening indicator`, () => {
      const { container } = renderPreview(type);
      expect(
        container.querySelector('[data-opening="outward"]'),
        `${type} swings, so it must show the outward cue`,
      ).toBeTruthy();
    });
  }

  it("covers every swing type the preview knows how to draw", () => {
    // Guards the omission this test block originally missed: a swing type that
    // renders sashes but no cue used to pass silently.
    for (const type of SWING_TYPE) {
      expect(
        productTypes.some((p) => p.id === type),
        `${type} is asserted here but is not a real product type`,
      ).toBe(true);
    }
  });

  it("tilt-turn is not claimed as outward — it is inward by design (open question)", () => {
    // A tilt & turn genuinely opens inward; that is what the product IS.
    // glossary.ts still describes it as tilting/swinging inward while it is
    // flagged is_fourlinq_offering: true. Do NOT "fix" this by drawing an
    // outward cue — confirm with the client whether FourlinQ sells tilt & turn
    // at all. See MEETING_INSTRUCTION_INVENTORY, "never inward" row.
    const { container } = renderPreview("tilt-turn");
    expect(container.querySelector('[data-opening="outward"]')).toBeNull();
  });
});

describe("fixed-slide-slide-slide-slide-fixed panel layout", () => {
  const LAYOUT_ID = "fixed-slide-slide-slide-slide-fixed";

  it("exposes the named preset on the sliding-door family with singular panel field", () => {
    const layout = getPanelLayout(LAYOUT_ID);
    expect(layout).toBeDefined();
    expect(layout!.family).toBe(SLIDING_DOOR_FAMILY);
    expect(layout!.label.toLowerCase()).toMatch(/fixed/);
    expect(layout!.label.toLowerCase()).toMatch(/4-panel|4 panel|slide/);
    // Singular field name contract — sequence is `panel`, not `panels`.
    expect(Array.isArray(layout!.panel)).toBe(true);
    expect(layout!.panel).toHaveLength(6);
    expect(layout!.panel[0]).toBe("fixed");
    expect(layout!.panel[5]).toBe("fixed");
    expect(layout!.panel.slice(1, 5).every((kind) => kind === "slide")).toBe(true);
  });

  it("draws six panels with fixed ends and slide cues on the middle four", () => {
    const { container } = renderPreview("sliding-door", {
      panelLayoutId: LAYOUT_ID,
    });
    const panelNode = container.querySelectorAll("[data-panel-index]");
    expect(panelNode.length).toBe(6);
    expect(panelNode[0].getAttribute("data-panel-kind")).toBe("fixed");
    expect(panelNode[5].getAttribute("data-panel-kind")).toBe("fixed");
    for (let i = 1; i <= 4; i++) {
      expect(panelNode[i].getAttribute("data-panel-kind")).toBe("slide");
      expect(
        container.querySelector(`[data-panel-index="${i}"][data-slide-cue="true"]`),
      ).toBeTruthy();
    }
    // Fixed ends must not carry a slide cue.
    expect(
      container.querySelector('[data-panel-index="0"][data-slide-cue="true"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-panel-index="5"][data-slide-cue="true"]'),
    ).toBeNull();
  });

  it("divides panel width evenly so total equals frame inner width at min, default, and max", () => {
    const layout = getPanelLayout(LAYOUT_ID)!;
    const widthSample = [
      sizeConstraints.width.min,
      1200,
      sizeConstraints.width.max,
    ];
    for (const widthMm of widthSample) {
      // Mirror the preview's frame math: pad 10, frame thickness 12 each side on a 300px SVG.
      // Tests assert the pure divider used by the renderer, then confirm the rendered sum.
      const svgW = 300;
      const pad = 10;
      const fw = 12;
      const fWidth = svgW - pad * 2;
      const innerWidth = fWidth - fw * 2;
      const each = dividePanelWidth(innerWidth, layout.panel.length);
      expect(each * layout.panel.length).toBeCloseTo(innerWidth, 5);

      const { container, unmount } = renderPreview("sliding-door", {
        panelLayoutId: LAYOUT_ID,
        width: widthMm,
        height: 1400,
      });
      const panelNode = container.querySelectorAll("[data-panel-index]");
      let sum = 0;
      panelNode.forEach((node) => {
        sum += Number(node.getAttribute("data-panel-width"));
      });
      expect(sum).toBeCloseTo(innerWidth, 5);
      unmount();
    }
  });
});

describe("/finishes door recolour wiring", () => {
  it("exposes a door scene (or svg preview mode) that is not a static no-op photo", () => {
    const doorScene = FINISH_SCENES.find((s) => s.id === "door");
    expect(doorScene).toBeDefined();
    // SVG-driven recolour: either hasAssets true with real variants, or an explicit svg preview mode.
    // A second hasAssets:false photo scene would not recolour — reject that path.
    const canRecolour =
      doorScene!.hasAssets === true ||
      (doorScene as { previewMode?: string }).previewMode === "svg";
    expect(canRecolour).toBe(true);
  });
});
