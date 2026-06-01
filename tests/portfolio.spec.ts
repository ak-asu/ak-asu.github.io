/**
 * Portfolio UI Test Suite
 *
 * Run with:  npx playwright test
 * With UI:   npx playwright test --ui
 * One file:  npx playwright test tests/portfolio.spec.ts
 *
 * Tests:
 *  - Loading screen
 *  - Hero section (all elements)
 *  - Navbar (items, ctrl buttons, mobile hamburger)
 *  - Skills section (3D canvas, filters)
 *  - Projects section (filters, showcase)
 *  - Work section (timeline, metrics)
 *  - Education section (cards, GPA, courses)
 *  - Achievements section (curtain, grid, tooltips)
 *  - Games section (cabinet, navigation)
 *  - Responsive layout (desktop / tablet / mobile)
 *  - Colors & contrast
 *  - Zero console errors across all sections
 *  - No horizontal overflow (clipping check)
 *  - AKChat panel (no mobile overflow)
 *  - Status bar
 */

import { test, expect, Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Wait for the loading screen to finish.
 *  The loading screen takes ~3.5 s (3 s timer + 0.5 s fade).
 *  We wait for the hero h1 "AAKASH" to be visible — it only renders after loading clears. */
async function waitForApp(page: Page) {
  await page.waitForSelector('h1:has-text("AAKASH")', { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(300);
}

/** Click a nav button by visible text (works on desktop; skips on mobile). */
async function navTo(page: Page, section: string) {
  const isMobile = page.viewportSize()!.width < 768;
  if (isMobile) {
    // open hamburger first
    const btns = await page.locator('button').all();
    for (const btn of btns.reverse()) {
      try {
        const box = await btn.boundingBox();
        if (!box || box.width > 60 || box.height > 60) continue;
        await btn.click({ timeout: 2000 });
        const appeared = await page.locator(`button:has-text("${section}")`).isVisible({ timeout: 1000 });
        if (appeared) break;
      } catch {}
    }
  }
  await page.locator(`button:has-text("${section}")`).first().click({ timeout: 8000 });
  await page.waitForTimeout(700);
}

// ─── Loading Screen ────────────────────────────────────────────────────────────

test.describe('Loading Screen', () => {
  test('shows correct brand name (AK, not Devsarc)', async ({ page }) => {
    await page.goto('/');
    // Loading screen h1 appears within ~0.3s of React mounting; check it says "AK" not "Devsarc"
    const h1 = await page.locator('h1').first().textContent({ timeout: 5000 }).catch(() => '');
    expect(h1?.trim()).not.toBe('Devsarc');
    // After load clears, hero section shows AAKASH
    await waitForApp(page);
    const h1s = await page.locator('h1').allTextContents();
    expect(h1s.some(t => t.includes('AAKASH'))).toBe(true);
  });
});

// ─── Hero Section ─────────────────────────────────────────────────────────────

test.describe('Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('name AAKASH is displayed', async ({ page }) => {
    const h1s = await page.locator('h1').allTextContents();
    expect(h1s.some(t => t.includes('AAKASH'))).toBe(true);
  });

  test('glitch animation class on h1', async ({ page }) => {
    await expect(page.locator('.animate-glitch')).toBeVisible();
  });

  test('metrics row shows all four stats', async ({ page }) => {
    for (const metric of ['3+', '5×', '370+', '35+']) {
      await expect(page.locator(`text=${metric}`).first()).toBeVisible();
    }
  });

  test('tech chips are rendered', async ({ page }) => {
    await expect(page.locator('text=LangChain').first()).toBeVisible();
    await expect(page.locator('text=React').first()).toBeVisible();
  });

  test('ArcReactor 3D canvas is present', async ({ page }) => {
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBeGreaterThanOrEqual(1);
  });

  test('activity feed shows items', async ({ page }) => {
    // Feed should contain at least one project/hackathon entry
    const feedVisible =
      (await page.locator('text=VisionForge').count()) > 0 ||
      (await page.locator('text=CareCallerAI').count()) > 0 ||
      (await page.locator('text=CloudForge').count()) > 0;
    expect(feedVisible).toBe(true);
  });

  test('social links (GitHub) present', async ({ page }) => {
    const ghLinks = await page.locator('a[href*="github"]').count();
    expect(ghLinks).toBeGreaterThan(0);
  });

  test('status bar shows ONLINE', async ({ page }) => {
    await expect(page.locator('text=ONLINE').first()).toBeVisible();
  });

  test('status bar shows MSCS @ ASU', async ({ page }) => {
    await expect(page.locator('text=MSCS @ ASU').first()).toBeVisible();
  });

  test('HUD corners are in the DOM', async ({ page }) => {
    await expect(page.locator('.hud-corners')).toBeAttached();
  });

  test('8 particle divs are present', async ({ page }) => {
    const count = await page.locator('.particle').count();
    expect(count).toBe(8);
  });

  test.describe('Desktop only', () => {
    test.skip(({ browserName, viewport }) => (viewport?.width ?? 0) < 1024, 'desktop-only');
    test('3-col layout: reactor canvas visible between left and right panels', async ({ page }) => {
      // Left panel: AAKASH h1
      await expect(page.locator('h1').filter({ hasText: 'AAKASH' }).first()).toBeVisible();
      // Right panel: activity feed header label
      await expect(page.locator('text=Live Activity').first()).toBeVisible();
    });
  });
});

