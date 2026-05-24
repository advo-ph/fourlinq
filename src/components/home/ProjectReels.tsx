import { useRef, useEffect, useCallback } from "react";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { PROJECT_REELS } from "@/data/project-reels";

const ProjectReels = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const setVideoRef = useCallback((index: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const syncPlay = () => {
      const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
      videos.forEach((v) => { v.currentTime = 0; });
      videos.forEach((v) => { v.play().catch(() => {}); });
    };

    const syncPause = () => {
      const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
      videos.forEach((v) => { v.pause(); });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) syncPlay();
        else syncPause();
      },
      { threshold: 0.3 },
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <Section tone="dark" size="lg" contained={false} className="!bg-black">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="container-editorial mb-12 lg:mb-16">
          <EyebrowHeading eyebrow="Our projects" level={2} toneInverse>
            See Fourlin<span className="text-brand">Q</span> in the real world.
          </EyebrowHeading>
        </div>

        <div ref={gridRef}>
          {/* Desktop: 3-col grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-8">
            {PROJECT_REELS.map((reel, i) => (
              <div key={reel.id} className="relative aspect-[5/4] overflow-hidden bg-black/30 rounded-sm">
                <video
                  ref={setVideoRef(i)}
                  src={reel.videoSrc}
                  poster={reel.posterSrc}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-5 lg:p-6">
                  <p className="font-serif text-h5 lg:text-h4 text-white tracking-tight">
                    {reel.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: horizontal scroll strip */}
          <div className="md:hidden -mx-4 overflow-x-auto no-scrollbar">
            <ul className="flex gap-4 px-4">
              {PROJECT_REELS.map((reel, i) => (
                <li key={reel.id} className="shrink-0 w-[78vw]">
                  <div className="relative aspect-[5/4] overflow-hidden bg-black/30 rounded-sm">
                    <video
                      ref={setVideoRef(i)}
                      src={reel.videoSrc}
                      poster={reel.posterSrc}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 p-5 lg:p-6">
                      <p className="font-serif text-h5 lg:text-h4 text-white tracking-tight">
                        {reel.location}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ProjectReels;
