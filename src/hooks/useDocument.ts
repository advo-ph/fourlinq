import { useQuery } from "@tanstack/react-query";

/**
 * Technical-library documents for /for-architects.
 *
 * Backed by the cms_document table via /api/cms/document; the team uploads
 * files (PDF, DWG, RFA, ZIP, DOC) from /admin > Content > Documents and each
 * row flips from "Available on request" to a real download. The static fallback mirrors
 * exactly what migration 013 seeds, so the page renders identically if the
 * API is unreachable.
 *
 * Status is derived, not stored:
 *   file_path → downloadable file · link_url → live page ·
 *   else note ?? "Available on request"
 */

export interface SiteDocument {
  cms_document_id?: number;
  slug: string;
  title: string;
  doc_type: string;
  description: string | null;
  file_path: string | null;
  link_url: string | null;
  note: string | null;
}

// Static fallback — same content the migration seeds into the table.
export const DOCUMENT_FALLBACK: SiteDocument[] = [
  {
    slug: "system-catalog",
    title: "System catalog",
    doc_type: "PDF",
    description:
      "Complete catalog of all window and door systems with the uPVC profile engineering features, the twelve verified finishes, materials, warranty scope, and showroom directory.",
    file_path: "/docs/fourlinq-system-catalog.pdf",
    link_url: null,
    note: null,
  },
  {
    slug: "casement-drawings",
    title: "Casement drawings",
    doc_type: "DWG",
    description:
      "2D AutoCAD blocks with profile sections, glazing options, and standard configurations for the Casement system.",
    file_path: null,
    link_url: null,
    note: null,
  },
  {
    slug: "sliding-drawings",
    title: "Sliding drawings",
    doc_type: "DWG",
    description:
      "2D AutoCAD blocks for Sliding Door, Lift & Slide, and Slide & Fold systems with track details.",
    file_path: null,
    link_url: null,
    note: null,
  },
  {
    slug: "large-panel-engineering-data",
    title: "Large-panel engineering data",
    doc_type: "PDF",
    description:
      "Maximum spans, glazing weight limits, reinforcement requirements for door openings up to 6 metres wide.",
    file_path: null,
    link_url: null,
    note: null,
  },
  {
    slug: "curtain-wall-manual",
    title: "Curtain wall manual",
    doc_type: "PDF",
    description:
      "Full curtain wall system specifications, structural calculations, and installation methodology.",
    file_path: null,
    link_url: null,
    note: null,
  },
  {
    slug: "revit-family-library",
    title: "Revit family library",
    doc_type: "RFA",
    description:
      "BIM family files for FourlinQ window and door systems, ready to drop into your Revit project.",
    file_path: null,
    link_url: null,
    note: "In progress",
  },
  {
    slug: "finish-palette",
    title: "Finish palette",
    doc_type: "PDF",
    description:
      "All twelve brochure-verified finishes with hex values, swatches, and recommended pairings for residential and commercial use.",
    file_path: null,
    link_url: "/finishes",
    note: null,
  },
  {
    slug: "care-specification",
    title: "Care specification",
    doc_type: "PDF",
    description:
      "Standard cleaning protocols, recommended hardware service intervals, and warranty registration requirements for client handover packages.",
    file_path: null,
    link_url: "/care",
    note: null,
  },
];

async function fetchDocument(): Promise<SiteDocument[]> {
  const res = await fetch("/api/cms/document");
  if (!res.ok) throw new Error(`/api/cms/document ${res.status}`);
  const payload = (await res.json()) as { items: SiteDocument[] };
  if (!payload.items?.length) throw new Error("empty document list");
  return payload.items;
}

/** Technical-library documents with API → static fallback. Never returns empty. */
export function useDocument() {
  const query = useQuery({
    queryKey: ["document"],
    queryFn: fetchDocument,
    placeholderData: DOCUMENT_FALLBACK,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const document =
    query.error || !query.data?.length ? DOCUMENT_FALLBACK : query.data;

  return { document, isLoading: query.isLoading };
}
