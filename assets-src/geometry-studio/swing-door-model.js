import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* ---------- shared primitives ---------- */

/* Rectangular ring profile (frame / leaf stiles+rails), extruded in Z, centred. */
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
 * Contemporary door lever on a slim rectangular escutcheon (interior or exterior).
 * Optional keyed cylinder or thumbturn above the lever.
 * Returns { group, lever } — lever turns about the leaf's local Z.
 */
function buildLever(M, name, opts = {}) {
  const g = new THREE.Group();
  g.name = name;
  const face = opts.face === -1 ? -1 : 1;          // +1 interior, -1 exterior
  const PLATE_W = 0.048, PLATE_H = 0.300, PLATE_D = 0.009;

  g.add(mesh(new THREE.BoxGeometry(PLATE_W, PLATE_H, PLATE_D), M.hardware,
    name + '_escutcheon', [0, 0, face * PLATE_D / 2]));

  if (opts.cylinder === 'keyed') {
    const boss = mesh(new THREE.BoxGeometry(0.030, 0.030, 0.006), M.hardware, name + '_cylinder_boss',
      [0, 0.082, face * (PLATE_D + 0.003)]);
    g.add(boss);
    const cyl = mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.005, 24), M.brass || M.steel,
      name + '_lock_cylinder', [0, 0.082, face * (PLATE_D + 0.0065)]);
    cyl.rotation.x = Math.PI / 2;
    g.add(cyl);
  } else if (opts.cylinder === 'turn') {
    const boss = mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.006, 24), M.hardware,
      name + '_turn_boss', [0, 0.082, face * (PLATE_D + 0.003)]);
    boss.rotation.x = Math.PI / 2;
    g.add(boss);
    const turn = mesh(new THREE.BoxGeometry(0.010, 0.030, 0.008), M.hardware, name + '_thumbturn',
      [0, 0.082, face * (PLATE_D + 0.008)]);
    g.add(turn);
  }

  const rose = mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.014, 28), M.hardware,
    name + '_rosette', [0, -0.048, face * (PLATE_D + 0.006)]);
  rose.rotation.x = Math.PI / 2;
  g.add(rose);

  const lever = new THREE.Group();
  lever.name = name + '_pivot';
  lever.position.set(0, -0.048, face * (PLATE_D + 0.014));
  const dirX = opts.pointing === -1 ? -1 : 1;      // lever points away from the hinge stile
  const arm = mesh(new THREE.BoxGeometry(0.104, 0.019, 0.020), M.hardware, name + '_lever',
    [dirX * 0.055, 0, 0]);
  arm.scale.set(1, 1, 1);
  lever.add(arm);
  const neck = mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.020, 24), M.hardware,
    name + '_lever_neck', [0, 0, -0.004]);
  neck.rotation.x = Math.PI / 2;
  lever.add(neck);
  const tip = mesh(new THREE.SphereGeometry(0.0098, 18, 12), M.hardware, name + '_lever_tip',
    [dirX * 0.108, 0, 0]);
  tip.scale.set(1.2, 1, 1.05);
  lever.add(tip);
  g.add(lever);

  return { group: g, lever };
}

/* Butt hinge with visible knuckles. Static leaf on the jamb, moving leaf on the door. */
function buildHinge(M, name, y, ext, pinZ) {
  const stat = new THREE.Group(); stat.name = name;
  const knuckle = mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.120, 24), M.hardware,
    name + '_knuckle', [0, y, 0]);
  stat.add(knuckle);
  [-1, 1].forEach((s, i) => {
    stat.add(mesh(new THREE.CylinderGeometry(0.0102, 0.0102, 0.026, 20), M.hardware,
      name + '_knuckle_cap_' + (i + 1), [0, y + s * 0.047, 0]));
  });
  const jambLeaf = mesh(new THREE.BoxGeometry(0.006, 0.112, 0.050), M.hardware,
    name + '_leaf_frame', [-ext * 0.006, y, -Math.sign(pinZ || 1) * 0.026]);
  stat.add(jambLeaf);
  const doorLeaf = mesh(new THREE.BoxGeometry(0.006, 0.108, 0.048), M.hardware,
    name + '_leaf_panel', [0, y, 0]);
  return { stat, doorLeaf };
}

/* ---------- leaf ---------- */

