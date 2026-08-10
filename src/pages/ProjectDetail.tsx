import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import ProjectHeroGallery from "@/components/shared/ProjectHeroGallery";
import EditorialButton from "@/components/primitives/Button";
import { projects as fallbackProject, type Project } from "@/data/projects";
import { projectLocationLabel } from "@/data/project-area";
import { products } from "@/data/products";
import { fetchProjects, mergeProject, canonicalProjectSlug } from "@/lib/cms-api";
import { versionedImage } from "@/lib/image-version";
import { fetchMergedProjectImagesFresh } from "@/lib/merged-project-images";
import type { MergedProjectImagesResponse } from "@/types/project-images";

/**
 * /projects/:slug. Individual project detail page.
 *
 * K&M has ZERO of these. Their gallery is image-only tabs with no project
 * detail (audit §3.3). Going deep here is the single highest-leverage move
 * on the project side. Page gracefully renders only fields present in the
 * Project data; absent fields are omitted (Vitrocsa-style restraint) rather
 * than shown as placeholders.
 */

const categoryLabel: Record<string, string> = {
  casement: "Casement Systems",
  sliding: "Sliding Systems",
  specialist: "Specialist Systems",
  interior: "Interior install",
  exterior: "Full home package",
  doors: "Door Systems",
};

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project[]>(fallbackProject);
  // The CMS response must not decide "not found" before it has arrived. The
  // page used to redirect on the very first render, which made any project
  // that exists ONLY in the CMS unreachable by direct URL or refresh.
  const [cmsSettled, setCmsSettled] = useState(false);
  // projectRatios from the merged API — same endpoint as Inspiration.tsx.
  // Defaults to empty so the hero falls back to 16:9 while the request is in flight.
  const [projectRatios, setProjectRatios] = useState<MergedProjectImagesResponse["projectRatios"]>({});
  // Admin-set display names from the merged API. Empty until the fetch settles, so
  // the static/CMS name renders first and is replaced only when a rename exists.
  const [projectNames, setProjectNames] = useState<MergedProjectImagesResponse["projectNames"]>({});
  // Hidden/deleted state from the merged API. Used to filter gallery images and
  // exclude hidden/deleted projects from the "Adjacent projects" section.
  const [hiddenImages, setHiddenImages] = useState<MergedProjectImagesResponse["hiddenImages"]>({});
  const [hiddenProjectIds, setHiddenProjectIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    fetchProjects()
      // Merge over the verified fallback rather than replacing it: a CMS
      // response that omits a project (or blanks a field) must not delete
      // what we already know. Replacing is what made San Lorenzo vanish.
      .then((row) => { if (active) setProject(mergeProject(fallbackProject, row)); })
      .catch(() => { /* keep fallback */ })
      .finally(() => { if (active) setCmsSettled(true); });
    return () => { active = false; };
  }, []);

  // Admin-set cover image path for this project. When set, it becomes the first
  // (hero) photo in the gallery. Falls back to the project's baseline hero.
  const [projectCoverImages, setProjectCoverImages] = useState<MergedProjectImagesResponse["projectCoverImages"]>({});

  // Authoritative gallery image lists keyed by projectId.
  // When present, this is the single source of truth for the gallery — it
  // reflects admin image_order, hidden, and replaced state exactly.
  const [projectGalleryImages, setProjectGalleryImages] = useState<NonNullable<MergedProjectImagesResponse["projectGalleryImages"]>>({});

  // True while the merged API fetch is in flight.  We hold the gallery render
  // until this settles so we never flash static-derived images before the
  // admin-curated list arrives (live-first idiom, mirrors Inspiration.tsx).
  const [mergedSettled, setMergedSettled] = useState(false);

  // Fetch merged project-images data for per-project ratio, hidden images,
  // hidden/deleted project IDs, cover image overrides, and gallery image lists.
  // Uses fetchMergedProjectImagesFresh (bypasses 60 s module cache + HTTP cache)
  // so a stale SWR copy cannot serve stale admin state.
  useEffect(() => {
    let active = true;
    fetchMergedProjectImagesFresh()
      .then((data) => {
        if (!active) return;
        setProjectRatios(data.projectRatios ?? {});
        setProjectNames(data.projectNames ?? {});
        setHiddenImages(data.hiddenImages ?? {});
        setHiddenProjectIds(
          new Set([...(data.hiddenProjects ?? []), ...(data.deletedProjects ?? [])])
        );
        setProjectCoverImages(data.projectCoverImages ?? {});
        setProjectGalleryImages(data.projectGalleryImages ?? {});
      })
      .catch(() => {
        // Fetch failed — fall back to static gallery composition.
        // hiddenImages/projectCoverImages remain empty; static path applies.
        console.warn("[ProjectDetail] /api/project-images/merged fetch failed — using static gallery fallback");
      })
      .finally(() => {
        if (active) setMergedSettled(true);
      });
    return () => { active = false; };
  }, []);

  // The published URL uses the British spelling; the CMS row uses the
  // American one. Canonicalize so both reach the same project.
  const canonicalSlug = slug ? canonicalProjectSlug(slug) : undefined;
  const selectedProject = project.find((p) => p.id === canonicalSlug);

  const otherProjects = useMemo(
    () =>
      project
        .filter((p) => p.id !== canonicalSlug && !hiddenProjectIds.has(p.id))
        .slice(0, 3),
    [canonicalSlug, project, hiddenProjectIds]
  );

  // Map systemsUsed slugs to product entries for cross-links
  const linkedProducts = useMemo(
    () =>
      (selectedProject?.systemsUsed ?? [])
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as (typeof products[number])[],
    [selectedProject]
  );

  // Only the settled CMS response may declare a slug missing. Redirecting
  // while the request is still in flight is what made a CMS-only project
  // unreachable by direct URL. A slug already in the verified fallback still
  // renders on the first paint, so this costs no perceived latency.
  if (!selectedProject) {
    if (!cmsSettled) {
      return (
        <Layout>
          <section className="min-h-[calc(var(--fq-lvh)*0.6)]" aria-busy="true" aria-label="Loading project" />
        </Layout>
      );
    }
    return <Navigate to="/inspiration" replace />;
  }

  // Build a Set of hidden image paths for the current project so we can
  // filter them out of the static gallery fallback without a per-image linear scan.
  // Paths in hiddenImages already carry a leading slash (e.g. /images/projects-fb/…)
  // which matches the paths stored in projects.ts, so no normalization is needed.
  const projectHiddenSet = new Set(hiddenImages[selectedProject.id] ?? []);

  // Admin rename wins over the static/CMS name for the title and every alt string.
  const displayName = projectNames?.[selectedProject.id] ?? selectedProject.name;

  // --- Gallery source of truth ---
  //
  // Live-first: if the merged API has resolved and returned a gallery list for
  // this project, use it directly — it already reflects admin image_order, hidden,
  // and replaced state.  If the API has not yet settled, show a skeleton (no
  // flash of stale static images).  On API failure, fall back to the static
  // composition (selectedProject.image + gallery), filtering hidden images.
  //
  // Static fallback path (API failure only):
  //   - Build the list from selectedProject.image + selectedProject.gallery.
  //   - Filter paths present in hiddenImages.
  //   - If an admin cover override arrived despite the gallery list not arriving
  //     (edge case: shouldn't happen because both come from the same endpoint),
  //     inject it first.

  // Show skeleton while the merged API is in flight so we never paint the
  // static gallery before the admin-curated list is available.
  if (!mergedSettled) {
    return (
      <Layout>
        <section className="min-h-[60vh]" aria-busy="true" aria-label="Loading project gallery" />
      </Layout>
    );
  }

  // Authoritative live gallery from API (when available for this project).
  const liveGalleryPaths: string[] | null = projectGalleryImages[selectedProject.id] ?? null;

  let visibleGalleryPhotos: Array<{ src: string; alt: string }>;

  if (liveGalleryPaths) {
    // Happy path: use the server-computed list directly.
    // alt text: first image is the project name; subsequent images are numbered.
    visibleGalleryPhotos = liveGalleryPaths.map((src, i) => ({
      src,
      alt: i === 0 ? displayName : `${displayName} detail ${i}`,
    }));
  } else {
    // Static fallback: API responded but this project is not in projectGalleryImages
    // (CMS-only projects or projects not in the finished manifest).
    // Admin cover override and hidden image filtering still apply here.
    const adminCoverPath = (() => {
      const c = projectCoverImages?.[selectedProject.id];
      return c && !projectHiddenSet.has(c) ? c : null;
    })();

    const baseGalleryPhotos: Array<{ src: string; alt: string }> = [
      { src: selectedProject.image, alt: displayName },
      ...(selectedProject.gallery ?? []).map((src, i) => ({
        src,
        alt: `${displayName} detail ${i + 1}`,
      })),
    ].filter((photo) => !projectHiddenSet.has(photo.src));

    visibleGalleryPhotos = adminCoverPath
      ? [
          { src: adminCoverPath, alt: displayName },
          ...baseGalleryPhotos.filter((p) => p.src !== adminCoverPath),
        ]
      : baseGalleryPhotos;
  }

  // Guard: if everything is hidden/empty, keep at least the baseline hero so
  // we never render a blank gallery.
  if (visibleGalleryPhotos.length === 0) {
    visibleGalleryPhotos = [{ src: selectedProject.image, alt: displayName }];
  }

  // versionedImage appends ?v=<hash> to bust stale cached copies after a
  // regeneration deploy. Paths not in the manifest (uploads, external) pass through.
  const galleryPhotos: Array<{ src: string; alt: string }> = visibleGalleryPhotos.map(
    (p) => ({ ...p, src: versionedImage(p.src) })
  );

  // Per-project aspect ratio from the merged API ('16:9' | '4:3') converted to
  // CSS form. Defaults to 4/3 when the API has no entry for this project, which
  // keeps the mobile hero landscape instead of the old portrait h-[68svh].
  const heroRatio = (projectRatios?.[selectedProject.id] ?? "4:3").replace(":", "/");

  return (
    <Layout>
      {/* Full-width immersive hero gallery — outside container-editorial */}
      <ProjectHeroGallery
        photos={galleryPhotos}
        title={displayName}
        ratio={heroRatio}
      />

      {/* Top padding is deliberately tighter than the section-* scale: the gallery
          above recedes on scroll but keeps its bottom edge anchored to its layout
          box, so this padding IS the visible gap to the rule below it. At the full
          section-desktop 120px that gap read as dead space. */}
      <section className="pt-10 md:pt-12 lg:pt-16 pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          {/* Project meta + description */}
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 mb-20 lg:mb-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-5">About this project</p>
              <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
                {selectedProject.description ?? selectedProject.caption}
              </p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <dl className="space-y-6">
                <div>
                  <dt className="eyebrow mb-2">Location</dt>
                  <dd className="text-body text-[color:var(--ink-primary)]">
                    {projectLocationLabel(selectedProject.area, selectedProject.location)}
                  </dd>
                </div>
                {selectedProject.year && (
                  <div className="border-t border-[color:var(--rule-soft)] pt-6">
                    <dt className="eyebrow mb-2">Completed</dt>
                    <dd className="text-body text-[color:var(--ink-primary)]">{selectedProject.year}</dd>
                  </div>
                )}
                {selectedProject.architect && (
                  <div className="border-t border-[color:var(--rule-soft)] pt-6">
                    <dt className="eyebrow mb-2">Architect</dt>
                    <dd className="text-body text-[color:var(--ink-primary)]">{selectedProject.architect}</dd>
                  </div>
                )}
                <div className="border-t border-[color:var(--rule-soft)] pt-6">
                  <dt className="eyebrow mb-2">Category</dt>
                  <dd className="text-body text-[color:var(--ink-primary)]">
                    {categoryLabel[selectedProject.category] ?? selectedProject.category}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Systems used, only if populated */}
          {linkedProducts.length > 0 && (
            <div className="mb-20 lg:mb-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
              <p className="eyebrow mb-3">Systems specified</p>
              <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14">
                What's behind the glass.
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {linkedProducts.map((prod) => (
                  <li key={prod.id}>
                    <Link to={`/products/${prod.category}`} className="group block">
                      <div className="aspect-[4/3] bg-[color:var(--canvas-soft)] overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                        />
                      </div>
                      <p className="mt-4 font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {prod.name}
                      </p>
                      <p className="mt-1 text-body-sm text-[color:var(--ink-secondary)]">
                        {prod.shortDescription}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Owner / architect quote, only if populated */}
          {selectedProject.quote && (
            <div className="mb-20 lg:mb-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
              <blockquote className="max-w-3xl">
                <p className="font-serif text-h3 lg:text-h2 leading-[1.2] tracking-tight text-[color:var(--ink-primary)]">
                  "{selectedProject.quote.text}"
                </p>
                <footer className="mt-8 eyebrow text-[color:var(--ink-muted)]">
                  {selectedProject.quote.attribution}
                </footer>
              </blockquote>
            </div>
          )}

          {/* Closing CTA */}
          <div className="border-t border-[color:var(--rule-soft)] pt-16 lg:pt-20 mb-20 lg:mb-28">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Your project</p>
              <h2 className="font-serif text-h2 lg:text-h1 tracking-tight text-[color:var(--ink-primary)] leading-[1.05] mb-6">
                Talk to us about your home.
              </h2>
              <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] mb-10">
                Bring your floor plan or just your questions. Ninety minutes with a FourlinQ engineer at one of our three showrooms across Metro Manila and Cebu.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">
                <EditorialButton to="/brand#showrooms" variant="primary" size="lg">
                  Visit a Showroom
                </EditorialButton>
                <Link to="/inspiration" className="text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin underline-offset-4 hover:underline">
                  See more projects →
                </Link>
              </div>
            </div>
          </div>

          {/* Adjacent projects */}
          {otherProjects.length > 0 && (
            <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
              <p className="eyebrow mb-3">More from FourlinQ</p>
              <h2 className="font-serif text-h3 lg:text-h2 leading-[1.1] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14">
                Adjacent projects.
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
                {otherProjects.map((other) => {
                  const otherName = projectNames?.[other.id] ?? other.name;
                  return (
                  <li key={other.id}>
                    <Link to={`/projects/${other.id}`} className="group block">
                      <div className="aspect-[4/3] bg-[color:var(--canvas-soft)] overflow-hidden">
                        <img
                          src={versionedImage(other.image)}
                          alt={otherName}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                        />
                      </div>
                      <p className="mt-4 eyebrow">{projectLocationLabel(other.area, other.location)}</p>
                      <p className="mt-2 font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {otherName}
                      </p>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetail;
