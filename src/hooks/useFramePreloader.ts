import { useRef, useState, useEffect, useCallback } from "react";

interface UseFramePreloaderOptions {
  enabled?: boolean;
  batchSize?: number;
  padLength?: number;
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
  const { enabled = true, batchSize = 6, padLength = 4 } = options;
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
    let loaded = 0;

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
              resolve();
            };
            img.onerror = () => {
              images[i] = images[i - 1] ?? new Image();
              loaded++;
              setProgress(loaded / totalFrames);
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
      imagesRef.current = images;
      setIsLoaded(true);
    });
  }, [enabled, totalFrames, batchSize, buildPath, isLoaded]);

  return { images: imagesRef.current, progress, isLoaded };
}