function buildLeaf(M, name, w, h, depth, lite, faceW, bottomRail) {
  const g = new THREE.Group();
  g.name = name;

  g.add(mesh(ringGeo(w, h, faceW, depth), M.upvc, name + '_frame'));
  g.add(mesh(new THREE.BoxGeometry(w - 0.004, bottomRail, depth - 0.003), M.upvc,
    name + '_bottom_rail', [0, -h / 2 + bottomRail / 2, 0]));
  g.add(mesh(ringGeo(w + 0.006, h + 0.006, 0.016, 0.010, 0), M.gasket, name + '_gasket',
    [0, 0, -depth / 2 - 0.002]));

  const openW = w - faceW * 2;
  const openTop = h / 2 - faceW;
  const openBot = -h / 2 + bottomRail;

  function glaze(gy, gh, tag) {
    const gw = openW + 0.020;
    g.add(mesh(new THREE.BoxGeometry(gw, gh + 0.020, 0.007), M.glass, name.replace('panel', 'glass') + tag,
      [0, gy, -0.006]));
    g.add(mesh(ringGeo(gw + 0.012, gh + 0.032, 0.017, 0.014), M.upvcInner,
      name + '_bead' + tag, [0, gy, depth / 2 - 0.010]));
    g.add(mesh(ringGeo(gw + 0.012, gh + 0.032, 0.017, 0.014), M.upvcInner,
      name + '_bead_ext' + tag, [0, gy, -depth / 2 + 0.010]));
  }

  function solidPanel(py, ph, tag) {
    g.add(mesh(new THREE.BoxGeometry(openW + 0.016, ph + 0.016, depth - 0.020), M.upvc,
      name + '_infill' + tag, [0, py, 0]));
    [1, -1].forEach((s, i) => {
      g.add(mesh(ringGeo(openW - 0.030, ph - 0.030, 0.026, 0.008), M.upvcInner,
        name + '_infill_moulding' + tag + '_' + (i + 1), [0, py, s * (depth / 2 - 0.014)]));
    });
  }

  if (lite === 'full') {
    glaze((openTop + openBot) / 2, openTop - openBot, '');
  } else if (lite === 'half') {
    const railY = openBot + (openTop - openBot) * 0.42;
    const RAIL = 0.150;
    g.add(mesh(new THREE.BoxGeometry(w - 0.004, RAIL, depth - 0.003), M.upvc, name + '_lock_rail', [0, railY, 0]));
    glaze((railY + RAIL / 2 + openTop) / 2, openTop - (railY + RAIL / 2), '_upper');
    solidPanel((openBot + railY - RAIL / 2) / 2, (railY - RAIL / 2) - openBot, '_lower');
  } else {
    const midY = (openTop + openBot) / 2;
    const halfH = (openTop - openBot) / 2;
    solidPanel(midY + halfH / 2, halfH - 0.030, '_upper');
    solidPanel(midY - halfH / 2, halfH - 0.030, '_lower');
  }
  return g;
}

/**
 * buildSwingDoor({ type, width, height, swing, handing, lite })
 *
 * type: 'french'        — active + passive full-lite leaves, astragal on the passive leaf
 *       'casement-door' — single tall full-lite side-hinged leaf (casement logic, door scale)
 *       'ninety'        — 90-series entry leaf, deeper profile, solid or half-lite, lever + deadbolt
 *
 * Metres, y-up, interior = +Z. Outswing leaves rotate toward -Z.
 * Returns { group, setOpen(t), leaves, dims, config }.
 */
