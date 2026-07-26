/**
 * Pins the `--fq-svh` / `--fq-lvh` CSS vars to pixel values on touch devices.
 *
 * Why: mobile browsers collapse/expand their chrome (URL bar, tab bar) while
 * scrolling, and in-app browsers (FB Messenger, Instagram) collapse a native
 * top + bottom bar by resizing the whole webview. Anything sized with
 * dvh / vh / live innerHeight reflows mid-scroll when that happens, which
 * shifts the scroll position under the user's finger — the "jitter".
 *
 * In real browsers the CSS fallbacks in index.css (svh/lvh) are already
 * stable, so pinning them to the same px is a no-op there. In in-app
 * webviews EVERY viewport unit tracks the resizing webview, so only pinned
 * px values hold still. Layout reads the vars; fixed/overlay UI (chat
 * bubble, navbar) keeps normal viewport-anchored positioning so it still
 * rides above the collapsing bottom bar.
 *
 * Re-measures only on real viewport changes — width change (rotation,
 * split-screen) or a >25% height jump — never on chrome collapse (~6–15%
 * of height) and never while an input is focused (on-screen keyboard).
 */
export function initStableViewport(): void {
  if (typeof window === "undefined") return;
  // Desktop (hover + fine pointer): units are stable and window resizes
  // should keep tracking live — leave the CSS fallbacks in charge.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const root = document.documentElement;
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;

  // Probe the real CSS value so the pinned px exactly matches what the
  // browser would resolve for 100svh / 100lvh right now. Old browsers
  // without svh/lvh keep the 100vh assignment (the invalid one is ignored).
  const measure = (unit: "svh" | "lvh"): number => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none";
    probe.style.height = "100vh";
    probe.style.height = `100${unit}`;
    document.body.appendChild(probe);
    const h = probe.getBoundingClientRect().height;
    probe.remove();
    return h;
  };

  const apply = () => {
    lastW = window.innerWidth;
    lastH = window.innerHeight;
    root.style.setProperty("--fq-svh", `${measure("svh")}px`);
    root.style.setProperty("--fq-lvh", `${measure("lvh")}px`);
  };

  const isTyping = () => {
    const el = document.activeElement;
    return (
      !!el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        (el as HTMLElement).isContentEditable)
    );
  };

  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Width changed → rotation / split-screen. Checked BEFORE the typing
    // guard: a keyboard can never change innerWidth, so this is always a
    // real viewport change — skipping it (rotate while typing) would leave
    // the pins sized for the previous orientation.
    if (w !== lastW) {
      apply();
      return;
    }
    if (isTyping()) return; // on-screen keyboard — not a real viewport change
    if (Math.abs(h - lastH) > lastH * 0.25) apply();
    // else: browser chrome collapsing/expanding — keep the pinned values
  };

  apply();
  window.addEventListener("resize", onResize);
}
