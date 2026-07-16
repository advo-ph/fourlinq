import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

import { type HeroSlide } from "@/components/home/HeroCarousel";
import ProjectReels from "@/components/home/ProjectReels";
import SystemsTiles from "@/components/home/SystemsTiles";
import VideoHero from "@/components/home/VideoHero";

const slide: HeroSlide[] = [
  { src: "/first.jpg", alt: "First project" },
  { src: "/second.jpg", alt: "Second project" },
];

describe("Marvin-aligned motion budget", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the base section static and reserves reveal for explicit use", () => {
    const sectionSource = readFileSync(
      resolve("src/components/primitives/Section.tsx"),
      "utf8",
    );
    const revealSource = readFileSync(
      resolve("src/components/primitives/ScrollReveal.tsx"),
      "utf8",
    );

    expect(sectionSource).not.toContain("whileInView");
    expect(sectionSource).not.toContain("motion.section");
    expect(revealSource).toContain("once: true");
    expect(revealSource).not.toContain("once: false");
    expect(revealSource).not.toContain("scale:");
  });

  it("does not auto-advance or animate the reduced-motion hero", () => {
    const intervalSpy = vi.spyOn(window, "setInterval");

    render(
      <MemoryRouter>
        <VideoHero
          videoSrc="/hero.mp4"
          fallbackSlides={slide}
          headline="Built around the opening."
          lede="A restrained project story."
          ctaLabel="Explore"
          ctaTo="/products"
        />
      </MemoryRouter>,
    );

    expect(document.querySelector("video")).not.toBeInTheDocument();
    expect(intervalSpy.mock.calls.some(([, delay]) => delay === 6000)).toBe(false);
    expect(screen.getByAltText("First project").parentElement).not.toHaveAttribute("style");

    fireEvent.click(screen.getByRole("button", { name: "Go to slide 2" }));
    expect(screen.getByAltText("Second project")).toBeInTheDocument();
  });

  it("uses static product images instead of frame canvases", () => {
    render(
      <MemoryRouter>
        <SystemsTiles />
      </MemoryRouter>,
    );

    expect(document.querySelectorAll("canvas")).toHaveLength(0);
    expect(document.querySelectorAll('img[data-product-media="static"]')).toHaveLength(3);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("keeps project video paused and user-controlled", () => {
    render(<ProjectReels />);

    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(document.querySelectorAll("video[controls]")).toHaveLength(6);
  });
});
