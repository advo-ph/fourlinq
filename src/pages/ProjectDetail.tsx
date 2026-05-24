import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ProjectPhotoSwitcher, { type ProjectPhoto } from "@/components/shared/ProjectPhotoSwitcher";
import EditorialButton from "@/components/primitives/Button";
import { projects as fallbackProjects, type Project } from "@/data/projects";
import { products } from "@/data/products";
import { fetchProjects, type CmsProject } from "@/lib/cms-api";

function fromCms(p: CmsProject): Project {
  return {
    id: p.slug,
    name: p.title,
    location: p.location ?? "",
    image: p.cover_path ?? "",
    gallery: p.gallery_paths,
    category: (p.category ?? "interior") as Project["category"],
    caption: p.caption ?? undefined,
    description: p.description ?? undefined,
    architect: p.architect ?? undefined,
    year: p.project_year ?? undefined,
    systemsUsed: p.systems_used,
    quote: p.quote_text ? { text: p.quote_text, attribution: p.quote_attribution ?? "" } : undefined,
  };
}

/**
 * /projects/:slug — individual project detail page.
 *
 * K&M has ZERO of these — their gallery is image-only tabs with no project
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
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);

  useEffect(() => {
    fetchProjects()
      .then((rows) => setProjects(rows.map(fromCms)))
      .catch(() => { /* keep fallback */ });
  }, []);

  const project = projects.find((p) => p.id === slug);

  const otherProjects = useMemo(
    () => projects.filter((p) => p.id !== slug).slice(0, 3),
    [slug, projects]
  );

  // Map systemsUsed slugs to product entries for cross-links
  const linkedProducts = useMemo(
    () =>
      (project?.systemsUsed ?? [])
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as (typeof products[number])[],
    [project]
  );

  if (!project) return <Navigate to="/inspiration" replace />;

  const galleryPhotos: ProjectPhoto[] = [
    { src: project.image, alt: project.name, caption: project.location },
    ...(project.gallery ?? []).map((src, i) => ({
      src,
      alt: `${project.name} — detail ${i + 1}`,
      caption: project.location,
    })),
  ];

  return (
    <Layout>
      <PageHeader
        eyebrow={categoryLabel[project.category] ?? "Project"}
        title={project.name}
        breadcrumbLabel={project.name}
        subtitle={project.caption ?? project.location}
      />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          {/* Photo gallery — uses the cursor-switching component */}
          <div className="mb-20 lg:mb-28">
            <ProjectPhotoSwitcher photos={galleryPhotos} eyebrow="The project" />
          </div>

          {/* Project meta + description */}
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 mb-20 lg:mb-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-5">About this project</p>
              <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
                {project.description ?? project.caption}
              </p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <dl className="space-y-6">
                <div>
                  <dt className="eyebrow mb-2">Location</dt>
                  <dd className="text-body text-[color:var(--ink-primary)]">{project.location}</dd>
                </div>
                {project.year && (
                  <div className="border-t border-[color:var(--rule-soft)] pt-6">
                    <dt className="eyebrow mb-2">Completed</dt>
                    <dd className="text-body text-[color:var(--ink-primary)]">{project.year}</dd>
                  </div>
                )}
                {project.architect && (
                  <div className="border-t border-[color:var(--rule-soft)] pt-6">
                    <dt className="eyebrow mb-2">Architect</dt>
                    <dd className="text-body text-[color:var(--ink-primary)]">{project.architect}</dd>
                  </div>
                )}
                <div className="border-t border-[color:var(--rule-soft)] pt-6">
                  <dt className="eyebrow mb-2">Category</dt>
                  <dd className="text-body text-[color:var(--ink-primary)]">
                    {categoryLabel[project.category] ?? project.category}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Systems used — only if populated */}
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

          {/* Owner / architect quote — only if populated */}
          {project.quote && (
            <div className="mb-20 lg:mb-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
              <blockquote className="max-w-3xl">
                <p className="font-serif text-h3 lg:text-h2 leading-[1.2] tracking-tight text-[color:var(--ink-primary)]">
                  "{project.quote.text}"
                </p>
                <footer className="mt-8 eyebrow text-[color:var(--ink-muted)]">
                  — {project.quote.attribution}
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
                Bring your floor plan or just your questions. Ninety minutes with a FourlinQ engineer at one of our four showrooms across Metro Manila and Cebu.
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
                {otherProjects.map((other) => (
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
