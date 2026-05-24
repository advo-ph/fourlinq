import { useRef, useState, useEffect, useCallback } from "react";

interface UseFramePreloaderOptions {
  enabled?: boolean;
  batchSize?: number;
  padLength?: number;
  /** Fraction of frames that must load before isLoaded flips true. Default 0.3
   *  (show animation as soon as 30% buffered; remaining frames stream in). */
  readyAtFraction?: number;
}

interface UseFramePreloaderReturn {
  images: HTMLImageElement[];
  progress: number;
  isLoaded: boolean;
}

export function useFramePreloader(
  totalFrames: number,
  pathTemplate: string,
  options: UseFramePreloaderOptions = {},
): UseFramePreloaderReturn {
  const { enabled = true, batchSize = 50, padLength = 4, readyAtFraction = 0.03 } = options;
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadingRef = useRef(false);

  const buildPath = useCallback(
    (index: number) =>
      pathTemplate.replace("{index}", String(index + 1).padStart(padLength, "0")),
    [pathTemplate, padLength],
  );

  useEffect(() => {
    if (!enabled || loadingRef.current || isLoaded) return;
    loadingRef.current = true;

    const images: HTMLImageElement[] = new Array(totalFrames);
    imagesRef.current = images;
    let loaded = 0;
    const readyThreshold = Math.max(1, Math.floor(totalFrames * readyAtFraction));
    let readyFlipped = false;

    const flipReadyIfNeeded = () => {
      if (!readyFlipped && loaded >= readyThreshold) {
        readyFlipped = true;
        setIsLoaded(true);
      }
    };

    // Hard timeout — never let LOADING persist longer than 4 seconds, even if
    // the network is misbehaving. Canvas will fall back to nearest loaded frame.
    const hardTimeout = setTimeout(() => {
      if (!readyFlipped) {
        readyFlipped = true;
        setIsLoaded(true);
      }
    }, 4000);

    const loadBatch = async (startIdx: number) => {
      const end = Math.min(startIdx + batchSize, totalFrames);
      const batch: Promise<void>[] = [];

      for (let i = startIdx; i < end; i++) {
        batch.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              images[i] = img;
              loaded++;
              setProgress(loaded / totalFrames);
              flipReadyIfNeeded();
              resolve();
            };
            img.onerror = () => {
              // No fallback assignment here — leave undefined; canvas render
              // falls back to nearest-loaded frame.
              loaded++;
              setProgress(loaded / totalFrames);
              flipReadyIfNeeded();
              resolve();
            };
            img.src = buildPath(i);
          }),
        );
      }

      await Promise.all(batch);

      if (end < totalFrames) {
        await loadBatch(end);
      }
    };

    loadBatch(0).then(() => {
      clearTimeout(hardTimeout);
      // Safety net in case readyThreshold was never reached (e.g. all errored).
      setIsLoaded(true);
    });

    return () => clearTimeout(hardTimeout);
  }, [enabled, totalFrames, batchSize, buildPath, isLoaded, readyAtFraction]);

  return { images: imagesRef.current, progress, isLoaded };
}
