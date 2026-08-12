// Hover "opening" animations for system cards.
//
// Each animated system has a sequence of WebP frames (closed → open) extracted
// from its product video and stored under public/systems/anim/<id>/NN.webp.
// On card hover the frames play forward once; on un-hover they play in reverse
// back to the closed state. See SystemCardMedia.tsx for the player.
//
// Systems WITHOUT a video are intentionally absent here. Their cards stay
// fully static (nothing happens on hover).

const FRAME_COUNT = 28;
const BASE = "/systems/anim";

/**
 * product id (slug) → number of frames available
 *
 * Count is per-system on purpose. The first ten were all cut to 28; the two
 * 2026-08-12 additions keep whatever their source video actually had (30 and
 * 25 at 30fps) rather than being resampled to match, which would have dropped
 * two frames from one and duplicated three in the other for no visible gain.
 * Playback duration is fixed in SystemCardMedia, so a different count plays at
 * the same speed — it does not need to be uniform.
 */
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
  "automated-door": 30,
  "slim-door": 25,
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
