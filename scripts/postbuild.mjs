// After `astro build`: serve dist/ locally and use Playwright (Chromium) to
//  1. print /cv to dist/varvara-puzrina-cv.pdf (US Letter) and copy it to dist/resume.pdf,
//     failing the build if the CV runs past one page;
//  2. render a 1200×630 Open Graph image for every page into dist/og/<slug>.png.
// The base path (/ or /site-preview/) comes from SITE_BASE, as in astro.config.mjs.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.SITE_BASE || '/').replace(/\/?$/, '/');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(base)) { res.statusCode = 404; return res.end(); }
  p = join('dist', p.slice(base.length));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.statusCode = 404; return res.end(); }
  res.setHeader('content-type', types[extname(p)] || 'application/octet-stream');
  res.setHeader('access-control-allow-origin', '*'); // fonts in the OG cards load from a blank page
  res.end(readFileSync(p));
}).listen(0);
const origin = `http://localhost:${server.address().port}${base}`;

const browser = await chromium.launch();
try {
  // 1. CV PDF
  const page = await browser.newPage();
  await page.goto(`${origin}cv/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({ format: 'Letter', preferCSSPageSize: true, printBackground: false, tagged: true, outline: false });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
  writeFileSync('dist/varvara-puzrina-cv.pdf', pdf);
  copyFileSync('dist/varvara-puzrina-cv.pdf', 'dist/resume.pdf');
  console.log(`CV PDF: ${pages} page(s), ${(pdf.length / 1024).toFixed(0)} KB`);
  if (pages !== 1) throw new Error(`The CV is ${pages} pages; it must be one. Shorten src/data/about.ts (cv bullets).`);

  // 2. Open Graph images
  mkdirSync('dist/og', { recursive: true });
  const files = [];
  (function walk(d) {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) { if (f !== 'og' && f !== '_astro' && f !== 'fonts') walk(p); }
      else if (f.endsWith('.html')) files.push(p);
    }
  })('dist');
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const slug = ogSlug(file);
    const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').replace(/ · Varvara Puzrina$/, '');
    const path = '/' + file.replace(/^dist\/?/, '').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
    const isPaper = html.includes('class="wrap paper');
    await og.setContent(card(title, path, isPaper), { waitUntil: 'load' });
    await og.evaluate(() => document.fonts.ready);
    await og.screenshot({ path: `dist/og/${slug}.png` });
  }
  console.log(`OG images: ${files.length}`);
} finally {
  await browser.close();
  server.close();
}

export function ogSlug(file) {
  const rel = file.replace(/^dist\/?/, '').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
  return rel === '' ? 'home' : rel.replace(/\//g, '-');
}

function card(title, path, isPaper) {
  const esc = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const isHome = title === 'Varvara Puzrina';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:S;src:url(${origin}fonts/ibm-plex-serif-latin-600-normal.woff2)}
    @font-face{font-family:S;src:url(${origin}fonts/ibm-plex-serif-latin-ext-600-normal.woff2);unicode-range:U+0100-024F}
    @font-face{font-family:M;src:url(${origin}fonts/ibm-plex-mono-latin-400-normal.woff2)}
    html,body{margin:0;width:1200px;height:630px;background:#0F1113;color:#E6E3DC}
    .c{box-sizing:border-box;height:100%;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
    .n{font:400 26px M;color:#9A968D;letter-spacing:.02em}
    .t{font:600 ${isHome ? 76 : title.length > 70 ? 46 : 56}px/1.15 S;max-width:1000px}
    .r{width:120px;height:4px;background:#C47A4A;margin:28px 0 0}
    .f{display:flex;justify-content:space-between;font:400 24px M;color:#9A968D}
  </style></head><body><div class="c">
    <div class="n">${isHome ? 'Computer Science and Economics · Boston University' : 'Varvara Puzrina'}</div>
    <div><div class="t">${esc(title)}</div><div class="r"></div></div>
    <div class="f"><span>vpuzrina.github.io${path === '/' ? '' : path}</span><span>${isHome ? 'Internship · Spring/Summer 2027' : isPaper ? 'Working paper' : ''}</span></div>
  </div></body></html>`;
}
