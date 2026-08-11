import * as THREE from 'three';

/**
 * FourlinQ — chain-actuated automatic awning window.
 * Units: real metres. Y up. +Z is the interior (viewer side).
 * Origin at the centre of the opening. Top-hung sash, swings out toward -Z.
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

function ring(w, h, face, depth, mat, name, z) {
  const mesh = new THREE.Mesh(ringGeometry(w, h, face, face, face, face, depth), mat);
  mesh.name = name;
  mesh.position.z = z;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** glazed panel: mitred uPVC ring + rebate + beads both faces + gasket + glass */
function glazedPanel(M, { w, h, depth, stile, bottomRail, topRail, prefix }) {
  const g = new THREE.Group();
  g.name = prefix;

  const frame = new THREE.Mesh(ringGeometry(w, h, stile, stile, bottomRail, topRail, depth), M.upvc_white_matte);
  frame.name = prefix + '_frame';
  frame.castShadow = true; frame.receiveShadow = true;
  g.add(frame);

  const reb = new THREE.Mesh(
    ringGeometry(w - 0.014, h - 0.014, stile - 0.006, stile - 0.006, bottomRail - 0.006, topRail - 0.006, depth * 0.5),
    M.upvc_white_rebate
  );
  reb.name = prefix + '_rebate';
  g.add(reb);

  const gw = w - 2 * stile;
  const gh = h - bottomRail - topRail;
  const cy = (topRail - bottomRail) / -2;

  const beadOut = new THREE.Mesh(ringGeometry(gw + 0.024, gh + 0.024, 0.012, 0.012, 0.012, 0.012, 0.010), M.upvc_white_rebate);
  beadOut.name = prefix + '_glazing_bead_01';
  beadOut.position.set(0, cy, depth / 2 - 0.006);
  g.add(beadOut);

  const beadIn = beadOut.clone();
  beadIn.name = prefix + '_glazing_bead_02';
  beadIn.position.set(0, cy, -depth / 2 + 0.006);
  g.add(beadIn);

  const gasket = new THREE.Mesh(ringGeometry(gw + 0.008, gh + 0.008, 0.007, 0.007, 0.007, 0.007, depth - 0.022), M.epdm_gasket_black);
  gasket.name = prefix + '_glazing_gasket';
  gasket.position.set(0, cy, 0);
  g.add(gasket);

  const glass = new THREE.Mesh(new THREE.BoxGeometry(gw + 0.004, gh + 0.004, 0.008), M.glass_clear);
  glass.name = prefix + '_glass';
  glass.position.set(0, cy, 0);
  g.add(glass);

  return g;
}

