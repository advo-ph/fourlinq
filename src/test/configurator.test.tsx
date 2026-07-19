/**
 * Configurator material-step invariants.
 *
 * The meeting asked for a "like Apple selection" flow (00:11:11–00:11:28):
 * type -> material -> finish -> glass -> size. Material decides the finish set,
 * so the two must never contradict — a uPVC finish must not survive a switch to
 * aluminium.
 */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { finishesForMaterial } from "@/hooks/useConfigurator";
import { ALUMINIUM_FINISHES, FRAME_FINISHES } from "@/data/fourlinq-data";
import { saveConfiguration } from "@/lib/configuration";
import WindowPreview from "@/components/configurator/WindowPreview";
import { faqAnchor } from "@/data/faq";
import { submitQuote } from "@/lib/quote";
import { DESIGN_TOOL_FRAME_MESSAGE, designToolFrameHeight, isEmbeddedDesignTool } from "@/lib/embed";
import DesignTool from "@/pages/DesignTool";

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

describe("configuration submission truth", () => {
  const payload = {
    name: "Test Buyer",
    email: "buyer@example.com",
    phone: "",
    config: {
      type: "casement",
      material: "upvc",
      finish: "white",
      glass: "confirm-with-fourlinq",
      width: 1200,
      height: 1400,
    },
  };

  it("returns only a server-confirmed reference", async () => {
    const request = async () => new Response(
      JSON.stringify({ success: true, refId: "CFG-CONFIRMED" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

    await expect(saveConfiguration(payload, request)).resolves.toEqual({
      refId: "CFG-CONFIRMED",
    });
  });

  it("rejects an HTTP error instead of fabricating a local success", async () => {
    const request = async () => new Response(
      JSON.stringify({ error: "Database unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );

    await expect(saveConfiguration(payload, request)).rejects.toThrow("Database unavailable");
  });

  it("rejects a nominal response without a confirmed reference", async () => {
    const request = async () => new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

    await expect(saveConfiguration(payload, request)).rejects.toThrow(
      "The configuration could not be sent.",
    );
  });
});

describe("embedded Design Tool", () => {
  it("identifies only the explicit Design Tool embed route", () => {
    expect(isEmbeddedDesignTool("/design-tool", "?embed=1")).toBe(true);
    expect(isEmbeddedDesignTool("/design-tool", "?embed=0")).toBe(false);
    expect(isEmbeddedDesignTool("/", "?embed=1")).toBe(false);
  });

  it("accepts only bounded Design Tool height messages", () => {
    expect(designToolFrameHeight({ type: DESIGN_TOOL_FRAME_MESSAGE, height: 701.2 })).toBe(720);
    expect(designToolFrameHeight({ type: DESIGN_TOOL_FRAME_MESSAGE, height: 1_234.1 })).toBe(1_235);
    expect(designToolFrameHeight({ type: DESIGN_TOOL_FRAME_MESSAGE, height: 4_000 })).toBe(1_600);
    expect(designToolFrameHeight({ type: "other", height: 900 })).toBeNull();
    expect(designToolFrameHeight({ type: DESIGN_TOOL_FRAME_MESSAGE, height: "900" })).toBeNull();
  });

  it("keeps family selection focused and exposes a final review action", () => {
    render(
      <MemoryRouter initialEntries={["/design-tool?embed=1"]}>
        <DesignTool />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Choose a product family" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Casement" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Slide & Fold" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Doors" }));
    expect(screen.getByRole("button", { name: "Slide & Fold" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Step 5: Size" }));
    expect(screen.getByRole("button", { name: "Send visual brief" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open full Design Tool" })).toHaveAttribute("target", "_top");
  });
});

describe("quote submission truth", () => {
  const payload = {
    name: "Test Buyer",
    email: "buyer@example.com",
    phone: "",
    quantity: "2",
    dimensions: "1200 x 1400 mm",
    finish: "White",
    timeline: "Planning",
    notes: "Test request",
  };

  it("requires both server success and a reference", async () => {
    const request = async () => new Response(
      JSON.stringify({ success: true, refId: "QR-CONFIRMED", message: "Recorded" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

    await expect(submitQuote(payload, request)).resolves.toEqual({
      refId: "QR-CONFIRMED",
      message: "Recorded",
    });
  });

  it("rejects a response without a reference", async () => {
    const request = async () => new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

    await expect(submitQuote(payload, request)).rejects.toThrow(
      "The quote request could not be submitted.",
    );
  });
});

describe("decision-tool accessibility", () => {
  it("gives the visual preview a useful accessible name and caveat", () => {
    render(
      <WindowPreview
        type="casement"
        frameColor="#f5f5f5"
        finishId="white"
        glassTint="rgba(200,220,240,0.1)"
        glassOpacity={0.1}
        width={1200}
        height={1400}
        label="Casement uPVC window preview in White"
      />,
    );

    expect(screen.getByRole("img", { name: /Casement uPVC window preview in White/ })).toBeInTheDocument();
    expect(screen.getByText(/Illustrative preview only/)).toBeInTheDocument();
  });

  it("creates stable FAQ deep-link anchors", () => {
    expect(faqAnchor("What's not covered?")).toBe("faq-what-s-not-covered");
  });
});
