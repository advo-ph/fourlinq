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
import { CATALOGUE_SYSTEM, SYSTEMS, type SystemType } from "./window-system";

export type { SystemType };

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

/** Materials that take the frame finish. `parts`/`parts2` are hardware. */
const FRAME_MATERIAL = new Set(["frame1", "frame2", "frame3"]);

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
    const cfg = SYSTEMS[systemType];
    const exact = new Set(cfg.visibleRoot);
    const prefix = cfg.visibleRootPrefix ?? [];

    sceneClone.traverse((child) => {
      if (child.type !== "Mesh") return;
      const mesh = child as THREE.Mesh;
      let isVisible = false;
      let cur: THREE.Object3D | null = mesh;
      while (cur) {
        const n = cur.name || "";
        if (exact.has(n) || prefix.some((p) => n.startsWith(p))) {
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

    // Apply known-good transform per system. No bbox auto-fit — that was
    // racing with useAnimations' time-0 pose application and setFromObject's
    // matrixWorld reads, producing different bbox values on different mounts
    // depending on which effect ran first. Pinned center + scale per system is
    // deterministic. Both are in loaded-scene space, the same space this group
    // transforms, so the multiply below is unit-consistent.
    if (innerRef.current) {
      const [cx, cy, cz] = cfg.center;
      const s = cfg.scale;
      innerRef.current.scale.setScalar(s);
      innerRef.current.position.set(-cx * s, -cy * s, -cz * s);
    }
  }, [sceneClone, systemType]);

  useEffect(() => {
    const target = new THREE.Color(finish.swatchHex);
    const hasTexture = finish.hasTexture && finish.textureImagePath;

    const applyTexture = (texture: THREE.Texture | null) => {
      sceneClone.traverse((child) => {
        if (child.type !== "Mesh") return;
        const mesh = child as THREE.Mesh;
        if (!mesh.visible || !mesh.material) return;
        const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
        const name = mat.name || "";
        if (FRAME_MATERIAL.has(name)) {
          mat.color = texture ? new THREE.Color("#ffffff") : target;
          mat.map = texture;
          mat.roughness = 0.65;
          mat.metalness = 0;
          mat.needsUpdate = true;
        }
      });
    };

    if (hasTexture) {
      new THREE.TextureLoader().load(finish.textureImagePath!, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        applyTexture(tex);
      });
    } else {
      applyTexture(null);
    }
  }, [finish, sceneClone]);

  // Animation control — the source clip is a single 4-second "Scene" track that
  // drives every system at once, opening and then closing back. Playing it
  // through would cycle open AND closed in one shot, so instead we scrub
  // action.time manually toward a target:
  //   - target 0                       when closed
  //   - target SYSTEMS[type].openTime  when fully open
  // openTime is per system, not a shared constant: the louvre fins reach full
  // tilt at ~0.93s and a revolving door at 4.0s, while sashes peak near 1.9s.
  // Using one global 2.0 would have shown the louvre swinging back toward shut.
  const openTime = SYSTEMS[systemType].openTime;
  const targetTimeRef = useRef(0);

  useEffect(() => {
    targetTimeRef.current = isOpen ? openTime : 0;
  }, [isOpen, openTime]);

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
  const isOperable = config.openTime > 0;

  return (
    <div className={cn("relative w-full", className)}>
      {/* System tab rail — hairline-underlined */}
      <div className="flex items-end gap-6 border-b border-[color:var(--rule-soft)] mb-5 overflow-x-auto no-scrollbar">
        {CATALOGUE_SYSTEM.map((id) => {
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
          background: "linear-gradient(180deg, #FAFAFA 0%, #F0F0EE 55%, #E4E2DF 100%)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0.05, 3.4], fov: 28 }}
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
        {/* Background via inline color-mix, not a bg-[color:var(...)] class
            carrying an opacity modifier: Tailwind emits no rule at all for
            that combination, so the badge got no background and read as white
            text on a near-white gradient. Guarded by
            src/test/tailwind-arbitrary-opacity.test.ts. */}
        <div
          className="absolute top-4 left-4 flex items-center gap-2 backdrop-blur-sm text-white px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-medium pointer-events-none"
          style={{ backgroundColor: "color-mix(in srgb, var(--ink-primary) 90%, transparent)" }}
        >
          Live 3D · {config.label} · {selected.label}
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-4 left-4 text-[11px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)] bg-white/85 backdrop-blur-sm px-3 py-2 pointer-events-none">
          Drag to rotate
        </div>

        {/* Open / close — omitted for fixed glazing, which has no moving part.
            A disabled button would imply the unit opens and is merely
            unavailable here; no control says the right thing. */}
        {isOperable ? (
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="absolute bottom-4 right-4 px-4 py-3 bg-[color:var(--accent)] text-white text-body-sm font-medium hover:bg-[color:var(--accent-hover)] transition-colors duration-300 ease-marvin"
          >
            {isOpen ? config.closeLabel : config.openLabel}
          </button>
        ) : (
          <p className="absolute bottom-4 right-4 px-3 py-2 bg-white/85 backdrop-blur-sm text-[11px] uppercase tracking-[0.08em] text-[color:var(--ink-muted)]">
            Fixed — does not open
          </p>
        )}

      </div>

      {/* Finish picker */}
      <div className="mt-6">
        <p className="eyebrow mb-3">Finish</p>
        <ul className="flex flex-wrap gap-2">
          {FRAME_FINISHES.map((f) => {
            const isSelected = f.id === selected.id;
            const hasRealTexture = f.hasTexture && f.textureImagePath;
            return (
              <li key={f.id}>
                <button
                  onClick={() => setSelectedId(f.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "w-9 h-9 overflow-hidden transition-all duration-300 ease-marvin",
                    isSelected
                      ? "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-white"
                      : "ring-1 ring-[color:var(--rule-soft)] hover:ring-[color:var(--ink-primary)]"
                  )}
                  style={hasRealTexture ? undefined : { backgroundColor: f.swatchHex }}
                  title={f.label}
                >
                  {hasRealTexture && (
                    <img src={f.textureImagePath} alt={f.label} className="w-full h-full object-cover" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Attribution — small microline below the viewer; CC-BY satisfied
          without compromising authorship of the FourlinQ surface. */}
      <p className="mt-6 text-[10px] tracking-[0.06em] text-[color:var(--ink-muted)] text-right">
        3D model by{" "}
        <a
          href="https://sketchfab.com/makinwhat"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          makinwhat
        </a>
        {" "}· used with commercial permission
      </p>
    </div>
  );
};

export default Window3D;
