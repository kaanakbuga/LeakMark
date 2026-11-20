// Records the live demo flow (scan -> alert -> dispatch -> repair) as an MP4 for slide 9.
// Usage (in src/live_demo): node rec_demo.js <out.mp4>
// Needs Playwright (npm) and ffmpeg with libx264.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const OUT = path.resolve(process.argv[2] || 'LeakMark_Demo.mp4');
const DEMO = path.resolve(__dirname, '../../05_Demo_Panel/LeakMark_Live_Demo.html');
const W = 1880, H = 1000, FPS = 30;
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'lm_demo_'));

// Visible cursor with a click ripple, drawn inside the page so it is recorded.
const CURSOR = `(() => {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;left:0;top:0;width:26px;height:26px;z-index:99999;pointer-events:none;transform:translate(-4px,-2px)';
  c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.4L20.5 11z" fill="#fff" stroke="#0B2E4A" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  document.body.appendChild(c);
  addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
  addEventListener('mousedown', e => {
    const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:99998;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #FF5A3C;left:' + e.clientX + 'px;top:' + e.clientY + 'px;transition:transform .45s ease,opacity .45s ease;transform:scale(.3);opacity:1';
    document.body.appendChild(r);
    requestAnimationFrame(() => { r.style.transform = 'scale(1.3)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 600);
  }, true);
})()`;

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + DEMO);
  await pg.evaluate(CURSOR);
  await pg.mouse.move(W * 0.55, H * 0.55);
  await pg.waitForTimeout(400);

  const frames = [];
  const cdp = await pg.context().newCDPSession(pg);
  cdp.on('Page.screencastFrame', async f => {
    const file = path.join(TMP, `f${String(frames.length).padStart(5, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (_) { }
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: W, maxHeight: H, everyNthFrame: 1 });

  let pos = { x: W * 0.55, y: H * 0.55 };
  const wait = ms => pg.waitForTimeout(ms);
  async function click(sel, pause = 350) {
    const box = await pg.locator(sel).boundingBox();
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    const steps = Math.max(12, Math.round(Math.hypot(x - pos.x, y - pos.y) / 25));
    await pg.mouse.move(x, y, { steps });
    pos = { x, y };
    await wait(pause);
    await pg.mouse.down(); await wait(90); await pg.mouse.up();
  }

  // The four route scans play at SPEED x in the video so the whole demo fits a 3-minute pitch.
  const SPEED = 2, marks = [], fast = [];
  const log = l => marks.push({ t: Date.now() / 1000, l });
  await wait(1500);
  log('start: day 14, rain earlier raised no alert');
  fast.push(Date.now() / 1000);
  for (let i = 0; i < 4; i++) {
    await click('#start-scan');
    log('scan ' + (i + 1));
    await wait(3400);
    await click('#scan-done', 250);
    await wait(500);
  }
  fast.push(Date.now() / 1000);
  log('alert at T-27, ' + (await pg.textContent('#dayLabel')));
  await wait(1800);
  await click('#send-T-27', 500);
  log('send crew');
  await wait(1600);
  await click('#banner');
  log('work order on phone');
  await wait(1500);
  await click('#arrive');
  log('navigate and arrive');
  await wait(2300);
  await click('#c-leak');
  log('leak noise heard');
  await wait(700);
  await click('#submit-check');
  await wait(900);
  await click('#ph');
  log('photo');
  await wait(900);
  await click('#mark-repaired');
  log('repaired: ' + (await pg.textContent('#k-fix')));
  await pg.mouse.move(W * 0.5, H * 0.08, { steps: 25 });
  await wait(2500);
  log('end');

  const tEnd = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  await wait(200);
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join('; '));

  // Variable-rate screencast frames -> constant-rate H.264.
  const inFast = t => t >= fast[0] && t < fast[1];
  const outTime = t => (t - frames[0].t) - Math.max(0, Math.min(t, fast[1]) - fast[0]) * (1 - 1 / SPEED);
  for (const m of marks) console.log(outTime(m.t).toFixed(1).padStart(5) + ' s  ' + m.l);
  console.log(outTime(tEnd).toFixed(1).padStart(5) + ' s  video length');
  const lines = [];
  for (let i = 0; i < frames.length; i++) {
    let d = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : tEnd - frames[i].t;
    if (inFast(frames[i].t)) d /= SPEED;
    lines.push(`file '${frames[i].file}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`);
  }
  lines.push(`file '${frames[frames.length - 1].file}'`);
  const list = path.join(TMP, 'list.txt');
  fs.writeFileSync(list, lines.join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
    '-vf', `fps=${FPS},scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-movflags', '+faststart', '-an', OUT]);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('frames', frames.length, '->', OUT);
})();
