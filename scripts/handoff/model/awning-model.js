import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* Rectangular ring profile (frame / sash / bead), extruded in Z, centred. */
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

/**
 * Applied muntin grid, 2 × 2, mirroring buildFixed's grid in fixed-model.js:
 * a bar pair on each glass face plus a thin shadow bar in the cavity so the
 * grille reads through the pane instead of floating on it.
 *
 * Material is M.upvcInner (`upvc_white_rebate`), the same profile material the
 * glazing bead uses. That name maps to the `frame2` slot at bake time, so the
 * finish picker recolours the bars with the rest of the profile — a bar built
 * from a hardware or gasket material would stay black under a White finish.
 *
 * `zGlass` / `glassT` are the pane's centre and thickness in the parent's
 * local space, so the caller decides which moving node the grid hangs off.
 */
function gridGroup(M, name, gw, gh, zGlass, glassT) {
  const g = new THREE.Group();
  g.name = name;
  const BAR = 0.024, BAR_T = 0.012;
  const spanW = gw + 0.004, spanH = gh + 0.004;
  [['ext', zGlass - glassT / 2 - BAR_T / 2], ['int', zGlass + glassT / 2 + BAR_T / 2]].forEach(([side, z]) => {
    g.add(mesh(new THREE.BoxGeometry(BAR, spanH, BAR_T), M.upvcInner, `${name}_bar_v_${side}`, [0, 0, z]));
    g.add(mesh(new THREE.BoxGeometry(spanW, BAR, BAR_T), M.upvcInner, `${name}_bar_h_${side}`, [0, 0, z]));
  });
  g.add(mesh(new THREE.BoxGeometry(BAR - 0.008, spanH, 0.003), M.upvcInner, `${name}_spacer_v`, [0, 0, zGlass]));
  g.add(mesh(new THREE.BoxGeometry(spanW, BAR - 0.008, 0.003), M.upvcInner, `${name}_spacer_h`, [0, 0, zGlass]));
  return g;
}

/* Cam lever on the sill rail — lever turns about the sash normal (Z). */
function buildHandle(M, name) {
  const g = new THREE.Group();
  g.name = name;

  g.add(mesh(new THREE.BoxGeometry(0.104, 0.030, 0.009), M.hardware, name + '_backplate', [0, 0, 0.0045]));
  const rose = mesh(new THREE.CylinderGeometry(0.0135, 0.0155, 0.016, 32), M.hardware, name + '_rosette', [0, 0, 0.016]);
  rose.rotation.x = Math.PI / 2;
  g.add(rose);

  const holder = new THREE.Group();
  holder.name = name + '_lever_holder';
  holder.position.set(0, 0, 0.023);
  holder.rotation.z = Math.PI / 2;   // locked: lever lies flat along the sill rail
  const lever = new THREE.Group();
  lever.name = name + '_lever_pivot';
  const arm = mesh(new THREE.BoxGeometry(0.016, 0.086, 0.018), M.hardware, name + '_lever', [0, -0.046, 0]);
  lever.add(arm);
  const tip = mesh(new THREE.SphereGeometry(0.0090, 20, 14), M.hardware, name + '_lever_tip', [0, -0.090, 0]);
  tip.scale.set(1, 1.45, 1.05);
  lever.add(tip);
  const neck = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.019, 24), M.hardware, name + '_lever_neck', [0, -0.005, 0]);
  neck.rotation.x = Math.PI / 2;
  lever.add(neck);
  holder.add(lever);
  g.add(holder);
  return { group: g, lever };
}

/**
 * buildAwning({ variant: 'vent' | 'wide', grid })
 * Top-hinged outswing sash: pivot on the HEAD, horizontal axis, 0 → 32°.
 * Returns { group, setOpen(t), setGrid(on), sash, arms, animNodes, config }
 * Metres, y-up, base at y = 0. Interior = +Z, exterior = −Z.
 * `grid: true` adds a 2 × 2 applied bar set parented to the sash pivot, so it
 * swings out with the sash rather than staying flat in the frame.
 */
