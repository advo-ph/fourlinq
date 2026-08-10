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
 * buildSlider({ panel, grid })
 * Horizontal glider on a TWIN track (two rails, exterior + interior).
 * Metres, y-up, interior = +Z. Operable panels sit on the interior plane so the
 * meeting-stile overlap reads at every point of travel.
 *
 *   panel: 2 (default) — XO. Left leaf fixed on the exterior rail, right leaf
 *          operable on the interior rail, lapping it by OVERLAP when closed.
 *   panel: 4          — OXXO on the SAME twin track, which is why it is the
 *          configuration consistent with the existing 2-panel rather than a
 *          4-track: both outer leaves are fixed on the exterior rail, both
 *          inner leaves are operable and share the interior rail, parting from
 *          the centre outward. Two leaves on one rail can never pass each
 *          other, and here they never need to — each travels away from the
 *          other. At the centre the two operables meet stile-to-stile with an
 *          interlock (no overlap, they are coplanar); the overlap is at the two
 *          outer joints, where an interior leaf laps an exterior one.
 *
 *   grid: true — applied muntin grille, one 2 x 2 bar set per leaf, built the
 *          same way as buildFixed()'s grid in fixed-model.js (exterior bar +
 *          interior bar + a thinner shadow bar inside the cavity, so the grille
 *          reads through the glass), added to every leaf so it travels with the
 *          sash. Hidden rather than omitted when off, exactly as buildFixed
 *          does — GLTFExporter's onlyVisible default drops it from the bake.
 */
