import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* Rectangular ring profile (frame / bead), extruded in Z, centred. */
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

/* Operating crank on the sill rail — handle turns about the window normal (Z). */
function buildCrank(M, name) {
  const g = new THREE.Group();
  g.name = name;

  g.add(mesh(new THREE.BoxGeometry(0.058, 0.088, 0.010), M.hardware, name + '_backplate', [0, 0, 0.005]));
  const rose = mesh(new THREE.CylinderGeometry(0.0135, 0.0155, 0.018, 32), M.hardware, name + '_rosette', [0, 0, 0.017]);
  rose.rotation.x = Math.PI / 2;
  g.add(rose);

  const lever = new THREE.Group();
  lever.name = name + '_lever_pivot';
  lever.position.set(0, 0, 0.026);
  lever.add(mesh(new THREE.BoxGeometry(0.015, 0.072, 0.016), M.hardware, name + '_lever', [0, -0.038, 0]));
  const tip = mesh(new THREE.SphereGeometry(0.0090, 20, 14), M.hardware, name + '_lever_tip', [0, -0.076, 0]);
  tip.scale.set(1, 1.4, 1.05);
  lever.add(tip);
  const neck = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.020, 24), M.hardware, name + '_lever_neck', [0, -0.004, 0]);
  neck.rotation.x = Math.PI / 2;
  lever.add(neck);
  g.add(lever);
  return { group: g, lever };
}

/**
 * buildLouvre({ variant: 'narrow' | 'wide' })
 *
 * Jalousie / louvre window. Every blade is its own node with its own pivot,
 * turning about its horizontal long axis (X). All blades turn in unison,
 * driven off one vertical link bar on the left jamb — the bar TRANSLATES in Y
 * as the blades tilt, which is the real mechanism, so the bake picks up both
 * the rotation channels and the arm's translation channel.
 *
 *   closed  = blades near the window plane, shingled with a small overlap
 *   open    = blades swung toward horizontal (70° of travel)
 *
 * Both variants share one opening (same frame, same stack height); the blade
 * count is what changes — 18 narrow blades at 100 mm, or 9 wide at 200 mm.
 *
 * Returns { group, setOpen(t), fin, arm, animNodes, config }
 * Metres, y-up, base at y = 0. Interior = +Z, exterior = −Z.
 */
