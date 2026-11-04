// 1. Loads every page (scrolling to hydrate islands) and fails on any request to another origin.
// 2. Keyboard walkthrough of the home page: skip link first, then every tab stop must show a visible focus style.
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4321/';
const origin = new URL(base).origin;
const pages = ['', 'about/', 'cv/', 'event-study-lab/', 'cobre-panama/', 'nil-gender-gap/', 'newspaper-expulsions/', 'imperial-mortality/', '404'];
const browser = await chromium.launch();
let fail = 0;

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const foreign = [];
let total = 0;
page.on('request', (r) => { total++; if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) foreign.push(r.url()); });
for (const p of pages) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
}
console.log(`requests: ${total} across ${pages.length} pages, third-party: ${foreign.length}`);
if (foreign.length) { fail++; console.log('  ' + foreign.join('\n  ')); }
const cookies = await ctx.cookies();
console.log(`cookies set: ${cookies.length}`);
if (cookies.length) fail++;

// Keyboard walkthrough
for (const p of ['', 'imperial-mortality/']) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement.className + ' ' + document.activeElement.textContent.trim());
  if (p === '') {
    console.log(`first tab stop: ${first}`);
    if (!first.includes('skip')) { fail++; console.log('  FAIL: skip link is not the first stop'); }
    await page.keyboard.press('Enter');
    const after = await page.evaluate(() => document.activeElement.id);
    console.log(`after Enter on skip link, focus is on #${after}`);
    if (after !== 'main') fail++;
  }
  const stops = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const knob = el.querySelector?.('.knob');
      const visible =
        (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
        (knob && getComputedStyle(knob).strokeWidth !== '1.5px') ||
        (el.closest('label') && getComputedStyle(el.closest('label')).outlineStyle !== 'none');
      const name = el.getAttribute('aria-label') || el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) || el.tagName;
      return { name, tag: el.tagName.toLowerCase(), visible };
    });
    if (!s) break;
    stops.push(s);
  }
  const invisible = stops.filter((s) => !s.visible);
  console.log(`/${p}: ${stops.length} tab stops checked, without a visible focus style: ${invisible.length}`);
  for (const s of invisible) console.log(`  ${s.tag} "${s.name}"`);
  if (invisible.length) fail++;
  if (p === '') console.log('  order: ' + stops.slice(0, 22).map((s) => s.name).join(' | '));
}
await browser.close();
console.log(fail ? 'FAILED' : 'network and keyboard checks passed');
process.exit(fail ? 1 : 0);
