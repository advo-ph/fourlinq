import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

/* Slim dark-aluminium curtain-wall palette. */
export function makeCwMaterials() {
  const base = makeMaterials();
  const alu = new THREE.MeshStandardMaterial({ color: 0x2c3033, roughness: 0.46, metalness: 0.62 });
  alu.name = 'alu_dark_anodised';
  const aluDeep = new THREE.MeshStandardMaterial({ color: 0x1d2123, roughness: 0.42, metalness: 0.66 });
  aluDeep.name = 'alu_dark_anodised_deep';
  const cap = new THREE.MeshStandardMaterial({ color: 0x35393d, roughness: 0.5, metalness: 0.58 });
  cap.name = 'alu_pressure_cap';
  const glass = new THREE.MeshStandardMaterial({
    color: 0xc6dcdd, roughness: 0.05, metalness: 0.14,
    transparent: true, opacity: 0.24, side: THREE.DoubleSide,
  });
  glass.name = 'glass_igu_clear';
  const spandrel = new THREE.MeshStandardMaterial({ color: 0x23282b, roughness: 0.5, metalness: 0.2 });
  spandrel.name = 'glass_spandrel_backpan';
  const scaleFig = new THREE.MeshStandardMaterial({ color: 0xb9bcbe, roughness: 0.9, metalness: 0.0 });
  scaleFig.name = 'scale_figure_matte';
  return { ...base, alu, aluDeep, cap, glass, spandrel, scaleFig };
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

export const CW_VARIANTS = {
  standard: { bay: 1.500, storey: 3.200, label: '4500 × 9600' },
  wide:     { bay: 1.800, storey: 3.200, label: '5400 × 9600' },
  lobby:    { bay: 1.500, storey: 4.000, label: '4500 × 12000' },
};

/**
 * buildCurtainWall({ variant, awning, spandrel, figure })
 * Modular stick-system curtain wall: 3 bays × 3 storeys, slim dark aluminium
 * mullion/transom grid, fixed IGUs, optional operable awning insert in the
 * centre bay of the middle storey (top-hung, projects to exterior −Z).
 * Metres, y-up, base of grid at y = 0. Exterior faces −Z.
 */
export function buildCurtainWall(opts = {}) {
  const key = CW_VARIANTS[opts.variant] ? opts.variant : 'standard';
  const V = CW_VARIANTS[key];
  const M = opts.materials || makeCwMaterials();

  const BAYS = 3, STOREYS = 3;
  const BW = V.bay, SH = V.storey;
  const W = BW * BAYS, H = SH * STOREYS;

  const MUL_FACE = 0.065;          // slim sightline
  const MUL_DEPTH = 0.190;         // structural back-mullion depth (interior)
  const CAP = 0.052, CAP_D = 0.026;
  const GLASS_T = 0.028;
  const zGlass = 0;                            // glass plane at z = 0
  const zCap = -GLASS_T / 2 - CAP_D / 2 - 0.004;
  const zBack = GLASS_T / 2 + MUL_DEPTH / 2;   // back mullion sits interior side

  const root = new THREE.Group();
  root.name = 'curtainwall_' + key;

  const xs = [], ys = [];
  for (let i = 0; i <= BAYS; i++) xs.push(-W / 2 + i * BW);
  for (let j = 0; j <= STOREYS; j++) ys.push(-H / 2 + j * SH);

  /* ---- back mullions (vertical, full height) + transoms (horizontal) ---- */
  const grid = new THREE.Group(); grid.name = 'grid';
  xs.forEach((x, i) => {
    grid.add(mesh(new THREE.BoxGeometry(MUL_FACE, H, MUL_DEPTH), M.alu, 'mullion_' + i, [x, 0, zBack]));
    grid.add(mesh(new THREE.BoxGeometry(CAP, H, CAP_D), M.cap, 'mullion_cap_' + i, [x, 0, zCap]));
  });
  ys.forEach((y, j) => {
    for (let i = 0; i < BAYS; i++) {
      const cx = (xs[i] + xs[i + 1]) / 2, len = BW - MUL_FACE;
      grid.add(mesh(new THREE.BoxGeometry(len, MUL_FACE, MUL_DEPTH * 0.72), M.aluDeep,
        `transom_${j}_${i}`, [cx, y, GLASS_T / 2 + MUL_DEPTH * 0.36]));
      grid.add(mesh(new THREE.BoxGeometry(len, CAP, CAP_D), M.cap, `transom_cap_${j}_${i}`, [cx, y, zCap]));
    }
  });
  root.add(grid);

  /* ---- infill: fixed IGUs, one per bay ---- */
  const gw = BW - MUL_FACE - 0.008, gh = SH - MUL_FACE - 0.008;
  const infill = new THREE.Group(); infill.name = 'infill';
  const spandrelOn = !!opts.spandrel;
  const awningOn = !!opts.awning;
  const AW_ROW = 1, AW_COL = 1;                // middle storey, centre bay

  for (let j = 0; j < STOREYS; j++) {
    for (let i = 0; i < BAYS; i++) {
      if (awningOn && j === AW_ROW && i === AW_COL) continue;
      const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
      const isSpandrel = spandrelOn && j > 0;   // spandrel band at each floor line
      if (isSpandrel) {
        const bandH = 0.62;
        infill.add(mesh(new THREE.BoxGeometry(gw, bandH, GLASS_T), M.spandrel,
          `spandrel_${j}_${i}`, [cx, ys[j] + MUL_FACE / 2 + bandH / 2, zGlass]));
        infill.add(mesh(new THREE.BoxGeometry(gw, gh - bandH - MUL_FACE / 2, GLASS_T), M.glass,
          `glass_${j}_${i}`, [cx, cy + (bandH + MUL_FACE / 2) / 2, zGlass]));
      } else {
        infill.add(mesh(new THREE.BoxGeometry(gw, gh, GLASS_T), M.glass, `glass_${j}_${i}`, [cx, cy, zGlass]));
      }
      infill.add(mesh(ringGeo(gw + 0.008, gh + 0.008, 0.012, 0.012, 0), M.gasket,
        `gasket_${j}_${i}`, [cx, cy, -GLASS_T / 2 - 0.006]));
      infill.add(mesh(ringGeo(gw - 0.004, gh - 0.004, 0.010, GLASS_T - 0.008, 0), M.aluDeep,
        `spacer_${j}_${i}`, [cx, cy, zGlass]));
    }
  }
  root.add(infill);

  /* ---- operable awning insert: top-hung, projects outward (−Z) ---- */
  let awPivot = null, stayL = null, stayR = null;
  if (awningOn) {
    const cx = (xs[AW_COL] + xs[AW_COL + 1]) / 2;
    const top = ys[AW_ROW + 1] - MUL_FACE / 2 - 0.004;
    const sw = gw, sh = gh;
    const SASH_FACE = 0.058, SASH_D = 0.062;

    awPivot = new THREE.Group();
    awPivot.name = 'sash_pivot';
    awPivot.position.set(cx, top, GLASS_T / 2 - 0.010);
    root.add(awPivot);

    const sash = new THREE.Group(); sash.name = 'sash';
    sash.position.y = -sh / 2;
    awPivot.add(sash);
    sash.add(mesh(ringGeo(sw, sh, SASH_FACE, SASH_D), M.alu, 'sash_frame'));
    sash.add(mesh(new THREE.BoxGeometry(sw - SASH_FACE * 2 + 0.012, sh - SASH_FACE * 2 + 0.012, GLASS_T),
      M.glass, 'sash_glass', [0, 0, -0.006]));
    sash.add(mesh(ringGeo(sw - SASH_FACE * 2 + 0.020, sh - SASH_FACE * 2 + 0.020, 0.012, 0.010, 0),
      M.gasket, 'sash_gasket', [0, 0, -SASH_D / 2 + 0.006]));
    /* hinge barrels at the head */
    [-1, 1].forEach((s, k) => {
      const hg = new THREE.CylinderGeometry(0.012, 0.012, 0.10, 12);
      hg.rotateZ(Math.PI / 2);
      sash.add(mesh(hg, M.steel, 'hinge_' + k, [s * sw * 0.28, sh / 2 - 0.012, -0.030]));
    });
    /* handle on the interior face, bottom rail */
    const hb = new THREE.BoxGeometry(0.150, 0.026, 0.024);
    sash.add(mesh(hb, M.hardware, 'handle', [0, -sh / 2 + 0.055, SASH_D / 2 + 0.010]));

    /* side stay arms: frame jamb → sash stile, visibly scissor open */
    const stayGeo = new THREE.BoxGeometry(0.016, 0.34, 0.010);
    stayL = new THREE.Group(); stayL.name = 'stay_arm_l';
    stayR = new THREE.Group(); stayR.name = 'stay_arm_r';
    [[stayL, -1], [stayR, 1]].forEach(([g, s]) => {
      g.position.set(cx + s * (sw / 2 - 0.030), top - 0.30, GLASS_T / 2 - 0.004);
      const a = mesh(stayGeo, M.steel, 'stay_arm_blade', [0, -0.17, 0]);
      g.add(a);
      root.add(g);
    });
  }

  /* ---- perimeter: head flashing, base sill, storey floor-line markers ---- */
  root.add(mesh(new THREE.BoxGeometry(W + 0.06, 0.055, MUL_DEPTH + 0.06), M.aluDeep, 'head',
    [0, H / 2 + 0.028, zBack - 0.02]));
  const sill = mesh(new THREE.BoxGeometry(W + 0.06, 0.048, MUL_DEPTH + 0.10), M.aluDeep, 'sill',
    [0, -H / 2 - 0.024, zBack - 0.03]);
  root.add(sill);

  const slabs = new THREE.Group(); slabs.name = 'slab_edges';
  slabs.visible = !!opts.slabs;
  for (let j = 1; j < STOREYS; j++) {
    slabs.add(mesh(new THREE.BoxGeometry(W - 0.02, 0.26, 1.10), M.spandrel, 'slab_' + j,
      [0, ys[j], zBack + MUL_DEPTH / 2 + 0.55]));
  }
  root.add(slabs);

  /* ---- optional 1.75 m scale figure at grade, interior side ---- */
  const fig = new THREE.Group(); fig.name = 'scale_figure';
  fig.visible = !!opts.figure;
  const body = mesh(new THREE.CapsuleGeometry(0.16, 1.10, 6, 14), M.scaleFig, 'figure_body', [0, 0.86, 0]);
  const head = mesh(new THREE.SphereGeometry(0.115, 18, 14), M.scaleFig, 'figure_head', [0, 1.63, 0]);
  fig.add(body, head);
  fig.position.set(-W / 2 + BW * 0.5, -H / 2, zBack + 0.75);
  root.add(fig);

  root.position.y = H / 2;

  const turntable = new THREE.Group();
  turntable.name = 'turntable';
  turntable.add(root);

  const MAX_DEG = 26;
  function setOpen(t) {
    if (!awPivot) return;
    const k = Math.min(1, Math.max(0, t));
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   // ease-in-out
    awPivot.rotation.x = THREE.MathUtils.degToRad(MAX_DEG * e);
    [stayL, stayR].forEach(g => {
      if (!g) return;
      g.rotation.x = THREE.MathUtils.degToRad(MAX_DEG * e * 0.72);
    });
  }
  function setYaw(deg) { turntable.rotation.y = THREE.MathUtils.degToRad(deg); }
  function setSlabs(on) { slabs.visible = !!on; }
  function setFigure(on) { fig.visible = !!on; }

  setOpen(0);

  return {
    group: turntable,
    unit: root,
    setOpen, setYaw, setSlabs, setFigure,
    hasAwning: awningOn,
    size: { w: W, h: H, d: MUL_DEPTH + GLASS_T },
    config: {
      id: 'curtain_wall_stick',
      grid: `${BAYS} bays × ${STOREYS} storeys`,
      bay_mm: Math.round(BW * 1000),
      storey_mm: Math.round(SH * 1000),
      overall_mm: `${Math.round(W * 1000)} × ${Math.round(H * 1000)}`,
      sightline_mm: Math.round(MUL_FACE * 1000),
      mullion_depth_mm: Math.round(MUL_DEPTH * 1000),
      glazing: '28 mm IGU, captured pressure plate + cap',
      infill: spandrelOn ? 'vision + spandrel band at floor line' : 'full vision',
      operable: awningOn ? 'awning insert · centre bay, middle storey' : false,
      motion: awningOn ? `open 0→1, top-hung, ${MAX_DEG}° max projection` : 'none',
      presentation: 'turntable_360',
    },
  };
}
