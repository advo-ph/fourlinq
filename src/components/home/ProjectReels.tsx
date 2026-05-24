import { useRef, useEffect } from "react";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { PROJECT_REELS } from "@/data/project-reels";

function ReelCard({ reel }: { reel: (typeof PROJECT_REELS)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.readyState >= 2) {
            tryPlay();
          } else {
            video.load();
            video.addEventListener("canplay", tryPlay, { once: true });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative aspect-[5/4] overflow-hidden bg-black/30 rounded-none">
      <video
        ref={videoRef}
        src={reel.videoSrc}
        poster={reel.posterSrc}
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 p-5 lg:p-6">
        <p className="font-serif text-h5 lg:text-h4 text-white tracking-tight">
          {reel.location}
        </p>
      </div>
    </div>
  );
}

const ProjectReels = () => {
  return (
    <Section tone="dark" size="lg" contained={false} className="!bg-black">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="container-editorial mb-12 lg:mb-16">
          <EyebrowHeading eyebrow="Our projects" level={2} toneInverse>
            See Fourlin<span className="text-brand-500">Q</span> in the real world.
          </EyebrowHeading>
        </div>

        <div>
          <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-8">
            {PROJECT_REELS.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>

          <div className="md:hidden -mx-4 overflow-x-auto no-scrollbar">
            <ul className="flex gap-4 px-4">
              {PROJECT_REELS.map((reel) => (
                <li key={reel.id} className="shrink-0 w-[78vw]">
                  <ReelCard reel={reel} />
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