export function buildSwingDoor(opts = {}) {
  const M = opts.materials || makeMaterials();
  const type = ['french', 'casement-door', 'ninety'].includes(opts.type) ? opts.type : 'french';
  const swing = opts.swing === 'in' ? 'in' : 'out';
  const swingSign = swing === 'out' ? 1 : -1;
  const hand = opts.handing === 'LH' ? -1 : 1;      // +1 = active leaf hinged on the right (RH)
  const isFrench = type === 'french';
  const isNinety = type === 'ninety';

  const lite = isFrench || type === 'casement-door'
    ? 'full'
    : (opts.lite === 'solid' ? 'solid' : 'half');

  const W = opts.width ?? (isFrench ? 1.80 : isNinety ? 1.00 : 0.95);
  const H = opts.height ?? (isFrench ? 2.10 : isNinety ? 2.15 : 2.30);
  const D = isNinety ? 0.180 : 0.140;               // frame depth
  const FACE = isNinety ? 0.098 : 0.078;            // frame face width
  const LEAF_D = isNinety ? 0.076 : 0.056;          // leaf thickness
  const LEAF_FACE = isNinety ? 0.132 : 0.112;       // stile / top rail face
  const BOTTOM_RAIL = isNinety ? 0.245 : 0.215;

  const root = new THREE.Group();
  root.name = isFrench ? 'french_door' : isNinety ? 'entry_door_90_series' : 'casement_door';

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;
  const leafZ = 0;                                   // leaf centre plane inside the frame
  const pinZ = -swingSign * (LEAF_D / 2 + 0.014);    // hinge pin sits on the swing side

  /* ---- frame + stop + gasket ---- */
  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));
  const STOP = 0.030;
  const stopZ = swingSign * (LEAF_D / 2 + STOP / 2);
  root.add(mesh(ringGeo(openW + 0.016, openH + 0.016, 0.040, STOP), M.upvcInner, 'frame_stop',
    [0, 0, stopZ]));
  root.add(mesh(ringGeo(openW + 0.012, openH + 0.012, 0.014, 0.008, 0), M.gasket, 'gasket',
    [0, 0, stopZ - swingSign * (STOP / 2 + 0.004)]));

  /* ---- sill / threshold (matching the anodised outswing sill detail) ---- */
  const sill = new THREE.Group(); sill.name = 'sill';
  const sillY = -openH / 2 - 0.014;
  sill.add(mesh(new THREE.BoxGeometry(W - 0.004, 0.026, D - 0.006), M.steel, 'sill_plate', [0, sillY, 0]));
  sill.add(mesh(new THREE.BoxGeometry(W + 0.030, 0.012, D + 0.034), M.steel, 'sill_nose', [0, sillY - 0.018, 0]));
  sill.add(mesh(new THREE.BoxGeometry(W - 0.010, 0.008, 0.016), M.gasket, 'sill_seal',
    [0, sillY + 0.017, -swingSign * (LEAF_D / 2 + 0.004)]));
  root.add(sill);

  /* ---- head + jamb call-outs (named, flush with the frame face) ---- */
  root.add(mesh(new THREE.BoxGeometry(W - 0.004, 0.010, D - 0.030), M.upvcInner, 'head',
    [0, H / 2 - FACE - 0.005, 0]));
  [[-1, 'jamb_left'], [1, 'jamb_right']].forEach(([s, n]) => {
    root.add(mesh(new THREE.BoxGeometry(0.010, openH - 0.010, D - 0.030), M.upvcInner, n,
      [s * (openW / 2 + 0.005), 0, 0]));
  });

  /* ---- leaves ---- */
  const leaves = [];
  const leafH = openH - 0.010;

  function addLeaf(cfg) {
    const { name, leafW, hingeX, ext, maxDeg, cylinder, isActive } = cfg;
    const pivot = new THREE.Group();
    pivot.name = name + '_pivot';
    pivot.position.set(hingeX, 0, pinZ);
    root.add(pivot);

    const ox = ext * (leafW / 2 - 0.004);
    const oz = leafZ - pinZ;
    const leaf = buildLeaf(M, name, leafW, leafH, LEAF_D, lite, LEAF_FACE, BOTTOM_RAIL);
    leaf.position.set(ox, 0, oz);
    pivot.add(leaf);

    /* hinges: 3 for standard leaves, 4 on the deeper 90-series slab */
    const ys = isNinety ? [0.82, 0.28, -0.28, -0.82] : [0.78, 0, -0.78];
    const hset = new THREE.Group(); hset.name = name.replace('panel', 'hinge') + '_set';
    ys.forEach((y, k) => {
      const hg = buildHinge(M, name.replace('panel', 'hinge') + '_' + (k + 1), y, ext, pinZ);
      hg.stat.position.set(hingeX, 0, pinZ);
      hset.add(hg.stat);
      hg.doorLeaf.position.set(ext * 0.008, y, oz - Math.sign(pinZ || 1) * 0.020);
      pivot.add(hg.doorLeaf);
    });
    root.add(hset);

    /* interior lever on the lock stile; keyed plate on the exterior for active leaves */
    const lockX = ox + ext * (leafW / 2 - LEAF_FACE / 2);
    const hi = buildLever(M, name.replace('panel', 'handle') + '_interior',
      { face: 1, pointing: -ext, cylinder: isNinety && isActive ? 'turn' : null });
    hi.group.position.set(lockX, -0.02, oz + LEAF_D / 2);
    pivot.add(hi.group);

    let leverExt = null;
    if (isActive) {
      const he = buildLever(M, name.replace('panel', 'handle') + '_exterior',
        { face: -1, pointing: -ext, cylinder: cylinder || 'keyed' });
      he.group.position.set(lockX, -0.02, oz - LEAF_D / 2);
      pivot.add(he.group);
      leverExt = he.lever;
    }

    leaves.push({ pivot, lever: hi.lever, leverExt, ext, maxDeg, name, isActive });
    return { pivot, leaf, ox, leafW, lockX, oz };
  }

  if (isFrench) {
    const leafW = (openW - 0.006) / 2;
    const activeExt = -hand;                            // RH: hinged right, leaf extends -X
    addLeaf({
      name: 'panel_active', leafW, ext: activeExt,
      hingeX: hand * (openW / 2 - 0.004), maxDeg: 90, isActive: true,
    });
    const passive = addLeaf({
      name: 'panel_passive', leafW, ext: -activeExt,
      hingeX: -hand * (openW / 2 - 0.004), maxDeg: 70, isActive: false,
    });
    /* astragal rides the passive leaf's meeting stile and closes the joint */
    const pExt = -activeExt;
    const ax = passive.ox + pExt * (leafW / 2 - 0.014);
    const astragal = mesh(new THREE.BoxGeometry(0.036, leafH - 0.020, LEAF_D - 0.006), M.upvc, 'astragal',
      [ax, 0, passive.oz]);
    passive.pivot.add(astragal);
    const astSeal = mesh(new THREE.BoxGeometry(0.008, leafH - 0.030, 0.012), M.gasket, 'astragal_gasket',
      [ax + pExt * 0.020, 0, passive.oz - swingSign * (LEAF_D / 2 - 0.010)]);
    passive.pivot.add(astSeal);
    /* flush bolts on the passive leaf head and sill */
    [1, -1].forEach((s, i) => {
      passive.pivot.add(mesh(new THREE.BoxGeometry(0.022, 0.090, 0.008), M.hardware,
        'flush_bolt_' + (i + 1), [ax, s * (leafH / 2 - 0.075), passive.oz + LEAF_D / 2]));
    });
  } else {
    const only = addLeaf({
      name: 'panel', leafW: openW - 0.006, ext: -hand,
      hingeX: hand * (openW / 2 - 0.004), maxDeg: 90, isActive: true,
      cylinder: 'keyed',
    });
    if (isNinety) {
      /* deadbolt escutcheon above the lever, exterior face */
      const db = mesh(new THREE.BoxGeometry(0.048, 0.086, 0.008), M.hardware, 'deadbolt_escutcheon',
        [only.lockX, 0.230, only.oz - LEAF_D / 2 - 0.004]);
      only.pivot.add(db);
      const kw = mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.006, 22), M.steel, 'deadbolt_cylinder',
        [only.lockX, 0.230, only.oz - LEAF_D / 2 - 0.010]);
      kw.rotation.x = Math.PI / 2;
      only.pivot.add(kw);
    }
  }

  root.position.y = H / 2 + 0.018;

  const LEVER_TURN = THREE.MathUtils.degToRad(38);
  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const eased = c * c * (3 - 2 * c);
    leaves.forEach((l) => {
      const ang = THREE.MathUtils.degToRad(l.maxDeg) * eased;
      l.pivot.rotation.y = swingSign * l.ext * ang;
      /* lever throws in the first 15% of the clip, then holds down */
      const lt = Math.min(1, c / 0.15);
      const turn = -l.ext * lt * LEVER_TURN;
      if (l.lever) l.lever.rotation.z = turn;
      if (l.leverExt) l.leverExt.rotation.z = -turn;
    });
  }
  setOpen(0);

  return {
    group: root, setOpen, leaves,
    dims: {
      W, H, D, FACE, LEAF_D, LEAF_FACE, BOTTOM_RAIL, openW, openH,
      leafW: isFrench ? (openW - 0.006) / 2 : openW - 0.006,
      clearOpen: isFrench ? openW - 0.006 : openW - 0.006,
      lite,
    },
    config: {
      id: type === 'ninety' ? 'ninety-series' : type === 'french' ? 'french-door' : 'casement-door',
      motion: 'hinge_' + swing + 'swing_vertical',
      handing: hand === 1 ? 'RH' : 'LH',
      size_mm: { width: Math.round(W * 1000), height: Math.round(H * 1000), frame_depth: Math.round(D * 1000) },
      leaves: leaves.map(l => ({ name: l.name, max_angle_deg: l.maxDeg })),
      lite, frames: 28, fps: 28, easing: 'ease_in_out',
    },
  };
}
