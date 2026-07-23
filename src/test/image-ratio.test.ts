import { describe, it, expect } from "vitest";
import { nearestRatioLabel } from "@/lib/image-ratio";

describe("nearestRatioLabel", () => {
  it("returns '16:9 landscape' for 1920×1080", () => {
    expect(nearestRatioLabel(1920 / 1080)).toBe("16:9 landscape");
  });

  it("returns '16:9 landscape' for values close to 16/9", () => {
    expect(nearestRatioLabel(1.78)).toBe("16:9 landscape");
  });

  it("returns '4:3 landscape' for 1600×1200", () => {
    expect(nearestRatioLabel(1600 / 1200)).toBe("4:3 landscape");
  });

  it("returns '3:2 landscape' for 3000×2000", () => {
    expect(nearestRatioLabel(3000 / 2000)).toBe("3:2 landscape");
  });

  it("returns '5:4 landscape' for 1280×1024", () => {
    expect(nearestRatioLabel(1280 / 1024)).toBe("5:4 landscape");
  });

  it("returns '21:9 landscape' for 2560×1080", () => {
    expect(nearestRatioLabel(2560 / 1080)).toBe("21:9 landscape");
  });

  it("returns '1:1 square' for exact 1.0", () => {
    expect(nearestRatioLabel(1.0)).toBe("1:1 square");
  });

  it("returns '1:1 square' for near-square (within 5%)", () => {
    expect(nearestRatioLabel(1.04)).toBe("1:1 square");
  });

  it("returns '9:16 portrait' for 1080×1920", () => {
    expect(nearestRatioLabel(1080 / 1920)).toBe("9:16 portrait");
  });

  it("returns '3:4 portrait' for 768×1024", () => {
    expect(nearestRatioLabel(768 / 1024)).toBe("3:4 portrait");
  });

  it("returns '2:3 portrait' for 800×1200", () => {
    expect(nearestRatioLabel(800 / 1200)).toBe("2:3 portrait");
  });

  it("returns 'unknown' for 0 or invalid", () => {
    expect(nearestRatioLabel(0)).toBe("unknown");
    expect(nearestRatioLabel(-1)).toBe("unknown");
    expect(nearestRatioLabel(Infinity)).toBe("unknown");
    expect(nearestRatioLabel(NaN)).toBe("unknown");
  });
});
