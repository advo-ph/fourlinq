import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

/* Direct-glaze palette: dark aluminium-clad exterior + wood interior liner. */
export function makeCladMaterials() {
  const base = makeMaterials();
  const alu = new THREE.MeshStandardMaterial({ color: 0x33383c, roughness: 0.52, metalness: 0.55 });
  alu.name = 'alu_clad_graphite';
  const aluDark = new THREE.MeshStandardMaterial({ color: 0x25292c, roughness: 0.48, metalness: 0.6 });
  aluDark.name = 'alu_clad_graphite_dark';
  const wood = new THREE.MeshStandardMaterial({ color: 0xe4c79a, roughness: 0.72, metalness: 0.0 });
  wood.name = 'wood_pine_clear';
  const woodDeep = new THREE.MeshStandardMaterial({ color: 0xd3b183, roughness: 0.78, metalness: 0.0 });
  woodDeep.name = 'wood_pine_rebate';
  return { ...base, alu, aluDark, wood, woodDeep };
}

function ringGeo(w, h, faceW, depth, bevel = 0.0012) {
  const s = new THREE.Shape();
  const x = w / 2, y = h / 2;
  s.moveTo(-x, -y); s.lineTo(x, -y); s.lineTo(x, y); s.lineTo(-x, y); s.closePath();
  const hx = w / 2 - faceW, hy = h / 2 - faceW;
  const hole = new THREE.Path();
  hole.moveTo(-hx, -hy); hole.lineTo(-hx, hy); hole.lineTo(hx, hy); hole.lineTo(hx, -hy); hole.closePath();
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: depth - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel,
    bevelSize: bevel, bevelSegments: 1, curveSegments: 1,
  });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  return g;
}

function mesh(geo, mat, name, pos) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  if (pos) m.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0);
  return m;
}

export const FIXED_VARIANTS = {
  tall:  { w: 0.900, h: 1.800, label: '900 × 1800' },
  wide:  { w: 1.800, h: 1.200, label: '1800 × 1200' },
  square:{ w: 1.200, h: 1.200, label: '1200 × 1200' },
};

/**
 * buildFixed({ variant, grid })
 * Fixed picture / direct-glaze unit: no sash, no hardware, no motion.
 * Aluminium-clad exterior (−Z) over a wood interior liner (+Z); IGU bedded
 * straight into the frame rebate. `grid: true` adds a 2×2 narrow alu bar set.
 * Metres, y-up, base at y = 0.
 */
