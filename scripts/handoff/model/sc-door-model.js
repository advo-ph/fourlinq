import * as THREE from 'three';

/**
 * FourlinQ — SC-Door System. A casement-proportioned door leaf that slides
 * on a track rather than swinging on hinges.
 *
 * Units: real metres. Y up. +Z is the interior (viewer side).
 * Origin at the centre of the 1800 x 2400 opening.
 *
 * The operable leaf rides the INTERIOR track, the fixed lite sits on the
 * EXTERIOR one, so the two pass in different planes ~69 mm apart.
 * Handing "RH": leaf parks on the right, travels toward -X to open.
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

/* mitred rectangular ring, extruded in Z, centred on its own origin */
function ringGeometry(w, h, left, right, bottom, top, depth) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-w / 2 + left, -h / 2 + bottom);
  hole.lineTo(-w / 2 + left, h / 2 - top);
  hole.lineTo(w / 2 - right, h / 2 - top);
  hole.lineTo(w / 2 - right, -h / 2 + bottom);
  hole.closePath();
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1, steps: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}

function box(w, h, d, mat, name, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** mitred uPVC ring + glazing beads both faces + EPDM gasket line + glass */
function glazedPanel(M, { w, h, depth, stile, bottomRail, topRail, prefix }) {
  const g = new THREE.Group();
  g.name = prefix;

  const frame = new THREE.Mesh(ringGeometry(w, h, stile, stile, bottomRail, topRail, depth), M.upvc_white_matte);
  frame.name = prefix + '_frame';
  frame.castShadow = true; frame.receiveShadow = true;
  g.add(frame);

  const reb = new THREE.Mesh(
    ringGeometry(w - 0.014, h - 0.014, stile - 0.006, stile - 0.006, bottomRail - 0.006, topRail - 0.006, depth * 0.55),
    M.upvc_white_rebate
  );
  reb.name = prefix + '_rebate';
  g.add(reb);

  const gw = w - 2 * stile;                     // daylight of the lite
  const gh = h - bottomRail - topRail;
  const cy = (bottomRail - topRail) / 2;        // hole centre when rails differ

  const beadOut = new THREE.Mesh(ringGeometry(gw + 0.028, gh + 0.028, 0.014, 0.014, 0.014, 0.014, 0.012), M.upvc_white_rebate);
  beadOut.name = prefix + '_glazing_bead_01';
  beadOut.position.set(0, cy, depth / 2 - 0.007);
  g.add(beadOut);

  const beadIn = beadOut.clone();
  beadIn.name = prefix + '_glazing_bead_02';
  beadIn.position.set(0, cy, -depth / 2 + 0.007);
  g.add(beadIn);

  const gasket = new THREE.Mesh(ringGeometry(gw + 0.008, gh + 0.008, 0.007, 0.007, 0.007, 0.007, depth - 0.026), M.epdm_gasket_black);
  gasket.name = prefix + '_gasket';
  gasket.position.set(0, cy, 0);
  g.add(gasket);

  const glass = new THREE.Mesh(new THREE.BoxGeometry(gw + 0.004, gh + 0.004, 0.008), M.glass_clear);
  glass.name = prefix + '_glass';
  glass.position.set(0, cy, 0);
  g.add(glass);

  return g;
}

export function buildSCDoor(opts = {}) {
  const width = opts.width ?? 1.8;         // clear opening the two panels fill
  const height = opts.height ?? 2.4;
  const openRatio = opts.openRatio ?? 0.9;
  const handing = opts.handing ?? 'RH';
  const M = opts.materials ?? makeMaterials();
  const S = handing === 'LH' ? -1 : 1;     // +1 = leaf on the right, travels -X

  const group = new THREE.Group();
  group.name = 'sc_door';

  const hw = width / 2, hh = height / 2;   // 0.9, 1.2 — daylight of the opening
  const face = 0.062;                      // uPVC face width
  const frameD = 0.14;                     // outer frame depth (houses both planes)
  const frameZ = -0.004;

  const leafZ = 0.033;                     // interior plane
  const liteZ = -0.036;                    // exterior plane (69 mm apart)
  const leafD = 0.062;
  const liteD = 0.07;

  /* ---------------- outer frame ---------------- */
  const of = new THREE.Mesh(
    ringGeometry(width + 2 * face, height + 2 * face, face, face, face, face, frameD),
    M.upvc_white_matte
  );
  of.name = 'outer_frame';
  of.position.z = frameZ;
  of.castShadow = true; of.receiveShadow = true;
  group.add(of);

  const ofr = new THREE.Mesh(
    ringGeometry(width + 2 * face - 0.016, height + 2 * face - 0.016, face - 0.012, face - 0.012, face - 0.012, face - 0.012, frameD * 0.6),
    M.upvc_white_rebate
  );
  ofr.name = 'outer_frame_rebate';
  ofr.position.z = frameZ;
  group.add(ofr);

  /* ---------------- head track (slim, visible) ---------------- */
  const headPlateY = hh - 0.012;           // spans 1.176 .. 1.200
  group.add(box(width - 0.004, 0.024, frameD - 0.01, M.hinge_steel, 'head_track_plate', 0, headPlateY, frameZ));
  group.add(box(width - 0.004, 0.006, 0.016, M.hinge_steel, 'head_track_rail_int', 0, hh - 0.027, leafZ));
  group.add(box(width - 0.004, 0.006, 0.016, M.hinge_steel, 'head_track_rail_ext', 0, hh - 0.027, liteZ));

  /* ---------------- floor track (slim, visible) ---------------- */
  const railTopY = -hh + 0.032;            // -1.168
  group.add(box(width - 0.004, 0.024, frameD - 0.01, M.hinge_steel, 'floor_track_plate', 0, -hh + 0.012, frameZ));
  group.add(box(width - 0.004, 0.008, 0.014, M.hinge_steel, 'floor_track_rail_int', 0, railTopY - 0.004, leafZ));
  group.add(box(width - 0.004, 0.008, 0.014, M.hinge_steel, 'floor_track_rail_ext', 0, railTopY - 0.004, liteZ));

  /* ---------------- fixed lite (exterior plane) ---------------- */
  const liteW = 0.93;
  const liteBottom = railTopY, liteTop = hh - 0.03;
  const liteH = liteTop - liteBottom;
  const lite = glazedPanel(M, {
    w: liteW, h: liteH, depth: liteD,
    stile: 0.1, bottomRail: 0.12, topRail: 0.1,
    prefix: 'fixed_lite_01'
  });
  lite.position.set(S * (-hw + liteW / 2), (liteBottom + liteTop) / 2, liteZ);
  group.add(lite);

  /* jamb seal the leaf closes against, plus the interlock seal at the lite edge */
  const leafW = 0.894;
  const leafBottom = -hh + 0.076, leafTop = hh - 0.038;
  const leafH = leafTop - leafBottom;
  group.add(box(0.006, height - 0.02, 0.026, M.epdm_gasket_black, 'jamb_seal_01', S * (hw - 0.003), 0, leafZ));
  group.add(box(0.012, liteH - 0.02, 0.012, M.epdm_gasket_black, 'interlock_seal_01', S * (-hw + liteW - 0.006), (liteBottom + liteTop) / 2, liteZ + liteD / 2 - 0.006));

  /* ---------------- operable leaf (interior plane) ---------------- */
  const leaf = new THREE.Group();
  leaf.name = 'leaf_01';                   // the moving node
  const leafCX = S * (hw - 0.006 - leafW / 2);
  const leafCY = (leafBottom + leafTop) / 2;

  const panel = glazedPanel(M, {
    w: leafW, h: leafH, depth: leafD,
    stile: 0.1, bottomRail: 0.13, topRail: 0.1,
    prefix: 'leaf_01'
  });
  panel.position.set(leafCX, leafCY, leafZ);
  leaf.add(panel);

  /* rollers: two per leaf bottom, riding the interior floor rail */
  const axleY = leafBottom - 0.022;
  for (let r = 0; r < 2; r++) {
    const rx = leafCX + (r === 0 ? -1 : 1) * (leafW / 2 - 0.13);
    const n = '0' + (r + 1);
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.0215, 0.0215, 0.016, 20), M.hinge_steel);
    roller.name = 'leaf_01_roller_' + n;
    roller.rotation.x = Math.PI / 2;
    roller.position.set(rx, axleY, leafZ);
    roller.castShadow = true;
    leaf.add(roller);
    for (let f = 0; f < 2; f++) {
      leaf.add(box(0.052, 0.032, 0.008, M.hinge_steel, 'leaf_01_roller_cheek_' + n + '_0' + (f + 1),
        rx, leafBottom - 0.016, leafZ + (f === 0 ? -1 : 1) * 0.016));
    }
  }

  /* head guides straddling the interior head rail */
  for (let r = 0; r < 2; r++) {
    const gx = leafCX + (r === 0 ? -1 : 1) * (leafW / 2 - 0.13);
    for (let f = 0; f < 2; f++) {
      leaf.add(box(0.08, 0.012, 0.012, M.hinge_steel, 'leaf_01_head_guide_0' + (r + 1) + '_0' + (f + 1),
        gx, leafTop + 0.006, leafZ + (f === 0 ? -1 : 1) * 0.017));
    }
  }

  /* D-pull handle + lock body, interior face of the closing stile */
  const hx = leafCX + S * (leafW / 2 - 0.055);
  const hzo = leafZ + leafD / 2;
  leaf.add(box(0.05, 0.34, 0.01, M.hardware_matte_black, 'handle_backplate', hx, -0.12, hzo + 0.005));
  for (let i = 0; i < 2; i++) {
    leaf.add(box(0.03, 0.03, 0.024, M.hardware_matte_black, 'handle_standoff_0' + (i + 1), hx, -0.12 + (i === 0 ? -0.13 : 0.13), hzo + 0.022));
  }
  leaf.add(box(0.024, 0.29, 0.024, M.hardware_matte_black, 'handle_bar', hx, -0.12, hzo + 0.046));
  leaf.add(box(0.042, 0.07, 0.014, M.hardware_matte_black, 'lock_body', hx, -0.335, hzo + 0.007));
  const turn = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.03, 16), M.hardware_matte_black);
  turn.name = 'lock_thumbturn';
  turn.rotation.x = Math.PI / 2;
  turn.position.set(hx, -0.335, hzo + 0.029);
  turn.castShadow = true;
  leaf.add(turn);

  group.add(leaf);

  // The trailing edge of the closed leaf sits at x = S*(hw - 0.006 - leafW) = 0.
  // It runs until that edge reaches the far jamb face less 6 mm of clearance.
  const travelMax = (hw - 0.006 - leafW) + hw - 0.006;   // 0.894 m
  const travel = travelMax * openRatio;          // 805 mm at openRatio 0.9

  function setOpen(t) {
    const k = Math.min(1, Math.max(0, t));
    leaf.position.x = -S * travel * k;
  }
  setOpen(0);

  return { group, setOpen, travel, travelMax, materials: M };
}
