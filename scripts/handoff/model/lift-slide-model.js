import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* Rectangular ring profile (frame / panel), extruded in Z, centred. */
function ringGeo(w, h, faceW, depth, bevel = 0.0018) {
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

/* Rounded-end slim plate (stadium), extruded in Z. */
function stadiumGeo(w, h, depth, seg = 12) {
  const r = w / 2, straight = Math.max(0.0001, h / 2 - r);
  const s = new THREE.Shape();
  s.moveTo(-r, -straight);
  s.absarc(0, -straight, r, Math.PI, 0, true);
  s.lineTo(r, straight);
  s.absarc(0, straight, r, 0, Math.PI, true);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: depth - 0.0012, bevelEnabled: true, bevelThickness: 0.0006,
    bevelSize: 0.0009, bevelSegments: 2, curveSegments: seg,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/**
 * Flush-mount oval pull set into the stile face: escutcheon ring, sunken dish,
 * finger lip and two fixing screws. Sits proud by ~2 mm only.
 */
function buildFlushPull(M, name) {
  const g = new THREE.Group();
  g.name = name;
  const W = 0.052, H = 0.148;
  g.add(mesh(stadiumGeo(W, H, 0.006, 16), M.hardware, name + '_escutcheon', [0, 0, 0.003]));
  const dish = mesh(stadiumGeo(W - 0.014, H - 0.016, 0.010, 16), M.hardware, name + '_dish', [0, 0, -0.004]);
  g.add(dish);
  g.add(mesh(new THREE.BoxGeometry(W - 0.016, 0.010, 0.007), M.hardware, name + '_finger_lip', [0, -H / 2 + 0.026, -0.001]));
  [1, -1].forEach((s, i) => {
    const sc = mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.003, 16), M.hardware,
      name + '_screw_' + (i + 1), [0, s * (H / 2 - 0.011), 0.0045]);
    sc.rotation.x = Math.PI / 2;
    g.add(sc);
  });
  return g;
}

/**
 * Interior lift-and-slide lever: backplate + lever that swings 180° (down = lifted
 * / free to slide, up = dropped and sealed). Returns the pivot so the viewer can
 * drive it from the open clip.
 */
function buildLiftLever(M, name) {
  const g = new THREE.Group();
  g.name = name;
  const PLATE_W = 0.044, PLATE_H = 0.230, PLATE_D = 0.011;
  g.add(mesh(stadiumGeo(PLATE_W, PLATE_H, PLATE_D, 16), M.hardware, name + '_backplate', [0, 0, PLATE_D / 2]));

  const rose = mesh(new THREE.CylinderGeometry(0.0165, 0.0185, 0.016, 28), M.hardware, name + '_rosette',
    [0, 0.052, PLATE_D + 0.006]);
  rose.rotation.x = Math.PI / 2;
  g.add(rose);

  const pivot = new THREE.Group();
  pivot.name = name + '_lever_pivot';
  pivot.position.set(0, 0.052, PLATE_D + 0.016);
  const arm = mesh(new THREE.BoxGeometry(0.019, 0.128, 0.021), M.hardware, name + '_lever', [0, -0.068, 0]);
  pivot.add(arm);
  const tip = mesh(new THREE.SphereGeometry(0.0105, 20, 14), M.hardware, name + '_lever_tip', [0, -0.132, 0]);
  tip.scale.set(1, 1.45, 1.05);
  pivot.add(tip);
  g.add(pivot);

  const cyl = mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.006, 24), M.steel, name + '_lock_cylinder',
    [0, -0.078, PLATE_D + 0.003]);
  cyl.rotation.x = Math.PI / 2;
  g.add(cyl);
  g.add(mesh(new THREE.BoxGeometry(0.0035, 0.012, 0.002), M.steel, name + '_keyway', [0, -0.078, PLATE_D + 0.007]));

  return { group: g, pivot };
}

export const SILLS = {
  flush:    { label: 'Flush sill',            upstand: 0.002, recess: 0.062, drain: false },
  recessed: { label: 'Recessed drainage sill', upstand: 0.000, recess: 0.104, drain: true },
  flat:     { label: 'Flat sill',              upstand: 0.026, recess: 0.000, drain: false },
  half:     { label: 'Half sill',              upstand: 0.014, recess: 0.030, drain: true },
};

/**
 * buildLiftSlideDoor({ panels: 2 | 3, width, height, sill, openRatio })
 *
 * Lift-and-slide patio door. Metres, y-up, interior = +Z.
 *  · 2-panel (XO): left fixed on the exterior plane, right panel operable, interior plane.
 *  · 3-panel (OXO): outer panels fixed exterior, centre panel operable interior.
 * The `open` clip is two-phase in one timeline: 0.0–0.2 the operable panel lifts
 * 10 mm off its seals (lever swings 180°), 0.2–1.0 it slides.
 */
