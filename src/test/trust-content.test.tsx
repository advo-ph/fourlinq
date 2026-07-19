import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import NewsCard from "@/components/shared/NewsCard";
import ChatMessage from "@/components/chat/ChatMessage";
import { whatsNew, type WhatsNewEntry } from "@/data/whats-new";
import { products } from "@/data/products";
import { projects } from "@/data/projects";
import { glassOptions } from "@/data/configurator";

const archiveEntry: WhatsNewEntry = {
  id: "archive-note",
  date: "2026-01-01",
  category: "event",
  title: "Archive note",
  excerpt: "Source-bounded archive text.",
  image: "",
};

describe("trust-content regressions", () => {
  it("does not turn a news item without a destination into a false link", () => {
    render(
      <MemoryRouter>
        <NewsCard entry={archiveEntry} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("DATE UNVERIFIED")).toBeInTheDocument();
  });

  it("labels a supplied, verified publication date", () => {
    render(
      <MemoryRouter>
        <NewsCard entry={{ ...archiveEntry, dateVerified: true }} />
      </MemoryRouter>,
    );

    expect(screen.getByText("JAN 2026")).toBeInTheDocument();
  });

  it("never ships a placeholder hash destination in the fallback news feed", () => {
    expect(whatsNew.some((entry) => entry.link === "#")).toBe(false);
  });

  it("turns assistant catalog paths into canonical product-filter links", () => {
    render(
      <MemoryRouter>
        <ChatMessage role="assistant" content="Browse /products?filter=windows for the current window catalog." />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Window Systems/ })).toHaveAttribute(
      "href",
      "/products?filter=windows",
    );
  });

  it("marks every inferred fallback date as unverified", () => {
    for (const entry of whatsNew) {
      if (entry.id !== "worldbex-2026") expect(entry.dateVerified).not.toBe(true);
    }
  });

  it("keeps the fallback product catalog free of inferred option matrices", () => {
    for (const product of products) {
      expect(product.finishes).toEqual([]);
      expect(product.glassOptions).toEqual([]);
      expect(product.specs.join(" ")).toMatch(/confirm/i);
    }

    expect(JSON.stringify(products)).not.toMatch(/typhoon|up to 6 metres|weatherproof|multi-point locking|Low-E Coated/i);
  });

  it("keeps the configurator glass step confirmation-only", () => {
    expect(glassOptions).toEqual([
      expect.objectContaining({
        id: "confirm-with-fourlinq",
        name: "Glass to be confirmed",
      }),
    ]);
  });

  it("keeps fallback project records free of unsupported performance prose", () => {
    const projectText = projects.map((project) => `${project.caption ?? ""} ${project.description ?? ""}`).join(" ");
    expect(projectText).not.toMatch(/better security|better insulation|better efficiency|premium windows|durability/i);
  });

  it("deactivates legacy knowledge and reconciles stale generated chunks", () => {
    const migration = readFileSync("server/migrations/013_source_bound_public_content.sql", "utf8");
    const seed = readFileSync("server/scripts/seed-site-knowledge.ts", "utf8");
    const productRoute = readFileSync("server/routes/products.ts", "utf8");

    expect(migration).toMatch(/Product Facts[\s\S]*Site Knowledge — Generated/);
    expect(migration).toMatch(/SET is_active = false/);
    expect(seed).toMatch(/stale generated chunks deactivated/);
    expect(seed.indexOf('client.query("BEGIN")')).toBeGreaterThan(seed.indexOf("WHERE name = ANY"));
    expect(seed.indexOf("UPDATE knowledge_base SET is_active = true")).toBeGreaterThan(seed.indexOf("NOT (source_url = ANY"));
    expect(seed).toMatch(/kb_type, is_active\)[\s\S]*'educational', false/);
    expect(seed).not.toMatch(/DIMENSION_CONSTRAINTS|benefitPlain/);
    expect(productRoute).not.toMatch(/FROM product_(?:feature|finish|glass)/);
  });
});
