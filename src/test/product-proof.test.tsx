import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import SystemProof from "@/components/home/SystemProof";

describe("static homepage product story", () => {
  it("keeps the product gateway independent from frame engines", () => {
    const source = readFileSync(
      resolve("src/components/home/SystemsTiles.tsx"),
      "utf8",
    );

    expect(source).not.toContain("TILE_FRAMES");
    expect(source).not.toContain("useFramePreloader");
    expect(source).not.toContain("requestAnimationFrame");
    expect(source).not.toContain("<canvas");
  });

  it("replaces the long scroll chapter with one ordinary section", () => {
    const source = readFileSync(resolve("src/pages/Index.tsx"), "utf8");

    expect(source).toContain("<SystemProof />");
    expect(source).not.toContain("ScrollWindow");
    expect(source).not.toContain("Suspense");
    expect(source).not.toContain("500vh");
  });

  it("shows brochure-backed system proof without animation", () => {
    render(
      <MemoryRouter>
        <SystemProof />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Performance starts inside the frame." }),
    ).toBeInTheDocument();

    const proof = screen.getByRole("list", { name: "uPVC system features" });
    expect(within(proof).getAllByRole("listitem")).toHaveLength(3);
    expect(within(proof).getByText("Multi-Chamber Profile")).toBeInTheDocument();
    expect(within(proof).getByText("EPDM Gaskets")).toBeInTheDocument();
    expect(within(proof).getByText("Thick Glass")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore uPVC" })).toHaveAttribute(
      "href",
      "/why-upvc",
    );
    expect(document.querySelectorAll("canvas")).toHaveLength(0);
  });
});
