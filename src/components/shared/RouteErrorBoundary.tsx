import { Component, type ErrorInfo, type ReactNode } from "react";

// Shared sessionStorage key and cooldown — must match the guard in main.tsx.
const CHUNK_RELOAD_KEY = "chunk-reload-at";
const CHUNK_RELOAD_COOLDOWN_MS = 10_000; // 10 s

/**
 * Returns true when the error looks like a Vite/webpack chunk-load failure
 * (dynamic import 404 after a deploy).
 */
function isChunkLoadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /failed to fetch dynamically imported module|importing a module script failed|ChunkLoadError|css chunk/i.test(
    err.message
  );
}

/**
 * Returns true when it is safe to auto-reload (no reload in the last
 * CHUNK_RELOAD_COOLDOWN_MS ms). Also records the reload timestamp.
 */
function shouldAutoReload(): boolean {
  const lastAt = parseInt(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? "0", 10);
  const now = Date.now();
  if (!lastAt || now - lastAt > CHUNK_RELOAD_COOLDOWN_MS) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
    return true;
  }
  return false;
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

/**
 * RouteErrorBoundary wraps the router's <Suspense> so any chunk-load failure
 * from a lazy route auto-reloads ONCE (with a cooldown guard). Any other error
 * renders a minimal "Something went wrong" fallback — never a white screen.
 */
class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(err: unknown): State {
    const chunkError = isChunkLoadError(err);

    // If it's a chunk error and we haven't auto-reloaded recently, trigger it.
    // getDerivedStateFromError must be pure (no side effects), so we record the
    // intent here and handle the actual reload in componentDidCatch.
    return { hasError: true, isChunkError: chunkError };
  }

  componentDidCatch(err: unknown, info: ErrorInfo) {
    if (this.state.isChunkError && shouldAutoReload()) {
      console.info(
        "[RouteErrorBoundary] Chunk-load failure detected — reloading once.",
        err,
        info
      );
      window.location.reload();
    } else {
      console.error("[RouteErrorBoundary] Caught error:", err, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            minHeight: "100svh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              color: "var(--ink-secondary, #6b7280)",
              maxWidth: "24rem",
            }}
          >
            Something went wrong. Please reload the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "1px solid var(--rule-strong, #e5e7eb)",
              borderRadius: "0.25rem",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
