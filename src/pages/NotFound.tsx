import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import EditorialButton from "@/components/primitives/Button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center">
        <div className="container-editorial">
          <p className="eyebrow mb-5">
            404. Page not found
          </p>
          <h1 className="font-serif font-normal tracking-tight text-[color:var(--ink-primary)] text-h1 lg:text-display leading-[1.04] max-w-[18ch]">
            This page is somewhere else.
          </h1>
          <p className="mt-7 lg:mt-9 text-body-lg lg:text-lead text-[color:var(--ink-secondary)] max-w-[36rem] leading-[1.55]">
            The address you tried doesn't match any page on the site. Head back to the start or explore the catalog.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <EditorialButton to="/" variant="primary" size="md">Return home</EditorialButton>
            <EditorialButton to="/products" variant="ghost" size="md">Browse systems →</EditorialButton>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
