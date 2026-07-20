import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFramePreloader } from "@/hooks/useFramePreloader";

const TILE_FRAMES = 53;
/** ~35ms per frame → full open/close sweep in ~0.9s, matching the tiles' feel. */
const FRAME_INTERVAL_MS = 16;

/**
 * Mega-menu tile that plays the window/door opening frame sequence forward on
 * hover and back on unhover — the same 53-frame sequences the homepage tiles
 * scrub by scroll, driven by pointer intent here. Frames preload only once
 * the panel that contains the tile has opened (`active`).
 */
interface NavFrameTileProps {
  label: string;
  description?: string;
  to: string;
  framePath: string;
  /** True when the parent panel is open — gates frame preloading. */
  active: boolean;
  onNavigate?: () => void;
}

const NavFrameTile = ({ label, description, to, framePath, active, onNavigate }: NavFrameTileProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);

  const { images, isLoaded } = useFramePreloader(TILE_FRAMES, framePath, {
    enabled: active,
    padLength: 4,
  });

  const draw = useCallback(
    (f: number) => {
      const cvs = canvasRef.current;
      const ctx = cvs?.getContext("2d");
      const img = images[f];
      if (!cvs || !ctx || !img?.naturalWidth) return;
      if (cvs.width !== img.naturalWidth || cvs.height !== img.naturalHeight) {
        cvs.width = img.naturalWidth;
        cvs.height = img.naturalHeight;
      }
      ctx.drawImage(img, 0, 0);
    },
    [images],
  );

  useEffect(() => {
    if (isLoaded) draw(frameRef.current);
  }, [isLoaded, draw]);

  // Step the current frame toward the target (end on hover, start on unhover).
  const animate = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      if (now - lastTickRef.current >= FRAME_INTERVAL_MS) {
        lastTickRef.current = now;
        const current = frameRef.current;
        const target = targetRef.current;
        if (current !== target) {
          frameRef.current = current + Math.sign(target - current);
          draw(frameRef.current);
        }
      }
      if (frameRef.current !== targetRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [draw]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const play = () => { targetRef.current = TILE_FRAMES - 1; animate(); };
  const rewind = () => { targetRef.current = 0; animate(); };

  return (
    <Link
      to={to}
      onClick={onNavigate}
      onMouseEnter={play}
      onMouseLeave={rewind}
      onFocus={play}
      onBlur={rewind}
      className="group block"
    >
      <div className="relative aspect-video overflow-hidden bg-[color:var(--canvas-soft)]">
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <p className="text-[17px] font-medium text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
          {label}
        </p>
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
        />
      </div>
      {description && (
        <p className="mt-1.5 text-body-sm text-[color:var(--ink-muted)] leading-snug">
          {description}
        </p>
      )}
    </Link>
  );
};

export default NavFrameTile;