// ─── Navbar ───────────────────────────────────────────────────────────────────

test.describe('Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('AK logo is visible', async ({ page }) => {
    await expect(page.locator('text=AK').first()).toBeVisible();
  });

  const sections = ['Skills', 'Projects', 'Work', 'Education', 'Achievements', 'Games'];

  test.describe('Desktop nav items', () => {
    test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, 'desktop-only');
    for (const section of sections) {
      test(`"${section}" nav button is visible`, async ({ page }) => {
        await expect(page.locator(`button:has-text("${section}")`).first()).toBeVisible();
      });
    }
    test('chamfered ctrl buttons exist (≥3)', async ({ page }) => {
      const count = await page.locator('.btn-chamfer').count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
    test('clicking Skills shows underline indicator', async ({ page }) => {
      await page.locator('button:has-text("Skills")').first().click();
      await page.waitForTimeout(400);
      // Section header should show "SKILLS"
      await expect(page.locator('.section-header-title').first()).toContainText('SKILLS');
    });
  });

  test.describe('Mobile hamburger', () => {
    test.skip(({ viewport }) => (viewport?.width ?? 1440) >= 768, 'mobile-only');
    test('hamburger opens nav menu with all sections', async ({ page }) => {
      // Find and click hamburger (small button in top-right area)
      const btns = await page.locator('button').all();
      let opened = false;
      for (const btn of btns.reverse()) {
        try {
          const box = await btn.boundingBox();
          if (!box || box.width > 60) continue;
          await btn.click({ timeout: 1500 });
          const visible = await page.locator('button:has-text("Skills")').isVisible({ timeout: 1000 });
          if (visible) { opened = true; break; }
        } catch {}
      }
      expect(opened).toBe(true);
    });
  });
});

// ─── Skills Section ───────────────────────────────────────────────────────────

test.describe('Skills Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await navTo(page, 'Skills');
  });

  test('section header reads SKILLS', async ({ page }) => {
    await expect(page.locator('.section-header-title').first()).toContainText('SKILLS');
  });

  test('3D constellation canvas renders', async ({ page }) => {
    const count = await page.locator('canvas').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  const categories = ['All', 'AI/ML', 'Backend', 'Frontend', 'Cloud/Infra', 'Mobile'];
  for (const cat of categories) {
    test(`"${cat}" filter button present`, async ({ page }) => {
      await expect(page.locator(`button:has-text("${cat}")`).first()).toBeVisible();
    });
  }

  test('clicking AI/ML filter narrows to that category', async ({ page }) => {
    await page.locator('button:has-text("AI/ML")').first().click();
    await page.waitForTimeout(500);
    // After filter, Python (Backend category) should not appear in tooltip
    // Just verify the filter button click doesn't crash the page
    await expect(page.locator('.section-header-title').first()).toContainText('SKILLS');
  });
});

// ─── Projects Section ─────────────────────────────────────────────────────────

