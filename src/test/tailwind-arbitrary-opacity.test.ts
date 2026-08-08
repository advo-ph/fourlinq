/**
 * Guard against a class that compiles to nothing.
 *
 * Tailwind 3 cannot apply an opacity modifier to an arbitrary value that
 * already carries a type hint — `bg-[color:var(--ink-primary)]/30` produces no
 * rule at all, so the element gets no background rather than a translucent one.
 * It fails silently: the markup looks right, the class is in the DOM, and the
 * compiled stylesheet simply has no matching selector.
 *
 * That shipped twice. It made the 3D viewer's badge white-on-white, and it left
 * three modal scrims (QuoteModal, Products, SystemBucket) with a blur but no
 * dimming. Both are fixed with an inline
 * `color-mix(in srgb, var(--token) N%, transparent)`, which keeps the design
 * token instead of hardcoding a hex.
 *
 * This scans source rather than rendering, because the failure lives in the
 * stylesheet, not the component: a runtime probe that builds the class name
 * dynamically finds nothing either way, since the JIT only emits classes it
 * literally saw in a source file.
 */
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const SELF = "src/test/tailwind-arbitrary-opacity.test.ts";

/**
 * `bg-[color:var(--x)]/30`, `text-[length:...]/50`, and friends — any arbitrary
 * value with a `type:` hint followed by an opacity modifier.
 */
const HINTED_ARBITRARY_WITH_OPACITY = /\b[a-z-]+-\[[a-z-]+:[^\]]+\]\/\d+/g;

/** Every `.ts`/`.tsx` under src/, as repo-relative POSIX paths. */
const sourceFile = readdirSync(resolve(ROOT, "src"), { recursive: true })
  .map((entry) => `src/${String(entry).replace(/\\/g, "/")}`)
  .filter((rel) => /\.tsx?$/.test(rel))
  // This file quotes the broken class in its own docblock as the example.
  .filter((rel) => rel !== SELF);

describe("Tailwind arbitrary values", () => {
  it("finds source files to scan", () => {
    // A bad glob would make every assertion below vacuously pass.
    expect(sourceFile.length).toBeGreaterThan(50);
  });

  it("never pairs a type-hinted arbitrary value with an opacity modifier", () => {
    const offender: string[] = [];

    for (const rel of sourceFile) {
      const text = readFileSync(resolve(ROOT, rel), "utf8");
      for (const [index, line] of text.split("\n").entries()) {
        for (const match of line.matchAll(HINTED_ARBITRARY_WITH_OPACITY)) {
          offender.push(`${rel}:${index + 1}  ${match[0]}`);
        }
      }
    }

    expect(
      offender,
      `These compile to no CSS rule. Use an inline style with color-mix instead:\n${offender.join("\n")}`,
    ).toEqual([]);
  });
});
