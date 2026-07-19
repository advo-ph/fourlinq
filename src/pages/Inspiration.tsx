import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { projects as fallbackProject, type Project } from "@/data/projects";
import { fetchProjects, mergeProject } from "@/lib/cms-api";

const Inspiration = () => {
  const [project, setProject] = useState<Project[]>(fallbackProject);

  useEffect(() => {
    let isActive = true;

    fetchProjects()
      .then((row) => {
        if (isActive) setProject(mergeProject(fallbackProject, row));
      })
      .catch(() => { /* keep fallback */ });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Inspiration"
        title="Published project archive."
        breadcrumbLabel="Inspiration"
        subtitle="Project records compiled from FourlinQ's published archive. Metadata is under verification, so missing system, performance, authorship, and technical information is not inferred."
      />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          <p className="eyebrow mb-12 border-b border-[color:var(--rule-soft)] pb-4">All published projects</p>

          {project.length === 0 ? (
            <p className="text-body text-[color:var(--ink-muted)]">No published project records are available.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
              {project.map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--canvas-soft)]">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-5">
                      <p className="eyebrow mb-3">{p.location}</p>
                      <h3 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {p.name}
                      </h3>
                      {p.caption && (
                        <p className="mt-3 text-body-sm text-[color:var(--ink-secondary)] leading-[1.6] max-w-md">
                          {p.caption}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Inspiration;