export function buildAwning(opts = {}) {
  const variant = opts.variant === 'wide' ? 'wide' : 'vent';
  const M = opts.materials || makeMaterials();
  const grid = !!opts.grid;

  const W = variant === 'wide' ? 1.40 : 1.00;
  const H = variant === 'wide' ? 0.60 : 0.70;
  const D = 0.084;
  const FACE = 0.062;

  const root = new THREE.Group();
  root.name = 'awning_' + variant + (grid ? '_grid' : '');

  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  const stopDepth = 0.026;
  root.add(mesh(ringGeo(W - FACE * 2 + 0.014, H - FACE * 2 + 0.014, 0.037, stopDepth), M.upvcInner,
    'frame_stop', [0, 0, D / 2 - stopDepth / 2]));

  const sill = mesh(new THREE.BoxGeometry(W + 0.03, 0.016, D + 0.030), M.upvc, 'frame_sill_nose',
    [0, -H / 2 - 0.006, -0.008]);
  sill.rotation.x = -0.06;
  root.add(sill);

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;

  const clear = 0.003;
  const sw = openW - clear * 2;
  const sh = openH - clear * 2;
  const sashFace = 0.062;
  const sashDepth = 0.056;
  const sashZ = -D / 2 + sashDepth / 2;

  /* gasket on the frame stop — dark shadow line when shut */
  root.add(mesh(ringGeo(sw + 0.006, sh + 0.006, 0.034, 0.009, 0), M.gasket, 'gasket',
    [0, 0, D / 2 - stopDepth + 0.0015]));

  /* ---- sash pivot: head of the opening, axis = X (horizontal) ---- */
  const pivotY = sh / 2 + 0.004;
  const pivotZ = -D / 2 + 0.008;      // axis on the exterior face, where the butt hinges sit
  const pivot = new THREE.Group();
  pivot.name = 'sash_pivot';
  pivot.position.set(0, pivotY, pivotZ);
  root.add(pivot);

  const oy = -pivotY;                 // sash centre relative to the head pivot
  const oz = sashZ - pivotZ;

  pivot.add(mesh(ringGeo(sw, sh, sashFace, sashDepth), M.upvc, 'sash', [0, oy, oz]));

  const glassW = sw - sashFace * 2 + 0.020;
  const glassH = sh - sashFace * 2 + 0.020;
  pivot.add(mesh(new THREE.BoxGeometry(glassW, glassH, 0.006), M.glass, 'glass', [0, oy, oz - 0.008]));
  pivot.add(mesh(ringGeo(glassW + 0.008, glassH + 0.008, 0.014, 0.013), M.upvcInner,
    'glazing_bead', [0, oy, oz + 0.012]));

  /* Grid hangs off the sash pivot, alongside the glass and bead, so it rotates
     with the sash. Hidden rather than omitted when `grid` is false:
     GLTFExporter skips invisible nodes, so the no-grid bake is unchanged. */
  const gridBar = gridGroup(M, 'grid_2x2', glassW, glassH, oz - 0.008, 0.006);
  gridBar.position.y = oy;
  gridBar.visible = grid;
  pivot.add(gridBar);

  /* ---- top hinges: barrels on the head, axis along X ---- */
  const hingeTop = new THREE.Group(); hingeTop.name = 'hinge_top';
  const hxs = [-sw / 2 + 0.10, sw / 2 - 0.10];
  hxs.forEach((hx, k) => {
    const barrel = mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.092, 24), M.steel,
      'hinge_top_' + (k + 1) + '_knuckle', [hx, pivotY, pivotZ]);   // exactly on the swing axis
    barrel.rotation.z = Math.PI / 2;
    hingeTop.add(barrel);
    const headLeaf = mesh(new THREE.BoxGeometry(0.088, 0.050, 0.006), M.steel,
      'hinge_top_' + (k + 1) + '_leaf_frame', [hx, pivotY + 0.030, pivotZ - 0.009]);
    hingeTop.add(headLeaf);
    const sashLeaf = mesh(new THREE.BoxGeometry(0.086, 0.046, 0.006), M.steel,
      'hinge_top_' + (k + 1) + '_leaf_sash', [hx, -0.028, oz - sashDepth / 2 - 0.003]);
    pivot.add(sashLeaf);
  });
  root.add(hingeTop);

  /* ---- handle: cam lever on the interior face of the sash sill rail ---- */
  const h = buildHandle(M, 'handle');
  h.group.position.set(0, oy - sh / 2 + sashFace / 2, oz + sashDepth / 2 + 0.001);
  pivot.add(h.group);

  /* ---- stay arms: single arm, frame track shoe → sash stile pin (both jambs) ---- */
  const armX = openW / 2 - 0.016;
  const anchorZ = -D / 2 + 0.020;
  const pinLocalY = oy - sh / 2 + 0.048;      // pin height on the stile, relative to head pivot
  const pinLocalZ = oz - sashDepth / 2 + 0.004;

  const MAX = THREE.MathUtils.degToRad(32);

  /* pin position (y,z in root space) for a given sash angle */
  function pinYZ(angle) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    return {
      y: pivotY + pinLocalY * ca - pinLocalZ * sa,
      z: pivotZ + pinLocalY * sa + pinLocalZ * ca,
    };
  }
  const pinOpen = pinYZ(MAX), pinShut = pinYZ(0);
  /* arm length sized so the shoe still sits 100 mm up-track at full open */
  const ARM_L = Math.hypot(0.10, anchorZ - pinOpen.z);
  const shoeY = (p) => p.y + Math.sqrt(Math.max(0.0004, ARM_L * ARM_L - (anchorZ - p.z) ** 2));
  const shoeShutY = shoeY(pinShut), shoeOpenY = shoeY(pinOpen);

  const arms = [];
  [-1, 1].forEach((sx) => {
    const side = sx < 0 ? '_l' : '_r';
    const grp = new THREE.Group(); grp.name = 'stay_arm' + side;
    root.add(grp);

    const trackLen = shoeShutY - shoeOpenY + 0.07;
    grp.add(mesh(new THREE.BoxGeometry(0.010, trackLen, 0.013), M.steel, 'stay_arm' + side + '_track',
      [sx * (armX + 0.006), (shoeShutY + shoeOpenY) / 2, anchorZ - 0.004]));

    const shoe = mesh(new THREE.BoxGeometry(0.014, 0.048, 0.020), M.steel, 'stay_arm' + side + '_shoe',
      [sx * armX, shoeShutY, anchorZ]);
    grp.add(shoe);

    const bar = mesh(new THREE.BoxGeometry(0.012, ARM_L, 0.018), M.steel, 'stay_arm' + side + '_bar');
    grp.add(bar);

    const sashPin = mesh(new THREE.BoxGeometry(0.013, 0.046, 0.016), M.steel, 'stay_arm' + side + '_bracket',
      [sx * (sw / 2 - 0.010), pinLocalY + 0.004, pinLocalZ - 0.004]);
    pivot.add(sashPin);

    arms.push({ sx, bar, shoe });
  });

  root.position.y = H / 2 + 0.02;

  const LEVER = THREE.MathUtils.degToRad(88);
  const up = new THREE.Vector3(0, 1, 0);

  function placeBone(m, from, to, len) {
    const d = to.clone().sub(from);
    m.position.copy(from).add(to).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, d.clone().normalize());
    m.scale.set(1, Math.max(0.05, d.length() / len), 1);
  }

  function solveArm(arm, angle) {
    const p = pinYZ(angle);
    const B = new THREE.Vector3(arm.sx * (sw / 2 - 0.010), p.y, p.z);
    const A = new THREE.Vector3(arm.sx * armX, shoeY(p), anchorZ);
    arm.shoe.position.copy(A);
    placeBone(arm.bar, A, B, ARM_L);
  }

  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const eased = c * c * (3 - 2 * c);
    const angle = eased * MAX;
    pivot.rotation.x = angle;
    h.lever.rotation.z = Math.min(1, c / 0.16) * LEVER;   // unlocks upward, clear of the sill
    arms.forEach((a) => solveArm(a, angle));
  }
  setOpen(0);

  const animNodes = [pivot, h.lever];
  arms.forEach((a) => animNodes.push(a.bar, a.shoe));

  function setGrid(on) { gridBar.visible = !!on; }

  return {
    group: root, setOpen, setGrid, sash: { pivot, lever: h.lever }, arms, animNodes,
    config: {
      id: 'awning', motion: 'hinge_outswing_horizontal', max_angle_deg: 32,
      grid: grid ? '2x2_applied' : null,
    },
  };
}
