/**
 * Glossary integrity + the RM1 editorial boundary.
 *
 * The glossary is published before the client has signed off the full product
 * master (RM1 is Tier 3). These tests keep it inside the safe boundary: correct
 * structure, and — critically — no term that would imply a FourlinQ capability
 * the codebase has not confirmed (automation, opening-control devices, insect
 * screens, casings), nor the product-line names the audit flagged as contested
 * ("90 Series", "Large Panel").
 */
import { describe, expect, it } from "vitest";
import {
  GLOSSARY_TERM,
  GLOSSARY_GROUP,
  termByCategory,
  type GlossaryCategory,
} from "@/data/glossary";

describe("glossary structure", () => {
  it("every term has a non-trivial definition", () => {
    for (const t of GLOSSARY_TERM) {
      expect(t.term.length).toBeGreaterThan(0);
      expect(t.definition.length).toBeGreaterThan(30);
    }
  });

  it("terms are unique", () => {
    const names = GLOSSARY_TERM.map((t) => t.term);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every term sits in a declared group, and no group is empty", () => {
    const declared = new Set(GLOSSARY_GROUP.map((g) => g.category));
    for (const t of GLOSSARY_TERM) {
      expect(declared.has(t.category)).toBe(true);
    }
    for (const g of GLOSSARY_GROUP) {
      expect(termByCategory(g.category).length).toBeGreaterThan(0);
    }
  });
});

describe("RM1 editorial boundary — no unconfirmed capability leaks in", () => {
  const haystack = GLOSSARY_TERM.map((t) =>
    `${t.term} ${t.definition} ${t.also_called ?? ""}`.toLowerCase(),
  ).join(" | ");

  // FourlinQ has not confirmed it offers these; naming them as products would
  // be exactly the over-claim the 2026-07-10 audit warns against.
  const forbidden = [
    "automation", "smart", "sensor",
    "window opening control", "wocd",
    "insect screen", "retractable screen",
    "90 series", "large panel",
  ];

  it.each(forbidden)("does not present %s as a FourlinQ offering", (phrase) => {
    expect(haystack).not.toContain(phrase);
  });

  it("everything flagged is_fourlinq_offering is a real confirmed operation/material/glass", () => {
    // The offering flag may only sit on the axes the repo already ships:
    // operations, materials, glass, and the weatherseal (EPDM, in the data).
    const allowed: GlossaryCategory[] = ["operation", "material", "glass", "anatomy"];
    for (const t of GLOSSARY_TERM.filter((t) => t.is_fourlinq_offering)) {
      expect(allowed).toContain(t.category);
    }
  });
});