export function buildFixed(opts = {}) {
  const key = FIXED_VARIANTS[opts.variant] ? opts.variant : 'tall';
  const V = FIXED_VARIANTS[key];
  const M = opts.materials || makeCladMaterials();
  const grid = !!opts.grid;

  const W = V.w, H = V.h;
  const D = 0.092;                 // total frame depth
  const FACE_EXT = 0.036;          // narrow exterior sightline
  const FACE_INT = 0.058;          // wood liner face
  const CLAD_D = 0.034;
  const zExt = -D / 2 + CLAD_D / 2;

  const root = new THREE.Group();
  root.name = 'fixed_' + key + (grid ? '_grid' : '');

  /* ---- exterior aluminium cladding: narrow face, square-cut ---- */
  root.add(mesh(ringGeo(W, H, FACE_EXT, CLAD_D), M.alu, 'frame_clad_ext', [0, 0, zExt]));
  /* thin nosing shadow line at the outer edge */
  root.add(mesh(ringGeo(W + 0.006, H + 0.006, 0.010, 0.012, 0), M.aluDark, 'frame_clad_nose',
    [0, 0, -D / 2 + 0.006]));

  /* ---- wood interior liner ---- */
  const woodD = D - CLAD_D;
  const zWood = -D / 2 + CLAD_D + woodD / 2;
  root.add(mesh(ringGeo(W - 0.004, H - 0.004, FACE_INT, woodD), M.wood, 'frame_liner_int', [0, 0, zWood]));
  root.add(mesh(ringGeo(W - FACE_INT * 2 + 0.016, H - FACE_INT * 2 + 0.016, 0.020, 0.014), M.woodDeep,
    'frame_stop_int', [0, 0, D / 2 - 0.007]));

  /* ---- IGU set directly into the frame (no sash) ---- */
  const glassW = W - FACE_EXT * 2 + 0.014;
  const glassH = H - FACE_EXT * 2 + 0.014;
  const glassT = 0.026;
  const zGlass = -D / 2 + CLAD_D + glassT / 2 - 0.004;
  root.add(mesh(new THREE.BoxGeometry(glassW, glassH, glassT), M.glass, 'glass_igu', [0, 0, zGlass]));

  /* dark structural glazing gasket framing the pane on both faces */
  root.add(mesh(ringGeo(glassW + 0.010, glassH + 0.010, 0.012, 0.010, 0), M.gasket, 'gasket_ext',
    [0, 0, zGlass - glassT / 2 - 0.004]));
  root.add(mesh(ringGeo(glassW + 0.010, glassH + 0.010, 0.012, 0.010, 0), M.gasket, 'gasket_int',
    [0, 0, zGlass + glassT / 2 + 0.004]));

  /* warm-edge spacer visible through the glass edge */
  root.add(mesh(ringGeo(glassW - 0.004, glassH - 0.004, 0.009, glassT - 0.008, 0), M.aluDark,
    'igu_spacer', [0, 0, zGlass]));

  /* ---- sill nosing / drainage lip ---- */
  const sill = mesh(new THREE.BoxGeometry(W + 0.012, 0.014, CLAD_D + 0.024), M.alu, 'sill_nose',
    [0, -H / 2 - 0.005, zExt - 0.008]);
  sill.rotation.x = -0.07;
  root.add(sill);

  /* ---- optional 2 × 2 mullion grid: narrow applied alu bars ---- */
  const bars = new THREE.Group();
  bars.name = 'grid_2x2';
  bars.visible = grid;
  const BAR = 0.024, BAR_T = 0.014;
  const zBarExt = zGlass - glassT / 2 - 0.008;
  const zBarInt = zGlass + glassT / 2 + 0.008;
  const spanW = glassW + 0.004, spanH = glassH + 0.004;
  [['ext', zBarExt], ['int', zBarInt]].forEach(([side, z]) => {
    bars.add(mesh(new THREE.BoxGeometry(BAR, spanH, BAR_T), M.aluDark, 'grid_bar_v_' + side, [0, 0, z]));
    bars.add(mesh(new THREE.BoxGeometry(spanW, BAR, BAR_T), M.aluDark, 'grid_bar_h_' + side, [0, 0, z]));
  });
  /* shadow bar inside the cavity so the grid reads through the glass */
  bars.add(mesh(new THREE.BoxGeometry(BAR - 0.008, spanH, 0.004), M.aluDark, 'grid_spacer_v', [0, 0, zGlass]));
  bars.add(mesh(new THREE.BoxGeometry(spanW, BAR - 0.008, 0.004), M.aluDark, 'grid_spacer_h', [0, 0, zGlass]));
  root.add(bars);

  root.position.y = H / 2 + 0.02;

  const turntable = new THREE.Group();
  turntable.name = 'turntable';
  turntable.add(root);

  function setGrid(on) { bars.visible = !!on; }
  function setYaw(deg) { turntable.rotation.y = THREE.MathUtils.degToRad(deg); }

  return {
    group: turntable,
    unit: root,
    setGrid,
    setYaw,
    size: { w: W, h: H, d: D },
    config: {
      id: 'fixed_picture',
      motion: 'none',
      operable: false,
      presentation: 'turntable_360',
      sightline_mm: Math.round(FACE_EXT * 1000),
      grid: grid ? '2x2_applied_alu' : null,
    },
  };
}
