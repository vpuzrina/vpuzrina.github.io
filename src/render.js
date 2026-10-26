// Builds the page markup from content.js at build/dev time (see vite.config.js).
// Output is static HTML: everything is visible without JavaScript.

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A field is shown only if it is non-empty and has no [TODO] or [FILL] marker
const MARKER = /\[(TODO|FILL)/;
export const has = (s) => typeof s === 'string' && s.trim() !== '' && !MARKER.test(s);
export const keep = (list = []) => list.filter(has);

// Every unfinished item in content.js: marked strings and `todos: [...]` arrays
export function collectTodos(obj, path = '') {
  if (typeof obj === 'string') return MARKER.test(obj) ? [`${path}: ${obj}`] : [];
  if (Array.isArray(obj)) return obj.flatMap((v, i) => collectTodos(v, `${path}[${i}]`));
  if (obj && typeof obj === 'object')
    return Object.entries(obj).flatMap(([k, v]) =>
      k === 'todos' ? v.map((note) => `${path}: ${note}`) : collectTodos(v, path ? `${path}.${k}` : k)
    );
  return [];
}

export const icon = {
  download:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5m0-5-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 8-4 4 4 4m6-8 4 4-4 4"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16M8 7.8v.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.6 2.4-2.6s2.1 1 2.1 2.6V16"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.6-1.3 5.6-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.6 2.6 5.6 2.9 5.6 2.9a4.3 4.3 0 0 0-.1 3.2 4.6 4.6 0 0 0-1.3 3.2c0 4.6 2.9 5.7 5.6 6a3 3 0 0 0-.8 2.3V21"/></svg>',
  sun: '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
  moon: '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
};

const sectionHead = (title, lead) => `
  <header class="section-head">
    <h2 class="h2">${esc(title)}</h2>
    ${has(lead) ? `<p class="lead">${esc(lead)}</p>` : ''}
  </header>`;

const bullets = (items) => {
  const list = keep(items);
  return list.length ? `<ul class="bullets">${list.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
};
const cvLink = (c, cls, label) =>
  `<a class="${cls}" href="${esc(c.person.cv)}" download="${esc(c.person.cvDownloadName)}">${icon.download}<span>${esc(label)}</span></a>`;
const date = (d) => (has(d) ? `<span class="date">${esc(d)}</span>` : '');

// "A (BU)", "A (BU) and B (Pitt)", "A, B and C"
export const joinPeople = (people) => {
  const names = people.map((p) => `${esc(has(p.fullName) ? p.fullName : p.name)}${p.short ? ` (${esc(p.short)})` : ''}`);
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
};
const metaLine = (parts) => {
  const list = parts.filter(Boolean);
  return list.length ? `<p class="entry-meta">${list.join('<span class="sep" aria-hidden="true"> · </span>')}</p>` : '';
};
const entryTitle = (role, org) => `<h3 class="entry-title">${esc(role)}<span class="sep" aria-hidden="true"> · </span>${esc(org)}</h3>`;

// Work-sample cards that are filled in (max 3): NIL abstract, GitHub, Cobre Panamá once visible
function sampleCards(c) {
  const w = c.workSamples;
  if (!w) return [];
  const cards = [];
  if (has(w.nil?.abstract)) cards.push({ ...w.nil, kind: 'details' });
  if (has(w.github?.text) && has(c.person.github)) cards.push({ ...w.github, href: c.person.github, external: true });
  if (c.featuredProject?.visible) cards.push({ ...w.cobre, href: '#project' });
  return cards.slice(0, 3);
}
const isVisible = (c, section) => {
  if (!section) return true;
  if (section === 'workSamples') return sampleCards(c).length > 0;
  return c[section]?.visible !== false;
};

/* ---------- Sections ---------- */

function nav(c) {
  const links = c.nav.filter((n) => isVisible(c, n.section));
  return `
  <nav class="nav" aria-label="Main">
    <div class="container nav-inner">
      <a class="brand" href="#top">${esc(c.person.name)}</a>
      <ul class="nav-links">
        ${links.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}
      </ul>
      <div class="nav-tools">
        <button class="icon-link theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark theme">${icon.sun}${icon.moon}</button>
        <a class="icon-link" href="${esc(c.person.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon.linkedin}</a>
        ${has(c.person.github) ? `<a class="icon-link" href="${esc(c.person.github)}" target="_blank" rel="noopener" aria-label="GitHub">${icon.github}</a>` : ''}
        <a class="btn btn-sm btn-outline nav-cv" href="${esc(c.person.cv)}" download="${esc(
          c.person.cvDownloadName
        )}" aria-label="Download CV">${icon.download}<span>Download CV</span></a>
      </div>
    </div>
  </nav>`;
}

const heroKpis = (kpis) => `
  <ul class="hero-kpis">
    ${kpis
      .filter((k) => has(k.value))
      .map(
        (k) => `
      <li class="kpi">
        <span class="kpi-value">${esc(k.value)}</span>
        <span class="kpi-label">${esc(k.label)}</span>
        <span class="kpi-note">${esc(k.note)}</span>
      </li>`
      )
      .join('')}
  </ul>`;

function hero(c) {
  const h = c.hero;
  const lines = h.headlineOptions[h.headline] || h.headlineOptions[0];
  return `
  <section class="hero" id="top">
    <div class="container">
      <div class="hero-copy">
        <h1 class="h1">${lines.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h1>
        <p class="hero-sub">${esc(h.subline)}</p>
        ${has(h.availability) ? `<p class="availability">${esc(h.availability)}</p>` : ''}
        <div class="hero-ctas">
          ${cvLink(c, 'btn btn-primary', h.primaryCta)}
          <a class="btn btn-outline" href="#research"><span>${esc(h.secondaryCta)}</span>${icon.arrow}</a>
        </div>
      </div>
      ${heroKpis(h.kpis)}
    </div>
  </section>`;
}

function affiliations(c) {
  const a = c.affiliations;
  const items = keep(a.items);
  if (!items.length) return '';
  return `
  <section class="affil" aria-label="${esc(a.label)}">
    <div class="container"><div class="affil-inner">
      <span class="affil-label">${esc(a.label)}</span>
      <ul class="affil-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    </div></div>
  </section>`;
}

function about(c, opts) {
  const a = c.about;
  const degree = [a.degree, has(a.minor) ? a.minor : ''].filter(Boolean).join(' · ');
  const photo = opts.photo && has(a.photo) ? `<img class="photo" src="${esc(a.photo)}" alt="${esc(a.photoAlt)}" width="112" height="112">` : '';
  return `
  <section class="section" id="about">
    <div class="container">
      <div class="about-grid">
        <h2 class="h2">${esc(a.title)}</h2>
        <div class="about-copy${photo ? ' has-photo' : ''}">
          ${photo}
          <div>
            ${keep(a.paragraphs).map((p) => `<p>${esc(p)}</p>`).join('')}
            <p class="degree">${esc(degree)}</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function roleCard(c, r) {
  const people = r.supervisors?.length ? `with ${joinPeople(r.supervisors)}` : '';
  return `
  <article class="card entry entry-wide">
    <div class="entry-head">
      ${has(r.relevant) ? `<p class="relevant">${esc(c.research.relevantLabel)}: ${esc(r.relevant)}</p>` : ''}
      ${entryTitle(r.role, r.orgShort || r.org)}
      <p class="entry-project">${esc(r.project)}</p>
      ${metaLine([date(r.dates), people, has(r.funding) ? esc(r.funding) : ''])}
    </div>
    <div class="entry-body">${bullets(r.bullets)}</div>
  </article>`;
}

function research(c) {
  const r = c.research;
  return `
  <section class="section" id="research">
    <div class="container">
      ${sectionHead(r.title, r.lead)}
      <div class="roles">${r.roles.map((role) => roleCard(c, role)).join('')}</div>
    </div>
  </section>`;
}

function caseStudy(c) {
  const k = c.caseStudy;
  if (!k || k.visible === false) return '';
  const findings = keep(k.findings);
  const row = (label, body) => `<div class="case-row"><h3 class="case-label">${esc(label)}</h3><div>${body}</div></div>`;
  return `
  <section class="section" id="case">
    <div class="container">
      ${sectionHead(k.title)}
      <article class="card report">
        <div class="report-bar">
          ${entryTitle(k.role, k.org)}
          ${metaLine([date(k.dates), `<span class="report-title">“${esc(k.reportTitle)}”</span>`])}
        </div>
        <div class="case-body">
          ${row('Question', `<p class="case-question">${esc(k.question)}</p>`)}
          ${row(
            k.approachLabel,
            `<ul class="design">${k.approach
              .map((a) => `<li><span class="design-value">${esc(a.value)}</span><span class="design-label">${esc(a.label)}</span></li>`)
              .join('')}</ul>${has(k.approachNote) ? `<p class="design-note">${esc(k.approachNote)}</p>` : ''}`
          )}
          ${findings.length ? row(k.findingsLabel, `<ol class="findings">${findings.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>`) : ''}
          ${row(k.outcomeLabel, `<p>${esc(k.outcome)}</p>`)}
        </div>
      </article>
    </div>
  </section>`;
}

function project(c) {
  const p = c.featuredProject;
  if (!p || !p.visible) return '';
  const steps = [
    ['Question', p.question],
    ['Data', p.data],
    ['Method', p.method],
  ].filter(([, v]) => has(v));
  return `
  <section class="section" id="project">
    <div class="container">
      ${sectionHead(p.title, p.lead)}
      <article class="card report">
        <div class="case-body">
          ${steps.map(([k, v]) => `<div class="case-row"><h3 class="case-label">${k}</h3><p>${esc(v)}</p></div>`).join('')}
          <div class="case-row" data-finding-row hidden><h3 class="case-label">${esc(p.findingLabel)}</h3><p data-finding></p></div>
        </div>
        <div class="report-chart" data-report-chart hidden>
          <div class="chart-head">
            <h4>${esc(p.chartTitle)}</h4>
            <p class="entry-meta" data-xlabel></p>
            <p class="report-kpi"><span data-headline-value></span> <span data-headline-label></span></p>
          </div>
          <div class="chart-box chart-event"><canvas data-chart="event" aria-label="Event study chart" role="img"></canvas></div>
          ${
            has(p.github)
              ? `<a class="btn btn-sm btn-outline" href="${esc(p.github)}" target="_blank" rel="noopener">${icon.code}<span>${esc(
                  p.githubLabel
                )}</span>${icon.ext}</a>`
              : ''
          }
        </div>
      </article>
    </div>
  </section>`;
}

function workSamples(c) {
  const cards = sampleCards(c);
  if (!cards.length) return '';
  return `
  <section class="section" id="samples">
    <div class="container">
      ${sectionHead(c.workSamples.title)}
      <div class="samples samples-${cards.length}">
        ${cards
          .map((s) => {
            const head = `<span class="sample-label">${esc(s.label)}</span><h3 class="entry-title">${esc(s.title)}</h3>`;
            if (s.kind === 'details')
              return `<details class="card sample"><summary>${head}<span class="sample-more">${esc(s.more)}</span></summary><p>${esc(
                s.abstract
              )}</p></details>`;
            const attrs = s.external ? ' target="_blank" rel="noopener"' : '';
            return `<a class="card sample" href="${esc(s.href)}"${attrs}>${head}<p>${esc(s.text)}</p></a>`;
          })
          .join('')}
      </div>
    </div>
  </section>`;
}

// Appends a filled-in `result` to the first bullet; otherwise just closes the sentence
export const withResult = (x) => {
  if (!x.bullets?.length) return [];
  const [first, ...rest] = x.bullets;
  const base = first.replace(/\.$/, '');
  return [has(x.result) ? `${base}; ${x.result.replace(/\.$/, '')}.` : `${base}.`, ...rest];
};

function experience(c) {
  const e = c.experience;
  return `
  <section class="section" id="experience">
    <div class="container">
      ${sectionHead(e.title)}
      <div class="exp-grid">
        ${e.items
          .map(
            (x) => `
          <article class="card entry entry-wide">
            <div class="entry-head">
              ${entryTitle(x.role, x.org)}
              ${metaLine([date(x.dates), has(x.place) ? esc(x.place) : ''])}
            </div>
            <div class="entry-body">${bullets(withResult(x))}</div>
          </article>`
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function skills(c) {
  const s = c.skills;
  return `
  <section class="section" id="skills">
    <div class="container">
      ${sectionHead(s.title)}
      <dl class="skills">
        ${s.groups.map((g) => `<div class="skill-row"><dt>${esc(g.name)}</dt><dd>${keep(g.items).map(esc).join(', ')}</dd></div>`).join('')}
      </dl>
    </div>
  </section>`;
}

function contact(c) {
  const k = c.contact;
  const p = c.person;
  const github = has(p.github);
  return `
  <section class="section contact" id="contact">
    <div class="container"><div class="contact-inner">
      <h2 class="h-cta">${esc(k.title)}</h2>
      <p class="lead">${esc(k.text)}</p>
      <a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)}</a>
      <div class="hero-ctas">
        <a class="btn btn-primary" href="mailto:${esc(p.email)}">${icon.mail}<span>${esc(k.emailCta)}</span></a>
        <a class="btn btn-outline" href="${esc(p.linkedin)}" target="_blank" rel="noopener"><span>${esc(k.linkedinCta)}</span>${icon.ext}</a>
        ${github ? `<a class="btn btn-outline" href="${esc(p.github)}" target="_blank" rel="noopener"><span>${esc(k.githubCta)}</span>${icon.ext}</a>` : ''}
        ${cvLink(c, 'btn btn-outline', k.cvCta)}
      </div>
      <p class="print-only print-contact">${esc(p.email)} · ${esc(p.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}${
        github ? ` · ${esc(p.github.replace(/^https?:\/\//, ''))}` : ''
      }</p>
    </div></div>
    <div class="container"><footer class="footer">
      <span>© ${new Date().getFullYear()} ${esc(k.footer)}</span>
      <ul class="footer-links">
        <li><a href="mailto:${esc(p.email)}">Email</a></li>
        <li><a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>
        ${github ? `<li><a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a></li>` : ''}
        <li><span>${esc(k.updated)}</span></li>
      </ul>
    </footer></div>
  </section>`;
}

export function renderPage(c, opts = {}) {
  return [
    nav(c),
    '<main>',
    hero(c),
    affiliations(c),
    about(c, opts),
    research(c),
    caseStudy(c),
    project(c),
    experience(c),
    skills(c),
    workSamples(c),
    '</main>',
    contact(c),
  ].join('\n');
}

export function renderHead(c) {
  const url = c.meta.url.replace(/\/$/, '');
  const og = url ? `${url}/og.jpg` : 'og.jpg';
  return `
    <title>${esc(c.meta.title)}</title>
    <meta name="description" content="${esc(c.meta.description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(c.meta.title)}">
    <meta property="og:description" content="${esc(c.meta.description)}">
    <meta property="og:image" content="${esc(og)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    ${url ? `<meta property="og:url" content="${esc(url)}/"><link rel="canonical" href="${esc(url)}/">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(c.meta.title)}">
    <meta name="twitter:description" content="${esc(c.meta.description)}">
    <meta name="twitter:image" content="${esc(og)}">`;
}
