import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* Finishes — recolour the uPVC/aluminium palette without touching topology. */
export const FINISHES = {
  white:    { label: 'Matte white uPVC', face: 0xf3f3f0, rebate: 0xe9e9e5, rough: 0.62 },
  charcoal: { label: 'Matte charcoal',   face: 0x2c2f31, rebate: 0x232628, rough: 0.58 },
  bronze:   { label: 'Bronze anodised',  face: 0x4a3a2c, rebate: 0x3b2f24, rough: 0.52 },
  woodgrain:{ label: 'Wood-grain foil',  face: 0x8a5a30, rebate: 0x74491f, rough: 0.66 },
};

export function makeBifoldMaterials(finish = 'white') {
  const M = makeMaterials();
  const f = FINISHES[finish] || FINISHES.white;
  M.upvc = M.upvc.clone(); M.upvcInner = M.upvcInner.clone();
  M.upvc.color.setHex(f.face); M.upvc.roughness = f.rough; M.upvc.name = 'upvc_' + finish;
  M.upvcInner.color.setHex(f.rebate); M.upvcInner.name = 'upvc_' + finish + '_rebate';
  return M;
}

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

/* Butt hinge: two leaves + knuckle barrel, axis vertical, sat on the panel edge. */
function buildHinge(M, name, panelD) {
  const g = new THREE.Group();
  g.name = name;
  const barrel = mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.108, 18), M.steel, name + '_knuckle');
  g.add(barrel);
  [-1, 1].forEach((s, i) => {
    g.add(mesh(new THREE.BoxGeometry(0.040, 0.100, 0.0055), M.steel, name + '_leaf_' + (i + 1),
      [s * 0.020, 0, s * (panelD / 2 - 0.010)]));
  });
  for (let i = 0; i < 3; i++) {
    g.add(mesh(new THREE.CylinderGeometry(0.0145, 0.0145, 0.008, 18), M.hardware,
      name + '_collar_' + (i + 1), [0, (i - 1) * 0.042, 0]));
  }
  return g;
}

/* Top carrier: roller block that rides the head track. */
function buildCarrier(M, name) {
  const g = new THREE.Group();
  g.name = name;
  g.add(mesh(new THREE.BoxGeometry(0.086, 0.030, 0.034), M.steel, name + '_body'));
  [-0.028, 0.028].forEach((dx, i) => {
    const r = mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.014, 20), M.steel,
      name + '_roller_' + (i + 1), [dx, 0.020, 0]);
    r.rotation.x = Math.PI / 2;
    g.add(r);
  });
  const pin = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.040, 16), M.hardware, name + '_pivot_pin', [0, -0.020, 0]);
  g.add(pin);
  return g;
}

/* Bottom guide shoe running the sill channel. */
function buildShoe(M, name) {
  const g = new THREE.Group();
  g.name = name;
  g.add(mesh(new THREE.BoxGeometry(0.070, 0.024, 0.030), M.steel, name + '_body'));
  g.add(mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 18), M.hardware, name + '_wheel', [0, -0.016, 0]));
  return g;
}

/* Lead-panel folding handle: recessed bar pull + interior lever on a backplate. */
function buildFoldHandle(M, name, panelD) {
  const g = new THREE.Group();
  g.name = name;
  g.add(mesh(new THREE.BoxGeometry(0.030, 0.230, 0.010), M.hardware, name + '_backplate', [0, 0, panelD / 2 + 0.005]));
  const bar = mesh(new THREE.BoxGeometry(0.026, 0.150, 0.020), M.hardware, name + '_bar', [0, 0.008, panelD / 2 + 0.020]);
  g.add(bar);
  const rose = mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.014, 24), M.hardware, name + '_rosette', [0, -0.086, panelD / 2 + 0.016]);
  rose.rotation.x = Math.PI / 2;
  g.add(rose);
  const pivot = new THREE.Group();
  pivot.name = name + '_lever_pivot';
  pivot.position.set(0, -0.086, panelD / 2 + 0.026);
  pivot.add(mesh(new THREE.BoxGeometry(0.016, 0.098, 0.018), M.hardware, name + '_lever', [0, -0.050, 0]));
  const tip = mesh(new THREE.SphereGeometry(0.009, 18, 12), M.hardware, name + '_lever_tip', [0, -0.100, 0]);
  tip.scale.set(1, 1.4, 1.0);
  pivot.add(tip);
  g.add(pivot);
  /* exterior flush pull */
  g.add(mesh(new THREE.BoxGeometry(0.028, 0.140, 0.008), M.hardware, name + '_flush_pull', [0, 0, -panelD / 2 - 0.004]));
  return { group: g, pivot };
}