export function buildSlider(opts = {}) {
  const M = opts.materials || makeMaterials();
  const OPEN_RATIO = opts.openRatio ?? 0.45;
  const N = opts.panel === 4 ? 4 : 2;
  const grid = !!opts.grid;

  const W = N === 4 ? 2.60 : 1.50;   // overall width — a 4-leaf run is a door-width opening
  const H = 1.20;             // overall height
  const D = 0.118;            // frame depth — two tracks deep
  const FACE = 0.058;         // frame face width
  const OVERLAP = 0.036;      // meeting-stile overlap, closed (36 mm)
  const PANEL_D = 0.038;      // panel sightline depth
  const PANEL_FACE = 0.070;   // panel stile / rail face

  const root = new THREE.Group();
  root.name = 'slider_glider' + (N === 4 ? '_4panel' : '') + (grid ? '_grid' : '');

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
  /* 2 leaves lap once; 4 leaves lap twice (the centre joint is an interlock, not
     an overlap, because both operables share the interior rail). */
  const panelW = N === 4 ? (openW + OVERLAP * 2) / 4 : (openW + OVERLAP) / 2;
  const panelH = openH - 0.006;

  /* Applied muntin grille, mirroring buildFixed()'s grid in fixed-model.js:
     an exterior bar set, an interior bar set, and a thinner shadow bar inside
     the cavity so the grille reads through the glass. Bar section is scaled to
     this sash (PANEL_D 38 mm vs the fixed unit's 92 mm frame) so nothing
     protrudes past the sash face. Material is M.upvcInner
     ('upvc_white_rebate'), which the bake maps to the frame2 slot — so the
     finish picker recolours the grille with the rest of the profile. */
  const BAR = 0.022, BAR_T = 0.010;
  function addGrid(g, name, gw, gh, zGlass, glassT) {
    const bars = new THREE.Group();
    bars.name = name + '_grid_2x2';
    bars.visible = grid;
    const zBarExt = zGlass - glassT / 2 - BAR_T / 2 - 0.002;
    const zBarInt = zGlass + glassT / 2 + BAR_T / 2 + 0.002;
    const spanW = gw + 0.004, spanH = gh + 0.004;
    [['ext', zBarExt], ['int', zBarInt]].forEach(([side, z]) => {
      bars.add(mesh(new THREE.BoxGeometry(BAR, spanH, BAR_T), M.upvcInner, name + '_grid_bar_v_' + side, [0, 0, z]));
      bars.add(mesh(new THREE.BoxGeometry(spanW, BAR, BAR_T), M.upvcInner, name + '_grid_bar_h_' + side, [0, 0, z]));
    });
    bars.add(mesh(new THREE.BoxGeometry(BAR - 0.008, spanH, 0.004), M.upvcInner, name + '_grid_spacer_v', [0, 0, zGlass]));
    bars.add(mesh(new THREE.BoxGeometry(spanW, BAR - 0.008, 0.004), M.upvcInner, name + '_grid_spacer_h', [0, 0, zGlass]));
    g.add(bars);
    return bars;
  }

  const gridGroup = [];

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
    gridGroup.push(addGrid(g, name, gw, gh, -0.004, 0.006));
    return g;
  }

  /* Leading-stile recessed pull. `dir` is the direction the leaf travels: the
     pull sits on the stile that leads the leaf open. */
  function addHandle(carrier, name, dir) {
    const h = buildHandle(M, name);
    h.position.set(dir * (-panelW / 2 + PANEL_FACE / 2), -0.055, PANEL_D / 2 + 0.003);
    h.rotation.y = Math.PI;
    carrier.add(h);
    return h;
  }

  /* rollers under an operable panel, riding the interior rail */
  function addRoller(carrier, prefix) {
    [-1, 1].forEach((s, i) => {
      const r = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.009, 20), M.steel, prefix + (i + 1),
        [s * (panelW / 2 - 0.062), -panelH / 2 - 0.010, 0]);
      r.rotation.z = Math.PI / 2;
      carrier.add(r);
    });
  }

  /* ---- assembly ----
     The 2-leaf path is kept verbatim so `buildSlider()` with no opts is
     geometrically identical to the shipped public/models/system/sliding.glb. */
  const leaf = [];          // { carrier, closedX, dir } per operable leaf
  let operable, closedX;

  if (N === 2) {
    const fixed = buildPanel('panel_fixed', zExt);
    fixed.position.x = -openW / 2 + panelW / 2;
    root.add(fixed);

    operable = buildPanel('panel_operable', zInt);
    closedX = openW / 2 - panelW / 2;
    operable.position.x = closedX;
    root.add(operable);

    /* interlock on the fixed panel's meeting stile — the operable stile laps it */
    root.add(mesh(new THREE.BoxGeometry(0.014, panelH - 0.010, 0.026), M.upvcInner, 'meeting_interlock',
      [fixed.position.x + panelW / 2 - 0.007, 0, zExt + 0.030]));

    addHandle(operable, 'handle', 1);
    addRoller(operable, 'roller_');
    leaf.push({ carrier: operable, closedX, dir: -1 });
  } else {
    /* OXXO: fixed outers on the exterior rail, operable inners on the interior
       rail, parting from the centre. Joint pitch is (panelW - OVERLAP) at the
       two outer joints and panelW at the centre (stile-to-stile interlock). */
    const x0 = -openW / 2 + panelW / 2;
    const x1 = x0 + panelW - OVERLAP;
    const x2 = x1 + panelW;
    const x3 = x2 + panelW - OVERLAP;

    const fixedL = buildPanel('panel_fixed_l', zExt);
    fixedL.position.x = x0;
    root.add(fixedL);

    const operableL = buildPanel('panel_operable_l', zInt);
    operableL.position.x = x1;
    root.add(operableL);

    const operableR = buildPanel('panel_operable_r', zInt);
    operableR.position.x = x2;
    root.add(operableR);

    const fixedR = buildPanel('panel_fixed_r', zExt);
    fixedR.position.x = x3;
    root.add(fixedR);

    /* interlocks on each fixed leaf's inboard stile — the operable stile laps it */
    root.add(mesh(new THREE.BoxGeometry(0.014, panelH - 0.010, 0.026), M.upvcInner, 'meeting_interlock_l',
      [x0 + panelW / 2 - 0.007, 0, zExt + 0.030]));
    root.add(mesh(new THREE.BoxGeometry(0.014, panelH - 0.010, 0.026), M.upvcInner, 'meeting_interlock_r',
      [x3 - panelW / 2 + 0.007, 0, zExt + 0.030]));
    /* centre joint: the two operables are coplanar, so they interlock rather
       than lap. The astragal rides with the left leaf. */
    operableL.add(mesh(new THREE.BoxGeometry(0.012, panelH - 0.010, 0.020), M.upvcInner, 'centre_astragal',
      [panelW / 2 - 0.006, 0, 0]));

    addHandle(operableL, 'handle_l', 1);
    addHandle(operableR, 'handle_r', -1);
    addRoller(operableL, 'roller_l_');
    addRoller(operableR, 'roller_r_');

    leaf.push({ carrier: operableL, closedX: x1, dir: -1 });
    leaf.push({ carrier: operableR, closedX: x2, dir: 1 });

    operable = operableL;
    closedX = x1;
  }

  root.position.y = H / 2 + 0.02;

  const travel = Math.min(OPEN_RATIO * openW, panelW - OVERLAP - 0.008);
  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const eased = c * c * (3 - 2 * c);
    for (const l of leaf) l.carrier.position.x = l.closedX + l.dir * eased * travel;
  }
  setOpen(0);

  function setGrid(on) { for (const b of gridGroup) b.visible = !!on; }

  return {
    group: root, setOpen, setGrid, operable, closedX, travel, leaf,
    dims: { W, H, D, openW, panelW, overlap: OVERLAP, clearOpen: travel, panel: N },
    config: {
      id: N === 4 ? 'sliding-4panel' : 'sliding',
      motion: 'translate_x',
      open_ratio: OPEN_RATIO,
      panel: N,
      operable_panel: leaf.length,
      track: 'twin_rail',
      grid: grid ? '2x2_applied_upvc' : null,
    },
  };
}
