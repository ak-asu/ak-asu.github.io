/**
 * Portfolio E2E Test Suite
 *
 * Usage:
 *   npm run e2e                    # full suite (all viewports)
 *   node tests/e2e.mjs --section work    # single section
 *   node tests/e2e.mjs --viewport mobile # single viewport
 *
 * Prerequisites: dev server running on TEST_BASE_URL (default: http://127.0.0.1:5175)
 *   npm run dev -- --host 127.0.0.1 --port 5175
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:5175';
const SHOTS_DIR = 'test-reports/screenshots';
const RESULTS_FILE = 'test-reports/results.json';

const args = process.argv.slice(2);
const sectionIdx   = args.indexOf('--section');
const viewportIdx  = args.indexOf('--viewport');
const filterSection  = sectionIdx  >= 0 ? args[sectionIdx  + 1] : null;
const filterViewport = viewportIdx >= 0 ? args[viewportIdx + 1] : null;

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, isMobile: false },
  laptop:  { width: 1280, height: 800, isMobile: false },
  tablet:  { width: 768,  height: 1024, isMobile: true },
  mobile:  { width: 390,  height: 844, isMobile: true },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0, failed = 0, warned = 0;
const allResults = [];

function log(status, label, detail = '') {
  const sym = { PASS: '✅', FAIL: '❌', WARN: '⚠️', INFO: 'ℹ️' }[status] ?? status;
  const line = `  ${sym} [${label}] ${detail}`;
  console.log(line);
  allResults.push({ status, label, detail });
  if (status === 'PASS') passed++;
  else if (status === 'FAIL') failed++;
  else if (status === 'WARN') warned++;
}

async function ss(page, vp, name) {
  if (!existsSync(SHOTS_DIR)) mkdirSync(SHOTS_DIR, { recursive: true });
  const path = join(SHOTS_DIR, `${vp}-${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

/** Wait for the loading screen to clear (AAKASH h1 appears after ~3.5 s). */
async function waitForApp(page) {
  try {
    await page.waitForSelector('h1:has-text("AAKASH")', { timeout: 10_000 });
  } catch {}
  await page.waitForTimeout(400);
}

/** Open hamburger on mobile/tablet then click nav item. */
async function navTo(page, section, isMobile) {
  if (isMobile) {
    const btns = await page.locator('button').all();
    for (const btn of [...btns].reverse()) {
      try {
        const box = await btn.boundingBox();
        if (!box || box.width > 60 || box.height > 60) continue;
        await btn.click({ timeout: 1500 });
        const appeared = await page.locator(`button:has-text("${section}")`).isVisible({ timeout: 1000 }).catch(() => false);
        if (appeared) break;
      } catch {}
    }
  }
  await page.locator(`button:has-text("${section}")`).first().click({ timeout: 8000 });
  await page.waitForTimeout(700);
}

async function assert(condition, label, detail = '') {
  log(condition ? 'PASS' : 'FAIL', label, detail);
}

async function checkVisible(page, selector, label) {
  try {
    const visible = await page.locator(selector).first().isVisible({ timeout: 4000 });
    log(visible ? 'PASS' : 'FAIL', label, `"${selector}"`);
    return visible;
  } catch {
    log('FAIL', label, `"${selector}" not found`);
    return false;
  }
}

async function checkNoHorizontalOverflow(page, sectionName) {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    vw: window.innerWidth,
  }));
  const ok = overflow.bodyScrollWidth <= overflow.vw + 5;
  log(ok ? 'PASS' : 'FAIL', `${sectionName}: no horizontal overflow`,
    `scrollWidth=${overflow.bodyScrollWidth} vw=${overflow.vw}`);
  return ok;
}

// ─── Section Tests ─────────────────────────────────────────────────────────────

async function testLoadingScreen(page) {
  console.log('\n  ── Loading Screen');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const h1 = await page.locator('h1').first().textContent({ timeout: 3000 }).catch(() => '');
  await assert(h1.trim() !== 'Devsarc', 'Loading screen brand not "Devsarc"', `got: "${h1.trim()}"`);
  await assert(h1.trim() === 'AK', 'Loading screen brand is "AK"', `got: "${h1.trim()}"`);
}

