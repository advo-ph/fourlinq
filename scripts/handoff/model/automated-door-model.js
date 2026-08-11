import * as THREE from 'three';

/**
 * FourlinQ — automatic bi-parting sliding entrance.
 * Units: real metres. Y up. +Z is the interior (viewer side).
 * Origin at the centre of the opening.
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
  const hx0 = -w / 2 + left, hx1 = w / 2 - right;
  const hy0 = -h / 2 + bottom, hy1 = h / 2 - top;
  const hole = new THREE.Path();
  hole.moveTo(hx0, hy0);
  hole.lineTo(hx0, hy1);
  hole.lineTo(hx1, hy1);
  hole.lineTo(hx1, hy0);
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

/**
 * A glazed panel: mitred uPVC ring + glazing beads both faces + EPDM
 * gasket line + glass. Returns a THREE.Group centred on the panel.
 */
function glazedPanel(M, { w, h, depth, stile, bottomRail, topRail, prefix }) {
  const g = new THREE.Group();
  g.name = prefix;

  const frame = new THREE.Mesh(ringGeometry(w, h, stile, stile, bottomRail, topRail, depth), M.upvc_white_matte);
  frame.name = prefix + '_frame';
  frame.castShadow = true; frame.receiveShadow = true;
  g.add(frame);

  // rebate / inner return, sitting just behind the outer face
  const reb = new THREE.Mesh(
    ringGeometry(w - 0.014, h - 0.014, stile - 0.005, stile - 0.005, bottomRail - 0.005, topRail - 0.005, depth * 0.55),
    M.upvc_white_rebate
  );
  reb.name = prefix + '_rebate';
  g.add(reb);

  const gw = w - 2 * stile;         // daylight opening
  const gh = h - bottomRail - topRail;
  const gcy = (bottomRail - topRail) / -2 + 0; // hole centre offset in y
  const cy = (topRail - bottomRail) / -2;
  void gcy;

  const beadOut = new THREE.Mesh(ringGeometry(gw + 0.026, gh + 0.026, 0.013, 0.013, 0.013, 0.013, 0.011), M.upvc_white_rebate);
  beadOut.name = prefix + '_glazing_bead_01';
  beadOut.position.set(0, cy, depth / 2 - 0.0065);
  g.add(beadOut);

  const beadIn = beadOut.clone();
  beadIn.name = prefix + '_glazing_bead_02';
  beadIn.position.set(0, cy, -depth / 2 + 0.0065);
  g.add(beadIn);

  const gasket = new THREE.Mesh(ringGeometry(gw + 0.008, gh + 0.008, 0.007, 0.007, 0.007, 0.007, depth - 0.024), M.epdm_gasket_black);
  gasket.name = prefix + '_gasket';
  gasket.position.set(0, cy, 0);
  g.add(gasket);

  const glass = new THREE.Mesh(new THREE.BoxGeometry(gw + 0.004, gh + 0.004, 0.008), M.glass_clear);
  glass.name = prefix + '_glass';
  glass.position.set(0, cy, 0);
  g.add(glass);

  return g;
}

