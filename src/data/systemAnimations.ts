// Hover "opening" animations for system cards.
//
// Each animated system has a sequence of WebP frames (closed → open) stored
// under public/systems/anim/<id>/NN.webp. On card hover the frames play forward
// once; on un-hover they play in reverse back to the closed state. See
// SystemCardMedia.tsx for the player.
//
// Every set is now RENDERED, baked from GLBs FourlinQ owns outright by
// `node scripts/bake-system-anim.mjs`. Nothing here is extracted from product
// video any more.
//
// That replaced ten filmed sets whose provenance this repo never recorded — the
// commit that added all 280 frames is titled "f", and `systemAnimations.ts`
// claimed only that they came from "its product video", whose we never knew.
// The rendered set answers that, and two other things the filmed one could not:
// the frames now carry the mechanism the 3D builders actually author — lever
// handles throwing before the leaf moves, cam locks turning a quarter, hinges
// and stay arms and actuator chains — and they are re-runnable, so a profile or
// finish change is one command rather than a reshoot.
//
// Systems still absent are absent on purpose. special-shapes and custom-shapes
// are catch-all categories — any one mechanism claims a geometry the customer
// did not pick — and glass-railing is a fixed balustrade that genuinely does
// not open. Their cards stay static rather than animating a claim.

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
  louvre: FRAME_COUNT,
  "automated-window": FRAME_COUNT,
  "sc-door": FRAME_COUNT,
  "automated-door": FRAME_COUNT,
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