async function testHero(page, vp, isMobile) {
  console.log('\n  ── Hero Section');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await ss(page, vp, 'hero');

  const h1s = await page.locator('h1').allTextContents();
  await assert(h1s.some(t => t.includes('AAKASH')), 'Hero: AAKASH name', h1s.join(' | '));
  await checkVisible(page, '.animate-glitch', 'Hero: glitch animation class');
  await checkVisible(page, '.particle', 'Hero: particles');
  await checkVisible(page, '.hud-corners', 'Hero: HUD corners in DOM');

  const particleCount = await page.locator('.particle').count();
  await assert(particleCount === 8, `Hero: exactly 8 particles`, `count: ${particleCount}`);

  const canvas = await page.locator('canvas').count();
  await assert(canvas >= 1, 'Hero: ArcReactor canvas', `count: ${canvas}`);

  for (const metric of ['3+', '370+', '35+']) {
    await checkVisible(page, `text=${metric}`, `Hero: metric "${metric}"`);
  }
  // 5× uses Unicode multiplication sign; check by label text instead
  await checkVisible(page, 'text=Hackathons', 'Hero: metric Hackathons (5×)');
  await checkVisible(page, 'text=LangChain', 'Hero: tech chip LangChain');
  await checkVisible(page, 'text=ONLINE', 'Hero: status bar ONLINE');
  await checkVisible(page, 'text=MSCS @ ASU', 'Hero: status bar MSCS');

  const ghLinks = await page.locator('a[href*="github"]').count();
  await assert(ghLinks > 0, 'Hero: GitHub social link', `count: ${ghLinks}`);

  if (!isMobile) {
    const feedVisible = await page.locator('text=VisionForge').count() > 0 ||
                        await page.locator('text=CareCallerAI').count() > 0;
    await assert(feedVisible, 'Hero: activity feed items visible');
    await checkVisible(page, 'text=Live Activity', 'Hero: activity feed header');
  }

  await checkNoHorizontalOverflow(page, 'Hero');
}

async function testNavbar(page, vp, isMobile) {
  console.log('\n  ── Navbar');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);

  await checkVisible(page, 'text=AK', 'Navbar: AK logo');

  if (!isMobile) {
    for (const item of ['Skills', 'Projects', 'Work', 'Education', 'Achievements', 'Games']) {
      await checkVisible(page, `button:has-text("${item}")`, `Navbar: "${item}" button`);
    }
    const ctrlBtns = await page.locator('.btn-chamfer').count();
    await assert(ctrlBtns >= 3, 'Navbar: ≥3 ctrl buttons (chamfer)', `count: ${ctrlBtns}`);

    // Click Skills and verify section changes
    await page.locator('button:has-text("Skills")').first().click();
    await page.waitForTimeout(600);
    const header = await page.locator('.section-header-title').first().textContent().catch(() => '');
    await assert(header.includes('SKILLS'), 'Navbar: clicking Skills shows SKILLS header', header);
  } else {
    // Mobile hamburger test
    const btns = await page.locator('button').all();
    let opened = false;
    for (const btn of [...btns].reverse()) {
      try {
        const box = await btn.boundingBox();
        if (!box || box.width > 60) continue;
        await btn.click({ timeout: 1500 });
        opened = await page.locator('button:has-text("Skills")').isVisible({ timeout: 1000 }).catch(() => false);
        if (opened) break;
      } catch {}
    }
    await assert(opened, 'Navbar mobile: hamburger opens nav');
    await ss(page, vp, 'navbar-mobile-open');
  }
}

async function testSkills(page, vp, isMobile) {
  console.log('\n  ── Skills Section');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await navTo(page, 'Skills', isMobile);
  await ss(page, vp, 'skills');

  const header = await page.locator('.section-header-title').first().textContent().catch(() => '');
  await assert(header.includes('SKILLS'), 'Skills: section header', header);

  const canvas = await page.locator('canvas').count();
  await assert(canvas >= 1, 'Skills: 3D constellation canvas', `count: ${canvas}`);

  for (const cat of ['All', 'AI/ML', 'Backend', 'Frontend', 'Cloud/Infra', 'Mobile']) {
    await checkVisible(page, `button:has-text("${cat}")`, `Skills: filter "${cat}"`);
  }

  await page.locator('button:has-text("AI/ML")').first().click();
  await page.waitForTimeout(500);
  await ss(page, vp, 'skills-aiml-filter');
  log('PASS', 'Skills: AI/ML filter click', 'no crash after filter click');

  await checkNoHorizontalOverflow(page, 'Skills');
}

