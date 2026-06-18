// Hover "opening" animations for system cards.
//
// Each animated system has a sequence of WebP frames (closed → open) extracted
// from its product video and stored under public/systems/anim/<id>/NN.webp.
// On card hover the frames play forward once; on un-hover they play in reverse
// back to the closed state. See SystemCardMedia.tsx for the player.
//
// Systems WITHOUT a video are intentionally absent here — their cards stay
// fully static (nothing happens on hover).

const FRAME_COUNT = 28;
const BASE = "/systems/anim";

/** product id (slug) → number of frames available */
const ANIMATED: Record<string, number> = {
  casement: FRAME_COUNT,
  sliding: FRAME_COUNT,
  awning: FRAME_COUNT,
  "sliding-door": FRAME_COUNT,
  "slide-and-fold": FRAME_COUNT,
  "casement-door": FRAME_COUNT,
  "french-door": FRAME_COUNT,
  "large-panel-doors": FRAME_COUNT,
  "lift-and-slide": FRAME_COUNT,
  "90-series": FRAME_COUNT,
};

export interface SystemAnimation {
  /** Ordered closed → open frame URLs. */
  frames: string[];
}

/** Returns the frame sequence for a system, or null if it has no animation. */
export function getSystemAnimation(productId: string): SystemAnimation | null {
  const count = ANIMATED[productId];
  if (!count) return null;
  const frames = Array.from(
    { length: count },
    (_, i) => `${BASE}/${productId}/${String(i + 1).padStart(2, "0")}.webp`,
  );
  return { frames };
}