export function buildAutomatedDoor(opts = {}) {
  const width = opts.width ?? 2.4;
  const height = opts.height ?? 2.4;
  const openRatio = opts.openRatio ?? 0.97;
  const hasSidelite = opts.sidelite ?? true;
  const M = opts.materials ?? makeMaterials();

  const group = new THREE.Group();
  group.name = 'automated_door';

  const halfW = width / 2;
  const halfH = height / 2;
  const panelW = width / 4;          // 0.6 m at 2400 wide
  const leafDepth = 0.062;
  const sideDepth = 0.07;
  const leafZ = -0.058;              // leaves run behind (exterior of) the sidelites
  const sideZ = 0.02;
  const sealW = 0.006;

  /* ---------------- header box (the operator) ---------------- */
  const headerH = 0.18, headerD = 0.15, headerY = halfH + headerH / 2, headerZ = -0.015;
  const header = new THREE.Group();
  header.name = 'header_assembly';
  header.add(box(width, headerH, headerD, M.upvc_white_matte, 'header_box', 0, headerY, headerZ));
  header.add(box(width - 0.024, headerH - 0.016, 0.006, M.alu_clad_graphite, 'header_fascia', 0, headerY, headerZ + headerD / 2 + 0.003));
  header.add(box(width, 0.014, headerD + 0.01, M.alu_clad_graphite, 'header_top_cap', 0, headerY + headerH / 2 + 0.007, headerZ));
  header.add(box(0.014, headerH + 0.014, headerD + 0.01, M.alu_clad_graphite, 'header_endcap_01', -halfW - 0.007, headerY, headerZ));
  header.add(box(0.014, headerH + 0.014, headerD + 0.01, M.alu_clad_graphite, 'header_endcap_02', halfW + 0.007, headerY, headerZ));
  group.add(header);

  /* sensor housings, interior face of the header */
  for (let i = 0; i < 2; i++) {
    const sx = (i === 0 ? -1 : 1) * (halfW - 0.34);
    const n = i === 0 ? '01' : '02';
    group.add(box(0.19, 0.046, 0.03, M.hardware_matte_black, 'sensor_housing_' + n, sx, headerY - 0.038, headerZ + headerD / 2 + 0.021));
    group.add(box(0.168, 0.024, 0.008, M.hardware_matte_black, 'sensor_lens_' + n, sx, headerY - 0.038, headerZ + headerD / 2 + 0.04));
    group.add(box(0.03, 0.03, 0.02, M.hinge_steel, 'sensor_bracket_' + n, sx, headerY + 0.01, headerZ + headerD / 2 + 0.014));
  }

  /* ---------------- head track inside the header ---------------- */
  const railY = halfH + 0.044;      // rail centre; underside at halfH + 0.03
  const railGap = 0.026;            // rollers ride outboard of the carrier plate
  group.add(box(width - 0.05, 0.028, 0.03, M.hinge_steel, 'head_track_rail_01', 0, railY, leafZ - railGap));
  group.add(box(width - 0.05, 0.028, 0.03, M.hinge_steel, 'head_track_rail_02', 0, railY, leafZ + railGap));
  group.add(box(width - 0.05, 0.012, 0.096, M.hinge_steel, 'head_track_plate', 0, railY + 0.026, leafZ));
  for (let i = 0; i < 4; i++) {
    const bx = -halfW + 0.24 + i * ((width - 0.48) / 3);
    group.add(box(0.05, 0.05, 0.012, M.hinge_steel, 'track_bracket_0' + (i + 1), bx, railY + 0.057, leafZ - 0.02));
  }

  /* ---------------- floor guide track ---------------- */
  const floorY = -halfH - 0.008;
  group.add(box(width - 0.05, 0.014, 0.014, M.hinge_steel, 'floor_guide_rail_01', 0, floorY, leafZ - 0.019));
  group.add(box(width - 0.05, 0.014, 0.014, M.hinge_steel, 'floor_guide_rail_02', 0, floorY, leafZ + 0.019));
  group.add(box(width - 0.05, 0.006, 0.052, M.hinge_steel, 'floor_guide_base', 0, floorY - 0.01, leafZ));
  void 0;

  /* ---------------- fixed sidelites ---------------- */
  const sideInner = panelW - 0.02;           // 20 mm interlock with the closed leaf
  const sideW = halfW - sideInner;
  if (hasSidelite) {
    for (let i = 0; i < 2; i++) {
      const sgn = i === 0 ? -1 : 1;
      const n = i === 0 ? '01' : '02';
      const p = glazedPanel(M, {
        w: sideW, h: height, depth: sideDepth,
        stile: 0.062, bottomRail: 0.11, topRail: 0.062,
        prefix: 'sidelite_' + n
      });
      p.position.set(sgn * (sideInner + sideW / 2), 0, sideZ);
      group.add(p);
      group.add(box(0.02, height, sideDepth + 0.012, M.upvc_white_matte, 'jamb_' + n, sgn * (halfW + 0.01), 0, sideZ));
      group.add(box(0.012, height, 0.02, M.epdm_gasket_black, 'jamb_seal_' + n, sgn * (sideInner - 0.006), 0, sideZ));
    }
  }

  /* ---------------- sliding leaves ---------------- */
  const leafBodyW = panelW - sealW;
  const leafH = height - 0.02;
  const leafCY = -0.01;
  const leaves = [];
  for (let i = 0; i < 2; i++) {
    const sgn = i === 0 ? -1 : 1;
    const n = i === 0 ? '01' : '02';
    const node = new THREE.Group();
    node.name = 'leaf_' + n;            // the moving node
    const p = glazedPanel(M, {
      w: leafBodyW, h: leafH, depth: leafDepth,
      stile: 0.05, bottomRail: 0.105, topRail: 0.058,
      prefix: 'leaf_' + n
    });
    const cx = sgn * (sealW + leafBodyW / 2);
    p.position.set(cx, leafCY, leafZ);
    node.add(p);

    // meeting-stile seal on the leading edge
    node.add(box(0.005, leafH - 0.01, leafDepth - 0.006, M.epdm_gasket_black,
      'leaf_' + n + '_leading_seal', sgn * 0.0035, leafCY, leafZ));

    // hanger carriers + rollers
    const axleY = railY - 0.014 - 0.022;
    for (let r = 0; r < 2; r++) {
      const rx = cx + (r === 0 ? -1 : 1) * (leafBodyW / 2 - 0.11);
      node.add(box(0.12, 0.03, 0.03, M.hinge_steel, 'leaf_' + n + '_carrier_0' + (r + 1), rx, axleY, leafZ));
      node.add(box(0.032, 0.013, 0.02, M.hinge_steel, 'leaf_' + n + '_hanger_0' + (r + 1), rx, axleY - 0.0215, leafZ));
      for (let s = 0; s < 2; s++) {
        const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.018, 20), M.hinge_steel);
        roller.name = 'leaf_' + n + '_roller_0' + (r * 2 + s + 1);
        roller.rotation.x = Math.PI / 2;
        roller.position.set(rx, axleY, leafZ + (s === 0 ? -1 : 1) * railGap);
        roller.castShadow = true;
        node.add(roller);
      }
    }

    // bottom guide riding between the floor rails
    node.add(box(0.07, 0.014, 0.016, M.hardware_matte_black, 'leaf_' + n + '_bottom_guide', cx, floorY + 0.001, leafZ));

    leaves.push(node);
    group.add(node);
  }

  const maxTravel = halfW - panelW;                 // 0.6 m at 2400 wide
  const travel = maxTravel * openRatio;             // 582 mm

  function setOpen(t) {
    const k = Math.min(1, Math.max(0, t));
    leaves[0].position.x = -travel * k;
    leaves[1].position.x = travel * k;
  }
  setOpen(0);

  return { group, setOpen, travel, materials: M };
}
