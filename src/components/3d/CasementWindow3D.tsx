import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PresentationControls } from "@react-three/drei";
import * as THREE from "three";
import { FRAME_FINISHES, type FrameFinish } from "@/data/fourlinq-data";
import { cn } from "@/lib/utils";

/**
 * Procedural 3D casement window built with Three.js + react-three-fiber.
 *
 * Not photoreal — built from primitive boxes / planes. But it is REAL 3D:
 * - User can rotate the window (PresentationControls)
 * - Click to open / close the sash on its hinge
 * - Finish selector live-updates the frame material
 *
 * This is the §15.2 workaround until commissioned models replace it.
 * See docs/REDESIGN_ROADMAP.md §15.2 for the full ambition statement.
 */

/* ─── Geometry constants (mm-scaled, converted to scene units) ─── */
const M = 1 / 1000; // 1 unit = 1 meter; mm → meters

const WIN = {
  totalWidth:   1200 * M,
  totalHeight:  1600 * M,
  frameDepth:    70  * M,
  frameThickness: 60 * M,
  sashThickness:  50 * M,
  glassThickness:  6 * M,
  hingeRadius:    8 * M,
  hingeLength:   40 * M,
};

/** Frame component — the outer fixed rectangle that doesn't move. */
function OuterFrame({ color }: { color: string }) {
  const { totalWidth, totalHeight, frameDepth, frameThickness: t } = WIN;
  const halfW = totalWidth / 2;
  const halfH = totalHeight / 2;

  return (
    <group>
      {/* Top horizontal */}
      <mesh position={[0, halfH - t / 2, 0]}>
        <boxGeometry args={[totalWidth, t, frameDepth]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
      </mesh>
      {/* Bottom horizontal */}
      <mesh position={[0, -halfH + t / 2, 0]}>
        <boxGeometry args={[totalWidth, t, frameDepth]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
      </mesh>
      {/* Left vertical */}
      <mesh position={[-halfW + t / 2, 0, 0]}>
        <boxGeometry args={[t, totalHeight - 2 * t, frameDepth]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
      </mesh>
      {/* Right vertical */}
      <mesh position={[halfW - t / 2, 0, 0]}>
        <boxGeometry args={[t, totalHeight - 2 * t, frameDepth]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
      </mesh>
    </group>
  );
}

/** Sash — the openable inner part. Pivots on the LEFT hinge axis. */
function Sash({ color, openAmount }: { color: string; openAmount: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { totalWidth, totalHeight, frameThickness: t, sashThickness: s, glassThickness, frameDepth } = WIN;
  const sashWidth = totalWidth - 2 * t;
  const sashHeight = totalHeight - 2 * t;
  const halfSW = sashWidth / 2;
  const halfSH = sashHeight / 2;

  // Open angle: 0 = closed, 1 = full ~85deg open
  const targetAngle = openAmount * (-Math.PI * 0.47);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const current = groupRef.current.rotation.y;
    // Smooth interp toward target
    groupRef.current.rotation.y = current + (targetAngle - current) * Math.min(1, delta * 4);
  });

  return (
    // Group origin at LEFT edge of sash so rotation pivots on hinge
    <group ref={groupRef} position={[-halfSW, 0, frameDepth / 2 - s / 2]}>
      <group position={[halfSW, 0, 0]}>
        {/* Sash frame — inner rectangle */}
        {/* Top */}
        <mesh position={[0, halfSH - s / 2, 0]}>
          <boxGeometry args={[sashWidth, s, s]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -halfSH + s / 2, 0]}>
          <boxGeometry args={[sashWidth, s, s]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Left */}
        <mesh position={[-halfSW + s / 2, 0, 0]}>
          <boxGeometry args={[s, sashHeight - 2 * s, s]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Right */}
        <mesh position={[halfSW - s / 2, 0, 0]}>
          <boxGeometry args={[s, sashHeight - 2 * s, s]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
        </mesh>

        {/* Glass */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[sashWidth - 2 * s, sashHeight - 2 * s]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.92}
            opacity={0.4}
            transparent
            roughness={0.05}
            thickness={glassThickness * 1000}
            ior={1.45}
            clearcoat={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Handle — small protrusion on the right side, opposite the hinge */}
        <mesh position={[halfSW - s, -sashHeight * 0.05, s]}>
          <boxGeometry args={[s * 0.5, s * 2.5, s * 0.6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/** Hinges — two cylinders on the left side of the frame, visual detail. */
function Hinges({ color }: { color: string }) {
  const { totalWidth, totalHeight, frameThickness: t, hingeRadius, hingeLength, frameDepth } = WIN;
  const x = -totalWidth / 2 + t;
  const upperY = totalHeight / 2 - t - totalHeight * 0.18;
  const lowerY = -totalHeight / 2 + t + totalHeight * 0.18;

  return (
    <group>
      {[upperY, lowerY].map((y, i) => (
        <mesh key={i} position={[x, y, frameDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hingeRadius, hingeRadius, hingeLength, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Scene — composed window + hinges + sash. */
function WindowScene({ finish, openAmount }: { finish: FrameFinish; openAmount: number }) {
  return (
    <group>
      <OuterFrame color={finish.swatchHex} />
      <Hinges color="#3a3a3a" />
      <Sash color={finish.swatchHex} openAmount={openAmount} />
    </group>
  );
}

/* ─── Wrapper Component ─── */

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
      {/* The 3D scene */}
      <div className="relative w-full aspect-[5/6] lg:aspect-[4/5] bg-[color:var(--canvas-soft)] overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 2.2], fov: 35 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#f8f8f8"]} />

          {/* Lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} castShadow />
          <directionalLight position={[-3, 2, 3]} intensity={0.6} />
          <directionalLight position={[0, -2, 4]} intensity={0.3} />

          <Suspense fallback={null}>
            <Environment preset="apartment" />
            <PresentationControls
              global
              cursor
              snap
              speed={1.2}
              polar={[-Math.PI / 8, Math.PI / 8]}
              azimuth={[-Math.PI / 3, Math.PI / 3]}
              rotation={[0, 0, 0]}
            >
              <WindowScene finish={selected} openAmount={isOpen ? 1 : 0} />
            </PresentationControls>
          </Suspense>
        </Canvas>

        {/* Status badge — top-left, matches Finishes preview style */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[color:var(--ink-primary)]/90 backdrop-blur-sm text-white px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-medium pointer-events-none">
          Live 3D · {selected.label}
        </div>

        {/* Controls hint — bottom-left */}
        <div className="absolute bottom-4 left-4 text-[11px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)] bg-white/85 backdrop-blur-sm px-3 py-2 pointer-events-none">
          Drag to rotate
        </div>

        {/* Open / close trigger — bottom-right */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="absolute bottom-4 right-4 px-4 py-3 bg-[color:var(--accent)] text-white text-body-sm font-medium hover:bg-[color:var(--accent-hover)] transition-colors duration-300 ease-marvin"
        >
          {isOpen ? "Close window" : "Open window"}
        </button>
      </div>

      {/* Finish picker — compact row */}
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
