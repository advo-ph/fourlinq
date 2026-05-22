import { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  PresentationControls,
  ContactShadows,
  useGLTF,
  useAnimations,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import { FRAME_FINISHES, type FrameFinish } from "@/data/fourlinq-data";
import { cn } from "@/lib/utils";

/**
 * Real GLB-loaded casement window from "Animated Window Systems" by makinwhat
 * (Sketchfab). Original license CC-BY-NC; commercial use granted by author for
 * fourlinq.ph.
 *
 * The source model contains 10 window types in a single scene. We:
 *  - Hide all non-casement subtrees on load
 *  - Center the casement at the world origin
 *  - Override frame1 + frame2 materials with the selected finish color
 *  - Play the model's built-in "Scene" animation on Open click (only the
 *    casement panels are visible, so only those rotations register visually)
 */

const MODEL_URL = "/models/animated-window-systems.glb";
useGLTF.preload(MODEL_URL);

/** Which top-level node prefixes belong to the simple (non-bridged) casement. */
const CASEMENT_PREFIXES = ["casement_frame", "casement_panelL", "casement_panelR"];

function isCasementNode(name: string): boolean {
  return CASEMENT_PREFIXES.some((p) => name.startsWith(p));
}

/* ────────────────────────────────────────────────────────── */

interface CasementModelProps {
  finish: FrameFinish;
  isOpen: boolean;
}

function CasementModel({ finish, isOpen }: CasementModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const sceneClone = useMemo(() => scene.clone(true), [scene]);
  const { actions, mixer } = useAnimations(animations, groupRef);

  // On mount: hide everything that isn't the simple casement; clone+override materials
  useEffect(() => {
    sceneClone.traverse((child) => {
      if (child.type !== "Mesh") return;
      const mesh = child as THREE.Mesh;
      // Walk up to find the top-level window-type ancestor
      let topName: string | null = null;
      let cur: THREE.Object3D | null = mesh;
      while (cur) {
        const n = cur.name || "";
        if (isCasementNode(n)) {
          topName = n;
          break;
        }
        cur = cur.parent;
      }
      mesh.visible = topName !== null;

      // Clone the material so our color override doesn't leak into other instances
      if (mesh.visible && mesh.material) {
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        mesh.material = (mat as THREE.MeshStandardMaterial).clone();
      }
    });
  }, [sceneClone]);

  // Color-swap on finish change: any visible frame1/frame2 mesh gets the new color
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

  // Play / pause the animation when isOpen toggles
  useEffect(() => {
    const clip = actions["Scene"] || actions[animations[0]?.name];
    if (!clip) return;
    clip.setLoop(THREE.LoopOnce, 1);
    clip.clampWhenFinished = true;

    if (isOpen) {
      clip.reset().setEffectiveTimeScale(1).play();
    } else {
      // Reverse playback to close
      if (clip.time > 0) {
        clip.setEffectiveTimeScale(-1).play();
      }
    }
  }, [isOpen, actions, animations]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <group ref={groupRef}>
      <Center top>
        {/* Scale the model — source units are ~cm; we normalize to ~1.6m world height */}
        <group scale={[0.008, 0.008, 0.008]}>
          <primitive object={sceneClone} />
        </group>
      </Center>
    </group>
  );
}

/* ────────────────────────────────────────────────────────── */

interface CasementWindow3DProps {
  className?: string;
  initialFinishId?: string;
}

const CasementWindow3D = ({ className, initialFinishId = "white" }: CasementWindow3DProps) => {
  const [selectedId, setSelectedId] = useState(initialFinishId);
  const [isOpen, setIsOpen] = useState(false);

  const selected = useMemo(
    () => FRAME_FINISHES.find((f) => f.id === selectedId) ?? FRAME_FINISHES.find((f) => f.id === "white")!,
    [selectedId]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative w-full aspect-[5/6] lg:aspect-[4/5] bg-[color:var(--canvas-soft)] overflow-hidden">
        <Canvas
          camera={{ position: [0, 0.1, 4.2], fov: 30 }}
          dpr={[1, 2]}
          shadows
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
        >
          <color attach="background" args={["#ECECEC"]} />

          <ambientLight intensity={0.35} />
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
              <CasementModel finish={selected} isOpen={isOpen} />
            </PresentationControls>

            <ContactShadows
              position={[0, -0.92, 0]}
              opacity={0.45}
              scale={4}
              blur={2.4}
              far={1.2}
              resolution={1024}
            />
          </Suspense>
        </Canvas>

        {/* Status badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[color:var(--ink-primary)]/90 backdrop-blur-sm text-white px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-medium pointer-events-none">
          Live 3D · {selected.label}
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-4 left-4 text-[11px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)] bg-white/85 backdrop-blur-sm px-3 py-2 pointer-events-none">
          Drag to rotate
        </div>

        {/* Open / close trigger */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="absolute bottom-4 right-4 px-4 py-3 bg-[color:var(--accent)] text-white text-body-sm font-medium hover:bg-[color:var(--accent-hover)] transition-colors duration-300 ease-marvin"
        >
          {isOpen ? "Close window" : "Open window"}
        </button>

        {/* Attribution */}
        <div className="absolute top-4 right-4 text-[10px] tracking-[0.06em] text-[color:var(--ink-muted)] bg-white/85 backdrop-blur-sm px-2 py-1 pointer-events-none">
          3D model by <a href="https://sketchfab.com/makinwhat" target="_blank" rel="noopener noreferrer" className="underline pointer-events-auto">makinwhat</a>
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

export default CasementWindow3D;
