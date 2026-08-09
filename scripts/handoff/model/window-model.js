import * as THREE from 'three';

/* Materials — small shared palette, all named (OBJ usemtl / GLB material names) */
export function makeMaterials() {
  const upvc = new THREE.MeshStandardMaterial({ color: 0xf3f3f0, roughness: 0.62, metalness: 0.0 });
  upvc.name = 'upvc_white_matte';
  const upvcInner = new THREE.MeshStandardMaterial({ color: 0xe9e9e5, roughness: 0.7, metalness: 0.0 });
  upvcInner.name = 'upvc_white_rebate';
  const gasket = new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.95, metalness: 0.0 });
  gasket.name = 'epdm_gasket_black';
  const glass = new THREE.MeshStandardMaterial({
    color: 0xcfe0e6, roughness: 0.06, metalness: 0.15,
    transparent: true, opacity: 0.28, side: THREE.DoubleSide,
  });
  glass.name = 'glass_clear';
  const hardware = new THREE.MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.45, metalness: 0.3 });
  hardware.name = 'hardware_matte_black';
  const steel = new THREE.MeshStandardMaterial({ color: 0x9fa5a9, roughness: 0.38, metalness: 0.35 });
  steel.name = 'hinge_steel';
  return { upvc, upvcInner, gasket, glass, hardware, steel };
}

/* A rectangular ring (frame / sash / bead profile), extruded in Z and centred. */
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

/* Lever handle (interior only), returns { group, lever } — lever turns about sash Z. */
function buildHandle(M, name) {
  const g = new THREE.Group();
  g.name = name;

  const plate = mesh(new THREE.BoxGeometry(0.036, 0.128, 0.010), M.hardware, name + '_backplate', [0, 0, 0.005]);
  g.add(plate);
  const rose = mesh(new THREE.CylinderGeometry(0.0145, 0.0165, 0.017, 32), M.hardware, name + '_rosette', [0, 0, 0.0175]);
  rose.rotation.x = Math.PI / 2;
  g.add(rose);

  const lever = new THREE.Group();
  lever.name = name + '_lever_pivot';
  lever.position.set(0, 0, 0.024);
  const arm = mesh(new THREE.BoxGeometry(0.017, 0.098, 0.019), M.hardware, name + '_lever', [0, -0.052, 0]);
  lever.add(arm);
  const tip = mesh(new THREE.SphereGeometry(0.0095, 20, 14), M.hardware, name + '_lever_tip', [0, -0.101, 0]);
  tip.scale.set(1, 1.5, 1.05);
  lever.add(tip);
  const neck = mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.02, 24), M.hardware, name + '_lever_neck', [0, -0.006, 0]);
  neck.rotation.x = Math.PI / 2;
  lever.add(neck);
  g.add(lever);
  return { group: g, lever };
}

/* One butt hinge: jamb knuckle+leaf are static, sash leaf rides the sash. */
function buildHinge(M, y, hingeX, dir, name) {
  const stat = new THREE.Group(); stat.name = name;
  const knuckle = mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.092, 24), M.steel, name + '_knuckle',
    [hingeX, y, -0.030]);
  stat.add(knuckle);
  const jambLeaf = mesh(new THREE.BoxGeometry(0.048, 0.088, 0.005), M.steel, name + '_leaf_frame',
    [hingeX - dir * 0.026, y, -0.030]);
  jambLeaf.rotation.y = Math.PI / 2;
  jambLeaf.position.set(hingeX - dir * 0.004, y, -0.030 - 0.024);
  stat.add(jambLeaf);
  const sashLeaf = mesh(new THREE.BoxGeometry(0.046, 0.086, 0.005), M.steel, name + '_leaf_sash',
    [dir * 0.026, y, -0.030]);
  return { stat, sashLeaf };
}

/**
 * buildCasement({ variant: 'single' | 'dual' })
 * Returns { group, setOpen(t), sashes:[{pivot, lever, dir}], config }
 * Metres, y-up, centred on origin, base at lowest y after group offset.
 * Interior = +Z. Single: hinges LEFT from interior (-X), handle right.
 */
