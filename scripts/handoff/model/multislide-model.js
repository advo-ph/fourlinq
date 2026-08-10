import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* Rectangular ring profile (frame / panel), extruded in Z, centred. */
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
 * Flush recessed pull — the correct hardware for a multi-slide panel that has to
 * pass a jamb pocket: a slim plate set into the stile face with a machined pocket
 * and (interior side) a thumb-turn paddle. Nothing projects past the panel face.
 */
function buildFlushPull(M, name, withLatch) {
  const g = new THREE.Group();
  g.name = name;
  const PW = 0.052, PH = withLatch ? 0.190 : 0.132, PD = 0.005;

  g.add(mesh(new THREE.BoxGeometry(PW, PH, PD), M.steel, name + '_plate', [0, 0, -PD / 2]));

  const pocketH = withLatch ? 0.088 : 0.098;
  const pocketY = withLatch ? PH / 2 - pocketH / 2 - 0.014 : 0;
  g.add(mesh(new THREE.BoxGeometry(PW - 0.016, pocketH, 0.016), M.hardware, name + '_pocket',
    [0, pocketY, -0.013]));
  g.add(mesh(ringGeo(PW - 0.014, pocketH + 0.002, 0.004, 0.014), M.steel, name + '_pocket_wall',
    [0, pocketY, -0.008]));

  if (withLatch) {
    const ly = -PH / 2 + 0.044;
    g.add(mesh(new THREE.BoxGeometry(PW - 0.018, 0.056, 0.012), M.hardware, name + '_latch_recess', [0, ly, -0.011]));
    g.add(mesh(new THREE.BoxGeometry(PW - 0.028, 0.018, 0.009), M.steel, name + '_thumbturn', [0, ly, -0.008]));
    const screw = mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.003, 16), M.steel, name + '_screw',
      [0, PH / 2 - 0.010, -0.0015]);
    screw.rotation.x = Math.PI / 2;
    g.add(screw);
  }
  return g;
}

/**
 * buildMultiSlide({ panels: 3 | 4 | 6, width, height, stackSide, scaleRef })
 *
 * Multi-slide door wall. Metres, y-up, interior = +Z, origin at the outer frame centre.
 * Every panel rides its own track plane, so the panels pass one another and build a
 * stack against the fixed end panel. Motion is staggered: the lead panel leaves first
 * and the following panels are picked up in turn, so the stack visibly assembles.
 *
 * `panels: 6` builds the bi-parting FIXED-Slide-Slide-Slide-Slide-FIXED run: a fixed
 * leaf at BOTH ends, four sliders between them, parting at the centre and stacking two
 * deep behind each fixed end. It needs only three track planes, not six — each half
 * mirrors the other onto the same three, which is how a real bi-part is built and what
 * keeps the frame depth at 264 mm instead of an absurd 456 mm. The two lead leaves
 * (3 and 4) therefore share the interior-most plane and meet on a butt joint at the
 * centre rather than lapping, so they never interpenetrate when closed.
 */
