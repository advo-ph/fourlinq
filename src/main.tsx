import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initStableViewport } from "./lib/stable-viewport";

// Pin --fq-svh/--fq-lvh to px on touch devices before first paint — keeps
// hero/section heights from reflowing when mobile browser chrome collapses.
initStableViewport();

// Guard against chunk-load failures after a new deploy. Vite fires this event
// when a dynamically-imported module (lazy route chunk) 404s because the old
// hashed filename is gone. Auto-reload ONCE so the browser fetches the fresh
// index.html and gets the correct chunk URLs. A sessionStorage flag prevents
// an infinite reload loop when the failure is persistent.
const CHUNK_RELOAD_KEY = "chunk-reload-at";
const CHUNK_RELOAD_COOLDOWN_MS = 10_000; // 10 s

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault?.();

  const lastAt = parseInt(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? "0", 10);
  const now = Date.now();

  if (!lastAt || now - lastAt > CHUNK_RELOAD_COOLDOWN_MS) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
    window.location.reload();
  }
  // If within cooldown, do nothing — RouteErrorBoundary will render the fallback UI.
});

createRoot(document.getElementById("root")!).render(<App />);
