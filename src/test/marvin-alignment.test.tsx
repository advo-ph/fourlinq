import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import EditorialButton from "@/components/primitives/Button";
import SystemCategoryCard from "@/components/shared/SystemCategoryCard";
import FinishSwatch from "@/components/shared/FinishSwatch";
import ThermalSystemToggle from "@/components/home/ThermalSystemToggle";
import { Button } from "@/components/ui/button";
import type { ThermalSystem } from "@/data/scroll-window-phases";

describe("Marvin alignment contracts", () => {
  it("keeps shared buttons rectangular with a one-pixel border", () => {
    const { rerender } = render(<EditorialButton>Request a quote</EditorialButton>);
    expect(screen.getByRole("button", { name: "Request a quote" })).toHaveClass(
      "rounded-sm",
      "border",
    );
    expect(screen.getByRole("button", { name: "Request a quote" })).not.toHaveClass(
      "border-[3px]",
    );

    rerender(<Button variant="outline">Continue</Button>);
    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass(
      "rounded-sm",
      "border",
    );
  });

  it("uses a neutral hairline and neutral hover ink on category cards", () => {
    const { container } = render(
      <MemoryRouter>
        <SystemCategoryCard
          category={{
            key: "window",
            eyebrow: "By type",
            name: "Window Systems",
            description: "Custom-fabricated window systems.",
            items: ["Casement"],
            image: "/window.jpg",
            to: "/products?filter=windows",
          }}
        />
      </MemoryRouter>,
    );

    const hairline = container.querySelector("[class*='border-t']");
    expect(hairline).toHaveClass("border-t", "border-[color:var(--rule-strong)]");
    expect(hairline).not.toHaveClass("border-t-[3px]", "border-[color:var(--accent)]");
    expect(screen.getByRole("heading", { name: "Window Systems" })).not.toHaveClass(
      "group-hover:text-[color:var(--accent)]",
    );
  });

  it("keeps the thermal selector flat while reserving red for selection", () => {
    const system: ThermalSystem[] = [
      {
        id: "upvc",
        label: "uPVC System",
        text: { eyebrow: "Thermal", headline: "Keeps heat outside.", body: "Body" },
        image: null,
      },
      {
        id: "alu",
        label: "Aluminium Thermal Break",
        text: { eyebrow: "Thermal", headline: "Keeps heat outside.", body: "Body" },
        image: null,
      },
    ];
    const { container } = render(
      <ThermalSystemToggle
        systems={system}
        value="upvc"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: "Window system" })).toHaveClass(
      "rounded-sm",
      "border",
      "bg-white",
    );
    expect(screen.getByRole("group", { name: "Window system" }).className).not.toMatch(
      /rounded-full|shadow|backdrop-blur/,
    );
    expect(container.querySelector("[aria-hidden='true']")?.className).not.toMatch(/shadow/);
  });

  it("renders finish swatches as restrained rectangular controls", () => {
    const { container } = render(
      <FinishSwatch color="#ffffff" finishType="solid" selected />,
    );
    expect(container.firstElementChild).toHaveClass("rounded-sm", "border", "ring-1");
    expect(container.firstElementChild?.className).not.toMatch(/rounded-full|border-\[3px\]/);
  });
});