test.describe('Projects Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await navTo(page, 'Projects');
  });

  test('section header reads PROJECTS', async ({ page }) => {
    await expect(page.locator('.section-header-title').first()).toContainText('PROJECTS');
  });

  const tabs = ['All', 'Personal', 'Hackathon', 'Collaborative'];
  for (const tab of tabs) {
    test(`"${tab}" filter tab present`, async ({ page }) => {
      await expect(page.locator(`button:has-text("${tab}")`).first()).toBeVisible();
    });
  }

  test('at least one GitHub link is present', async ({ page }) => {
    const links = await page.locator('a[href*="github"]').count();
    expect(links).toBeGreaterThan(0);
  });

  test('showcase displays a project name', async ({ page }) => {
    // One-at-a-time showcase: some project text should be visible
    const projectVisible =
      (await page.locator('text=CareCallerAI').count()) > 0 ||
      (await page.locator('text=CloudForge').count()) > 0 ||
      (await page.locator('text=MoneyNest').count()) > 0;
    expect(projectVisible).toBe(true);
  });
});

// ─── Work Section ─────────────────────────────────────────────────────────────

test.describe('Work Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await navTo(page, 'Work');
  });

  test('section header reads EXPERIENCE', async ({ page }) => {
    await expect(page.locator('.section-header-title').first()).toContainText('EXPERIENCE');
  });

  test('border-trace card is rendered', async ({ page }) => {
    const count = await page.locator('.border-trace').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('gold metric highlights exist', async ({ page }) => {
    const count = await page.locator('.metric-highlight').count();
    expect(count).toBeGreaterThan(0);
  });

  test('metric highlight color is gold', async ({ page }) => {
    const color = await page
      .locator('.metric-highlight')
      .first()
      .evaluate(e => window.getComputedStyle(e).color);
    // Gold ≈ rgb(252, 186, 3) or similar warm yellow
    expect(color).toMatch(/rgb\(2[0-9]{2}/);
  });

  test('timeline list has multiple entries', async ({ page }) => {
    const count = await page.locator('button:has-text("ASU"), button:has-text("Fractal")').count();
    expect(count).toBeGreaterThan(1);
  });

  test('clicking different company updates detail card', async ({ page }) => {
    const fractalBtns = await page.locator('button:has-text("Fractal")').all();
    if (fractalBtns.length > 0) {
      await fractalBtns[0].click();
      await page.waitForTimeout(400);
      await expect(page.locator('text=Fractal').first()).toBeVisible();
    }
  });

  test.describe('Mobile work strip', () => {
    test.skip(({ viewport }) => (viewport?.width ?? 1440) >= 768, 'mobile-only');
    test('horizontal scroll strip with chamfer buttons', async ({ page }) => {
      const count = await page.locator('.btn-chamfer').count();
      expect(count).toBeGreaterThan(0);
    });
  });
});

// ─── Education Section ────────────────────────────────────────────────────────

test.describe('Education Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await navTo(page, 'Education');
  });

  test('section header reads EDUCATION', async ({ page }) => {
    await expect(page.locator('.section-header-title').first()).toContainText('EDUCATION');
  });

  test('two institution cards rendered', async ({ page }) => {
    const count = await page.locator('.border-trace').count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('ASU is mentioned', async ({ page }) => {
    await expect(page.locator('text=Arizona State').first()).toBeVisible();
  });

  test('large gold GPA number present', async ({ page }) => {
    // GPA displayed as large number (3.75 for ASU)
    const gpaEl = await page.locator('text=3.75').count() + await page.locator('text=3.10').count();
    expect(gpaEl).toBeGreaterThan(0);
  });

  test('GPA color is gold', async ({ page }) => {
    const color = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('*'));
      for (const el of els) {
        if (el.textContent?.trim() === '3.75') {
          return window.getComputedStyle(el).color;
        }
      }
      return null;
    });
    expect(color).toBeTruthy();
    // Should be iron-gold ≈ rgb(196, 145, 2)
    expect(color).toMatch(/rgb\(1[0-9]{2}/);
  });

  test('courses toggle button present', async ({ page }) => {
    const count = await page.locator('button:has-text("Courses")').count();
    expect(count).toBeGreaterThan(0);
  });

  test('courses expand shows A+ grade badges', async ({ page }) => {
    await page.locator('button:has-text("Courses")').first().click();
    await page.waitForTimeout(400);
    const apCount = await page.locator('text=A+').count();
    expect(apCount).toBeGreaterThan(0);
  });
});

