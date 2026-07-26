import { describe, it, expect } from "vitest";
import { toThumbPath } from "@/lib/project-thumbs";

describe("toThumbPath — baked repo assets", () => {
  it("maps a projects-fb JPEG to its WebP thumb", () => {
    expect(toThumbPath("/images/projects-fb/abc.jpg")).toBe(
      "/images/projects-fb/thumbs/abc.webp",
    );
  });

  it("maps a projects-fb PNG to its WebP thumb", () => {
    expect(toThumbPath("/images/projects-fb/abc.png")).toBe(
      "/images/projects-fb/thumbs/abc.webp",
    );
  });

  it("leaves an already-thumbed path alone", () => {
    const p = "/images/projects-fb/thumbs/abc.webp";
    expect(toThumbPath(p)).toBe(p);
  });
});

describe("toThumbPath — CMS uploads", () => {
  // The upload router writes a 480px "-thumb" sibling next to each processed
  // image. These were generated but never requested before this mapping existed,
  // so covers loaded as multi-MB originals.
  it("maps a CMS upload to its -thumb sibling, preserving extension", () => {
    expect(toThumbPath("/uploads/cms/20260725-15d26d1d95.png")).toBe(
      "/uploads/cms/20260725-15d26d1d95-thumb.png",
    );
    expect(toThumbPath("/uploads/cms/photo.jpg")).toBe(
      "/uploads/cms/photo-thumb.jpg",
    );
  });

  it("does not double-suffix an already-thumbed upload", () => {
    const p = "/uploads/cms/photo-thumb.png";
    expect(toThumbPath(p)).toBe(p);
  });

  it("leaves an extensionless upload path unchanged", () => {
    const p = "/uploads/cms/noextension";
    expect(toThumbPath(p)).toBe(p);
  });

  it("does not touch /uploads/docs — that mount has no sharp post-processing", () => {
    const p = "/uploads/docs/spec.pdf";
    expect(toThumbPath(p)).toBe(p);
  });
});

describe("toThumbPath — passthrough", () => {
  it("returns unrelated paths unchanged", () => {
    expect(toThumbPath("/images/other/x.jpg")).toBe("/images/other/x.jpg");
    expect(toThumbPath("https://cdn.example.com/x.jpg")).toBe(
      "https://cdn.example.com/x.jpg",
    );
  });

  it("handles empty input without throwing", () => {
    expect(toThumbPath("")).toBe("");
  });
});