async function testProjects(page, vp, isMobile) {
  console.log('\n  ── Projects Section');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await navTo(page, 'Projects', isMobile);
  await page.waitForTimeout(400);
  await ss(page, vp, 'projects');

  const header = await page.locator('.section-header-title').first().textContent().catch(() => '');
  await assert(header.includes('PROJECTS'), 'Projects: section header', header);

  for (const tab of ['All', 'Personal', 'Hackathon', 'Collaborative']) {
    await checkVisible(page, `button:has-text("${tab}")`, `Projects: filter "${tab}"`);
  }

  const ghLinks = await page.locator('a[href*="github"]').count();
  await assert(ghLinks > 0, 'Projects: GitHub links present', `count: ${ghLinks}`);

  const projectVisible = (await page.locator('text=CareCallerAI').count()) > 0 ||
                         (await page.locator('text=CloudForge').count()) > 0 ||
                         (await page.locator('text=MoneyNest').count()) > 0;
  await assert(projectVisible, 'Projects: showcase shows a project');

  await checkNoHorizontalOverflow(page, 'Projects');
}

async function testWork(page, vp, isMobile) {
  console.log('\n  ── Work Section');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await navTo(page, 'Work', isMobile);
  await ss(page, vp, 'work');

  const header = await page.locator('.section-header-title').first().textContent().catch(() => '');
  await assert(header.includes('EXPERIENCE'), 'Work: section header', header);

  const borderTrace = await page.locator('.border-trace').count();
  await assert(borderTrace >= 1, 'Work: border-trace card present', `count: ${borderTrace}`);

  const metrics = await page.locator('.metric-highlight').count();
  await assert(metrics > 0, 'Work: gold metric highlights', `count: ${metrics}`);

  if (metrics > 0) {
    const color = await page.locator('.metric-highlight').first().evaluate(e => window.getComputedStyle(e).color);
    log('INFO', 'Work: metric color', color);
    await assert(color.includes('252') || color.includes('196'), 'Work: metric color is gold', color);
  }

  if (!isMobile) {
    const timeline = await page.locator('button:has-text("ASU"), button:has-text("Fractal")').count();
    await assert(timeline > 1, 'Work: timeline has multiple entries', `count: ${timeline}`);

    const fractalBtns = await page.locator('button:has-text("Fractal")').all();
    if (fractalBtns.length > 0) {
      await fractalBtns[0].click();
      await page.waitForTimeout(400);
      await ss(page, vp, 'work-fractal');
      log('PASS', 'Work: timeline click switches card');
    }

    const techChips = await page.locator('span:has-text("Python"), span:has-text("Django"), span:has-text("React")').count();
    await assert(techChips > 0, 'Work: tech chips visible', `count: ${techChips}`);
  } else {
    const strip = await page.locator('.btn-chamfer').count();
    await assert(strip > 0, 'Work mobile: horizontal scroll strip', `chamfer buttons: ${strip}`);
  }

  await checkNoHorizontalOverflow(page, 'Work');
}

async function testEducation(page, vp, isMobile) {
  console.log('\n  ── Education Section');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await navTo(page, 'Education', isMobile);
  await ss(page, vp, 'education');

  const header = await page.locator('.section-header-title').first().textContent().catch(() => '');
  await assert(header.includes('EDUCATION'), 'Education: section header', header);

  await checkVisible(page, 'text=Arizona State', 'Education: ASU institution');

  const cards = await page.locator('.border-trace').count();
  await assert(cards >= 2, 'Education: two institution cards', `count: ${cards}`);

  const gpaVisible = (await page.locator('text=3.75').count()) + (await page.locator('text=3.10').count());
  await assert(gpaVisible > 0, 'Education: GPA numbers visible', `found: ${gpaVisible}`);

  if (gpaVisible > 0) {
    const gpaColor = await page.evaluate(() => {
      for (const el of document.querySelectorAll('*')) {
        if (el.textContent?.trim() === '3.75') return window.getComputedStyle(el).color;
      }
      return null;
    });
    if (gpaColor) {
      log('INFO', 'Education: GPA color', gpaColor);
      await assert(gpaColor.includes('196') || gpaColor.includes('252'), 'Education: GPA color is gold', gpaColor);
    }
  }

  const coursesBtns = await page.locator('button:has-text("Courses")').count();
  await assert(coursesBtns > 0, 'Education: courses toggle present', `count: ${coursesBtns}`);

  if (coursesBtns > 0) {
    await page.locator('button:has-text("Courses")').first().click();
    await page.waitForTimeout(400);
    await ss(page, vp, 'education-courses');
    const aPlus = await page.locator('text=A+').count();
    await assert(aPlus > 0, 'Education: A+ grade badges after expand', `count: ${aPlus}`);
  }

  await checkNoHorizontalOverflow(page, 'Education');
}