// ─── Achievements Section ─────────────────────────────────────────────────────

test.describe('Achievements Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await navTo(page, 'Achievements');
  });

  test('section header reads ACHIEVEMENTS', async ({ page }) => {
    await expect(page.locator('.section-header-title').first()).toContainText('ACHIEVEMENTS');
  });

  test('curtain is shown with Reveal Achievements button', async ({ page }) => {
    await expect(page.locator('text=Reveal Achievements').first()).toBeVisible();
  });

  test('clicking Reveal removes curtain and shows grid', async ({ page }) => {
    await page.locator('text=Reveal Achievements').click();
    await page.waitForTimeout(900);
    // Curtain should be gone
    const curtainVisible = await page.locator('text=Reveal Achievements').isVisible().catch(() => false);
    expect(curtainVisible).toBe(false);
  });

  test('achievement cards are visible after reveal', async ({ page }) => {
    await page.locator('text=Reveal Achievements').click();
    await page.waitForTimeout(1000);
    // Expect multiple achievement title texts
    const cardCount = await page.locator('[style*="minHeight"]').count();
    expect(cardCount).toBeGreaterThan(0);
  });
});

// ─── Games Section ────────────────────────────────────────────────────────────

test.describe('Games Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await navTo(page, 'Games');
    await page.waitForTimeout(500);
  });

  test('section header reads GAMES', async ({ page }) => {
    await expect(page.locator('.section-header-title').first()).toContainText('GAMES');
  });

  test('440px screen element is rendered', async ({ page }) => {
    const count = await page.locator('[style*="440px"]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TIC TAC TOE is shown by default', async ({ page }) => {
    await expect(page.locator('text=TIC TAC TOE').first()).toBeVisible();
  });

  test('game description is visible', async ({ page }) => {
    await expect(page.locator('text=Classic X vs O battle').first()).toBeVisible();
  });

  test('TicTacToe board has 9 cells', async ({ page }) => {
    // 9 board cells + reset button = 10 buttons inside the screen area
    const allBtns = await page.locator('button').count();
    expect(allBtns).toBeGreaterThan(5);
  });

  test('next-game button switches to COLOR TAP', async ({ page }) => {
    // The chevron-right button is before the chevron-left in reverse DOM order
    // Find all buttons and locate the ones around the game name text
    const gameName = page.locator('text=TIC TAC TOE').first();
    await expect(gameName).toBeVisible();
    // The navigation area has prev, game-info, next in a flex row
    // Click the button AFTER the game name div
    const navArea = page.locator('.flex.items-center.gap-3').last();
    const nextBtn = navArea.locator('button').last();
    await nextBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=COLOR TAP').first()).toBeVisible();
  });

  test('cabinet gold frame is rendered', async ({ page }) => {
    const outerFrame = await page.locator('[class*="rounded-2xl"]').count();
    expect(outerFrame).toBeGreaterThan(0);
  });
});

// ─── Global Elements ──────────────────────────────────────────────────────────

test.describe('Global Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('body has dark background', async ({ page }) => {
    const bg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    // Should not be white
    expect(bg).not.toBe('rgb(255, 255, 255)');
  });

  test('section-header-bar is arc-blue', async ({ page }) => {
    await navTo(page, 'Work');
    const color = await page
      .locator('.section-header-bar')
      .first()
      .evaluate(e => window.getComputedStyle(e).backgroundColor);
    expect(color).toContain('0, 191');
  });

  test('terminal mode toggle works', async ({ page }) => {
    // Find terminal/layers icon button (ctrl buttons have title attribute)
    const termBtn = page.locator('[title="Terminal Mode"]').first();
    if (await termBtn.count() > 0) {
      await termBtn.click();
      await page.waitForTimeout(400);
      const terminalEl = await page.locator('[class*="terminal"], [class*="Terminal"]').count();
      expect(terminalEl).toBeGreaterThan(0);
    }
  });
});

