// Editorial design previews (/v1/, /v2/). Same content.js and section order as the live page.
import { esc, has, keep, joinPeople, withResult, icon } from '../render.js';

const bullets = (items) => {
  const list = keep(items);
  return list.length ? `<ul class="bullets">${list.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
};
// Previews live in sub-folders, so file links are root-absolute
const cvHref = (c) => `/${c.person.cv}`;
const cvLink = (c, cls, label) =>
  `<a class="${cls}" href="${esc(cvHref(c))}" download="${esc(c.person.cvDownloadName)}">${icon.download}<span>${esc(label)}</span></a>`;
const meta = (parts) => {
  const list = parts.filter(Boolean);
  return list.length ? `<p class="meta">${list.join('<span class="sep" aria-hidden="true"> · </span>')}</p>` : '';
};
const title = (role, org) => `<h3 class="entry-title">${esc(role)}<span class="sep" aria-hidden="true"> · </span>${esc(org)}</h3>`;
const pad = (n) => String(n).padStart(2, '0');

// Section frame: numbered label on the left ("02 — Research"), content on the right
const section = (id, n, label, body, extraClass = '') => `
  <section class="sec${extraClass}" id="${id}">
    <div class="wrap sec-grid">
      <h2 class="sec-label"><span class="num">${pad(n)}</span><span class="dash" aria-hidden="true"> — </span>${esc(label)}</h2>
      <div class="sec-body">${body}</div>
    </div>
  </section>`;

/* ---------- v2 hero figure: archive table → clean grid → line chart ---------- */
// Glyphs in the "scan" are hatched blobs and the chart has no axes or values, so nothing reads as data.
function archiveFigure() {
  const rows = 12;
  const cols = [
    { x: 36, w: 128, align: 'left' },
    { x: 176, w: 70 },
    { x: 258, w: 70 },
    { x: 340, w: 64 },
  ];
  const top = 150;
  const rowH = 24;
  // deterministic pseudo-random widths so the build is stable
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const heads = ['Губерніи', 'Мѣсяцъ', 'Умерло', 'Всего'];
  let oldCells = '';
  let gridCells = '';
  for (let r = 0; r < rows; r++) {
    const y = top + r * rowH;
    let oldRow = '';
    let gridRow = '';
    cols.forEach((col, i) => {
      const w = i === 0 ? 60 + rnd() * 60 : 26 + rnd() * 34;
      const x = col.align === 'left' ? col.x : col.x + col.w - w;
      oldRow += `<rect x="${x.toFixed(1)}" y="${y + 7}" width="${w.toFixed(1)}" height="9" rx="2" fill="url(#hatch)"/>`;
      gridRow += `<rect x="${x.toFixed(1)}" y="${y + 8}" width="${w.toFixed(1)}" height="7" rx="3.5"/>`;
    });
    oldCells += `<g class="old-row" style="--r:${r}">${oldRow}</g>`;
    gridCells += `<g class="grid-row" style="--r:${r}">${gridRow}</g>`;
  }
  const bottom = top + rows * rowH;
  const colLines = [170, 252, 334].map((x) => `<line x1="${x}" y1="118" x2="${x}" y2="${bottom}"/>`).join('');
  const rowLines = Array.from({ length: rows + 1 }, (_, r) => `<line x1="28" y1="${top + r * rowH}" x2="412" y2="${top + r * rowH}"/>`).join('');
  return `
  <figure class="archive" data-archive role="img" aria-label="Illustration: a scanned 1890s statistical table is digitized into a clean grid, then becomes a line chart. No real values are shown.">
    <svg viewBox="0 0 440 500" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(55)">
          <rect width="3" height="3" fill="#cdb98f"/><line x1="0" y1="0" x2="0" y2="3" stroke="#5a4630" stroke-width="1.3"/>
        </pattern>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/>
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 .22 0"/>
          <feComposite in2="SourceGraphic" operator="in"/>
        </filter>
      </defs>

      <g class="old">
        <rect class="paper" x="14" y="20" width="412" height="460" rx="3"/>
        <rect x="14" y="20" width="412" height="460" rx="3" fill="#000" filter="url(#grain)"/>
        <text class="old-title" x="220" y="64" text-anchor="middle">СТАТИСТИЧЕСКІЙ ЕЖЕГОДНИКЪ</text>
        <line class="old-rule" x1="28" y1="84" x2="412" y2="84"/><line class="old-rule" x1="28" y1="88" x2="412" y2="88"/>
        ${heads.map((h, i) => `<text class="old-head" x="${i === 0 ? 36 : cols[i].x + cols[i].w}" y="110" text-anchor="${i === 0 ? 'start' : 'end'}">${h}</text>`).join('')}
        <g class="old-lines">${colLines}<line x1="28" y1="${top - 6}" x2="412" y2="${top - 6}"/><line x1="28" y1="${bottom + 4}" x2="412" y2="${bottom + 4}"/></g>
        ${oldCells}
        <rect class="old-stain" x="300" y="380" width="90" height="70" rx="35"/>
      </g>

      <g class="grid">
        <rect class="grid-bg" x="14" y="20" width="412" height="460" rx="10"/>
        ${['Province', 'Month', 'Deaths', 'Total'].map((h, i) => `<text class="grid-head" x="${i === 0 ? 36 : cols[i].x + cols[i].w}" y="110" text-anchor="${i === 0 ? 'start' : 'end'}">${h}</text>`).join('')}
        <g class="grid-lines">${colLines}${rowLines}</g>
        ${gridCells}
      </g>

      <g class="chart">
        <line class="axis" x1="44" y1="420" x2="404" y2="420"/>
        <line class="axis" x1="44" y1="140" x2="44" y2="420"/>
        ${[210, 280, 350].map((y) => `<line class="gridline" x1="44" y1="${y}" x2="404" y2="${y}"/>`).join('')}
        <path class="line" pathLength="1" d="M44 360 C 84 352, 104 330, 134 334 S 184 360, 214 318 S 262 216, 292 236 S 340 300, 364 258 S 392 214, 404 206"/>
        <circle class="dot" cx="404" cy="206" r="5"/>
      </g>

      <rect class="scanline" x="0" y="0" width="440" height="3"/>
    </svg>
    <figcaption class="archive-steps">
      <span data-step="1">Scan</span><span data-step="2">Clean</span><span data-step="3">Analyze</span>
      <button class="replay" type="button" data-replay hidden>Replay</button>
    </figcaption>
  </figure>`;
}

/* ---------- Page ---------- */

function nav(c, links) {
  return `
  <nav class="nav" aria-label="Main">
    <div class="wrap nav-inner">
      <a class="brand" href="#top">${esc(c.person.name)}</a>
      <ul class="nav-links">${links.map((l) => `<li><a class="u" href="#${l.id}">${esc(l.label)}</a></li>`).join('')}</ul>
      <a class="icon-link" href="${esc(c.person.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon.linkedin}</a>
      ${has(c.person.github) ? `<a class="icon-link" href="${esc(c.person.github)}" target="_blank" rel="noopener" aria-label="GitHub">${icon.github}</a>` : ''}
      <a class="btn btn-outline btn-sm nav-cv" href="${esc(cvHref(c))}" download="${esc(c.person.cvDownloadName)}" aria-label="Download CV">${icon.download}<span>Download CV</span></a>
    </div>
  </nav>`;
}

function hero(c, variant) {
  const h = c.hero;
  const lines = h.headlineOptions[h.headline] || h.headlineOptions[0];
  const copy = `
    <div class="hero-copy">
      <h1 class="h1">${lines.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h1>
      <p class="hero-sub">${esc(h.subline)}</p>
      ${has(h.availability) ? `<p class="availability">${esc(h.availability)}</p>` : ''}
      <div class="ctas">
        ${cvLink(c, 'btn btn-primary', h.primaryCta)}
        <a class="text-link u" href="#research">${esc(h.secondaryCta)} <span aria-hidden="true">→</span></a>
      </div>
    </div>`;
  const kpis = `
    <ul class="kpis">
      ${h.kpis
        .filter((k) => has(k.value))
        .map(
          (k) => `<li class="kpi"><span class="kpi-value" data-count>${esc(k.value)}</span><span class="kpi-label">${esc(
            k.label
          )}</span><span class="kpi-note">${esc(k.note)}</span></li>`
        )
        .join('')}
    </ul>`;
  return `
  <header class="hero hero-${variant}" id="top">
    <div class="wrap">
      ${variant === 'v2' ? `<div class="hero-grid">${copy}${archiveFigure()}</div>` : copy}
      ${kpis}
      ${
        keep(c.affiliations.items).length
          ? `<p class="affil"><span class="affil-label">${esc(c.affiliations.label)}</span> ${keep(c.affiliations.items)
              .map((i) => `<span class="affil-item">${esc(i)}</span>`)
              .join('<span class="sep" aria-hidden="true"> · </span>')}</p>`
          : ''
      }
    </div>
  </header>`;
}

function aboutBody(c, photo) {
  const a = c.about;
  const degree = [a.degree, has(a.minor) ? a.minor : ''].filter(Boolean).join(' · ');
  const img = photo && has(a.photo) ? `<img class="photo" src="/${esc(a.photo)}" alt="${esc(a.photoAlt)}" width="120" height="120">` : '';
  return `
    <p class="statement">${esc(a.title)}</p>
    <div class="about-copy${img ? ' has-photo' : ''}">
      ${img}
      <div>
        ${keep(a.paragraphs).map((p) => `<p>${esc(p)}</p>`).join('')}
        <p class="degree">${esc(degree)}</p>
      </div>
    </div>`;
}

function researchBody(c) {
  return c.research.roles
    .map(
      (r) => `
    <article class="entry">
      ${has(r.relevant) ? `<p class="relevant">${esc(c.research.relevantLabel)}: ${esc(r.relevant)}</p>` : ''}
      ${title(r.role, r.orgShort || r.org)}
      <p class="project">${esc(r.project)}</p>
      ${meta([has(r.dates) ? `<span class="date">${esc(r.dates)}</span>` : '', r.supervisors?.length ? `with ${joinPeople(r.supervisors)}` : '', has(r.funding) ? esc(r.funding) : ''])}
      ${bullets(r.bullets)}
    </article>`
    )
    .join('');
}

function caseBody(c) {
  const k = c.caseStudy;
  const findings = keep(k.findings);
  const headline = k.title.replace(/^Case study:\s*/i, '');
  return `
    <p class="statement">${esc(headline.charAt(0).toUpperCase() + headline.slice(1))}</p>
    <p class="byline">${esc(k.role)}<span class="sep" aria-hidden="true"> · </span>${esc(k.org)}${
      has(k.dates) ? `<span class="sep" aria-hidden="true"> · </span><span class="date">${esc(k.dates)}</span>` : ''
    }<br><span class="report-title">From the report “${esc(k.reportTitle)}”</span></p>
    <blockquote class="pullquote"><p>${esc(k.question)}</p></blockquote>
    <h3 class="sub">${esc(k.approachLabel)}</h3>
    <ul class="figures">
      ${k.approach.map((a) => `<li><span class="figure-num" data-count>${esc(a.value)}</span><span class="figure-label">${esc(a.label)}</span></li>`).join('')}
    </ul>
    ${has(k.approachNote) ? `<p class="note">${esc(k.approachNote)}</p>` : ''}
    ${findings.length ? `<h3 class="sub">${esc(k.findingsLabel)}</h3><ol class="findings">${findings.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>` : ''}
    <h3 class="sub">${esc(k.outcomeLabel)}</h3>
    <p class="outcome">${esc(k.outcome)}</p>`;
}

function experienceBody(c) {
  return c.experience.items
    .map(
      (x) => `
    <article class="entry">
      ${title(x.role, x.org)}
      ${meta([has(x.dates) ? `<span class="date">${esc(x.dates)}</span>` : '', has(x.place) ? esc(x.place) : ''])}
      ${bullets(withResult(x))}
    </article>`
    )
    .join('');
}

const skillsBody = (c) => `
  <dl class="skills">
    ${c.skills.groups.map((g) => `<div><dt>${esc(g.name)}</dt><dd>${keep(g.items).map(esc).join(', ')}</dd></div>`).join('')}
  </dl>`;

function contactBody(c) {
  const k = c.contact;
  const p = c.person;
  return `
    <p class="cta">${esc(k.title)}</p>
    <p class="lead">${esc(k.text)}</p>
    <p><a class="email u" href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>
    <div class="ctas">
      <a class="btn btn-primary" href="mailto:${esc(p.email)}">${icon.mail}<span>${esc(k.emailCta)}</span></a>
      <a class="btn btn-outline" href="${esc(p.linkedin)}" target="_blank" rel="noopener"><span>${esc(k.linkedinCta)}</span>${icon.ext}</a>
      ${has(p.github) ? `<a class="btn btn-outline" href="${esc(p.github)}" target="_blank" rel="noopener"><span>${esc(k.githubCta)}</span>${icon.ext}</a>` : ''}
      ${cvLink(c, 'btn btn-outline', k.cvCta)}
    </div>`;
}

export function renderEditorial(c, { variant = 'v1', photo = false } = {}) {
  // Same section order as the live page; hidden sections (featured project, work samples) stay hidden
  const parts = [
    ['about', 'About', aboutBody(c, photo)],
    ['research', c.research.title, researchBody(c)],
    ['case', 'Case study', caseBody(c)],
    ['experience', c.experience.title, experienceBody(c)],
    ['skills', c.skills.title, skillsBody(c)],
  ];
  const navIds = new Set(c.nav.filter((n) => !n.section || c[n.section]?.visible !== false).map((n) => n.href.slice(1)));
  const links = c.nav.filter((n) => navIds.has(n.href.slice(1))).map((n) => ({ id: n.href.slice(1), label: n.label }));
  const body = parts.map(([id, label, html], i) => section(id, i + 1, label, html)).join('\n');
  const p = c.person;
  return [
    nav(c, links),
    '<main>',
    hero(c, variant),
    body,
    section('contact', parts.length + 1, 'Contact', contactBody(c), ' sec-contact'),
    '</main>',
    `<footer class="wrap footer"><span>© ${new Date().getFullYear()} ${esc(c.contact.footer)}</span><span><a class="u" href="mailto:${esc(
      p.email
    )}">Email</a> · <a class="u" href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>${
      has(p.github) ? ` · <a class="u" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a>` : ''
    } · ${esc(c.contact.updated)}</span></footer>`,
    `<div class="preview-bar" role="group" aria-label="Design preview controls">
      <span>Design preview ${variant.toUpperCase()} · accent</span>
      <button type="button" data-accent="claret" aria-pressed="true"><i class="sw sw-claret"></i>Claret</button>
      <button type="button" data-accent="teal" aria-pressed="false"><i class="sw sw-teal"></i>Teal</button>
      <button type="button" class="hide" data-hide-preview aria-label="Hide preview controls">Hide</button>
    </div>`,
  ].join('\n');
}

export function renderEditorialHead(c, variant) {
  const url = c.meta.url.replace(/\/$/, '');
  return `
    <title>${esc(c.meta.title)} (design preview ${variant})</title>
    <meta name="description" content="${esc(c.meta.description)}">
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="${esc(url)}/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(c.meta.title)}">
    <meta property="og:description" content="${esc(c.meta.description)}">
    <meta property="og:image" content="${esc(url)}/og.jpg">
    <meta name="twitter:card" content="summary_large_image">`;
}
