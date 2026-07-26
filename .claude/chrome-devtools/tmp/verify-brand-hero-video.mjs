// Verify the /brand full-bleed video hero (WhyUpvc pattern).
// Captures at 1440x900 and 390x844:
//   1. brand-hero-video-{w}-hero.png       — full hero in viewport, video playing
//   2. brand-hero-video-{w}-transition.png — hero bottom → next white section
// Also logs: video playing state, currentSrc tier, hero height vs viewport,
// and the h1 right edge (for glazing-clearance judgement).
import { chromium } from 'playwright';

const PORT = 8080;
const OUT = '/Users/princewagan/fourlinq/.claude/chrome-devtools/tmp';

const viewports = [
  { width: 1440, height: 900, tag: '1440' },
  { width: 390, height: 844, tag: '390' },
];

const b = await chromium.launch();

for (const vp of viewports) {
  const p = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
  // Pre-accept cookie consent + hide chat bubble so fixed overlays stay out of shots.
  await p.addInitScript(() => localStorage.setItem('fourlinq_cookie_consent', 'accepted'));
  await p.goto(`http://localhost:${PORT}/brand`, { waitUntil: 'networkidle', timeout: 90000 });
  await p.addStyleTag({ content: '[data-cookie-banner],[data-chat-bubble]{display:none !important;}' });
  await p.waitForSelector('header video', { timeout: 30000 });
  // Let the video actually start playing so the shot catches a real frame.
  await p.waitForTimeout(1500);

  const info = await p.evaluate(() => {
    const v = document.querySelector('header video');
    const header = v?.closest('header');
    const h1 = header?.querySelector('h1');
    const sub = header?.querySelector('p');
    const hr = header?.getBoundingClientRect();
    const h1r = h1?.getBoundingClientRect();
    const subr = sub?.getBoundingClientRect();
    return {
      currentSrc: v?.currentSrc?.split('/').pop(),
      playing: v ? !v.paused && !v.ended && v.readyState >= 2 : false,
      currentTime: v?.currentTime,
      headerTop: hr?.top,
      headerHeight: hr?.height,
      viewportH: window.innerHeight,
      h1Right: h1r ? Math.round(h1r.right) : null,
      h1Text: h1?.textContent,
      subRight: subr ? Math.round(subr.right) : null,
    };
  });
  console.log(`\n── ${vp.tag}x${vp.height} ──`);
  console.log(JSON.stringify(info, null, 2));
  console.log(`hero fills viewport: ${Math.abs(info.headerHeight - info.viewportH) < 4 ? 'PASS' : `CHECK (header ${info.headerHeight} vs vp ${info.viewportH})`}`);
  console.log(`glazing clearance: h1 right edge at ${info.h1Right}px of ${vp.width}px (${Math.round((info.h1Right / vp.width) * 100)}%)`);

  await p.screenshot({ path: `${OUT}/brand-hero-video-${vp.tag}-hero.png` });

  // Scroll so the hero bottom / next-section boundary sits mid-viewport.
  await p.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.65, behavior: 'instant' }));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/brand-hero-video-${vp.tag}-transition.png` });

  await p.close();
}

await b.close();
console.log('\nDone.');
