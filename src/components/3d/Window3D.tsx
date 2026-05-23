import { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  PresentationControls,
  ContactShadows,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import * as THREE from "three";
import { FRAME_FINISHES, type FrameFinish } from "@/data/fourlinq-data";
import { cn } from "@/lib/utils";

/**
 * Interactive 3D viewer for FourlinQ window systems.
 *
 * Loads makinwhat's "Animated Window Systems" GLB and shows ONE subtree at a
 * time, configurable via the `systemType` prop. Same underlying model is
 * reused across all types (drei's useGLTF caches the load).
 *
 * Original license CC-BY-NC; commercial use granted by makinwhat for
 * fourlinq.ph (see docs/LICENSES.md).
 */

const MODEL_URL = "/models/animated-window-systems.glb";
useGLTF.preload(MODEL_URL);

/* ─── System config map ─── */

export type SystemType = "casement" | "sliding" | "awning" | "slide-and-fold";

interface SystemConfig {
  label: string;
  /** Match these prefixes against any ancestor node name to decide visibility. */
  visiblePrefixes: string[];
  /** Pretty action label for the open/close button. */
  openLabel: string;
  closeLabel: string;
  /**
   * Known center of the visible subtree in the source GLB's local space.
   * Captured from gltf-transform inspection of the model. Used directly to
   * offset the model so the visible system lands at world origin — avoids
   * the bbox-computation timing/skinned-mesh issues that plagued auto-fit.
   */
  center: [number, number, number];
}

const SCENE_SCALE = 0.0075;

const SYSTEMS: Record<SystemType, SystemConfig> = {
  casement: {
    label: "Casement",
    visiblePrefixes: ["casement_frame", "casement_panelL", "casement_panelR"],
    openLabel: "Open window",
    closeLabel: "Close window",
    center: [-225, 552, -12],
  },
  sliding: {
    label: "Sliding",
    visiblePrefixes: [
      "sliding_horizontal_frame",
      "sliding_horizontal_windowL",
      "sliding_horizontal_windowR",
    ],
    openLabel: "Slide open",
    closeLabel: "Slide closed",
    center: [-395, 860, -13],
  },
  awning: {
    label: "Awning",
    visiblePrefixes: ["awning_frame", "awning_armature"],
    openLabel: "Open awning",
    closeLabel: "Close awning",
    center: [120, 470, -7],
  },
  "slide-and-fold": {
    label: "Slide & Fold",
    visiblePrefixes: ["holding_frame", "holding_panels"],
    openLabel: "Fold open",
    closeLabel: "Fold closed",
    center: [290, 573, -17],
  },
};

/* ─── Model component ─── */

interface WindowModelProps {
  finish: FrameFinish;
  isOpen: boolean;
  systemType: SystemType;
}

function WindowModel({ finish, isOpen, systemType }: WindowModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);

  // Fresh clone per system — avoids cross-pollution of material overrides.
  const sceneClone = useMemo(() => scene.clone(true), [scene]);
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Mount/system-change: hide non-matching subtrees, clone visible materials,
  // then measure the visible subtree's bbox in the sceneClone's LOCAL space
  // (independent of the outer group transforms) and apply both centering +
  // scaling on innerRef in one go.
  useEffect(() => {
    const prefixes = SYSTEMS[systemType].visiblePrefixes;

    sceneClone.traverse((child) => {
      if (child.type !== "Mesh") return;
      const mesh = child as THREE.Mesh;
      let isVisible = false;
      let cur: THREE.Object3D | null = mesh;
      while (cur) {
        const n = cur.name || "";
        if (prefixes.some((p) => n.startsWith(p))) {
          isVisible = true;
          break;
        }
        cur = cur.parent;
      }
      mesh.visible = isVisible;
      if (isVisible && mesh.material) {
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        mesh.material = (mat as THREE.MeshStandardMaterial).clone();
      }
    });

    // Apply known center offset + uniform scale. Hardcoded centers are more
    // reliable than bbox auto-fit for this GLB — some meshes are skinned /
    // armature-driven and their world bboxes don't reflect rendered extent.
    if (innerRef.current) {
      const [cx, cy, cz] = SYSTEMS[systemType].center;
      innerRef.current.scale.setScalar(SCENE_SCALE);
      innerRef.current.position.set(-cx * SCENE_SCALE, -cy * SCENE_SCALE, -cz * SCENE_SCALE);
    }
  }, [sceneClone, systemType]);

  // Finish swap — recolor frame1/frame2 materials on visible meshes.
  useEffect(() => {
    const target = new THREE.Color(finish.swatchHex);
    sceneClone.traverse((child) => {
      if (child.type !== "Mesh") return;
      const mesh = child as THREE.Mesh;
      if (!mesh.visible || !mesh.material) return;
      const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
      const name = mat.name || "";
      if (name === "frame1" || name === "frame2") {
        mat.color = target;
        mat.roughness = 0.65;
        mat.metalness = 0;
        mat.needsUpdate = true;
      }
    });
  }, [finish, sceneClone]);

  // Animation control — the source clip is 4 seconds (0-2s open, 2-4s close-back),
  // so playing it through cycles open AND closed in one shot. We don't want
  // that. Instead, scrub the action.time manually toward a target:
  //   - target 0   when closed
  //   - target 2.0 when fully open (peak of the model's animation)
  // Lerp via useFrame for a smooth motion regardless of click cadence.
  const OPEN_TIME = 2.0;
  const targetTimeRef = useRef(0);

  useEffect(() => {
    targetTimeRef.current = isOpen ? OPEN_TIME : 0;
  }, [isOpen]);

  useEffect(() => {
    const action = actions["Scene"] || (animations[0] && actions[animations[0].name]);
    if (!action) return;
    action.play();
    action.paused = true; // we control time manually
    action.time = 0;
  }, [actions, animations]);

  useFrame((_, delta) => {
    const action = actions["Scene"] || (animations[0] && actions[animations[0].name]);
    if (!action) return;
    const target = targetTimeRef.current;
    const diff = target - action.time;
    if (Math.abs(diff) > 0.005) {
      const speed = 2.5; // seconds of clip per second of real time → ~0.8s open/close
      const step = Math.sign(diff) * Math.min(Math.abs(diff), delta * speed);
      action.time = action.time + step;
      mixer.update(0); // re-evaluate pose at the new time without auto-advancing
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        <primitive object={sceneClone} />
      </group>
    </group>
  );
}

/* ─── Public component ─── */

interface Window3DProps {
  className?: string;
  initialSystem?: SystemType;
  initialFinishId?: string;
}

const Window3D = ({
  className,
  initialSystem = "casement",
  initialFinishId = "white",
}: Window3DProps) => {
  const [systemType, setSystemType] = useState<SystemType>(initialSystem);
  const [selectedId, setSelectedId] = useState(initialFinishId);
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close when switching system, otherwise the new system would appear mid-animation
  useEffect(() => {
    setIsOpen(false);
  }, [systemType]);

  const selected = useMemo(
    () => FRAME_FINISHES.find((f) => f.id === selectedId) ?? FRAME_FINISHES.find((f) => f.id === "white")!,
    [selectedId]
  );

  const config = SYSTEMS[systemType];

  return (
    <div className={cn("relative w-full", className)}>
      {/* System tab rail — hairline-underlined */}
      <div className="flex items-end gap-6 border-b border-[color:var(--rule-soft)] mb-5 overflow-x-auto no-scrollbar">
        {(Object.keys(SYSTEMS) as SystemType[]).map((id) => {
          const active = systemType === id;
          return (
            <button
              key={id}
              onClick={() => setSystemType(id)}
              className={cn(
                "pb-3 text-body-sm font-medium whitespace-nowrap transition-colors duration-300 ease-marvin border-b-2 -mb-px min-h-[44px] flex items-end",
                active
                  ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                  : "text-[color:var(--ink-muted)] border-transparent hover:text-[color:var(--ink-primary)]"
              )}
            >
              {SYSTEMS[id].label}
            </button>
          );
        })}
      </div>

      {/* 3D viewer — soft gradient backdrop (CSS) lets glass refraction read */}
      <div
        className="relative w-full aspect-[5/6] lg:aspect-[4/5] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #F4F4F4 0%, #E2E2E2 60%, #D0D0D0 100%)",
        }}
      >
        <Canvas
          camera={{ position: config.cameraPos ?? [0, 0.05, 3.4], fov: 28 }}
          dpr={[1, 2]}
          shadows
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[3, 4, 5]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-3, 2, 3]} intensity={0.4} />

          <Suspense fallback={null}>
            <Environment preset="apartment" />
            <PresentationControls
              global
              cursor
              snap
              speed={1.2}
              polar={[-Math.PI / 6, Math.PI / 6]}
              azimuth={[-Math.PI / 2.5, Math.PI / 2.5]}
            >
              <WindowModel finish={selected} isOpen={isOpen} systemType={systemType} />
            </PresentationControls>

            <ContactShadows
              position={[0, -0.85, 0]}
              opacity={0.22}
              scale={2.4}
              blur={1.6}
              far={0.6}
              resolution={1024}
            />
          </Suspense>
        </Canvas>

        {/* Status badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[color:var(--ink-primary)]/90 backdrop-blur-sm text-white px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-medium pointer-events-none">
          Live 3D · {config.label} · {selected.label}
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-4 left-4 text-[11px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)] bg-white/85 backdrop-blur-sm px-3 py-2 pointer-events-none">
          Drag to rotate
        </div>

        {/* Open / close */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="absolute bottom-4 right-4 px-4 py-3 bg-[color:var(--accent)] text-white text-body-sm font-medium hover:bg-[color:var(--accent-hover)] transition-colors duration-300 ease-marvin"
        >
          {isOpen ? config.closeLabel : config.openLabel}
        </button>

        {/* Attribution */}
        <div className="absolute top-4 right-4 text-[10px] tracking-[0.06em] text-[color:var(--ink-muted)] bg-white/85 backdrop-blur-sm px-2 py-1">
          3D model by{" "}
          <a
            href="https://sketchfab.com/makinwhat"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            makinwhat
          </a>
        </div>
      </div>

      {/* Finish picker */}
      <div className="mt-6">
        <p className="eyebrow mb-3">Finish</p>
        <ul className="flex flex-wrap gap-2">
          {FRAME_FINISHES.map((f) => {
            const isSelected = f.id === selected.id;
            const fakeGrain = f.category === "wood-grain"
              ? `repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 4px)`
              : "none";
            return (
              <li key={f.id}>
                <button
                  onClick={() => setSelectedId(f.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "w-9 h-9 transition-all duration-300 ease-marvin",
                    isSelected
                      ? "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-white"
                      : "ring-1 ring-[color:var(--rule-soft)] hover:ring-[color:var(--ink-primary)]"
                  )}
                  style={{
                    backgroundColor: f.swatchHex,
                    backgroundImage: fakeGrain !== "none" ? fakeGrain : undefined,
                    backgroundBlendMode: fakeGrain !== "none" ? "multiply" : undefined,
                  }}
                  title={f.label}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Window3D;