export function buildLouvre(opts = {}) {
  const variant = opts.variant === 'wide' ? 'wide' : 'narrow';
  const M = opts.materials || makeMaterials();

  /* blade geometry — pitch under the blade height so the closed stack shingles */
  const N = variant === 'wide' ? 9 : 18;
  const BLADE_H = variant === 'wide' ? 0.200 : 0.100;
  const PITCH = BLADE_H * 0.88;
  const BLADE_T = 0.006;

  const W = 0.80;
  const FACE = 0.062;                    // frame face, matching the other builders
  const D = 0.084;                       // frame sightline depth
  const stack = N * PITCH;
  const openH = stack + 0.020;
  const H = openH + FACE * 2;
  const openW = W - FACE * 2;

  const root = new THREE.Group();
  root.name = 'louvre_' + variant;

  /* ---- outer frame ---- */
  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  /* interior bead line, same trick the other frames use for a shadow gap */
  const beadDepth = 0.022;
  root.add(mesh(ringGeo(openW + 0.014, openH + 0.014, 0.030, beadDepth), M.upvcInner,
    'frame_bead', [0, 0, D / 2 - beadDepth / 2]));

  const sill = mesh(new THREE.BoxGeometry(W + 0.03, 0.016, D + 0.030), M.upvc, 'frame_sill_nose',
    [0, -H / 2 - 0.006, -0.008]);
  sill.rotation.x = -0.06;
  root.add(sill);

  /* ---- blade carrier channel down each jamb (the clips pivot in these) ---- */
  const carrierX = openW / 2 - 0.010;
  [-1, 1].forEach((sx) => {
    root.add(mesh(new THREE.BoxGeometry(0.020, openH, 0.030), M.upvcInner,
      'carrier_channel' + (sx < 0 ? '_l' : '_r'), [sx * carrierX, 0, -0.004]));
  });

  /* ---- blades ---- */
  const BLADE_W = openW - 0.036;
  const pivotZ = -0.004;                 // blade axis sits mid-depth in the frame
  const bladeGeo = new THREE.BoxGeometry(BLADE_W, BLADE_H, BLADE_T);
  const clipGeo = new THREE.BoxGeometry(0.018, BLADE_H * 0.52, 0.016);
  const pinGeo = new THREE.BoxGeometry(0.012, 0.014, 0.013);

  const LINK_R = Math.min(0.034, BLADE_H * 0.34);   // link pin offset below the axis
  /* The link bar runs INBOARD of the carrier channel, not outboard of it. Sitting
     it at -(carrierX + 0.014) put its centre at |x| 0.342 while the frame opening
     ends at W/2 - FACE = 0.338, so ~78% of the bar — and the knuckles with it —
     was buried inside solid uPVC. The bar is the only part of this mechanism that
     translates, so hiding it inside the jamb loses the one cue that the linkage is
     what drives the blades. Inboard puts it in the opening, overlapping the
     carrier by a couple of millimetres, which is where the real linkage sits. */
  const armX = -(carrierX - 0.018);

  const fin = [];
  const y0 = -(stack - PITCH) / 2;
  for (let i = 0; i < N; i += 1) {
    const tag = 'fin_' + String(i + 1).padStart(2, '0');
    const pivot = new THREE.Group();
    pivot.name = tag + '_pivot';
    pivot.position.set(0, y0 + i * PITCH, pivotZ);
    root.add(pivot);

    /* the blade itself — glass material, so it reads as a glass louvre blade */
    pivot.add(mesh(bladeGeo, M.glass, tag + '_glass'));

    /* end clips that hold the blade, one per jamb */
    [-1, 1].forEach((sx) => {
      pivot.add(mesh(clipGeo, M.hardware, tag + '_clip' + (sx < 0 ? '_l' : '_r'),
        [sx * (BLADE_W / 2 + 0.006), 0, 0]));
    });

    /* link pin, riding below the axis — this is what the bar pulls on */
    pivot.add(mesh(pinGeo, M.hardware, tag + '_link_pin', [armX, -LINK_R, 0]));

    fin.push({ pivot, i });
  }

  /* ---- vertical link bar down the left jamb ---- */
  const arm = new THREE.Group();
  arm.name = 'control_arm';
  arm.position.set(armX, 0, pivotZ - 0.012);
  root.add(arm);
  arm.add(mesh(new THREE.BoxGeometry(0.014, stack + 0.030, 0.012), M.hardware, 'control_arm_bar'));
  for (let i = 0; i < N; i += 1) {
    arm.add(mesh(new THREE.BoxGeometry(0.020, 0.016, 0.020), M.hardware,
      'control_arm_knuckle_' + String(i + 1).padStart(2, '0'), [0, y0 + i * PITCH, 0]));
  }

  /* ---- operating crank, interior face of the RIGHT jamb just above the sill.
     Mounted on the jamb rather than the sill rail so the lever tucks along the
     stile at both ends of its travel instead of dangling below the frame. ---- */
  const crank = buildCrank(M, 'crank');
  crank.group.position.set(W / 2 - FACE / 2, -openH / 2 + 0.110, D / 2 + 0.001);
  root.add(crank.group);

  root.position.y = H / 2 + 0.02;

  const CLOSED = THREE.MathUtils.degToRad(14);   // shingle lean when shut
  const OPEN = THREE.MathUtils.degToRad(84);     // near horizontal
  /* Just short of a half turn: an exact 180° flip is the one rotation whose
     quaternion sign is ambiguous, and the bake interpolates these. */
  const CRANK_TURN = THREE.MathUtils.degToRad(172);
  const armY0 = -LINK_R * Math.cos(CLOSED);

  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const eased = c * c * (3 - 2 * c);
    const angle = CLOSED + eased * (OPEN - CLOSED);
    fin.forEach((f) => { f.pivot.rotation.x = angle; });
    /* the bar rides the link pins: pin y = -LINK_R·cos(angle) */
    arm.position.y = -LINK_R * Math.cos(angle) - armY0;
    crank.lever.rotation.z = -eased * CRANK_TURN;
  }
  setOpen(0);

  const animNode = [arm, crank.lever, ...fin.map((f) => f.pivot)];

  return {
    group: root,
    setOpen,
    fin,
    arm,
    animNodes: animNode,
    config: {
      id: variant === 'wide' ? 'louvre-wide' : 'louvre',
      motion: 'louvre_tilt_horizontal',
      max_angle_deg: 70,
      blade_count: N,
      blade_height_mm: Math.round(BLADE_H * 1000),
    },
  };
}
