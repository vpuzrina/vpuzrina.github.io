// axe-core scan of every page, dark and light, desktop and phone width. WCAG 2.1 A and AA rules.
// Usage: node tests/e2e/a11y.mjs [baseURL]   (default http://localhost:4321/)
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const base = process.argv[2] || 'http://localhost:4321/';
const pages = ['', 'about/', 'cv/', 'event-study-lab/', 'cobre-panama/', 'nil-gender-gap/', 'newspaper-expulsions/', 'imperial-mortality/', '404'];
const browser = await chromium.launch();
let failures = 0;
for (const theme of ['dark', 'light']) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch (e) {} }, theme);
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(base + p, { waitUntil: 'networkidle' });
      // let islands hydrate
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(250);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
      for (const v of r.violations) {
        failures++;
        console.log(`[${theme} ${w}] /${p}  ${v.id} (${v.impact}): ${v.help}`);
        for (const n of v.nodes.slice(0, 4)) console.log(`    ${n.target.join(' ')}  ${n.any.map((a) => a.message).join('; ').slice(0, 160)}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
console.log(failures ? `\n${failures} violation groups` : 'axe: no violations on any page, both themes, both widths');
process.exit(failures ? 1 : 0);