export function buildMultiSlide(opts = {}) {
  const M = opts.materials || makeMaterials();
  const N = opts.panels === 3 ? 3 : opts.panels === 6 ? 6 : 4;
  const isBipart = N === 6;
  const W = isBipart
    ? Math.min(10.8, Math.max(5.4, opts.width ?? 9.0))
    : Math.min(6.0, Math.max(3.6, opts.width ?? 6.0));
  const H = opts.height ?? 2.60;
  const stackSide = opts.stackSide === -1 ? -1 : 1;      // +1 = stacks right

  const FACE = 0.086;                 // frame face
  const PITCH = 0.064;                // track-to-track pitch
  const PANEL_D = 0.052;
  const planeCount = isBipart ? 3 : N; // bi-part mirrors both halves onto three planes
  const D = planeCount * PITCH + 0.072; // frame depth swallows every track
  const OVERLAP = 0.030;              // interlock lap, closed
  const PANEL_FACE = 0.104;
  const BOTTOM_RAIL = 0.148;
  const STACK_STEP = 0.062;           // x fan across the parked stack

  const root = new THREE.Group();
  root.name = 'multislide_door_' + N + 'panel';

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;
  /* one lap per panel joint, minus the centre butt joint on a bi-part */
  const lapTotal = OVERLAP * (isBipart ? N - 2 : N - 1);
  const panelW = (openW + lapTotal) / N;
  const panelH = openH - 0.010;

  /* track planes: index 0 = interior-most (lead), planeCount-1 = exterior-most (fixed end) */
  const zAt = i => (planeCount - 1) / 2 * PITCH - i * PITCH;
  /* panel index → track plane. Straight run: one plane each. Bi-part: 0,1,2 count in
     from the left fixed leaf and 5,4,3 mirror in from the right. */
  const planeOf = i => (isBipart ? (i <= 2 ? 2 - i : i - 3) : i);

  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  /* ---- sill + multi-track threshold ---- */
  const track = new THREE.Group();
  track.name = 'track';
  const sillY = -openH / 2 - 0.010;
  track.add(mesh(new THREE.BoxGeometry(W - 0.004, 0.024, D - 0.012), M.upvcInner, 'sill', [0, sillY, 0]));
  track.add(mesh(new THREE.BoxGeometry(W + 0.030, 0.011, D + 0.034), M.upvc, 'sill_nose', [0, sillY - 0.015, 0]));
  const headY = openH / 2 + 0.008;
  for (let i = 0; i < planeCount; i++) {
    const z = zAt(i);
    track.add(mesh(new THREE.BoxGeometry(openW + 0.034, 0.015, PITCH - 0.014), M.upvcInner,
      'track_channel_' + (i + 1), [0, sillY + 0.011, z]));
    track.add(mesh(new THREE.BoxGeometry(openW + 0.034, 0.010, 0.015), M.steel,
      'track_' + (i + 1), [0, sillY + 0.021, z]));
    track.add(mesh(new THREE.BoxGeometry(openW + 0.034, 0.024, PITCH - 0.012), M.upvcInner,
      'head_guide_' + (i + 1), [0, headY - 0.007, z]));
  }
  root.add(track);

  /* ---- panels ---- */
  function buildPanel(idx, lapDir = stackSide) {
    const name = 'panel_' + (idx + 1);
    const g = new THREE.Group();
    g.name = name + '_carrier';
    g.position.z = zAt(planeOf(idx));
    g.add(mesh(ringGeo(panelW, panelH, PANEL_FACE, PANEL_D), M.upvc, name));
    g.add(mesh(new THREE.BoxGeometry(panelW - 0.004, BOTTOM_RAIL, PANEL_D - 0.004), M.upvc,
      name + '_bottom_rail', [0, -panelH / 2 + BOTTOM_RAIL / 2, 0]));

    const gw = panelW - PANEL_FACE * 2 + 0.026;
    const gh = panelH - BOTTOM_RAIL - PANEL_FACE + 0.026;
    const gy = (BOTTOM_RAIL - PANEL_FACE) / 2;
    g.add(mesh(new THREE.BoxGeometry(gw, gh, 0.009), M.glass, 'glass_' + (idx + 1), [0, gy, -0.005]));
    g.add(mesh(ringGeo(gw + 0.011, gh + 0.011, 0.017, 0.015), M.upvcInner, name + '_bead', [0, gy, 0.015]));
    g.add(mesh(ringGeo(panelW + 0.006, panelH + 0.006, 0.015, 0.010, 0), M.gasket,
      name + '_gasket', [0, 0, -PANEL_D / 2 - 0.002]));

    /* interlock stile on both leading edges — reads as the closed weather seal */
    [-1, 1].forEach((s, k) => {
      g.add(mesh(new THREE.BoxGeometry(0.013, panelH - 0.014, PITCH - 0.016), M.upvcInner,
        name + '_interlock_' + (k + 1), [s * (panelW / 2 - 0.0065), 0, -s * lapDir * (PITCH / 2 - 0.004)]));
    });

    /* rollers under each panel */
    [-1, 1].forEach((s, k) => {
      const r = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 20), M.steel,
        name + '_roller_' + (k + 1), [s * (panelW / 2 - 0.095), -panelH / 2 - 0.013, 0]);
      r.rotation.z = Math.PI / 2;
      g.add(r);
    });
    return g;
  }

  const panels = [];
  const closedX = [];
  const openX = [];
  /* which way this leaf's interlock stile leans, and where each leaf parks */
  const lapOf = i => (isBipart ? (i <= 2 ? 1 : -1) : stackSide);

  if (isBipart) {
    /* left→right in x. 0 and 5 are fixed; 1,2 part left and 3,4 part right.
       The centre joint (2|3) butts, every other joint laps. */
    let cx = -(openW / 2 - panelW / 2);
    /* The centre pair butts rather than laps, so it is spaced by the panel width
       PLUS the ring bevel on each side. ringGeo() extrudes with bevelSize 0.0018,
       which pushes each ring 1.8 mm proud of its nominal width; spacing the butt
       joint by exactly panelW therefore drove the two leaves 3.6 mm into each
       other over the full 2.42 m height. Every other joint laps by OVERLAP, which
       swallows the bevel, so this is the only joint where it shows. */
    const RING_BEVEL = 0.0018;
    for (let i = 0; i < N; i++) {
      if (i > 0) cx += panelW - (i === 3 ? -RING_BEVEL * 2 : OVERLAP);
      const p = buildPanel(i, lapOf(i));
      closedX.push(cx);
      p.position.x = cx;
      root.add(p);
      panels.push(p);
    }
    /* each slider parks behind its own fixed end, fanned by STACK_STEP; the lead
       leaf ends up outermost in the stack so the leaves never cross planes */
    openX.push(closedX[0]);
    openX.push(closedX[0] + STACK_STEP);
    openX.push(closedX[0] + STACK_STEP * 2);
    openX.push(closedX[5] - STACK_STEP * 2);
    openX.push(closedX[5] - STACK_STEP);
    openX.push(closedX[5]);
  } else {
    for (let i = 0; i < N; i++) {
      const p = buildPanel(i);
      /* index 0 = the panel furthest from the stack side */
      const cx = -stackSide * (openW / 2 - panelW / 2) + stackSide * i * (panelW - OVERLAP);
      closedX.push(cx);
      p.position.x = cx;
      root.add(p);
      panels.push(p);
    }
    const fixedX = closedX[N - 1];
    for (let i = 0; i < N; i++) openX.push(fixedX - stackSide * (N - 1 - i) * STACK_STEP);
  }

  /* which leaves move, in departure order (lead first), and which stay put */
  const moverPlan = isBipart
    ? [{ index: 2, delay: 0 }, { index: 3, delay: 0 }, { index: 1, delay: 0.21 }, { index: 4, delay: 0.21 }]
    : Array.from({ length: N - 1 }, (_, i) => ({ index: i, delay: (i / Math.max(1, N - 1)) * 0.42 }));
  const fixedIndex = isBipart ? [0, 5] : [N - 1];

  /* flush pulls on each lead panel's leading stile, both faces */
  function addPull(leaf, edgeSign, suffix = '') {
    const edgeX = edgeSign * (panelW / 2 - PANEL_FACE / 2);
    const pullIn = buildFlushPull(M, 'handle_interior' + suffix, true);
    pullIn.position.set(edgeX, -0.06, PANEL_D / 2 + 0.001);
    pullIn.rotation.y = Math.PI;
    leaf.add(pullIn);
    const pullOut = buildFlushPull(M, 'handle_exterior' + suffix, false);
    pullOut.position.set(edgeX, -0.06, -PANEL_D / 2 - 0.001);
    leaf.add(pullOut);
  }
  if (isBipart) {
    addPull(panels[2], 1, '_left');   // left lead, meeting stile on its +x edge
    addPull(panels[3], -1, '_right'); // right lead, meeting stile on its -x edge
  } else {
    addPull(panels[0], stackSide);
  }

  root.position.y = H / 2 + 0.014;

  /* 1.7 m human-scale ghost — authoring aid, excluded from every export */
  let scaleRef = null;
  if (opts.scaleRef) {
    scaleRef = new THREE.Group();
    scaleRef.name = 'scale_reference_1700mm';
    const ghost = new THREE.MeshStandardMaterial({
      color: 0x1f4ed8, roughness: 0.9, metalness: 0, transparent: true, opacity: 0.16,
    });
    ghost.name = 'scale_ghost';
    const yBase = -(H / 2 + 0.014);
    scaleRef.add(mesh(new THREE.BoxGeometry(0.44, 1.46, 0.24), ghost, 'ghost_body',
      [-stackSide * (openW / 2 - 0.55), yBase + 0.73, 0.62]));
    scaleRef.add(mesh(new THREE.SphereGeometry(0.115, 24, 16), ghost, 'ghost_head',
      [-stackSide * (openW / 2 - 0.55), yBase + 1.58, 0.62]));
    root.add(scaleRef);
  }

  /* staggered stack motion: lead leaves first, each follower is picked up later */
  const delays = moverPlan.map(m => m.delay);
  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    for (const m of moverPlan) {
      const d = m.delay;
      const local = Math.min(1, Math.max(0, (c - d) / (1 - d)));
      const e = local * local * (3 - 2 * local);
      panels[m.index].position.x = closedX[m.index] + (openX[m.index] - closedX[m.index]) * e;
    }
    for (const i of fixedIndex) panels[i].position.x = closedX[i];
  }
  setOpen(0);

  const stackPerSide = isBipart ? 2 : N - 1;
  const stackW = panelW + stackPerSide * STACK_STEP;
  const clearOpen = openW - stackW * (isBipart ? 2 : 1);

  return {
    group: root, setOpen, panels, closedX, openX, delays, scaleRef,
    dims: { W, H, D, openW, openH, panelW, panelH, overlap: OVERLAP, stackW, clearOpen, panels: N },
    config: {
      id: isBipart ? 'multislide-door-6panel' : 'multislide-door',
      motion: isBipart ? 'translate_x_biparting' : 'translate_x_staggered',
      panel_count: N,
      ...(isBipart ? { layout: 'F-S-S-S-S-F' } : {}),
      stack_side: isBipart ? 'both' : (stackSide === 1 ? 'right' : 'left'),
      clear_open_ratio: +(clearOpen / openW).toFixed(3),
    },
  };
}