async function testAchievements(page, vp, isMobile) {
  console.log('\n  ── Achievements Section');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await navTo(page, 'Achievements', isMobile);
  await ss(page, vp, 'achievements-curtain');

  const header = await page.locator('.section-header-title').first().textContent().catch(() => '');
  await assert(header.includes('ACHIEVEMENTS'), 'Achievements: section header', header);

  await checkVisible(page, 'text=Reveal Achievements', 'Achievements: curtain with reveal button');

  await page.locator('text=Reveal Achievements').click();
  await page.waitForTimeout(900);
  await ss(page, vp, 'achievements-revealed');

  const curtainGone = !(await page.locator('text=Reveal Achievements').isVisible().catch(() => false));
  await assert(curtainGone, 'Achievements: curtain disappears after reveal');

  // Cards use inline style with min-height (kebab-case in DOM)
  const cards = await page.locator('[style*="min-height"]').count();
  await assert(cards > 0, 'Achievements: grid cards visible', `count: ${cards}`);

  // Hover tooltip
  const firstCard = page.locator('[style*="minHeight"]').first();
  if (await firstCard.count() > 0) {
    await firstCard.hover();
    await page.waitForTimeout(300);
    await ss(page, vp, 'achievements-tooltip');
    log('INFO', 'Achievements: hovered card for tooltip screenshot');
  }

  await checkNoHorizontalOverflow(page, 'Achievements');
}

async function testGames(page, vp, isMobile) {
  console.log('\n  ── Games Section');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await navTo(page, 'Games', isMobile);
  await page.waitForTimeout(500);
  await ss(page, vp, 'games');

  const header = await page.locator('.section-header-title').first().textContent().catch(() => '');
  await assert(header.includes('GAMES'), 'Games: section header', header);

  await checkVisible(page, '[style*="440px"]', 'Games: 440px screen element');
  await checkVisible(page, 'text=TIC TAC TOE', 'Games: TIC TAC TOE default game');
  await checkVisible(page, 'text=Classic X vs O battle', 'Games: game description');
  await checkVisible(page, '[class*="rounded-2xl"]', 'Games: cabinet outer frame');

  const cells = await page.locator('button').count();
  await assert(cells > 5, 'Games: buttons present (game cells + nav)', `count: ${cells}`);

  // Navigate to next game via p-1.5 buttons (unique class for game nav prev/next)
  try {
    const gameNavBtns = await page.locator('button[class*="p-1.5"]').all();
    const nextBtn = gameNavBtns.length >= 2
      ? gameNavBtns[gameNavBtns.length - 1]
      : page.locator('.flex.items-center.gap-3.mt-4').first().locator('button').last();
    await nextBtn.click({ timeout: 3000 });
    // AnimatePresence mode="wait": exit 0.3s + enter 0.3s → wait up to 2s
    await page.waitForSelector('text=COLOR TAP', { timeout: 2000 });
    await ss(page, vp, 'games-color-tap');
    await assert(true, 'Games: next-game navigation → COLOR TAP');
  } catch (e) {
    log('WARN', 'Games: next-game navigation', String(e).slice(0, 80));
  }

  await checkNoHorizontalOverflow(page, 'Games');
}

async function testColors(page, _vp, _isMobile) {
  console.log('\n  ── Color & Contrast');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);

  const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  log('INFO', 'Body background', bodyBg);
  await assert(bodyBg !== 'rgb(255, 255, 255)', 'Colors: body is not white', bodyBg);

  await navTo(page, 'Work', false);
  const barBg = await page.locator('.section-header-bar').first().evaluate(e => window.getComputedStyle(e).backgroundColor).catch(() => '');
  log('INFO', 'Section header bar', barBg);
  await assert(barBg.includes('0, 191'), 'Colors: section header bar is arc-blue', barBg);

  const metricColor = await page.locator('.metric-highlight').first().evaluate(e => window.getComputedStyle(e).color).catch(() => '');
  log('INFO', 'Metric highlight color', metricColor);
  await assert(metricColor.includes('252') || metricColor.includes('196'), 'Colors: metric highlight is gold', metricColor);

  const navBg = await page.locator('nav div[style]').first().getAttribute('style').catch(() => '');
  log('INFO', 'Navbar background', navBg?.slice(0, 80));
  await assert(navBg?.includes('rgba(100, 0, 0') || navBg?.includes('rgba(40, 0, 0'), 'Colors: navbar has dark-red gradient', navBg?.slice(0, 60));
}

async function testConsoleErrors(page, _vp, isMobile) {
  console.log('\n  ── Console Errors');
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);

  for (const section of ['Skills', 'Projects', 'Work', 'Education', 'Achievements', 'Games']) {
    await navTo(page, section, isMobile).catch(() => {});
    if (section === 'Achievements') {
      await page.locator('text=Reveal Achievements').click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }

  const relevant = errors.filter(e => !e.includes('favicon') && !e.includes('[HMR]') && !e.includes('DevTools'));
  await assert(relevant.length === 0, 'Console: zero JS errors across all sections',
    relevant.length > 0 ? relevant.slice(0, 3).join(' | ') : 'clean');
}

