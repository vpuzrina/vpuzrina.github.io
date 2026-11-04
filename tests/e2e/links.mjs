// Broken-link check on dist/: every internal href/src must resolve to a file, and every #fragment
// must exist on the target page. External links are listed (and fetched when CHECK_EXTERNAL=1).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';

const base = (process.env.SITE_BASE || '/').replace(/\/?$/, '/');
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })('dist');

const idsOf = new Map();
const ids = (file) => {
  if (!idsOf.has(file)) idsOf.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsOf.get(file);
};
function resolveFile(urlPath) {
  let p = urlPath.startsWith(base) ? urlPath.slice(base.length) : null;
  if (p === null) return null;
  p = join('dist', decodeURIComponent(p));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p) && existsSync(p + '.html')) p += '.html';
  return existsSync(p) ? p : null;
}

const external = new Set();
let bad = 0, checked = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const pagePath = base + file.replace(/^dist\/?/, '').replace(/index\.html$/, '').replace(/\.html$/, '');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|data:)/.test(url)) continue;
    if (/^https?:\/\//.test(url)) {
      if (url.startsWith('https://vpuzrina.github.io/')) { /* canonical / og: checked as internal below */ }
      else { external.add(url); continue; }
    }
    checked++;
    const u = new URL(url, 'http://local' + pagePath);
    const target = u.origin === 'http://local' ? u.pathname : new URL(url).pathname;
    const f = resolveFile(target);
    if (!f) { bad++; console.log(`${file}: broken link ${url}`); continue; }
    if (u.hash && f.endsWith('.html') && !ids(f).has(decodeURIComponent(u.hash.slice(1)))) { bad++; console.log(`${file}: missing anchor ${url}`); }
  }
}
console.log(`internal links checked: ${checked}, broken: ${bad}`);
console.log(`external links (${external.size}):\n  ${[...external].join('\n  ')}`);
if (process.env.CHECK_EXTERNAL === '1') {
  for (const url of external) {
    try { const r = await fetch(url, { method: 'GET', redirect: 'follow' }); console.log(`  ${r.status} ${url}`); } catch (e) { console.log(`  ERR ${url} ${e.message}`); }
  }
}
process.exit(bad ? 1 : 0);
