import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* ---------------------------------------------------------------
   FourlinQ · fixed-geometry specialty shapes
   Arch / round-top · triangle gable · hexagon + trapezoid
   No operating hardware. Continuous frame profile, constant depth.
   Metres, y-up, base at y = 0. Interior = +Z, exterior = −Z.
----------------------------------------------------------------*/

const D = 0.084;     // frame profile depth (constant across all shapes)
const FACE = 0.062;  // frame face width (sight-line inset)

/* ---- geometry helpers ---- */

/* Inward offset of a convex CCW polygon by d (line-offset + intersect: keeps miters clean) */
function insetPoly(pts, d) {
  if (d === 0) return pts.map(p => [p[0], p[1]]);
  const n = pts.length, out = [];
  const off = (a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L;                       // inward normal for CCW winding
    return [a[0] + nx * d, a[1] + ny * d, dx, dy];
  };
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const A = off(p0, p1), B = off(p1, p2);
    const den = A[2] * B[3] - A[3] * B[2];
    if (Math.abs(den) < 1e-9) { out.push([A[0], A[1]]); continue; }
    const t = ((B[0] - A[0]) * B[3] - (B[1] - A[1]) * B[2]) / den;
    out.push([A[0] + A[2] * t, A[1] + A[3] * t]);
  }
  return out;
}

function archPts(W, H, inset, seg = 96) {
  const R = W / 2 - inset, springY = H - W / 2, hw = W / 2 - inset, y0 = inset;
  const pts = [[-hw, y0], [hw, y0], [hw, springY]];
  for (let i = 1; i < seg; i++) {
    const a = (i / seg) * Math.PI;
    pts.push([Math.cos(a) * R, springY + Math.sin(a) * R]);
  }
  pts.push([-hw, springY]);
  return pts;
}

function shapeFrom(pts, holePts) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  if (holePts) {
    const h = new THREE.Path();
    const r = holePts.slice().reverse();
    h.moveTo(r[0][0], r[0][1]);
    for (let i = 1; i < r.length; i++) h.lineTo(r[i][0], r[i][1]);
    h.closePath();
    s.holes.push(h);
  }
  return s;
}

