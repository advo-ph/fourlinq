import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* Rectangular ring profile (frame / sash), extruded in Z, centred. */
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

/* Recessed finger pull: pocket sunk into the stile + a lifted grip bar. */
function buildHandle(M, name) {
  const g = new THREE.Group();
  g.name = name;
  const PW = 0.040, PH = 0.150, PD = 0.014;
  const bezel = mesh(ringGeo(PW, PH, 0.005, 0.004, 0), M.hardware, name + '_bezel', [0, 0, -0.002]);
  g.add(bezel);
  const pocket = mesh(new THREE.BoxGeometry(PW - 0.008, PH - 0.008, PD), M.gasket, name + '_pocket',
    [0, 0, -PD / 2 - 0.003]);
  g.add(pocket);
  const bar = mesh(new THREE.BoxGeometry(0.013, PH - 0.044, 0.011), M.hardware, name + '_grip',
    [0.006, 0, -0.012]);
  g.add(bar);
  const lug = mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.011, 20), M.hardware, name + '_lug', [-0.006, 0, -0.012]);
  lug.rotation.z = Math.PI / 2;
  g.add(lug);
  return g;
}

/**
 * buildSlider({ variant: 'xo' | 'ox' })
 * Horizontal glider: left panel fixed, right panel operable (default 'xo').
 * Metres, y-up, interior = +Z. Operable panel sits on the interior plane so the
 * meeting-stile overlap reads at every point of travel.
 */
export function buildSlider(opts = {}) {
  const M = opts.materials || makeMaterials();
  const OPEN_RATIO = opts.openRatio ?? 0.45;

  const W = 1.50;             // overall width
  const H = 1.20;             // overall height
  const D = 0.118;            // frame depth — two tracks deep
  const FACE = 0.058;         // frame face width
  const OVERLAP = 0.036;      // meeting-stile overlap, closed (36 mm)
  const PANEL_D = 0.038;      // panel sightline depth
  const PANEL_FACE = 0.070;   // panel stile / rail face

  const root = new THREE.Group();
  root.name = 'slider_glider';

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;

  /* ---- outer frame ---- */
  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  /* ---- continuous bottom track: sill plate + two raised rails ---- */
  const trackY = -openH / 2 - 0.004;
  const zExt = -0.026, zInt = 0.026;                  // panel planes (exterior / interior)
  const track = new THREE.Group();
  track.name = 'track';
  const plate = mesh(new THREE.BoxGeometry(openW + 0.010, 0.012, D - 0.014), M.upvcInner, 'track_sill', [0, trackY, 0]);
  track.add(plate);
  [[zExt, 'track_rail_outer'], [zInt, 'track_rail_inner']].forEach(([z, n]) => {
    track.add(mesh(new THREE.BoxGeometry(openW + 0.010, 0.011, 0.013), M.steel, n, [0, trackY + 0.011, z]));
    track.add(mesh(new THREE.BoxGeometry(openW + 0.010, 0.016, 0.030), M.upvcInner, n + '_channel',
      [0, trackY + 0.004, z]));
  });
  /* top guide channel — mirrors the track, keeps the panel head captive */
  const guideY = openH / 2 + 0.004;
  [[zExt, 'top_guide_outer'], [zInt, 'top_guide_inner']].forEach(([z, n]) => {
    track.add(mesh(new THREE.BoxGeometry(openW + 0.010, 0.018, 0.032), M.upvcInner, n, [0, guideY - 0.003, z]));
  });
  root.add(track);

  /* ---- panel builder ---- */
  const panelW = (openW + OVERLAP) / 2;
  const panelH = openH - 0.006;

  function buildPanel(name, z) {
    const g = new THREE.Group();
    g.name = name + '_carrier';
    g.position.z = z;
    const p = mesh(ringGeo(panelW, panelH, PANEL_FACE, PANEL_D), M.upvc, name);
    g.add(p);

    const gw = panelW - PANEL_FACE * 2 + 0.020;
    const gh = panelH - PANEL_FACE * 2 + 0.020;
    g.add(mesh(new THREE.BoxGeometry(gw, gh, 0.006), M.glass, name.replace('panel', 'glass'), [0, 0, -0.004]));
    g.add(mesh(ringGeo(gw + 0.008, gh + 0.008, 0.013, 0.012), M.upvcInner, name + '_bead', [0, 0, 0.011]));
    g.add(mesh(ringGeo(panelW + 0.005, panelH + 0.005, 0.012, 0.008, 0), M.gasket, name + '_weatherstrip',
      [0, 0, -PANEL_D / 2 - 0.002]));
    return g;
  }

  const fixed = buildPanel('panel_fixed', zExt);
  fixed.position.x = -openW / 2 + panelW / 2;
  root.add(fixed);

  const operable = buildPanel('panel_operable', zInt);
  const closedX = openW / 2 - panelW / 2;
  operable.position.x = closedX;
  root.add(operable);

  /* interlock on the fixed panel's meeting stile — the operable stile laps it */
  root.add(mesh(new THREE.BoxGeometry(0.014, panelH - 0.010, 0.026), M.upvcInner, 'meeting_interlock',
    [fixed.position.x + panelW / 2 - 0.007, 0, zExt + 0.030]));

  /* recessed pull on the operable panel's meeting (leading) stile, interior face */
  const handle = buildHandle(M, 'handle');
  handle.position.set(-panelW / 2 + PANEL_FACE / 2, -0.055, PANEL_D / 2 + 0.003);
  handle.rotation.y = Math.PI;
  operable.add(handle);

  /* rollers under the operable panel, riding the interior rail */
  [-1, 1].forEach((s, i) => {
    const r = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.009, 20), M.steel, 'roller_' + (i + 1),
      [s * (panelW / 2 - 0.062), -panelH / 2 - 0.010, 0]);
    r.rotation.z = Math.PI / 2;
    operable.add(r);
  });

  root.position.y = H / 2 + 0.02;

  const travel = Math.min(OPEN_RATIO * openW, panelW - OVERLAP - 0.008);
  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const eased = c * c * (3 - 2 * c);
    operable.position.x = closedX - eased * travel;
  }
  setOpen(0);

  return {
    group: root, setOpen, operable, closedX, travel,
    dims: { W, H, D, openW, panelW, overlap: OVERLAP, clearOpen: travel },
    config: { id: 'sliding', motion: 'translate_x', open_ratio: OPEN_RATIO },
  };
}
