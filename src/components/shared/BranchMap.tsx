import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Warm "Apple-Maps paint pass" locator map.
 *
 * Renderer: MapLibre GL JS. Tiles: CARTO free Positron basemap CDN (keyless,
 * OpenMapTiles schema, © OpenStreetMap). Positron ships cold gray; we recolor
 * specific layer groups into the warm cream/blue palette from the design
 * handoff after the style loads. See map-design-handoff for the source spec.
 */
const POSITRON_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const GREEN_KEYWORDS = ["park", "green", "grass", "wood", "cemetery"];

const PALETTE = {
  background: "#F7F2E8", // warm cream
  land: "#F2EDE1", // generic land fills
  green: "#DCE8D2", // parks / grass / wood
  water: "#A6CFE8", // soft blue
  casing: "#E3DDD0", // road casings (replaces near-black)
} as const;

/**
 * Recolor Positron's layer groups into the warm palette. Every branch is
 * guarded — CARTO can rename layers, and a skipped layer is better than a
 * crash.
 */
function applyWarmPaintPass(map: maplibregl.Map) {
  const layers = map.getStyle()?.layers;
  if (!layers) return;

  for (const layer of layers) {
    const id = layer.id;
    try {
      if (layer.type === "background") {
        map.setPaintProperty(id, "background-color", PALETTE.background);
      } else if (layer.type === "fill") {
        if (id.includes("water")) {
          map.setPaintProperty(id, "fill-color", PALETTE.water);
        } else if (id.includes("landcover") || id.includes("landuse")) {
          const isGreen = GREEN_KEYWORDS.some((k) => id.includes(k));
          map.setPaintProperty(id, "fill-color", isGreen ? PALETTE.green : PALETTE.land);
        }
      } else if (layer.type === "line") {
        if (id.includes("water")) {
          map.setPaintProperty(id, "line-color", PALETTE.water);
        } else if (id.includes("casing")) {
          map.setPaintProperty(id, "line-color", PALETTE.casing);
        }
      }
    } catch {
      /* layer doesn't carry this paint property — skip, don't crash */
    }
  }
}

/** FourlinQ-red teardrop pin, tip anchored to the coordinate. */
function createPin(): HTMLElement {
  const el = document.createElement("div");
  el.style.filter = "drop-shadow(0 2px 3px rgba(0,0,0,0.25))";
  el.innerHTML = `
    <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 8.94 13 21 13 21s13-12.06 13-21C26 5.82 20.18 0 13 0Z" fill="#C8102E"/>
      <circle cx="13" cy="13" r="4.5" fill="#fff"/>
    </svg>`;
  return el;
}

interface BranchMapProps {
  lat: number;
  lng: number;
  /** Accessible place name, e.g. the branch label. */
  label: string;
  zoom?: number;
  className?: string;
}

const BranchMap = ({ lat, lng, label, zoom = 14.5, className }: BranchMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: POSITRON_STYLE,
      center: [lng, lat],
      zoom,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      scrollZoom: false, // never hijack page scroll
    });

    map.touchZoomRotate.disableRotation();
    // Zoom-only nav (compass removed) — clean chrome per the handoff.
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    // On-map attribution intentionally omitted — the required OSM/CARTO credit
    // lives as a single line under the showroom grid (see Brand.tsx).

    const marker = new maplibregl.Marker({ element: createPin(), anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);

    map.on("load", () => applyWarmPaintPass(map));

    return () => {
      marker.remove();
      map.remove();
    };
  }, [lat, lng, zoom]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Map showing the location of ${label}`}
      className={className}
    />
  );
};

export default BranchMap;