export function buildAutomatedWindow(opts = {}) {
  const width = opts.width ?? 1.2;
  const height = opts.height ?? 0.7;
  const maxAngleDeg = opts.maxAngleDeg ?? 35;
  const pitch = (opts.chainLink ?? 18) / 1000;
  const M = opts.materials ?? makeMaterials();

  const group = new THREE.Group();
  group.name = 'automated_window';

  const halfW = width / 2, halfH = height / 2;
  const frameFace = 0.062, frameDepth = 0.07;
  const apW = width - 2 * frameFace;          // 1.076 daylight aperture
  const apH = height - 2 * frameFace;         // 0.576
  const maxAngle = THREE.MathUtils.degToRad(maxAngleDeg);

  /* ---------------- outer frame ---------------- */
  group.add(ring(width, height, frameFace, frameDepth, M.upvc_white_matte, 'frame_outer', 0));
  group.add(ring(width - 0.014, height - 0.014, frameFace - 0.007, frameDepth * 0.54, M.upvc_white_rebate, 'frame_rebate', 0));
  /* interior stop the sash closes against, 14 mm into the aperture */
  group.add(ring(apW, apH, 0.014, 0.016, M.upvc_white_rebate, 'frame_stop', 0.027));
  /* perimeter weather seal, exterior face of the stop */
  group.add(ring(apW, apH, 0.010, 0.004, M.epdm_gasket_black, 'perimeter_seal', 0.017));

  /* ---------------- sash (moving node, hinged on its top rail) ---------------- */
  const sashW = apW - 0.006, sashH = apH - 0.006, sashDepth = 0.052;
  const AXIS_Y = sashH / 2;                    // 0.285 — top rail line
  const AXIS_Z = -(frameDepth / 2) - 0.006;    // -0.041 — surface hinge, exterior face
  const panelZ = 0.030;                        // sash local z of the panel centre

  const sash = new THREE.Group();
  sash.name = 'sash';
  sash.position.set(0, AXIS_Y, AXIS_Z);

  const panel = glazedPanel(M, {
    w: sashW, h: sashH, depth: sashDepth,
    stile: 0.058, bottomRail: 0.062, topRail: 0.058,
    prefix: 'sash'
  });
  panel.position.set(0, -sashH / 2, panelZ);
  sash.add(panel);

  /* sash-side hinge leaves, on the axis */
  for (let i = 0; i < 2; i++) {
    const sgn = i === 0 ? -1 : 1, n = i === 0 ? '01' : '02';
    sash.add(box(0.072, 0.036, 0.012, M.hinge_steel, 'sash_hinge_leaf_' + n, sgn * 0.42, -0.024, -0.002));
  }

  /* chain bracket on the interior face of the bottom rail */
  const bracketY = -0.532, plateZ = 0.062;
  sash.add(box(0.076, 0.036, 0.012, M.hinge_steel, 'chain_bracket_plate', 0, bracketY, plateZ));
  sash.add(box(0.026, 0.016, 0.016, M.hinge_steel, 'chain_bracket_ear', 0, -0.520, 0.076));
  const PIN = { y: -0.513, z: 0.080 };         // chain attachment, sash-local
  group.add(sash);

  /* frame-side hinge leaves + knuckles (static, sitting on the axis) */
  for (let i = 0; i < 2; i++) {
    const sgn = i === 0 ? -1 : 1, n = i === 0 ? '01' : '02';
    group.add(box(0.072, 0.030, 0.012, M.hinge_steel, 'frame_hinge_leaf_' + n, sgn * 0.42, halfH - 0.046, AXIS_Z - 0.001));
    const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.052, 12), M.hinge_steel);
    knuckle.name = 'hinge_knuckle_' + n;
    knuckle.rotation.z = Math.PI / 2;
    knuckle.position.set(sgn * 0.42, AXIS_Y, AXIS_Z);
    knuckle.castShadow = true;
    group.add(knuckle);
  }

  /* ---------------- chain actuator, interior face of the sill ---------------- */
  const actY = -0.278, actZ = 0.055;           // 300 x 40 x 40 housing
  const actuator = new THREE.Group();
  actuator.name = 'actuator_assembly';
  actuator.add(box(0.30, 0.04, 0.04, M.hardware_matte_black, 'actuator_housing', 0, actY, actZ));
  actuator.add(box(0.012, 0.046, 0.046, M.hardware_matte_black, 'actuator_endcap_01', -0.156, actY, actZ));
  actuator.add(box(0.012, 0.046, 0.046, M.hardware_matte_black, 'actuator_endcap_02', 0.156, actY, actZ));
  actuator.add(box(0.26, 0.006, 0.006, M.hinge_steel, 'actuator_face_groove', 0, actY, actZ + 0.023));
  for (let i = 0; i < 2; i++) {
    const sgn = i === 0 ? -1 : 1, n = i === 0 ? '01' : '02';
    actuator.add(box(0.05, 0.05, 0.008, M.hinge_steel, 'actuator_mount_' + n, sgn * 0.108, actY, 0.039));
  }
  /* chain exit nose */
  actuator.add(box(0.034, 0.008, 0.03, M.hinge_steel, 'chain_guide_nose', 0, -0.254, 0.050));
  const sprocket = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 14), M.hinge_steel);
  sprocket.name = 'chain_sprocket';
  sprocket.rotation.z = Math.PI / 2;
  sprocket.position.set(0, -0.266, 0.050);
  actuator.add(sprocket);
  group.add(actuator);

  const A = { y: -0.252, z: 0.050 };           // chain pays out from here

  /* ---------------- chain ---------------- */
  function pinAt(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return {
      y: AXIS_Y + (PIN.y * c - PIN.z * s),
      z: AXIS_Z + (PIN.y * s + PIN.z * c)
    };
  }
  function span(a) {
    const p = pinAt(a);
    const dy = p.y - A.y, dz = p.z - A.z;
    return { dy, dz, len: Math.hypot(dy, dz) };
  }
  const closedLen = span(0).len;
  const openLen = span(maxAngle).len;
  const linkCount = Math.ceil(openLen / pitch) + 3;

  const links = [];
  for (let i = 0; i < linkCount; i++) {
    const n = String(i + 1).padStart(2, '0');
    const node = new THREE.Group();
    node.name = 'chain_link_' + n;
    const plate = box(0.012, 0.016, 0.0035, M.hinge_steel, 'chain_link_plate_' + n);
    plate.rotation.y = (i % 2) * Math.PI / 2;   // alternating plates, as a real link chain
    node.add(plate);
    links.push(node);
    group.add(node);
  }

  function setOpen(t) {
    const k = Math.min(1, Math.max(0, t));
    const a = maxAngle * k;
    sash.rotation.x = a;

    const { dy, dz, len } = span(a);
    const uy = dy / len, uz = dz / len;
    const dir = Math.atan2(uz, uy);
    const shown = Math.min(linkCount, Math.max(1, Math.floor(len / pitch)));

    for (let i = 0; i < linkCount; i++) {
      const node = links[i];
      if (i < shown) {
        const d = (i + 0.5) * pitch;
        node.position.set(0, A.y + uy * d, A.z + uz * d);
        node.rotation.set(dir, 0, 0);
      } else {
        /* stored in the housing, laid along its length — never overlapping */
        const j = i - shown;
        node.position.set(-0.132 + j * 0.0135, actY, actZ);
        node.rotation.set(0, 0, Math.PI / 2);
      }
    }
  }
  setOpen(0);

  return {
    group, setOpen, materials: M, maxAngleDeg,
    chainLength: (t) => span(maxAngle * Math.min(1, Math.max(0, t))).len,
    chainStroke: openLen - closedLen
  };
}
