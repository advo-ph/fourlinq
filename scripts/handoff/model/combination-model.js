import * as THREE from 'three';
import { makeCladMaterials } from './fixed-model.js';

/* ---------- shared primitives (same profile language as fixed-model) ---------- */

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

const D = 0.092;          // frame depth
const CLAD_D = 0.034;
const FACE_EXT = 0.036;
const FACE_INT = 0.058;

/**
 * One glazed panel, centred on its own origin, plane = XY, exterior = −Z.
 * Fixed / direct-glazed for v1; `sash: true` adds a casement sash + lever for later.
 */
function buildPanel(M, w, h, name, sash) {
  const g = new THREE.Group();
  g.name = name;
  const zExt = -D / 2 + CLAD_D / 2;

  g.add(mesh(ringGeo(w, h, FACE_EXT, CLAD_D), M.alu, name + '_clad_ext', [0, 0, zExt]));
  g.add(mesh(ringGeo(w + 0.006, h + 0.006, 0.010, 0.012, 0), M.aluDark, name + '_clad_nose',
    [0, 0, -D / 2 + 0.006]));

  const woodD = D - CLAD_D;
  g.add(mesh(ringGeo(w - 0.004, h - 0.004, FACE_INT, woodD), M.wood, name + '_liner_int',
    [0, 0, -D / 2 + CLAD_D + woodD / 2]));
  g.add(mesh(ringGeo(w - FACE_INT * 2 + 0.016, h - FACE_INT * 2 + 0.016, 0.020, 0.014), M.woodDeep,
    name + '_stop_int', [0, 0, D / 2 - 0.007]));

  const gw = w - FACE_EXT * 2 + 0.014;
  const gh = h - FACE_EXT * 2 + 0.014;
  const gt = 0.026;
  const zg = -D / 2 + CLAD_D + gt / 2 - 0.004;
  g.add(mesh(new THREE.BoxGeometry(gw, gh, gt), M.glass, name + '_glass', [0, 0, zg]));
  g.add(mesh(ringGeo(gw + 0.010, gh + 0.010, 0.012, 0.010, 0), M.gasket, name + '_gasket_ext',
    [0, 0, zg - gt / 2 - 0.004]));
  g.add(mesh(ringGeo(gw + 0.010, gh + 0.010, 0.012, 0.010, 0), M.gasket, name + '_gasket_int',
    [0, 0, zg + gt / 2 + 0.004]));
  g.add(mesh(ringGeo(gw - 0.004, gh - 0.004, 0.009, gt - 0.008, 0), M.aluDark, name + '_igu_spacer',
    [0, 0, zg]));

  if (sash) {
    const sw = gw + 0.030, sh = gh + 0.030;
    g.add(mesh(ringGeo(sw, sh, 0.058, 0.050), M.alu, name + '_sash', [0, 0, -D / 2 + 0.050 / 2 + 0.004]));
    const lev = mesh(new THREE.BoxGeometry(0.016, 0.092, 0.018), M.hardware, name + '_lever',
      [sw / 2 - 0.05, -0.04, D / 2 - 0.006]);
    g.add(lev);
  }
  return g;
}

/* Horizontal board (seat / head) from a plan polygon, thickness up from y = 0. */
function boardFromPlan(pts, thickness, mat, name) {
  const s = new THREE.Shape();
  pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2);
  return mesh(g, mat, name);
}

/* ---------- plan layouts ---------- */

export const COMBO_VARIANTS = {
  bay:    { label: 'Bay — 3 panel' },
  bow:    { label: 'Bow — arc' },
  corner: { label: 'Corner — 90°' },
};

/**
 * Returns { panels:[{w, x, z, ry, role}], walk:[[x,z]…], openingW, projection }
 * walk = the run of panel centre-lines in plan, wall line at z = 0, projection to −Z.
 */
function layout(variant, o) {
  if (variant === 'corner') {
    const wA = o.legA, wB = o.legB, post = o.joint === 'butt' ? 0.026 : 0.072;
    const half = post / 2;
    return {
      panels: [
        { w: wA, x: -(half + wA / 2), z: 0, ry: 0, role: 'leg_a' },
        { w: wB, x: 0, z: half + wB / 2, ry: -Math.PI / 2, role: 'leg_b' },
      ],
      walk: [[-half - wA, 0], [0, 0], [0, half + wB]],
      openingW: wA + post, projection: wB + post,
    };
  }

  const n = variant === 'bow' ? o.facets : 3;
  const step = variant === 'bow'
    ? THREE.MathUtils.degToRad(o.facets === 5 ? 15 : 18)
    : THREE.MathUtils.degToRad(o.angleDeg);

  // per-facet plan angle: bay = [−a, 0, +a]; bow = evenly stepped across the arc
  const widths = [], angles = [];
  if (variant === 'bay') {
    widths.push(o.sideW, o.frontW, o.sideW);
    angles.push(-step, 0, step);
  } else {
    for (let i = 0; i < n; i++) {
      widths.push(o.facetW);
      angles.push((i - (n - 1) / 2) * step);
    }
  }

  const walk = [[0, 0]];
  let x = 0, z = 0;
  const panels = [];
  for (let i = 0; i < widths.length; i++) {
    const a = angles[i], w = widths[i];
    const dx = Math.cos(a) * w, dz = Math.sin(a) * w;
    panels.push({ w, x: x + dx / 2, z: z + dz / 2, ry: -a, role: 'facet_' + (i + 1) });
    x += dx; z += dz;
    walk.push([x, z]);
  }
  const totalW = x;
  walk.forEach(p => (p[0] -= totalW / 2));
  panels.forEach(p => (p.x -= totalW / 2));
  const projection = -Math.min(...walk.map(p => p[1]));
  return { panels, walk, openingW: totalW, projection };
}

