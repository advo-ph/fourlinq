import * as THREE from 'three';
import { makeMaterials } from './window-model.js';

export { makeMaterials };

/* Rectangular ring profile (frame / sash), extruded in Z, centred. */
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

/* Cam sash lock: base plate + pivoting lever, sits on the lower meeting rail. */
function buildSashLock(M, name) {
  const g = new THREE.Group();
  g.name = name;
  g.add(mesh(new THREE.BoxGeometry(0.062, 0.010, 0.026), M.hardware, name + '_base', [0, 0.005, 0]));
  const lever = mesh(new THREE.BoxGeometry(0.048, 0.008, 0.011), M.hardware, name + '_lever', [0.006, 0.014, 0]);
  lever.rotation.z = -0.22;
  g.add(lever);
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 20), M.hardware, name + '_pivot', [-0.014, 0.014, 0]));
  [-0.024, 0.024].forEach((x, i) =>
    g.add(mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.004, 14), M.steel, name + '_screw_' + (i + 1), [x, 0.011, 0])));
  return g;
}

/* Tilt latch: flush slider button on the sash top rail. */
function buildTiltLatch(M, name) {
  const g = new THREE.Group();
  g.name = name;
  g.add(mesh(new THREE.BoxGeometry(0.052, 0.011, 0.014), M.hardware, name + '_body'));
  g.add(mesh(new THREE.BoxGeometry(0.018, 0.007, 0.010), M.steel, name + '_button', [0.008, 0.008, 0]));
  return g;
}

/**
 * buildHung({ variant: 'double' | 'single' })
 * Two stacked sashes in vertical jamb channels, meeting rail at mid-height.
 * Metres, y-up, interior = +Z. Lower sash rides the interior plane and laps the
 * upper sash's bottom rail at the meeting rail, so the overlap reads at rest.
 */