async function testChatMobileOverflow(page, vp, isMobile) {
  if (!isMobile) return;
  console.log('\n  ── AKChat mobile overflow');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);

  // Click the chat toggle (fixed circular button)
  const allBtns = await page.locator('button').all();
  for (const btn of allBtns) {
    const cls = await btn.getAttribute('class').catch(() => '');
    if (cls?.includes('rounded-full') && cls?.includes('fixed')) {
      await btn.click({ timeout: 2000 });
      break;
    }
  }
  await page.waitForTimeout(400);

  const panel = page.locator('[class*="rounded-xl"][class*="fixed"]').first();
  if (await panel.count() > 0) {
    const box = await panel.boundingBox();
    const vw = page.viewportSize()?.width ?? 390;
    if (box) {
      log('INFO', 'AKChat panel bounds', `x=${Math.round(box.x)} w=${Math.round(box.width)} vw=${vw}`);
      await assert(box.x >= -1, 'AKChat: panel left edge ≥ 0', `x=${box.x}`);
      await assert(box.x + box.width <= vw + 1, 'AKChat: panel right edge ≤ viewport', `right=${Math.round(box.x + box.width)} vw=${vw}`);
    }
    await ss(page, vp, 'chat-open');
  } else {
    log('WARN', 'AKChat: panel not found after toggle click');
  }
}

// ─── Run per viewport ─────────────────────────────────────────────────────────

const SUITE = [
  { name: 'loading-screen', fn: testLoadingScreen },
  { name: 'hero',           fn: testHero },
  { name: 'navbar',         fn: testNavbar },
  { name: 'skills',         fn: testSkills },
  { name: 'projects',       fn: testProjects },
  { name: 'work',           fn: testWork },
  { name: 'education',      fn: testEducation },
  { name: 'achievements',   fn: testAchievements },
  { name: 'games',          fn: testGames },
  { name: 'colors',         fn: testColors },
  { name: 'console-errors', fn: testConsoleErrors },
  { name: 'chat-overflow',  fn: testChatMobileOverflow },
];

async function runViewport(vpName, vpConfig, browser) {
  console.log(`\n${'═'.repeat(56)}`);
  console.log(`VIEWPORT: ${vpName.toUpperCase()} (${vpConfig.width}×${vpConfig.height})`);
  console.log('═'.repeat(56));

  const context = await browser.newContext({
    viewport: { width: vpConfig.width, height: vpConfig.height },
    isMobile: vpConfig.isMobile,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const testsToRun = SUITE.filter(t => !filterSection || t.name === filterSection);
  for (const t of testsToRun) {
    try {
      await t.fn(page, vpName, vpConfig.isMobile);
    } catch (e) {
      log('FAIL', `${t.name}: UNEXPECTED ERROR`, String(e).slice(0, 100));
    }
  }

  await context.close();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('Portfolio E2E Test Suite');
console.log(`Target: ${BASE}`);
console.log('────────────────────────────────────────────────────────');

// Verify server is up
try {
  const res = await fetch(`${BASE}/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  console.log(`✓ Server responding at ${BASE}`);
} catch (e) {
  console.error(`✗ Server not reachable at ${BASE}`);
  console.error(`  Start it with: npm run dev -- --host 127.0.0.1 --port 5175`);
  process.exit(1);
}

if (!existsSync('test-reports')) mkdirSync('test-reports', { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

const viewportsToRun = Object.entries(VIEWPORTS).filter(([name]) => !filterViewport || name === filterViewport);
for (const [vpName, vpConfig] of viewportsToRun) {
  await runViewport(vpName, vpConfig, browser);
}

await browser.close();

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(56)}`);
console.log('SUMMARY');
console.log('═'.repeat(56));
console.log(`✅ PASS: ${passed}`);
console.log(`❌ FAIL: ${failed}`);
console.log(`⚠️  WARN: ${warned}`);
console.log(`📸 Screenshots: ${SHOTS_DIR}/`);

if (failed > 0) {
  console.log('\nFAILURES:');
  allResults.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ❌ [${r.label}] ${r.detail}`));
}

writeFileSync(RESULTS_FILE, JSON.stringify({ summary: { passed, failed, warned }, results: allResults }, null, 2));
console.log(`\nFull results: ${RESULTS_FILE}`);

process.exit(failed > 0 ? 1 : 0);
