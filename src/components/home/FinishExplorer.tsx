import { useState, useRef, useCallback } from "react";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { cn } from "@/lib/utils";

interface ProductEntry {
  id: string;
  label: string;
  category: "windows" | "doors";
}

const PRODUCTS: ProductEntry[] = [
  { id: "casement", label: "Casement", category: "windows" },
  { id: "sliding-window", label: "Sliding", category: "windows" },
  { id: "awning", label: "Awning", category: "windows" },
  { id: "special-shapes", label: "Special Shapes", category: "windows" },
  { id: "sliding-door", label: "Sliding Door", category: "doors" },
  { id: "slide-and-fold", label: "Slide & Fold", category: "doors" },
  { id: "casement-door", label: "Casement Door", category: "doors" },
  { id: "french-door", label: "French Door", category: "doors" },
  { id: "large-panel", label: "Large Panel", category: "doors" },
  { id: "lift-and-slide", label: "Lift & Slide", category: "doors" },
  { id: "90-series", label: "90 Series", category: "doors" },
];

const FINISH_TO_FILE: Record<string, string> = {
  "oak-light": "oaklight",
  "oak-malt": "oakmalt",
  "jet-black": "jet-black",
  "charcoal-gray": "charcoal-gray",
  "matte-quartz": "matte-quartz",
  "silica-cream": "silica-cream",
  "black-wood": "blackwood",
  "gray-wood": "graywood",
  "dark-oak": "darkoak",
  walnut: "walnut",
  "golden-oak": "goldenoak",
  white: "white",
};

function getImagePath(productId: string, finishId: string) {
  const fileSuffix = FINISH_TO_FILE[finishId] ?? finishId;
  return `/images/product-finishes/${productId}-${fileSuffix}.jpeg`;
}

function CrossfadeImage({ src, alt }: { src: string; alt: string }) {
  const [displayedSrc, setDisplayedSrc] = useState(src);
  const [fadingIn, setFadingIn] = useState(false);
  const nextRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setFadingIn(true);
    setTimeout(() => {
      setDisplayedSrc(src);
      setFadingIn(false);
    }, 300);
  }, [src]);

  const isNewImage = src !== displayedSrc;

  return (
    <div className="relative w-full max-h-[520px] overflow-hidden">
      <img
        src={displayedSrc}
        alt={alt}
        className="w-full h-auto max-h-[520px] object-contain"
      />
      {isNewImage && (
        <img
          ref={nextRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={cn(
            "absolute inset-0 w-full h-auto max-h-[520px] object-contain transition-opacity duration-300",
            fadingIn ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}

export default function FinishExplorer() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [selectedFinish, setSelectedFinish] = useState(FRAME_FINISHES[0]);

  const windows = PRODUCTS.filter((p) => p.category === "windows");
  const doors = PRODUCTS.filter((p) => p.category === "doors");

  return (
    <div className="grid lg:grid-cols-[280px,1fr] gap-8 lg:gap-12">
      {/* Left: product list */}
      <div className="flex flex-col gap-6">
        <div>
          <p className="eyebrow mb-3">Windows</p>
          <div className="flex flex-col gap-1">
            {windows.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={cn(
                  "text-left px-3 py-2 text-sm font-medium transition-colors border",
                  selectedProduct.id === p.id
                    ? "border-[color:var(--ink-primary)] bg-[color:var(--ink-primary)] text-white"
                    : "border-transparent hover:border-[color:var(--rule-soft)] text-[color:var(--ink-secondary)]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">Doors</p>
          <div className="flex flex-col gap-1">
            {doors.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={cn(
                  "text-left px-3 py-2 text-sm font-medium transition-colors border",
                  selectedProduct.id === p.id
                    ? "border-[color:var(--ink-primary)] bg-[color:var(--ink-primary)] text-white"
                    : "border-transparent hover:border-[color:var(--rule-soft)] text-[color:var(--ink-secondary)]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: preview + finish selector */}
      <div className="flex flex-col gap-6">
        <div className="bg-[color:var(--canvas-soft)] flex items-center justify-center">
          <CrossfadeImage
            src={getImagePath(selectedProduct.id, selectedFinish.id)}
            alt={`${selectedProduct.label} in ${selectedFinish.label}`}
          />
        </div>

        {/* Finish selector */}
        <div>
          <p className="eyebrow mb-3">Select Finish</p>
          <div className="flex flex-wrap gap-1.5">
            {FRAME_FINISHES.map((finish) => (
              <button
                key={finish.id}
                onClick={() => setSelectedFinish(finish)}
                title={finish.label}
                className={cn(
                  "relative w-9 h-9 border-2 transition-all",
                  selectedFinish.id === finish.id
                    ? "border-[color:var(--ink-primary)] ring-1 ring-[color:var(--ink-primary)]"
                    : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-secondary)]"
                )}
                style={{ backgroundColor: finish.swatchHex }}
              >
                {finish.hasTexture && finish.textureImagePath && (
                  <img
                    src={finish.textureImagePath}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-[color:var(--ink-secondary)]">
            {selectedFinish.label}
          </p>
        </div>
      </div>
    </div>
  );
}
