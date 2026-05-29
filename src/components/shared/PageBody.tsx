import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import Section from "@/components/primitives/Section";

/**
 * Renders editable markdown content from cms_page.body for a given route.
 *
 * Empty body → renders nothing. The design-locked hero + bespoke layout
 * above this component are untouched. Tita can add prose from
 * /admin → Content → Pages without breaking visuals.
 */

interface PageRow {
  route: string;
  body: string | null;
}

async function fetchPage(route: string): Promise<PageRow | null> {
  const res = await fetch(`/api/cms/pages/${encodeURIComponent(route)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`/api/cms/pages ${res.status}`);
  const payload = (await res.json()) as { item: PageRow };
  return payload.item;
}

interface PageBodyProps {
  route: string;
  tone?: "canvas" | "soft" | "dark";
}

const PageBody = ({ route, tone = "soft" }: PageBodyProps) => {
  const { data } = useQuery({
    queryKey: ["page", route],
    queryFn: () => fetchPage(route),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const body = data?.body?.trim();
  if (!body) return null;

  return (
    <Section tone={tone} size="lg">
      <div className="max-w-[42rem] mx-auto">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h2 className="font-serif font-normal tracking-tight text-h2 text-[color:var(--ink-primary)] leading-[1.1] mt-12 mb-6 first:mt-0">
                {children}
              </h2>
            ),
            h2: ({ children }) => (
              <h2 className="font-serif font-normal tracking-tight text-h3 text-[color:var(--ink-primary)] leading-[1.15] mt-10 mb-5 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-serif font-normal tracking-tight text-h4 text-[color:var(--ink-primary)] leading-[1.2] mt-8 mb-4 first:mt-0">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.7] mb-5">
                {children}
              </p>
            ),
            ul: ({ children }) => <ul className="list-disc pl-5 mb-5 space-y-2 text-body text-[color:var(--ink-secondary)] leading-[1.7]">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-5 space-y-2 text-body text-[color:var(--ink-secondary)] leading-[1.7]">{children}</ol>,
            a: ({ href, children }) => (
              <a href={href} className="text-[color:var(--ink-primary)] underline underline-offset-4 hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className="font-medium text-[color:var(--ink-primary)]">{children}</strong>,
            hr: () => <hr className="border-t border-[color:var(--rule-soft)] my-10" />,
          }}
        >
          {body}
        </ReactMarkdown>
      </div>
    </Section>
  );
};

export default PageBody;