export function buildLiftSlideDoor(opts = {}) {
  const M = opts.materials || makeMaterials();
  const PANELS = opts.panels === 3 ? 3 : 2;
  const OPEN_RATIO = opts.openRatio ?? 0.5;
  const SILL = SILLS[opts.sill] ? opts.sill : 'flush';
  const sillSpec = SILLS[SILL];

  const W = Math.min(4.2, Math.max(2.6, opts.width ?? 3.2));
  const H = opts.height ?? 2.60;
  const D = 0.178;                 // deeper frame than a plain slider
  const FACE = 0.084;
  const OVERLAP = 0.034;
  const PANEL_D = 0.068;           // heavier panel section
  const PANEL_FACE = 0.104;
  const BOTTOM_RAIL = 0.176;       // beefy bottom rail carries the lift gear
  const LIFT = 0.010;              // 10 mm seal disengage

  const root = new THREE.Group();
  root.name = PANELS === 3 ? 'lift_and_slide_oxo' : 'lift_and_slide_xo';

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;
  const zExt = -0.042, zInt = 0.042;

  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  /* ---- sill + twin track ---------------------------------------------- */
  const sill = new THREE.Group();
  sill.name = 'sill';
  const sillY = -openH / 2 - 0.011;
  const up = sillSpec.upstand;

  sill.add(mesh(new THREE.BoxGeometry(W - 0.004, 0.026 + up, D - 0.012), M.upvcInner, 'sill_body',
    [0, sillY + up / 2, 0]));
  if (up > 0.004) {
    sill.add(mesh(new THREE.BoxGeometry(W + 0.020, 0.010, D + 0.024), M.upvc, 'sill_nose',
      [0, sillY - 0.016, 0]));
  }

  const track = new THREE.Group();
  track.name = 'track';
  [[zExt, 'track_rail_outer'], [zInt, 'track_rail_inner']].forEach(([z, n]) => {
    track.add(mesh(new THREE.BoxGeometry(openW + 0.034, 0.016, 0.044), M.upvcInner, n + '_channel',
      [0, sillY + up + 0.012, z]));
    track.add(mesh(new THREE.BoxGeometry(openW + 0.034, 0.011, 0.016), M.steel, n,
      [0, sillY + up + 0.023, z]));
  });
  sill.add(track);

  if (sillSpec.drain) {
    const dr = mesh(new THREE.BoxGeometry(openW + 0.020, 0.014, 0.030), M.gasket, 'sill_drainage_channel',
      [0, sillY + up + 0.006, (zExt + zInt) / 2 - 0.030]);
    sill.add(dr);
    for (let i = 0; i < 4; i++) {
      const x = (i / 3 - 0.5) * (openW * 0.72);
      sill.add(mesh(new THREE.BoxGeometry(0.028, 0.007, 0.012), M.gasket, 'sill_weep_' + (i + 1),
        [x, sillY + up + 0.001, zExt - 0.026]));
    }
  }
  if (sillSpec.recess > 0.0005) {
    sill.add(mesh(new THREE.BoxGeometry(W + 0.060, sillSpec.recess, D + 0.070), M.upvcInner, 'sill_recess_pan',
      [0, sillY - 0.013 - sillSpec.recess / 2, 0]));
  }
  root.add(sill);

  /* head guide */
  const headY = openH / 2 + 0.010;
  [[zExt, 'head_guide_outer'], [zInt, 'head_guide_inner']].forEach(([z, n]) => {
    root.add(mesh(new THREE.BoxGeometry(openW + 0.034, 0.026, 0.046), M.upvcInner, n, [0, headY - 0.008, z]));
  });

  /* ---- panels ---------------------------------------------------------- */
  const panelW = (openW + OVERLAP * (PANELS - 1)) / PANELS;
  const panelH = openH - 0.010 - LIFT;

  function buildPanel(name, z) {
    const g = new THREE.Group();
    g.name = name + '_carrier';
    g.position.z = z;
    g.add(mesh(ringGeo(panelW, panelH, PANEL_FACE, PANEL_D), M.upvc, name));
    g.add(mesh(new THREE.BoxGeometry(panelW - 0.004, BOTTOM_RAIL, PANEL_D - 0.004), M.upvc, name + '_bottom_rail',
      [0, -panelH / 2 + BOTTOM_RAIL / 2, 0]));

    const gw = panelW - PANEL_FACE * 2 + 0.026;
    const gh = panelH - BOTTOM_RAIL - PANEL_FACE + 0.026;
    const gy = (BOTTOM_RAIL - PANEL_FACE) / 2;
    g.add(mesh(new THREE.BoxGeometry(gw, gh, 0.024), M.glass, name.replace('panel', 'glass'), [0, gy, -0.008]));
    g.add(mesh(ringGeo(gw + 0.012, gh + 0.012, 0.018, 0.016), M.upvcInner, name + '_bead', [0, gy, 0.022]));
    g.add(mesh(ringGeo(panelW + 0.006, panelH + 0.006, 0.016, 0.010, 0), M.gasket, name + '_gasket',
      [0, 0, -PANEL_D / 2 - 0.002]));
    return g;
  }

  const fixedPanels = [];
  let operable = null, closedX = 0;

  if (PANELS === 2) {
    const f = buildPanel('panel_fixed', zExt);
    f.position.x = -openW / 2 + panelW / 2;
    root.add(f); fixedPanels.push(f);

    operable = buildPanel('panel_operable', zInt);
    closedX = openW / 2 - panelW / 2;
    root.add(operable);

    root.add(mesh(new THREE.BoxGeometry(0.014, panelH - 0.014, 0.038), M.upvcInner, 'meeting_interlock',
      [f.position.x + panelW / 2 - 0.007, 0, zExt + 0.046]));
  } else {
    const l = buildPanel('panel_fixed_left', zExt);
    l.position.x = -openW / 2 + panelW / 2;
    root.add(l); fixedPanels.push(l);

    const r = buildPanel('panel_fixed_right', zExt);
    r.position.x = openW / 2 - panelW / 2;
    root.add(r); fixedPanels.push(r);

    operable = buildPanel('panel_operable', zInt);
    closedX = 0;
    root.add(operable);

    [[l.position.x + panelW / 2 - 0.007, 'meeting_interlock_left'],
     [r.position.x - panelW / 2 + 0.007, 'meeting_interlock_right']].forEach(([x, n]) => {
      root.add(mesh(new THREE.BoxGeometry(0.014, panelH - 0.014, 0.038), M.upvcInner, n, [x, 0, zExt + 0.046]));
    });
  }

  const closedY = 0;
  operable.position.set(closedX, closedY, zInt);

  /* interior lift lever on the leading stile, flush pull on the exterior face */
  const leadX = panelW / 2 - PANEL_FACE / 2;
  const lever = buildLiftLever(M, 'handle');
  lever.group.position.set(leadX, -0.06, PANEL_D / 2 + 0.001);
  operable.add(lever.group);

  const flush = buildFlushPull(M, 'handle_flush_pull');
  flush.position.set(leadX, -0.06, -PANEL_D / 2 - 0.001);
  flush.rotation.y = Math.PI;
  operable.add(flush);

  /* lift carriages under the beefy bottom rail */
  [-1, 1].forEach((s, i) => {
    const c = new THREE.Group();
    c.name = 'carriage_' + (i + 1);
    c.position.set(s * (panelW / 2 - 0.115), -panelH / 2 - 0.011, 0);
    c.add(mesh(new THREE.BoxGeometry(0.098, 0.016, 0.032), M.steel, 'carriage_body_' + (i + 1)));
    [-0.030, 0.030].forEach((dx, j) => {
      const r = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.013, 20), M.steel,
        'roller_' + (i * 2 + j + 1), [dx, -0.012, 0]);
      r.rotation.z = Math.PI / 2;
      c.add(r);
    });
    operable.add(c);
  });

  root.position.y = H / 2 + 0.014 + sillSpec.recess;

  const maxTravel = panelW - OVERLAP - 0.012;
  const travel = Math.min(OPEN_RATIO * openW, maxTravel);
  const dir = PANELS === 3 ? 1 : -1;
  const LIFT_END = 0.2;
  const smooth = (v) => v * v * (3 - 2 * v);

  /** open clip: 0–0.2 lift, 0.2–1.0 slide. */
  function poseAt(t) {
    const c = Math.min(1, Math.max(0, t));
    const lp = smooth(Math.min(1, c / LIFT_END));
    const sp = smooth(Math.max(0, (c - LIFT_END) / (1 - LIFT_END)));
    return { x: closedX + dir * sp * travel, y: closedY + lp * LIFT, lever: lp * Math.PI };
  }

  function setOpen(t) {
    const p = poseAt(t);
    operable.position.x = p.x;
    operable.position.y = p.y;
    lever.pivot.rotation.z = -dir * p.lever;
  }
  setOpen(0);

  return {
    group: root, setOpen, poseAt, operable, leverPivot: lever.pivot, fixedPanels,
    closedX, closedY, travel, dir, lift: LIFT, liftEnd: LIFT_END,
    dims: {
      W, H, D, openW, openH, panelW, panelH, overlap: OVERLAP, clearOpen: travel,
      panels: PANELS, bottomRail: BOTTOM_RAIL, sill: SILL, sillLabel: sillSpec.label,
    },
    config: {
      id: 'lift-and-slide', motion: 'lift_then_translate_x', lift_mm: Math.round(LIFT * 1000),
      lift_phase: [0, LIFT_END], slide_phase: [LIFT_END, 1], open_ratio: OPEN_RATIO,
      panel_count: PANELS, sill: SILL,
    },
  };
}