export function buildCasement(opts = {}) {
  const variant = opts.variant === 'dual' ? 'dual' : 'single';
  const M = opts.materials || makeMaterials();

  const H = 1.40;
  const W = variant === 'dual' ? 1.60 : 0.90;
  const D = 0.084;            // frame sightline depth ~84mm
  const FACE = 0.062;         // frame face width
  const MULL = 0.052;         // mullion width (dual)

  const root = new THREE.Group();
  root.name = variant === 'dual' ? 'casement_dual' : 'casement_single';

  /* ---- outer frame: head, jambs, sill as one mitred extrusion ---- */
  const frame = mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame');
  root.add(frame);

  /* interior stop the sash closes against */
  const stopDepth = 0.026;
  const stop = mesh(ringGeo(W - FACE * 2 + 0.014, H - FACE * 2 + 0.014, 0.037, stopDepth), M.upvcInner,
    'frame_stop', [0, 0, D / 2 - stopDepth / 2]);
  root.add(stop);

  /* sill nose */
  const sill = mesh(new THREE.BoxGeometry(W + 0.03, 0.016, D + 0.028), M.upvc, 'frame_sill_nose',
    [0, -H / 2 - 0.006, -0.008]);
  sill.rotation.x = -0.06;
  root.add(sill);

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;

  /* leaf layout: [openingCentreX, leafWidth, hingeDir(-1 hinge on -X side)] */
  let leaves;
  if (variant === 'single') {
    leaves = [{ cx: 0, w: openW, dir: -1 }];
  } else {
    const lw = (openW - MULL) / 2;
    leaves = [
      { cx: -(MULL / 2 + lw / 2), w: lw, dir: -1 },
      { cx: (MULL / 2 + lw / 2), w: lw, dir: 1 },
    ];
    const mull = mesh(new THREE.BoxGeometry(MULL, openH + 0.012, D - 0.012), M.upvc, 'mullion', [0, 0, -0.004]);
    root.add(mull);
    const mullStop = mesh(new THREE.BoxGeometry(MULL + 0.016, openH + 0.012, stopDepth), M.upvcInner,
      'mullion_stop', [0, 0, D / 2 - stopDepth / 2]);
    root.add(mullStop);
  }

  const sashes = [];
  const gasketGeoParts = [];

  leaves.forEach((leaf, i) => {
    const suffix = variant === 'dual' ? (i === 0 ? '_l' : '_r') : '';
    const clear = 0.003;
    const sw = leaf.w - clear * 2;
    const sh = openH - clear * 2;
    const sashFace = 0.072;
    const sashDepth = 0.056;
    const sashZ = -D / 2 + sashDepth / 2;

    /* gasket stays on the frame stop — visible dark line when closed */
    const gk = mesh(ringGeo(sw + 0.006, sh + 0.006, 0.034, 0.009, 0), M.gasket, 'gasket' + suffix,
      [leaf.cx, 0, D / 2 - stopDepth + 0.0015]);
    root.add(gk);
    gasketGeoParts.push(gk);

    const hingeX = leaf.cx + leaf.dir * (leaf.w / 2 - 0.004);
    const pivot = new THREE.Group();
    pivot.name = 'sash_pivot' + suffix;
    pivot.position.set(hingeX, 0, sashZ);
    root.add(pivot);

    const ox = leaf.cx - hingeX;   // sash centre relative to hinge

    const sash = mesh(ringGeo(sw, sh, sashFace, sashDepth), M.upvc, 'sash' + suffix, [ox, 0, 0]);
    pivot.add(sash);

    const glassW = sw - sashFace * 2 + 0.020;
    const glassH = sh - sashFace * 2 + 0.020;
    const glass = mesh(new THREE.BoxGeometry(glassW, glassH, 0.006), M.glass, 'glass' + suffix,
      [ox, 0, -0.008]);
    pivot.add(glass);

    const bead = mesh(ringGeo(glassW + 0.008, glassH + 0.008, 0.014, 0.013), M.upvcInner,
      'glazing_bead' + suffix, [ox, 0, 0.012]);
    pivot.add(bead);

    /* handle on the lock stile (opposite the hinge), interior face */
    const hx = ox - leaf.dir * (sw / 2 - sashFace / 2);
    const h = buildHandle(M, 'handle' + suffix);
    h.group.position.set(hx, -0.02, sashDepth / 2 + 0.001);
    pivot.add(h.group);

    /* hinges */
    const hingeSet = new THREE.Group(); hingeSet.name = 'hinge_set' + suffix;
    [0.44, -0.44, 0].forEach((hy, k) => {
      const hg = buildHinge(M, hy, hingeX, leaf.dir, 'hinge' + suffix + '_' + (k + 1));
      hingeSet.add(hg.stat);
      hg.sashLeaf.position.set(leaf.dir * 0.006, hy, -0.030 - sashZ);
      pivot.add(hg.sashLeaf);
    });
    root.add(hingeSet);

    sashes.push({ pivot, lever: h.lever, dir: leaf.dir });
  });

  root.position.y = H / 2 + 0.02;

  const MAX = THREE.MathUtils.degToRad(70);
  const LEVER = THREE.MathUtils.degToRad(15);
  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const eased = c * c * (3 - 2 * c);
    sashes.forEach((s) => {
      s.pivot.rotation.y = -s.dir * eased * MAX;
      s.lever.rotation.z = -s.dir * Math.min(1, c / 0.15) * LEVER;
    });
  }
  setOpen(0);

  return {
    group: root, setOpen, sashes,
    config: { id: 'casement', motion: 'hinge_outswing_vertical', max_angle_deg: 70, handing: 'LH' },
  };
}