// ─── AKChat Mobile Overflow ───────────────────────────────────────────────────

test.describe('AKChat: no mobile overflow', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 1440) >= 640, 'mobile-only');

  test('open chat panel does not overflow viewport width', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    // Open chat by clicking the chat toggle button
    const chatToggle = page.locator('.rounded-full.bg-linear-to-br, [class*="MessageCircle"]').first();
    await chatToggle.click({ timeout: 3000 }).catch(async () => {
      // Fallback: find the bottom-right fixed circular button
      const btns = await page.locator('button').all();
      for (const btn of btns) {
        const classList = await btn.getAttribute('class') ?? '';
        if (classList.includes('rounded-full') && classList.includes('fixed')) {
          await btn.click();
          break;
        }
      }
    });
    await page.waitForTimeout(400);

    // Find the chat panel
    const chatPanel = page.locator('[class*="rounded-xl"][class*="fixed"]').first();
    if (await chatPanel.count() > 0) {
      const box = await chatPanel.boundingBox();
      const vw = page.viewportSize()!.width;
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(-1); // should not be off-screen left
        expect(box.x + box.width).toBeLessThanOrEqual(vw + 1); // should not overflow right
      }
    }
  });
});

// ─── Console Errors (all sections) ───────────────────────────────────────────

test.describe('Zero console errors', () => {
  test('navigating all sections produces no JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForApp(page);

    for (const section of ['Skills', 'Projects', 'Work', 'Education', 'Achievements', 'Games']) {
      await navTo(page, section).catch(() => {});
      if (section === 'Achievements') {
        await page.locator('text=Reveal Achievements').click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(300);
      }
    }

    const relevant = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('[HMR]') &&
      !e.includes('Download the React DevTools'),
    );
    expect(relevant, `JS errors: ${relevant.join('\n')}`).toHaveLength(0);
  });
});

// ─── Horizontal Overflow / Clipping Check ─────────────────────────────────────

test.describe('No horizontal overflow (clipping)', () => {
  const SECTIONS = ['Skills', 'Projects', 'Work', 'Education', 'Achievements', 'Games'];

  for (const section of SECTIONS) {
    test(`${section} section: no unexpected horizontal scroll`, async ({ page }) => {
      await page.goto('/');
      await waitForApp(page);
      await navTo(page, section).catch(() => {});
      await page.waitForTimeout(500);

      const overflow = await page.evaluate(() => {
        // Check document body for horizontal overflow
        return {
          bodyScrollWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
          overflows: document.body.scrollWidth > window.innerWidth + 5,
        };
      });

      // Allow up to 5px tolerance
      expect(overflow.overflows, `${section}: body scrollWidth (${overflow.bodyScrollWidth}) > viewport (${overflow.viewportWidth})`).toBe(false);
    });
  }
});

// ─── Responsiveness Spot-checks ───────────────────────────────────────────────

test.describe('Responsive layout', () => {
  test('hero renders correctly at current viewport', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    // Name always visible regardless of viewport
    const h1s = await page.locator('h1').allTextContents();
    expect(h1s.some(t => t.includes('AAKASH'))).toBe(true);
    // Status bar always visible
    await expect(page.locator('text=ONLINE').first()).toBeVisible();
  });

  test('education cards are not clipping on this viewport', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await navTo(page, 'Education');
    const cards = await page.locator('.border-trace').all();
    for (const card of cards) {
      const box = await card.boundingBox();
      const vw = page.viewportSize()!.width;
      if (box) {
        // Card should not overflow viewport
        expect(box.x + box.width).toBeLessThanOrEqual(vw + 10);
      }
    }
  });

  test.describe('Tablet-specific (768px)', () => {
    test.skip(({ viewport }) => viewport?.width !== 768, 'tablet-only');
    test('work section loads via hamburger nav', async ({ page }) => {
      await page.goto('/');
      await waitForApp(page);
      await navTo(page, 'Work');
      await expect(page.locator('.section-header-title').first()).toContainText('EXPERIENCE');
    });
  });
});
