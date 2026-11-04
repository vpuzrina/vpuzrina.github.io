// Post-build checks on dist/. Fails the build when:
//  1. a banned word or phrase from the writing rules appears in page text,
//  2. a page loads a resource (script, stylesheet, image, font, iframe) from another domain,
//  3. STRICT=1 (main-site deploy) and a [TODO] marker is still in the HTML.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const banned = [
  'delve', 'leverage', 'robust', 'seamless', 'cutting-edge', 'passionate', 'dynamic', 'innovative', 'showcase',
  'tapestry', 'landscape', 'realm', 'journey', 'unlock', 'empower', "in today's world", 'not only',
  "it's worth noting", 'plays a crucial role', 'i am excited to', "i'm excited to", 'data-driven insights',
  'turning data into stories',
];
const allowed = ['robust standard errors', 'landscape orientation'];

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})('dist');

const problems = [];
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&#x27;|’/g, "'")
    .replace(/\s+/g, ' ')
    .toLowerCase();
  // also check meta descriptions and alt/aria text
  for (const m of html.matchAll(/(?:content|alt|aria-label)="([^"]*)"/g)) text += ' ' + m[1].toLowerCase();
  for (const a of allowed) text = text.split(a).join(' ');
  for (const w of banned) {
    const re = new RegExp(`\\b${w.replace(/[-']/g, (c) => `\\${c}`)}`, 'i');
    if (re.test(text)) problems.push(`${file}: banned word "${w}"`);
  }
  if (/!\s/.test(text.replace(/<!--[\s\S]*?-->/g, ''))) {
    // exclamation marks in prose
    const m = text.match(/.{0,30}![^=].{0,10}/);
    if (m) problems.push(`${file}: exclamation mark near "${m[0]}"`);
  }
  for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*?\b(src|href|srcset)="([^"]+)"/gi)) {
    const [, tag, , url] = m;
    if (tag.toLowerCase() === 'link' && !/rel="(stylesheet|preload|icon|modulepreload|apple-touch-icon|manifest)"/.test(m[0])) continue;
    if (/^(https?:)?\/\//.test(url) && !url.startsWith('https://vpuzrina.github.io')) problems.push(`${file}: third-party ${tag} ${url}`);
  }
  for (const m of html.matchAll(/url\((['"]?)(https?:)?\/\/[^)]+\)/g)) problems.push(`${file}: third-party CSS url ${m[0]}`);
  if (process.env.STRICT === '1' && html.includes('[TODO')) problems.push(`${file}: [TODO] marker left`);
}

if (problems.length) {
  console.error(`\nBuild checks failed:\n  - ${problems.join('\n  - ')}\n`);
  process.exit(1);
}
const todos = files.filter((f) => readFileSync(f, 'utf8').includes('[TODO')).length;
console.log(`Build checks passed on ${files.length} pages. Pages with [TODO] markers: ${todos}${todos ? ' (allowed on preview, blocked with STRICT=1)' : ''}.`);
