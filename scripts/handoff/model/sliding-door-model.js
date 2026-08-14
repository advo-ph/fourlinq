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

/* Rounded-end slim plate, extruded in Z (stadium profile). */
function stadiumGeo(w, h, depth) {
  const r = w / 2, straight = h / 2 - r;
  const s = new THREE.Shape();
  s.moveTo(-r, -straight);
  s.absarc(0, -straight, r, Math.PI, 0, true);
  s.lineTo(r, straight);
  s.absarc(0, straight, r, 0, Math.PI, true);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: depth - 0.0016, bevelEnabled: true, bevelThickness: 0.0008,
    bevelSize: 0.0012, bevelSegments: 2, curveSegments: 12,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/**
 * Cambridge-style interior pull: slim rounded-end backplate, keyed cylinder set
 * into the plate, and a shallow tapered D grip that bows off the face by roughly
 * a third of its length and returns flush at both ends.
 */
function buildDPull(M, name) {
  const g = new THREE.Group();
  g.name = name;

  const PLATE_W = 0.046, PLATE_H = 0.360, PLATE_D = 0.012;
  const plate = mesh(stadiumGeo(PLATE_W, PLATE_H, PLATE_D), M.steel, name + '_backplate', [0, 0, PLATE_D / 2]);
  g.add(plate);

  /* grip: half-torus flattened in Z so projection ≈ 1/3 of the grip length */
  const GRIP_R = 0.100, TUBE = 0.0135, PROJ = 0.066;
  const GRIP_Y = -0.010;
  const arc = mesh(new THREE.TorusGeometry(GRIP_R, TUBE, 16, 40, Math.PI), M.steel, name + '_grip', [0, GRIP_Y, PLATE_D]);
  arc.rotation.z = -Math.PI / 2;
  arc.rotation.y = -Math.PI / 2;
  arc.scale.y = PROJ / GRIP_R;   // torus bows along its LOCAL +Y — scale acts pre-rotation (T·R·S)
  g.add(arc);

  /* thickened returns where the grip meets the plate */
  [-1, 1].forEach((s, i) => {
    const foot = mesh(new THREE.CylinderGeometry(TUBE + 0.002, TUBE + 0.006, 0.012, 24), M.steel,
      name + '_grip_return_' + (i + 1), [0, GRIP_Y + s * GRIP_R, PLATE_D + 0.004]);
    foot.rotation.x = Math.PI / 2;
    g.add(foot);
  });

  /* keyed cylinder in an oval boss, set into the plate above the grip */
  const boss = mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.007, 28), M.steel, name + '_cylinder_boss',
    [0, 0.145, PLATE_D + 0.0025]);
  boss.rotation.x = Math.PI / 2;
  boss.scale.y = 1.35;
  g.add(boss);
  const cyl = mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.005, 24), M.hardware, name + '_lock_cylinder',
    [0, 0.145, PLATE_D + 0.006]);
  cyl.rotation.x = Math.PI / 2;
  g.add(cyl);
  const keyway = mesh(new THREE.BoxGeometry(0.0035, 0.012, 0.002), M.hardware, name + '_keyway',
    [0, 0.145, PLATE_D + 0.0085]);
  g.add(keyway);

  /* Hook-bolt lever below the grip. The plate, grip and keyed cylinder are all
     fixed — a D-pull is a grip, not a mechanism, and the key does not turn when
     you simply slide the door. The lever is the part that does move: a quarter
     turn retracts the hook bolt from the jamb keep before the leaf can travel.
     Its arm is offset from the pivot on purpose, so the rotation is legible;
     a boss spinning about its own axis of symmetry reads as static. */
  const lever = new THREE.Group();
  lever.name = name + '_lever';
  lever.position.set(0, -0.140, PLATE_D + 0.004);
  lever.add(mesh(new THREE.BoxGeometry(0.013, 0.060, 0.012), M.steel, name + '_lever_arm', [0, 0.028, 0]));
  const pin = mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.014, 18), M.steel, name + '_lever_boss', [0, 0, 0]);
  pin.rotation.x = Math.PI / 2;
  lever.add(pin);
  g.add(lever);

  return g;
}

/**
 * buildSlidingDoor({ panels: 2 | 3, width, height, openRatio })
 *
 * Full-height sliding patio door. Metres, y-up, interior = +Z.
 *  · 2-panel (XO): left fixed on the exterior plane, right panel operable on the interior plane.
 *  · 3-panel (OXO): outer panels fixed exterior, centre panel operable interior.
 * The operable panel always rides the interior plane, so the slim interlock overlap
 * reads correctly at every point of travel.
 */
