import { useRef, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { PROJECT_REEL } from "@/data/project-reels";

function ReelCard({ reel }: { reel: (typeof PROJECT_REEL)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const tryPlay = () => {
      if (reducedMotion.matches || userPausedRef.current) return;
      video.play().catch(() => setPlaying(false));
    };

    const handleCanPlay = () => tryPlay();
    const handleMotionChange = () => {
      if (reducedMotion.matches) video.pause();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.readyState >= 2) {
            tryPlay();
          } else {
            video.load();
            video.addEventListener("canplay", handleCanPlay, { once: true });
          }
        } else {
          video.removeEventListener("canplay", handleCanPlay);
          video.pause();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    reducedMotion.addEventListener("change", handleMotionChange);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionChange);
      video.removeEventListener("canplay", handleCanPlay);
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => setPlaying(false));
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <div className="relative aspect-[5/4] overflow-hidden bg-black/30 rounded-none">
      <video
        ref={videoRef}
        src={reel.videoSrc}
        poster={reel.posterSrc}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="FourlinQ project reel"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 p-5 lg:p-6">
        <p className="font-serif text-h5 lg:text-h4 text-white tracking-tight">Project reel</p>
        <button
          type="button"
          onClick={togglePlayback}
          aria-pressed={playing}
          aria-label={playing ? "Pause project reel" : "Play project reel"}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 border border-white/50 bg-black/35 px-4 text-body-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}

const ProjectReels = () => {
  return (
    <Section tone="dark" size="lg" contained={false} className="!bg-black" noAnimation>
      <div className="px-4 md:px-6 lg:px-8">
        <div className="container-editorial mb-12 lg:mb-16">
          <EyebrowHeading eyebrow="Our projects" level={2} toneInverse>
            Project footage.
          </EyebrowHeading>
        </div>

        <div>
          <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-8">
            {PROJECT_REEL.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>

          <div className="md:hidden -mx-4 overflow-x-auto no-scrollbar">
            <ul className="flex gap-4 px-4">
              {PROJECT_REEL.map((reel) => (
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
