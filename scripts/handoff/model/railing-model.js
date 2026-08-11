import * as THREE from 'three';

/**
 * FourlinQ — frameless structural glass balustrade.
 * Units: real metres. Y up. +Z is the interior (viewer side).
 * Origin at the centre of the opening: x=0 mid-run, y=0 mid-height.
 *
 * The balustrade is static. The only moving part is the optional gate leaf,
 * hung on two patch fittings at one stile and swinging out (toward -Z) 0..90°.
 * With gate:false, setOpen(t) is a no-op — that is the honest answer.
 */

export function makeMaterials() {
  const m = {
    upvc_white_matte: new THREE.MeshStandardMaterial({ color: 0xf3f2ef, roughness: 0.62, metalness: 0.0 }),
    upvc_white_rebate: new THREE.MeshStandardMaterial({ color: 0xdcd9d3, roughness: 0.7, metalness: 0.0 }),
    alu_clad_graphite: new THREE.MeshStandardMaterial({ color: 0x3b3e42, roughness: 0.45, metalness: 0.35 }),
    glass_clear: new THREE.MeshStandardMaterial({
      color: 0xc3d8db, roughness: 0.08, metalness: 0.0,
      transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false
    }),
    epdm_gasket_black: new THREE.MeshStandardMaterial({ color: 0x1b1b1c, roughness: 0.95, metalness: 0.0 }),
    hardware_matte_black: new THREE.MeshStandardMaterial({ color: 0x232426, roughness: 0.5, metalness: 0.3 }),
    hinge_steel: new THREE.MeshStandardMaterial({ color: 0xb8bbbf, roughness: 0.35, metalness: 0.35 })
  };
  for (const k in m) m[k].name = k;
  return m;
}

/* ---------- primitives ---------- */

function box(w, h, d, mat, name, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function tube(r, len, mat, name, axis, x = 0, y = 0, z = 0, seg = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg, 1), mat);
  mesh.name = name;
  if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

/**
 * A mitred profile (points given in the Z/Y cross-section plane) run along X.
 * side = +1 puts the profile's +u toward +Z, -1 mirrors it.
 */
function profileRun(pts, length, mat, name, xCenter, side = 1) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false, curveSegments: 1, steps: 1 });
  g.translate(0, 0, -length / 2);
  const mesh = new THREE.Mesh(g, mat);
  mesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  mesh.position.x = xCenter;
  mesh.name = name;
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

/* ---------- profiles (metres, cross-section in Z/Y) ---------- */

const CHANNEL = (y0) => [                 // 90 x 100 mm U, 28 mm glass slot 58 mm deep
  [-0.045, y0], [0.045, y0], [0.045, y0 + 0.100],
  [0.014, y0 + 0.100], [0.014, y0 + 0.042], [-0.014, y0 + 0.042], [-0.014, y0 + 0.100],
  [-0.045, y0 + 0.100]
];

const TRIM = (yTop) => [                  // snap-on cover trim, one side
  [0.014, yTop - 0.020], [0.047, yTop - 0.020], [0.047, yTop - 0.007],
  [0.030, yTop], [0.014, yTop]
];

const SADDLE = (yTop) => [                // 34 mm rail saddle, 15 mm glass slot, open below
  [-0.017, yTop - 0.0215], [-0.0075, yTop - 0.0215], [-0.0075, yTop - 0.006],
  [0.0075, yTop - 0.006], [0.0075, yTop - 0.0215], [0.017, yTop - 0.0215],
  [0.017, yTop], [-0.017, yTop]
];

/* ---------- builder ---------- */