export function buildSlidingDoor(opts = {}) {
  const M = opts.materials || makeMaterials();
  const PANELS = opts.panels === 3 ? 3 : 2;
  const OPEN_RATIO = opts.openRatio ?? 0.5;

  const W = Math.min(3.0, Math.max(2.4, opts.width ?? 2.6));   // overall width, 2400–3000 mm
  const H = opts.height ?? 2.40;                                // overall height
  const D = 0.148;                                              // frame depth — twin track
  const FACE = 0.072;                                           // frame face width
  const OVERLAP = 0.028;                                        // slim interlock, closed (28 mm)
  const PANEL_D = 0.048;                                        // panel sightline depth
  const PANEL_FACE = 0.092;                                     // stile / rail face
  const BOTTOM_RAIL = 0.132;                                    // deeper bottom rail

  const root = new THREE.Group();
  root.name = PANELS === 3 ? 'sliding_door_oxo' : 'sliding_door_xo';

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;
  const zExt = -0.032, zInt = 0.032;                             // panel planes

  /* ---- outer frame ---- */
  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  /* ---- low-profile threshold + twin floor track ---- */
  const track = new THREE.Group();
  track.name = 'track';
  const sillY = -openH / 2 - 0.009;
  track.add(mesh(new THREE.BoxGeometry(W - 0.004, 0.022, D - 0.010), M.upvcInner, 'threshold_plate', [0, sillY, 0]));
  track.add(mesh(new THREE.BoxGeometry(W + 0.026, 0.010, D + 0.030), M.upvc, 'threshold_nose', [0, sillY - 0.014, 0]));
  [[zExt, 'track_rail_outer'], [zInt, 'track_rail_inner']].forEach(([z, n]) => {
    track.add(mesh(new THREE.BoxGeometry(openW + 0.030, 0.014, 0.036), M.upvcInner, n + '_channel', [0, sillY + 0.010, z]));
    track.add(mesh(new THREE.BoxGeometry(openW + 0.030, 0.009, 0.014), M.steel, n, [0, sillY + 0.019, z]));
  });
  /* head guide — mirrors the track, keeps the panel head captive */
  const headY = openH / 2 + 0.008;
  [[zExt, 'head_guide_outer'], [zInt, 'head_guide_inner']].forEach(([z, n]) => {
    track.add(mesh(new THREE.BoxGeometry(openW + 0.030, 0.022, 0.038), M.upvcInner, n, [0, headY - 0.006, z]));
  });
  root.add(track);

  /* ---- panels ---- */
  const panelW = (openW + OVERLAP * (PANELS - 1)) / PANELS;
  const panelH = openH - 0.008;

  function buildPanel(name, z) {
    const g = new THREE.Group();
    g.name = name + '_carrier';
    g.position.z = z;
    g.add(mesh(ringGeo(panelW, panelH, PANEL_FACE, PANEL_D), M.upvc, name));
    /* deeper bottom rail sits inside the ring's lower face */
    g.add(mesh(new THREE.BoxGeometry(panelW - 0.004, BOTTOM_RAIL, PANEL_D - 0.004), M.upvc, name + '_bottom_rail',
      [0, -panelH / 2 + BOTTOM_RAIL / 2, 0]));

    const gw = panelW - PANEL_FACE * 2 + 0.024;
    const gh = panelH - BOTTOM_RAIL - PANEL_FACE + 0.024;
    const gy = (BOTTOM_RAIL - PANEL_FACE) / 2;
    g.add(mesh(new THREE.BoxGeometry(gw, gh, 0.008), M.glass, name.replace('panel', 'glass'), [0, gy, -0.005]));
    g.add(mesh(ringGeo(gw + 0.010, gh + 0.010, 0.016, 0.014), M.upvcInner, name + '_bead', [0, gy, 0.014]));
    g.add(mesh(ringGeo(panelW + 0.006, panelH + 0.006, 0.014, 0.009, 0), M.gasket, name + '_weatherstrip',
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
    operable.position.x = closedX;
    root.add(operable);

    root.add(mesh(new THREE.BoxGeometry(0.012, panelH - 0.012, 0.030), M.upvcInner, 'meeting_interlock',
      [f.position.x + panelW / 2 - 0.006, 0, zExt + 0.034]));
  } else {
    const l = buildPanel('panel_fixed_left', zExt);
    l.position.x = -openW / 2 + panelW / 2;
    root.add(l); fixedPanels.push(l);

    const r = buildPanel('panel_fixed_right', zExt);
    r.position.x = openW / 2 - panelW / 2;
    root.add(r); fixedPanels.push(r);

    operable = buildPanel('panel_operable', zInt);
    closedX = 0;
    operable.position.x = closedX;
    root.add(operable);

    [[l.position.x + panelW / 2 - 0.006, 'meeting_interlock_left'],
     [r.position.x - panelW / 2 + 0.006, 'meeting_interlock_right']].forEach(([x, n]) => {
      root.add(mesh(new THREE.BoxGeometry(0.012, panelH - 0.012, 0.030), M.upvcInner, n, [x, 0, zExt + 0.034]));
    });
  }

  /* interior D-pull on the operable panel's leading (right) stile */
  const handle = buildDPull(M, 'handle');
  handle.position.set(panelW / 2 - PANEL_FACE / 2, -0.10, PANEL_D / 2 + 0.002);
  operable.add(handle);

  /* rollers under the operable panel, riding the interior rail */
  [-1, 1].forEach((s, i) => {
    const r = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.011, 20), M.steel, 'roller_' + (i + 1),
      [s * (panelW / 2 - 0.085), -panelH / 2 - 0.012, 0]);
    r.rotation.z = Math.PI / 2;
    operable.add(r);
  });

  root.position.y = H / 2 + 0.012;

  const maxTravel = panelW - OVERLAP - 0.010;
  const travel = Math.min(OPEN_RATIO * openW, maxTravel);
  const dir = PANELS === 3 ? 1 : -1;   // OXO centre slides right; XO right panel slides left
  /* Quarter turn to retract the hook bolt, completed inside the first 15% of
     the sweep — the same lead-in the hinged builders give their handles. */
  const lever = handle.getObjectByName('handle_lever');
  const LEVER_TURN = Math.PI / 2;

  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const eased = c * c * (3 - 2 * c);
    operable.position.x = closedX + dir * eased * travel;
    if (lever) lever.rotation.z = dir * Math.min(1, c / 0.15) * LEVER_TURN;
  }
  setOpen(0);

  return {
    group: root, setOpen, operable, fixedPanels, closedX, travel, dir,
    dims: { W, H, D, openW, openH, panelW, panelH, overlap: OVERLAP, clearOpen: travel, panels: PANELS },
    config: { id: 'sliding-door', motion: 'translate_x', open_ratio: OPEN_RATIO, panel_count: PANELS },
  };
}