export function buildHung(opts = {}) {
  const M = opts.materials || makeMaterials();
  const variant = opts.variant === 'single' ? 'single' : 'double';
  const LOWER_RATIO = opts.lowerRatio ?? 0.50;   // lower sash rises 50% of the clear opening
  const UPPER_RATIO = opts.upperRatio ?? 0.30;   // upper sash drops 30% (double-hung only)

  const W = 0.90;             // overall width
  const H = 1.50;             // overall height
  const D = 0.118;            // frame depth — two sash channels deep
  const FACE = 0.058;         // frame face width
  const OVERLAP = 0.036;      // meeting-rail overlap, closed (36 mm)
  const SASH_D = 0.038;       // sash sightline depth
  const SASH_FACE = 0.070;    // sash stile / rail face

  const root = new THREE.Group();
  root.name = 'hung_window';

  const openW = W - FACE * 2;
  const openH = H - FACE * 2;
  const zExt = -0.026, zInt = 0.026;   // sash planes (upper exterior / lower interior)

  /* ---- outer frame ---- */
  root.add(mesh(ringGeo(W, H, FACE, D), M.upvc, 'frame'));

  /* ---- jamb liners: paired vertical balance channels, one per sash plane ---- */
  const liners = new THREE.Group();
  liners.name = 'jamb_liners';
  [-1, 1].forEach((s, i) => {
    const x = s * (openW / 2 + 0.004);
    [[zExt, 'exterior'], [zInt, 'interior']].forEach(([z, tag]) => {
      liners.add(mesh(new THREE.BoxGeometry(0.016, openH + 0.010, 0.032), M.upvcInner,
        `jamb_liner_${i + 1}_${tag}`, [x, 0, z]));
      liners.add(mesh(new THREE.BoxGeometry(0.007, openH - 0.030, 0.011), M.steel,
        `balance_${i + 1}_${tag}`, [x - s * 0.006, 0, z]));
    });
  });
  root.add(liners);

  /* head parting stop + sill stool, keeping the two channels distinct */
  root.add(mesh(new THREE.BoxGeometry(openW + 0.012, 0.014, 0.014), M.upvcInner, 'parting_stop_head', [0, openH / 2 + 0.003, 0]));
  root.add(mesh(new THREE.BoxGeometry(openW + 0.012, 0.016, D - 0.016), M.upvcInner, 'sill_stool', [0, -openH / 2 - 0.005, 0]));

  /* ---- sash builder ---- */
  const sashW = openW - 0.006;
  const sashH = (openH + OVERLAP) / 2;

  function buildSash(name, z) {
    const g = new THREE.Group();
    g.name = name + '_carrier';
    g.position.z = z;
    g.add(mesh(ringGeo(sashW, sashH, SASH_FACE, SASH_D), M.upvc, name));

    const gw = sashW - SASH_FACE * 2 + 0.020;
    const gh = sashH - SASH_FACE * 2 + 0.020;
    g.add(mesh(new THREE.BoxGeometry(gw, gh, 0.006), M.glass, name.replace('sash', 'glass'), [0, 0, -0.004]));
    g.add(mesh(ringGeo(gw + 0.008, gh + 0.008, 0.013, 0.012), M.upvcInner, name + '_bead', [0, 0, 0.011]));
    g.add(mesh(ringGeo(sashW + 0.005, sashH + 0.005, 0.012, 0.008, 0), M.gasket, name + '_weatherstrip',
      [0, 0, -SASH_D / 2 - 0.002]));
    return g;
  }

  const upper = buildSash('sash_upper', zExt);
  const upperClosedY = openH / 2 - sashH / 2;
  upper.position.y = upperClosedY;
  root.add(upper);

  const lower = buildSash('sash_lower', zInt);
  const lowerClosedY = -openH / 2 + sashH / 2;
  lower.position.y = lowerClosedY;
  root.add(lower);

  /* meeting-rail interlock on the upper sash bottom rail — the lower rail laps it */
  upper.add(mesh(new THREE.BoxGeometry(sashW - 0.010, 0.014, 0.026), M.upvcInner, 'meeting_interlock',
    [0, -sashH / 2 + 0.007, 0.030]));

  /* two cam sash locks on the lower sash top rail, interior face */
  [-1, 1].forEach((s, i) => {
    const lock = buildSashLock(M, 'sash_lock_' + (i + 1));
    lock.position.set(s * openW * 0.22, sashH / 2 - SASH_FACE / 2, SASH_D / 2 + 0.004);
    lower.add(lock);
  });

  /* tilt latches on the lower sash top rail, outboard of the locks */
  [-1, 1].forEach((s, i) => {
    const latch = buildTiltLatch(M, 'tilt_latch_' + (i + 1));
    latch.position.set(s * (sashW / 2 - 0.075), sashH / 2 - 0.006, SASH_D / 2 - 0.006);
    lower.add(latch);
  });

  /* lift handles on the lower sash bottom rail */
  [-1, 1].forEach((s, i) => {
    const lift = mesh(new THREE.BoxGeometry(0.090, 0.014, 0.016), M.hardware, 'lift_handle_' + (i + 1),
      [s * openW * 0.22, -sashH / 2 + SASH_FACE / 2, SASH_D / 2 + 0.006]);
    lower.add(lift);
  });

  root.position.y = H / 2 + 0.02;

  const headroom = sashH - OVERLAP - 0.008;
  const lowerTravel = Math.min(LOWER_RATIO * openH, headroom);
  const upperTravel = variant === 'single' ? 0 : Math.min(UPPER_RATIO * openH, headroom);

  /* Phased clip: lower sash rises first (0 → 0.55), then the upper drops (0.55 → 1). */
  const SPLIT = 0.55;
  const ease = (c) => c * c * (3 - 2 * c);
  function setOpen(t) {
    const c = Math.min(1, Math.max(0, t));
    const a = ease(Math.min(1, c / SPLIT));
    const b = variant === 'single' ? 0 : ease(Math.max(0, (c - SPLIT) / (1 - SPLIT)));
    lower.position.y = lowerClosedY + a * lowerTravel;
    upper.position.y = upperClosedY - b * upperTravel;
  }
  setOpen(0);

  return {
    group: root, setOpen, variant,
    upper, lower, upperClosedY, lowerClosedY, upperTravel, lowerTravel, split: SPLIT, ease,
    dims: { W, H, D, openW, openH, sashW, sashH, overlap: OVERLAP, clearOpen: lowerTravel + upperTravel },
    config: {
      id: 'hung', motion: 'translate_y',
      variant, lower_ratio: LOWER_RATIO, upper_ratio: variant === 'single' ? 0 : UPPER_RATIO, phase_split: SPLIT,
    },
  };
}