/**
 * buildCombination({ variant, angleDeg, facets, joint, seatBoard, sashSides })
 *   variant   'bay' | 'bow' | 'corner'
 *   angleDeg  30 | 45           (bay side splay off the wall)
 *   facets    4 | 5             (bow)
 *   joint     'post' | 'butt'   (corner)
 * Metres, y-up, base of the glazed panels at y = 0, wall plane at z = 0.
 */
export function buildCombination(opts = {}) {
  const variant = COMBO_VARIANTS[opts.variant] ? opts.variant : 'bay';
  const M = opts.materials || makeCladMaterials();
  const H = opts.height || 1.40;
  const seatBoard = variant !== 'corner' && opts.seatBoard !== false;

  const cfg = {
    angleDeg: opts.angleDeg === 45 ? 45 : 30,
    facets: opts.facets === 4 ? 4 : 5,
    joint: opts.joint === 'butt' ? 'butt' : 'post',
    frontW: 1.20, sideW: 0.70, facetW: 0.62, legA: 1.10, legB: 1.10,
  };

  const L = layout(variant, cfg);
  const root = new THREE.Group();
  root.name = 'combination_' + variant;

  L.panels.forEach((p, i) => {
    const sash = !!opts.sashSides && variant === 'bay' && i !== 1;
    const g = buildPanel(M, p.w, H, 'panel_' + (i + 1), sash);
    g.position.set(p.x, H / 2, p.z);
    g.rotation.y = p.ry;
    root.add(g);
  });

  /* mullion / corner post at every plan joint */
  if (variant === 'corner') {
    const post = cfg.joint === 'butt' ? 0.026 : 0.072;
    const mat = cfg.joint === 'butt' ? M.gasket : M.alu;
    const pst = mesh(new THREE.BoxGeometry(post, H, post), mat, 'corner_post', [-post / 2, H / 2, post / 2]);
    root.add(pst);
    if (cfg.joint === 'post') {
      root.add(mesh(new THREE.BoxGeometry(post - 0.026, H - 0.02, post - 0.026), M.wood,
        'corner_post_liner_int', [-post / 2 + 0.014, H / 2, post / 2 + 0.014]));
    }
  } else {
    for (let i = 1; i < L.walk.length - 1; i++) {
      const [x, z] = L.walk[i];
      const a0 = L.panels[i - 1].ry, a1 = L.panels[i].ry;
      const m = mesh(new THREE.BoxGeometry(0.060, H, D * 0.92), M.alu, 'mullion_' + i,
        [x, H / 2, z - 0.004]);
      m.rotation.y = (a0 + a1) / 2;
      root.add(m);
    }
  }

  /* head + seat boards close the projecting box (bay / bow only) */
  if (variant !== 'corner') {
    const poly = L.walk.map(p => [p[0], p[1]]);
    poly.push([L.walk[L.walk.length - 1][0], 0.10], [L.walk[0][0], 0.10]);
    const head = boardFromPlan(poly, 0.040, M.wood, 'head_board');
    head.position.y = H;
    root.add(head);
    const seat = boardFromPlan(poly, 0.038, M.wood, 'seat_board');
    seat.position.y = -0.038;
    seat.visible = seatBoard;
    root.add(seat);
    const nose = boardFromPlan(poly.map(([x, z]) => [x * 1.012, z - 0.012]), 0.016, M.woodDeep, 'seat_nosing');
    nose.position.y = -0.052;
    nose.visible = seatBoard;
    root.add(nose);
    root.userData.seat = [seat, nose];
  }

  /* exterior sill / drip under each panel */
  L.panels.forEach((p, i) => {
    const s = mesh(new THREE.BoxGeometry(p.w + 0.02, 0.014, CLAD_D + 0.026), M.alu, 'sill_' + (i + 1),
      [p.x, -0.006, p.z]);
    s.rotation.y = p.ry;
    s.translateZ(-D / 2 + CLAD_D / 2 - 0.008);
    s.rotateX(-0.07);
    root.add(s);
  });

  const turntable = new THREE.Group();
  turntable.name = 'turntable';
  turntable.add(root);

  function setSeat(on) { (root.userData.seat || []).forEach(m => (m.visible = !!on)); }
  function setYaw(deg) { turntable.rotation.y = THREE.MathUtils.degToRad(deg); }

  const plan = {
    variant,
    walk: L.walk,
    panels: L.panels.map(p => ({ w: p.w, x: p.x, z: p.z, ry: p.ry })),
    openingW: L.openingW,
    projection: L.projection,
    angleDeg: variant === 'bay' ? cfg.angleDeg : (variant === 'bow' ? (cfg.facets === 5 ? 15 : 18) : 90),
    height: H,
  };

  return {
    group: turntable,
    unit: root,
    setSeat, setYaw, plan,
    config: {
      id: 'combination_' + variant,
      motion: 'none',
      operable: false,
      assembly: variant,
      panels: L.panels.length,
      plan_angle_deg: plan.angleDeg,
      corner_joint: variant === 'corner' ? cfg.joint : null,
      seat_board: variant === 'corner' ? null : seatBoard,
      opening_mm: Math.round(L.openingW * 1000),
      projection_mm: Math.round(L.projection * 1000),
      height_mm: Math.round(H * 1000),
    },
  };
}