function extrude(shape, depth, bevel = 0.0015) {
  const g = new THREE.ExtrudeGeometry(shape, {
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

/* ---- shape catalogue ---- */

export const SHAPES = {
  arch: {
    id: 'special-shapes-arch',
    label: 'Arch / round-top',
    variants: {
      tall: { W: 1.00, H: 1.90, note: '1000 × 1900 mm · full round-top over rectangular lite' },
      compact: { W: 1.20, H: 1.05, note: '1200 × 1050 mm · segmental head, wide' },
    },
  },
  triangle: {
    id: 'special-shapes-triangle',
    label: 'Triangle gable',
    variants: {
      isosceles: { W: 1.60, pitch: 35, note: '1600 mm base · isosceles gable, 35° pitch' },
      right: { W: 1.40, pitch: 30, right: true, note: '1400 mm base · right rake, 30° pitch' },
    },
  },
  hex: {
    id: 'special-shapes-hex',
    label: 'Hexagon / trapezoid',
    variants: {
      hexagon: { W: 1.10, H: 1.10, note: '1100 × 1100 mm · flat-top hexagon' },
      trapezoid: { W: 1.40, H: 0.90, note: '1400 × 900 mm · symmetrical trapezoid' },
    },
  },
};

function outlineFor(shape, variant) {
  const v = SHAPES[shape].variants[variant];
  if (shape === 'arch') {
    const H = Math.max(v.H, v.W / 2 + 0.12);
    return { kind: 'arch', W: v.W, H, springY: H - v.W / 2, bottomW: v.W, note: v.note };
  }
  if (shape === 'triangle') {
    const W = v.W, H = Math.tan(THREE.MathUtils.degToRad(v.pitch)) * (v.right ? W : W / 2);
    const apex = v.right ? [W / 2, H] : [0, H];
    return {
      kind: 'poly', W, H, bottomW: W, note: v.note,
      pts: [[-W / 2, 0], [W / 2, 0], apex],
    };
  }
  const W = v.W, H = v.H;
  if (variant === 'hexagon') {
    const a = W * 0.27;
    return {
      kind: 'poly', W, H, bottomW: W - 2 * a, note: v.note,
      pts: [[-W / 2 + a, 0], [W / 2 - a, 0], [W / 2, H * 0.5], [W / 2 - a, H], [-W / 2 + a, H], [-W / 2, H * 0.5]],
    };
  }
  const t = W * 0.22;
  return {
    kind: 'poly', W, H, bottomW: W, note: v.note,
    pts: [[-W / 2, 0], [W / 2, 0], [W / 2 - t, H], [-W / 2 + t, H]],
  };
}

function outlinePts(o, inset) {
  return o.kind === 'arch' ? archPts(o.W, o.H, inset) : insetPoly(o.pts, inset);
}

/**
 * buildSpecial({ shape:'arch'|'triangle'|'hex', variant, transom:boolean })
 * Fixed (non-operating) light. Returns { group, spin, setSpin(t), animNodes, size, config }.
 */
export function buildSpecial(opts = {}) {
  const shape = SHAPES[opts.shape] ? opts.shape : 'arch';
  const variant = SHAPES[shape].variants[opts.variant] ? opts.variant : Object.keys(SHAPES[shape].variants)[0];
  const M = opts.materials || makeMaterials();
  const o = outlineFor(shape, variant);
  const transom = shape === 'arch' && opts.transom !== false;

  const root = new THREE.Group();
  root.name = `special_${shape}_${variant}`;
  const spin = new THREE.Group();
  spin.name = 'turntable';
  root.add(spin);

  const outer = outlinePts(o, 0);
  const sight = outlinePts(o, FACE);

  /* continuous outer frame — one profile, mitred/curved to follow the outline */
  spin.add(mesh(extrude(shapeFrom(outer, sight), D), M.upvc, 'frame'));

  /* exterior glazing rebate + interior bead, both following the same outline */
  spin.add(mesh(extrude(shapeFrom(outlinePts(o, FACE - 0.005), outlinePts(o, FACE + 0.020)), 0.016, 0.001),
    M.upvcInner, 'glazing_rebate', [0, 0, -0.020]));
  spin.add(mesh(extrude(shapeFrom(outlinePts(o, FACE - 0.005), outlinePts(o, FACE + 0.016)), 0.014, 0.001),
    M.upvcInner, 'glazing_bead', [0, 0, 0.016]));
  spin.add(mesh(extrude(shapeFrom(outlinePts(o, FACE - 0.002), outlinePts(o, FACE + 0.008)), 0.006, 0),
    M.gasket, 'gasket_int', [0, 0, 0.009]));
  spin.add(mesh(extrude(shapeFrom(outlinePts(o, FACE - 0.002), outlinePts(o, FACE + 0.008)), 0.006, 0),
    M.gasket, 'gasket_ext', [0, 0, -0.011]));

  /* sill nose on the horizontal bottom edge */
  const sill = mesh(new THREE.BoxGeometry(o.bottomW + 0.030, 0.016, D + 0.030), M.upvc, 'frame_sill_nose',
    [0, -0.006, -0.008]);
  sill.rotation.x = -0.06;
  spin.add(sill);

  /* ---- glazing ---- */
  const GT = 0.024, GZ = -0.004;
  if (o.kind === 'arch' && transom) {
    const bar = 0.056, hw = o.W / 2 - FACE + 0.010;
    const lowTop = o.springY - bar / 2, lowBot = FACE - 0.010;
    spin.add(mesh(new THREE.BoxGeometry(hw * 2, lowTop - lowBot, GT), M.glass, 'glass_lower',
      [0, (lowTop + lowBot) / 2, GZ]));

    const r = hw, a0 = Math.asin(Math.min(0.95, (bar / 2) / r));
    const pts = [];
    const seg = 72;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI - 2 * a0);
      pts.push([Math.cos(a) * r, o.springY + Math.sin(a) * r]);
    }
    spin.add(mesh(extrude(shapeFrom(pts), GT, 0), M.glass, 'glass_upper', [0, 0, GZ]));

    spin.add(mesh(new THREE.BoxGeometry(hw * 2 + 0.004, bar, D - 0.014), M.upvc, 'transom_bar',
      [0, o.springY, -0.004]));
    spin.add(mesh(new THREE.BoxGeometry(hw * 2 + 0.004, bar + 0.020, 0.014), M.upvcInner,
      'transom_bead', [0, o.springY, 0.016]));
  } else {
    spin.add(mesh(extrude(shapeFrom(outlinePts(o, FACE - 0.010)), GT, 0), M.glass, 'glass', [0, 0, GZ]));
  }

  function setSpin(t) {
    spin.rotation.y = (Math.min(1, Math.max(0, t))) * Math.PI * 2;
  }
  setSpin(0);

  const config = {
    id: SHAPES[shape].id,
    motion: 'fixed',
    operable: false,
    hardware: 'none',
    turntable: { axis: 'Y', from_deg: 0, to_deg: 360, duration_s: 8 },
    profile: { depth_mm: Math.round(D * 1000), face_mm: Math.round(FACE * 1000), finish: 'upvc_white_matte' },
    size_mm: { width: Math.round(o.W * 1000), height: Math.round(o.H * 1000) },
  };

  return {
    group: root, spin, setSpin, animNodes: [spin],
    size: { W: o.W, H: o.H, note: o.note }, config,
  };
}
