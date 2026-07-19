import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ProjectPhotoSwitcher, { type ProjectPhoto } from "@/components/shared/ProjectPhotoSwitcher";
import EditorialButton from "@/components/primitives/Button";
import { projects as fallbackProject, type Project } from "@/data/projects";
import { products } from "@/data/products";
import { canonicalProjectSlug, fetchProjects, mergeProject } from "@/lib/cms-api";

/**
 * /projects/:slug — individual project detail page.
 *
 * K&M has ZERO of these — their gallery is image-only tabs with no project
 * detail (audit §3.3). Going deep here is the single highest-leverage move
 * on the project side. Page gracefully renders only fields present in the
 * Project data; absent fields are omitted (Vitrocsa-style restraint) rather
 * than shown as placeholders.
 */

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project[]>(fallbackProject);
  const [loadState, setLoadState] = useState<"loading" | "settled">("loading");

  useEffect(() => {
    let isActive = true;

    fetchProjects()
      .then((row) => {
        if (isActive) setProject(mergeProject(fallbackProject, row));
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => {
        if (isActive) setLoadState("settled");
      });

    return () => {
      isActive = false;
    };
  }, []);

  const requestedSlug = canonicalProjectSlug(slug ?? "");
  const selectedProject = project.find((entry) => entry.id === requestedSlug);

  const otherProject = useMemo(
    () => project.filter((entry) => entry.id !== requestedSlug).slice(0, 3),
    [project, requestedSlug]
  );

  // Map systemsUsed slugs to product entries for cross-links
  const linkedProduct = useMemo(
    () =>
      (selectedProject?.systemsUsed ?? [])
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as (typeof products[number])[],
    [selectedProject]
  );

  if (slug && requestedSlug !== slug) {
    return <Navigate to={`/projects/${requestedSlug}`} replace />;
  }

  if (!selectedProject && loadState === "loading") {
    return (
      <Layout>
        <section className="container-editorial py-section-mobile md:py-section-tablet" role="status" aria-live="polite">
          <p className="text-body text-[color:var(--ink-muted)]">Loading project…</p>
        </section>
      </Layout>
    );
  }

  if (!selectedProject) return <Navigate to="/inspiration" replace />;

  const galleryPhoto: ProjectPhoto[] = [
    { src: selectedProject.image, alt: selectedProject.name, caption: selectedProject.location },
    ...(selectedProject.gallery ?? []).map((src) => ({
      src,
      alt: `Additional image from the ${selectedProject.name} project record`,
      caption: selectedProject.location,
    })),
  ].filter((photo, index, photoList) =>
    Boolean(photo.src) && photoList.findIndex((entry) => entry.src === photo.src) === index
  );

  return (
    <Layout>
      <PageHeader
        eyebrow="Published project"
        title={selectedProject.name}
        breadcrumbLabel={selectedProject.name}
        subtitle={selectedProject.caption ?? selectedProject.location}
      />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          <p className="mb-12 max-w-3xl border-l-2 border-[color:var(--accent)] pl-5 text-body-sm leading-[1.65] text-[color:var(--ink-secondary)]">
            This project record was compiled from FourlinQ's published archive, and its metadata is still under verification. Where the source does not identify the exact system, performance evidence, architect, completion date, or client attribution, this page leaves that detail unconfirmed.
          </p>
          {/* Photo gallery — uses the cursor-switching component */}
          <div className="mb-20 lg:mb-28">
            <ProjectPhotoSwitcher photos={galleryPhoto} eyebrow="The project" />
          </div>

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
                  <dd className="text-body text-[color:var(--ink-primary)]">{selectedProject.location}</dd>
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
              </dl>
            </div>
          </div>

          {/* Systems used — only if populated */}
          {linkedProduct.length > 0 && (
            <div className="mb-20 lg:mb-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
              <p className="eyebrow mb-3">Systems listed in this record</p>
              <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14">
                Linked product references.
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {linkedProduct.map((prod) => (
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

          {/* Owner / architect quote — only if populated */}
          {selectedProject.quote && (
            <div className="mb-20 lg:mb-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
              <blockquote className="max-w-3xl">
                <p className="font-serif text-h3 lg:text-h2 leading-[1.2] tracking-tight text-[color:var(--ink-primary)]">
                  "{selectedProject.quote.text}"
                </p>
                <footer className="mt-8 eyebrow text-[color:var(--ink-muted)]">
                  — {selectedProject.quote.attribution}
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
                Bring your floor plan or project questions. Contact FourlinQ first to confirm the relevant sample, location access, meeting format, and appointment time.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">
                <EditorialButton to="/brand#showrooms" variant="primary" size="lg">
                  View locations
                </EditorialButton>
                <Link to="/inspiration" className="text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin underline-offset-4 hover:underline">
                  See more projects →
                </Link>
              </div>
            </div>
          </div>

          {/* More projects */}
          {otherProject.length > 0 && (
            <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
              <p className="eyebrow mb-3">More from FourlinQ</p>
              <h2 className="font-serif text-h3 lg:text-h2 leading-[1.1] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14">
                More projects.
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
                {otherProject.map((other) => (
                  <li key={other.id}>
                    <Link to={`/projects/${other.id}`} className="group block">
                      <div className="aspect-[4/3] bg-[color:var(--canvas-soft)] overflow-hidden">
                        <img
                          src={other.image}
                          alt={other.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                        />
                      </div>
                      <p className="mt-4 eyebrow">{other.location}</p>
                      <p className="mt-2 font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {other.name}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetail;
