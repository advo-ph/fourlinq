// Hover animations for system cards.
//
// Each animated system has a sequence of WebP frames stored under
// public/systems/anim/<id>/NN.webp. The baked files are always numbered
// 01 = closed … 28 = open, matching the order `scripts/bake-system-anim.mjs`
// produces. On card hover the player scrubs the frames array forward once;
// on un-hover it scrubs backward. For most systems that means closed → open
// on hover and open → closed on un-hover. For systems whose card still is the
// fully-open pose the array is reversed here in data (see REVERSED below) so
// the resting frame and the still match and the motion reads correctly. See
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

/**
 * Systems whose card still is the fully-open pose rather than the closed one.
 *
 * The baked frames are always numbered 01 = closed → 28 = open on disk, so
 * that a fresh `node scripts/bake-system-anim.mjs` run stays consistent and
 * does not silently un-reverse or double-reverse anything. The reversal lives
 * here in data instead: getSystemAnimation returns the array open → closed for
 * these ids so the player's forward pass (hover) goes from open toward closed
 * and the backward pass (un-hover) returns to the open resting state.
 *
 * automated-window: the supplied card still is frame 28 (sash fully extended,
 * chain actuator visible). Resting on frame 01 (closed) would crossfade into
 * a pose that looks nothing like the still. Resting on frame 28 and closing on
 * hover matches the still exactly and reads correctly for a motorised opener —
 * the interesting motion is the powered sweep, shown departing from its open
 * resting state.
 */
const REVERSED = new Set(["automated-window"]);

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
  "sliding-casement-door": FRAME_COUNT,
  "automated-door": FRAME_COUNT,
};

export interface SystemAnimation {
  /**
   * Frame URLs in playback order — forward on hover, reversed on un-hover.
   * Most systems go closed → open; systems in REVERSED go open → closed.
   */
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
  // Systems in REVERSED rest on the open end: the array is flipped so the
  // player's forward pass goes from open toward closed on hover, and reverses
  // back to the open still on un-hover. The files on disk stay 01–28.
  if (REVERSED.has(productId)) frames.reverse();
  return { frames };
}