/**
 * buildBifoldDoor({ width, height, layout, fold, finish, panels })
 *
 * Four-panel slide-and-fold door, metres, y-up, interior = +Z.
 * Kinematics: a true accordion chain — panel 1 is hinged to the jamb, every
 * following panel is hinged to the one before it and swings twice the jamb
 * angle, so panels alternate ±theta and the pair joints collapse onto the jamb
 * at full fold. Hinge axes alternate face-to-face by one panel thickness so the
 * folded stack nests instead of interpenetrating. Head track carries the load
 * via carriers at every second joint; sill channel only guides.
 *
 * layout: '4L' | '4R' (all four stack one side) | '2-2' (two pairs, split)
 * fold:   'in' (+Z, room side) | 'out'
 */
export function buildBifoldDoor(opts = {}) {
  const finish = FINISHES[opts.finish] ? opts.finish : 'white';
  const M = opts.materials || makeBifoldMaterials(finish);
  const LAYOUT = ['4L', '4R', '2-2'].includes(opts.layout) ? opts.layout : '4L';
  const FOLD = opts.fold === 'out' ? -1 : 1;

  const W = Math.min(5.6, Math.max(2.4, opts.width ?? 3.60));
  const H = Math.min(2.90, Math.max(2.00, opts.height ?? 2.40));
  const D = 0.152;
  const FACE = 0.078;
  const PANEL_D = 0.062;
  const PANEL_FACE = 0.096;
  const BOTTOM_RAIL = 0.128;
  const THETA_MAX = (87 * Math.PI) / 180;
  const h = PANEL_D / 2;

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;

  const root = new THREE.Group();
  root.name = 'slide_and_fold_4panel';
  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  /* ---- head track (load bearing) ---- */
  const headY = openH / 2;
  const head = new THREE.Group();
  head.name = 'head';
  head.add(mesh(new THREE.BoxGeometry(openW + 0.030, 0.052, 0.076), M.upvcInner, 'head_track_housing', [0, headY - 0.026, 0.014]));
  head.add(mesh(new THREE.BoxGeometry(openW + 0.030, 0.018, 0.040), M.steel, 'track', [0, headY - 0.050, 0.014]));
  head.add(mesh(new THREE.BoxGeometry(openW + 0.030, 0.010, 0.012), M.gasket, 'head_gasket', [0, headY - 0.004, -0.026]));
  root.add(head);

  /* ---- sill + guide channel ---- */
  const sillY = -openH / 2;
  const sill = new THREE.Group();
  sill.name = 'sill';
  sill.add(mesh(new THREE.BoxGeometry(W - 0.004, 0.030, D - 0.010), M.upvcInner, 'sill_body', [0, sillY + 0.015, 0]));
  sill.add(mesh(new THREE.BoxGeometry(openW + 0.030, 0.014, 0.030), M.steel, 'sill_guide_channel', [0, sillY + 0.030, 0.014]));
  sill.add(mesh(new THREE.BoxGeometry(W + 0.018, 0.010, D + 0.020), M.upvc, 'sill_nose', [0, sillY - 0.005, 0]));
  for (let i = 0; i < 4; i++) {
    sill.add(mesh(new THREE.BoxGeometry(0.026, 0.006, 0.010), M.gasket, 'sill_weep_' + (i + 1),
      [(i / 3 - 0.5) * openW * 0.7, sillY + 0.006, -D / 2 + 0.014]));
  }
  root.add(sill);

  /* ---- one folding panel -------------------------------------------------
     Local origin sits ON the hinge axis of the panel's trailing edge; the leaf
     body is offset back to the opening centreline by the alternating half
     thickness so closed panels are coplanar. */
  const panelH = openH - 0.014;

  function buildPanel(name, panelW, zLocal, lead) {
    const g = new THREE.Group();
    g.name = name + '_leaf';
    g.position.set(panelW / 2, 0, zLocal);
    g.add(mesh(ringGeo(panelW, panelH, PANEL_FACE, PANEL_D), M.upvc, name));
    g.add(mesh(new THREE.BoxGeometry(panelW - 0.004, BOTTOM_RAIL, PANEL_D - 0.004), M.upvc, name + '_bottom_rail',
      [0, -panelH / 2 + BOTTOM_RAIL / 2, 0]));
    const gw = panelW - PANEL_FACE * 2 + 0.024;
    const gh = panelH - BOTTOM_RAIL - PANEL_FACE + 0.024;
    const gy = (BOTTOM_RAIL - PANEL_FACE) / 2;
    g.add(mesh(new THREE.BoxGeometry(gw, gh, 0.024), M.glass, name.replace('panel', 'glass'), [0, gy, -0.006]));
    g.add(mesh(ringGeo(gw + 0.012, gh + 0.012, 0.016, 0.014), M.upvcInner, name + '_bead', [0, gy, 0.020]));
    g.add(mesh(ringGeo(panelW + 0.005, panelH + 0.005, 0.014, 0.009, 0), M.gasket, name + '_gasket',
      [0, 0, -PANEL_D / 2 - 0.002]));
    if (lead) {
      g.add(mesh(new THREE.BoxGeometry(0.012, panelH - 0.020, 0.030), M.upvcInner, name + '_lead_interlock',
        [panelW / 2 - 0.006, 0, -0.004]));
    }
    return g;
  }

  /**
   * Accordion chain of `n` panels running in +x from a jamb hinge.
   * Node k rotates by ±2·theta relative to its parent (node 0 by theta), which
   * yields panel cumulative angles alternating +theta / -theta.
   */
  function buildChain(id, n, panelW, x0) {
    const chain = new THREE.Group();
    chain.name = id;
    chain.position.x = x0;

    const nodes = [], hinges = [], carriers = [], shoes = [];
    let parent = chain;
    let zAxis = h * FOLD;                     // first hinge axis on the fold-side face

    for (let k = 0; k < n; k++) {
      const node = new THREE.Group();
      node.name = `${id}_hinge_${k}`;
      node.position.set(k === 0 ? 0 : panelW, 0, k === 0 ? zAxis : (zAxis * 2));
      parent.add(node);
      nodes.push(node);

      const lead = k === n - 1;
      node.add(buildPanel(`${id}_panel_${k + 1}`, panelW, -zAxis, lead));

      const hg = buildHinge(M, `${id}_hinge_hw_${k}`, PANEL_D);
      hg.position.set(0, 0, 0);
      node.add(hg);
      for (let j = 0; j < 2; j++) {
        const extra = buildHinge(M, `${id}_hinge_hw_${k}_${j + 2}`, PANEL_D);
        extra.position.set(0, (j ? -1 : 1) * panelH * 0.34, 0);
        node.add(extra);
        hinges.push(extra);
      }
      hinges.push(hg);

      /* carriers ride the track at every second joint + the lead stile */
      if (k > 0 && k % 2 === 0) {
        const c = buildCarrier(M, `${id}_carrier_${k / 2}`);
        c.position.set(0, panelH / 2 + 0.026, 0);
        node.add(c); carriers.push({ obj: c, node: k });
        const s = buildShoe(M, `${id}_shoe_${k / 2}`);
        s.position.set(0, -panelH / 2 - 0.014, 0);
        node.add(s); shoes.push({ obj: s, node: k });
      }
      if (lead) {
        const c = buildCarrier(M, `${id}_carrier_lead`);
        c.position.set(panelW, panelH / 2 + 0.026, 0);
        node.add(c); carriers.push({ obj: c, node: k, lead: true });
        const s = buildShoe(M, `${id}_shoe_lead`);
        s.position.set(panelW, -panelH / 2 - 0.014, 0);
        node.add(s); shoes.push({ obj: s, node: k, lead: true });
      }

      parent = node;
      zAxis = -zAxis;
    }

    /* handle on the lead stile, interior face */
    const leadNode = nodes[n - 1];
    const handle = buildFoldHandle(M, `${id}_handle`, PANEL_D);
    handle.group.position.set(panelW - PANEL_FACE / 2, -0.05, 0);
    leadNode.add(handle.group);

    function setAngle(a) {
      nodes.forEach((nd, k) => { nd.rotation.y = k === 0 ? a : (k % 2 ? -2 * a : 2 * a); });
      /* keep track hardware square to the track */
      carriers.concat(shoes).forEach(({ obj, node: k }) => { obj.rotation.y = -(k % 2 ? -a : a); });
      handle.pivot.rotation.z = -Math.min(1, Math.abs(a) / 0.35) * (Math.PI * 0.55);
    }

    return { group: chain, nodes, setAngle, panelW, n };
  }

  const chains = [];
  if (LAYOUT === '2-2') {
    const panelW = openW / 4;
    const left = buildChain('left', 2, panelW, -openW / 2);
    const right = buildChain('right', 2, panelW, openW / 2);
    right.group.scale.x = -1;
    root.add(left.group, right.group);
    chains.push(left, right);
  } else {
    const panelW = openW / 4;
    const c = buildChain(LAYOUT === '4R' ? 'right' : 'left', 4, panelW,
      LAYOUT === '4R' ? openW / 2 : -openW / 2);
    if (LAYOUT === '4R') c.group.scale.x = -1;
    root.add(c.group);
    chains.push(c);
  }

  root.position.y = H / 2 + 0.010;

  const panelW = openW / 4;
  const smooth = (v) => v * v * (3 - 2 * v);

  function poseAt(t) {
    const c = Math.min(1, Math.max(0, t));
    const theta = smooth(c) * THETA_MAX;
    const stack = (LAYOUT === '2-2' ? 2 : 4) * panelW * Math.cos(theta);
    const clear = LAYOUT === '2-2'
      ? Math.max(0, openW - 2 * stack)
      : Math.max(0, openW - stack);
    return { theta, deg: (theta * 180) / Math.PI, clearOpen: clear, stackDepth: panelW * Math.sin(theta) };
  }

  function setOpen(t) {
    const p = poseAt(t);
    chains.forEach(c => c.setAngle(-FOLD * p.theta));
  }
  setOpen(0);

  return {
    group: root, setOpen, poseAt, chains,
    dims: {
      W, H, D, openW, openH, panelW, panelH, panels: 4, layout: LAYOUT,
      fold: FOLD > 0 ? 'in' : 'out', finish, finishLabel: FINISHES[finish].label,
      thetaMax: (THETA_MAX * 180) / Math.PI, clearOpen: poseAt(1).clearOpen,
    },
    config: {
      id: 'slide-and-fold',
      motion: 'bifold_accordion',
      panel_count: 4,
      layout: LAYOUT,
      fold_direction: FOLD > 0 ? 'interior' : 'exterior',
      hinge_rule: 'panel_1 = theta at jamb, each following panel = -2x parent (alternating ±theta)',
      theta_max_deg: Math.round((THETA_MAX * 180) / Math.PI),
      load_path: 'top_track_carriers',
      clip: { name: 'open', frames: 28, easing: 'ease-in-out' },
      finish,
    },
  };
}