export function buildGlassRailing(opts = {}) {
  const run = opts.run ?? 3.0;
  const height = opts.height ?? 1.1;
  const panels = Math.max(1, Math.round(opts.panel ?? 3));
  const gt = opts.glassThickness ?? 0.012;
  const gap = opts.gap ?? 0.015;
  const handrail = opts.handrail !== false;
  const gateOn = opts.gate === true;
  const gateIndex = Math.min(panels - 1, Math.max(0, opts.gateIndex ?? 0));
  const M = opts.materials ?? makeMaterials();

  const group = new THREE.Group();
  group.name = 'glass_railing';

  const halfRun = run / 2;
  const floorY = -height / 2;                       // -0.55
  const topY = height / 2;                          //  0.55
  const chanTop = floorY + 0.100;                   // -0.45
  const trimTop = chanTop + 0.020;                  // -0.43
  const railR = 0.025;
  const railY = topY - railR;                       //  0.525
  const saddleTop = railY - railR;                  //  0.500
  const glassTop = handrail ? saddleTop - 0.0075 : topY - 0.010;
  const glassBottom = floorY + 0.047;               // seated 5 mm off the slot floor
  const pw = (run - (panels - 1) * gap) / panels;

  const panelX = (i) => -halfRun + i * (pw + gap) + pw / 2;

  /* ---- gate geometry, resolved before the static run so it can be cut ---- */
  const s = gateIndex <= (panels - 1) / 2 ? 1 : -1;  // +1: hinge on the left stile
  const gateCx = panelX(gateIndex);
  const hingeX = gateCx - s * (pw / 2 - 0.030);      // pivot line, 30 mm in from the stile
  const leafW = pw - 0.030;                          // swing clearance at the free stile
  const RAIL_CUT = 0.045, CHAN_CUT = 0.055, FREE_CUT = 0.015;

  function cut(back, front) {
    const a = hingeX - s * back, b = hingeX + s * (leafW + front);
    return [Math.min(a, b), Math.max(a, b)];
  }
  function segments(cutRange) {
    if (!gateOn) return [[-halfRun, halfRun]];
    const [a, b] = cutRange;
    return [[-halfRun, a], [b, halfRun]].filter(([p, q]) => q - p > 0.02);
  }
  const railSegs = segments(cut(RAIL_CUT, FREE_CUT));
  const chanSegs = segments(cut(CHAN_CUT, FREE_CUT));

  /* ---- base channel + cover trims ---- */
  chanSegs.forEach(([a, b], i) => {
    const n = String(i + 1).padStart(2, '0');
    const len = b - a, cx = (a + b) / 2;
    group.add(profileRun(CHANNEL(floorY), len, M.upvc_white_matte, 'base_channel_' + n, cx));
    group.add(profileRun(TRIM(trimTop), len, M.upvc_white_matte, 'channel_cover_trim_' + n + '_front', cx, 1));
    group.add(profileRun(TRIM(trimTop), len, M.upvc_white_matte, 'channel_cover_trim_' + n + '_rear', cx, -1));
    group.add(box(len, 0.005, 0.024, M.epdm_gasket_black, 'channel_setting_gasket_' + n, cx, floorY + 0.0445, 0));
  });

  /* ---- glass panels, saddles, spigots ---- */
  const glassH = glassTop - glassBottom;
  const glassCy = (glassTop + glassBottom) / 2;
  let spigot = 0;

  for (let i = 0; i < panels; i++) {
    if (gateOn && i === gateIndex) continue;
    const n = String(i + 1).padStart(2, '0');
    const cx = panelX(i);

    const panel = new THREE.Group();
    panel.name = 'panel_' + n;
    panel.add(box(pw, glassH, gt, M.glass_clear, 'panel_' + n + '_glass', cx, glassCy, 0));
    group.add(panel);

    if (handrail) group.add(profileRun(SADDLE(saddleTop), pw, M.upvc_white_rebate, 'rail_saddle_' + n, cx));

    for (let k = 0; k < 2; k++) {
      spigot++;
      const sn = String(spigot).padStart(2, '0');
      const sx = cx + (k === 0 ? -1 : 1) * pw * 0.28;
      for (const [face, dz] of [['front', 1], ['rear', -1]]) {
        const geo = new THREE.CylinderGeometry(0.030, 0.038, 0.130, 12, 1, false,
          dz > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI);
        const shell = new THREE.Mesh(geo, M.hinge_steel);
        shell.name = 'spigot_' + sn + '_' + face;
        shell.position.set(sx, trimTop + 0.066, dz * 0.0075);
        shell.castShadow = true; shell.receiveShadow = true;
        group.add(shell);
      }
      group.add(box(0.028, 0.010, 0.014, M.hardware_matte_black, 'spigot_' + sn + '_grub_screw', sx, trimTop + 0.100, 0.046));
    }
  }

  /* ---- handrail ---- */
  if (handrail) {
    railSegs.forEach(([a, b], i) => {
      const n = String(i + 1).padStart(2, '0');
      group.add(tube(railR, b - a, M.upvc_white_rebate, 'handrail_' + n, 'x', (a + b) / 2, railY, 0));
    });
  }

  /* ---- gate leaf ---- */
  const gate = new THREE.Group();
  gate.name = 'gate_leaf';
  gate.position.set(hingeX, 0, 0);

  if (gateOn) {
    const gBottom = chanTop + 0.020;                 // clears the channel and its trim
    const gTop = glassTop;
    const gH = gTop - gBottom;
    const gCy = (gTop + gBottom) / 2;
    const R0 = 0.055;                                // inboard start of the gate's own cap rail
    const G0 = 0.050;                                // glass held clear of the newel post

    gate.add(box(leafW - G0, gH, gt, M.glass_clear, 'gate_glass', s * ((G0 + leafW) / 2), gCy, 0));

    if (handrail) {
      const rl = leafW - R0;
      gate.add(profileRun(SADDLE(saddleTop), rl, M.upvc_white_rebate, 'gate_rail_saddle', s * (R0 + rl / 2)));
      gate.add(tube(railR, rl, M.upvc_white_rebate, 'gate_handrail', 'x', s * (R0 + rl / 2), railY, 0));
    }

    /* two patch fittings on the hinge stile — plates straddle the glass,
       collars ride the newel post (2 mm clear of it, so nothing sweeps through it) */
    [['01', gTop - 0.075], ['02', gBottom + 0.075]].forEach(([n, py]) => {
      for (const [face, dz] of [['front', 1], ['rear', -1]]) {
        gate.add(box(0.105, 0.090, 0.008, M.hinge_steel,
          'gate_patch_' + n + '_' + face, s * 0.1005, py, dz * (gt / 2 + 0.005)));
      }
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.008, 6, 16), M.hinge_steel);
      collar.name = 'gate_hinge_collar_' + n;
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, py, 0);
      collar.castShadow = true; collar.receiveShadow = true;
      gate.add(collar);
    });

    /* pull handle on the free stile, interior face */
    const hx = s * (leafW - 0.075);
    gate.add(tube(0.009, 0.300, M.hardware_matte_black, 'gate_pull_bar', 'y', hx, 0.030, 0.072, 12));
    [0.180, -0.120].forEach((py, k) => {
      gate.add(tube(0.008, 0.058, M.hardware_matte_black, 'gate_pull_post_' + (k === 0 ? '01' : '02'),
        'z', hx, py, 0.037, 10));
    });

    /* latch on the free stile */
    for (const [face, dz] of [['front', 1], ['rear', -1]]) {
      gate.add(box(0.055, 0.090, 0.012, M.hardware_matte_black,
        'gate_latch_' + face, s * (leafW - 0.030), -0.060, dz * (gt / 2 + 0.007)));
    }
    gate.add(box(0.014, 0.030, 0.018, M.hinge_steel, 'gate_latch_bolt', s * (leafW + 0.012), -0.060, 0));

    /* static side of the gate: stainless newel post on the pivot line + latch keep */
    const postTop = handrail ? saddleTop : glassTop;
    group.add(tube(0.028, postTop - floorY, M.hinge_steel, 'gate_newel_post', 'y', hingeX, (postTop + floorY) / 2, 0, 16));
    group.add(tube(0.048, 0.014, M.hinge_steel, 'gate_newel_base', 'y', hingeX, floorY + 0.007, 0, 16));
    const hasNeighbour = s > 0 ? gateIndex < panels - 1 : gateIndex > 0;
    if (hasNeighbour) {
      for (const [face, dz] of [['front', 1], ['rear', -1]]) {
        group.add(box(0.042, 0.070, 0.012, M.hardware_matte_black, 'gate_latch_keep_' + face,
          hingeX + s * (leafW + 0.050), -0.060, dz * (gt / 2 + 0.007)));
      }
    }
  }
  group.add(gate);

  const maxAngleDeg = gateOn ? 90 : 0;
  const maxAngle = THREE.MathUtils.degToRad(maxAngleDeg);

  /** Pure function of t. Static balustrade → no-op; gate leaf → 0..90° outward. */
  function setOpen(t) {
    if (!gateOn) return;
    const k = Math.min(1, Math.max(0, t));
    gate.rotation.y = s * maxAngle * k;
  }
  setOpen(0);

  return {
    group, setOpen, materials: M, maxAngleDeg,
    gate: gateOn,
    panelWidth: pw,
    handing: gateOn ? (s > 0 ? 'left-hung gate, opens out' : 'right-hung gate, opens out') : 'fixed'
  };
}
