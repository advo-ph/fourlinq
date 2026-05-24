import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import ScrollReveal from "@/components/primitives/ScrollReveal";
import { projects } from "@/data/projects";

// ── Intro frame config ────────────────────────────────────────
const INTRO_FRAMES = 53;
const INTRO_PATH = "/images/reels-intro/frame-{index}.jpg";
const INTRO_DURATION = 700;

type Phase = "idle" | "playing" | "done";

// ── Project card ──────────────────────────────────────────────

const categoryLabel: Record<string, string> = {
  casement: "Casement + Sliding",
  sliding: "Sliding",
  specialist: "Special shapes",
  interior: "Casement + Fixed",
  exterior: "Casement + Sliding",
  doors: "Slide & Fold",
};

const ProjectCard = ({
  project,
  aspect = "aspect-[4/3]",
  fillHeight = false,
}: {
  project: (typeof projects)[number];
  aspect?: string;
  fillHeight?: boolean;
}) => (
  <Link
    to={`/projects/${project.id}`}
    className={`group block ${fillHeight ? "flex flex-col h-full" : ""}`}
  >
    <ScrollReveal className={fillHeight ? "flex-1 min-h-0" : ""}>
      <div
        className={`relative overflow-hidden bg-neutral-100 ${fillHeight ? "h-full" : aspect}`}
      >
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03] ${fillHeight ? "absolute inset-0" : ""}`}
        />
      </div>
    </ScrollReveal>
    <div className="mt-4">
      <p className="eyebrow text-[color:var(--ink-muted)] mb-2">
        {categoryLabel[project.category] ?? "Project"}
      </p>
      <p className="font-serif text-h6 lg:text-h5 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
        {project.location}
      </p>
    </div>
  </Link>
);

// ── InspirationStrip ──────────────────────────────────────────

const InspirationStrip = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>("idle");
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const preventRef = useRef<((e: Event) => void) | null>(null);
  const snappingRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [frame, setFrame] = useState(0);
  const [near, setNear] = useState(false);

  const { images, progress, isLoaded } = useFramePreloader(
    INTRO_FRAMES,
    INTRO_PATH,
    { enabled: near, padLength: 3 },
  );

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  // ── Scroll lock (belt-and-suspenders) ─────────────────────
  const lock = useCallback(() => {
    if (preventRef.current) return;
    const scrollbarW =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarW}px`;
    const h = (e: Event) => e.preventDefault();
    preventRef.current = h;
    window.addEventListener("wheel", h, { passive: false });
    window.addEventListener("touchmove", h, { passive: false });
  }, []);

  const unlock = useCallback(() => {
    document.documentElement.style.overflow = "";
    document.body.style.paddingRight = "";
    const h = preventRef.current;
    if (!h) return;
    window.removeEventListener("wheel", h);
    window.removeEventListener("touchmove", h);
    preventRef.current = null;
  }, []);

  useEffect(
    () => () => {
      unlock();
      cancelAnimationFrame(rafRef.current);
    },
    [unlock],
  );

  // ── Snap section to viewport top, then play ───────────────
  const snapAndPlay = useCallback(() => {
    const el = sectionRef.current;
    if (!el || snappingRef.current || phaseRef.current !== "idle") return;
    snappingRef.current = true;
    lock();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const t0 = performance.now();
    const check = () => {
      const rect = el.getBoundingClientRect();
      if (Math.abs(rect.top) < 10 || performance.now() - t0 > 1000) {
        snappingRef.current = false;
        go("playing");
      } else {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);
  }, [lock, go]);

  // ── Preload trigger ───────────────────────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          obs.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Forward trigger ───────────────────────────────────────
  // Fires when the section top enters the upper half of the viewport.
  // Also acts as a can't-skip-past guard: if the section scrolled
  // above the viewport while still idle, it drags the user back.
  useEffect(() => {
    if (!isLoaded || phaseRef.current !== "idle") return;

    const onScroll = () => {
      if (phaseRef.current !== "idle" || snappingRef.current) return;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top < vh * 0.5 && rect.top > -vh * 2) {
        snapAndPlay();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLoaded, snapAndPlay]);

  // ── Frame animation with position correction ──────────────
  useEffect(() => {
    if (phase !== "playing") return;

    const msPerFrame = INTRO_DURATION / INTRO_FRAMES;
    let t0 = 0;

    const run = (ts: number) => {
      // Keep section pinned to viewport top during animation
      const el = sectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (Math.abs(rect.top) > 3) {
          window.scrollTo(window.scrollX, window.scrollY + rect.top);
        }
      }

      if (!t0) t0 = ts;
      const f = Math.min(
        INTRO_FRAMES - 1,
        Math.floor((ts - t0) / msPerFrame),
      );

      if (f >= INTRO_FRAMES - 1) {
        frameRef.current = INTRO_FRAMES - 1;
        setFrame(INTRO_FRAMES - 1);
        go("done");
        unlock();
        return;
      }

      frameRef.current = f;
      setFrame(f);
      rafRef.current = requestAnimationFrame(run);
    };

    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, unlock, go]);

  // ── Canvas draw ───────────────────────────────────────────
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || !isLoaded) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const img = images[frame];
    if (!img?.naturalWidth) return;
    if (
      cvs.width !== img.naturalWidth ||
      cvs.height !== img.naturalHeight
    ) {
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
    }
    ctx.drawImage(img, 0, 0);
  }, [frame, images, isLoaded]);

  // ── Render ────────────────────────────────────────────────
  const showCanvas = phase !== "done";
  const showContent = phase === "done";
  const [feature, second, third, ...rest] = projects;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-[color:var(--canvas)]"
    >
      {/* Loading */}
      {!isLoaded && near && (
        <div className="absolute inset-x-0 top-0 h-screen z-30 flex items-center justify-center bg-[color:var(--canvas)]">
          <div className="text-center">
            <div className="w-48 h-[2px] bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-400 transition-[width] duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mt-4 eyebrow text-[color:var(--ink-faint)]">
              Loading
            </p>
          </div>
        </div>
      )}

      {/* Intro frame canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-x-0 top-0 h-screen w-full object-cover transition-opacity duration-500 z-10",
          showCanvas
            ? "opacity-100"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* Project content */}
      <div
        className={cn(
          "z-20 bg-[color:var(--canvas)]",
          "py-section-mobile md:py-section-tablet lg:py-section-desktop",
          "transition-[opacity,transform] duration-700 ease-out",
          showContent
            ? "relative opacity-100 scale-100"
            : "absolute inset-x-0 top-0 opacity-0 scale-[0.92] pointer-events-none",
        )}
      >
        <div className="container-editorial">
          <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
            <EyebrowHeading eyebrow="Our Projects" level={2}>
              Installed across the Philippines.
            </EyebrowHeading>
            <FeatureLink to="/inspiration">View full gallery</FeatureLink>
          </div>

          {/* Mobile */}
          <div className="lg:hidden -mx-5 overflow-x-auto no-scrollbar">
            <ul className="flex gap-4 px-5">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="shrink-0 w-[78vw] sm:w-[58vw] md:w-[42vw]"
                >
                  <ProjectCard project={p} aspect="aspect-[4/3]" />
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-x-6 gap-y-12">
            <div className="lg:col-span-8">
              <ProjectCard project={feature} aspect="aspect-[16/10]" />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <ProjectCard project={second} fillHeight />
            </div>
            <div className="lg:col-span-4">
              <ProjectCard project={third} aspect="aspect-[4/3]" />
            </div>
            {rest.slice(0, 2).map((p) => (
              <div key={p.id} className="lg:col-span-4">
                <ProjectCard project={p} aspect="aspect-[4/3]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InspirationStrip;
