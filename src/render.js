// Builds the page markup from content.js at build/dev time (see vite.config.js).
// Output is static HTML, so the page is readable before any JS runs.

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A field is shown only if it is non-empty and has no [TODO] or [FILL] marker
const MARKER = /\[(TODO|FILL)/;
const has = (s) => typeof s === 'string' && s.trim() !== '' && !MARKER.test(s);
const keep = (list = []) => list.filter(has);

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

const icon = {
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
};

const sectionHead = (title, lead) => `
  <header class="section-head reveal">
    <h2 class="h2">${esc(title)}</h2>
    ${has(lead) ? `<p class="lead">${esc(lead)}</p>` : ''}
  </header>`;

const chips = (items) => keep(items).map((m) => `<li class="chip">${esc(m)}</li>`).join('');
const bullets = (items) => {
  const list = keep(items);
  return list.length ? `<ul class="bullets">${list.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
};
const cvLink = (c, cls, label) =>
  `<a class="${cls}" href="${esc(c.person.cv)}" download="${esc(c.person.cvDownloadName)}">${icon.download}<span>${esc(label)}</span></a>`;

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
      <a class="brand" href="#top">
        <span class="brand-mark" aria-hidden="true">${esc(c.person.short)}</span>
        <span>${esc(c.person.name)}</span>
      </a>
      <ul class="nav-links">
        ${links.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}
      </ul>
      <div class="nav-icons">
        <a class="icon-link" href="${esc(c.person.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon.linkedin}</a>
        ${has(c.person.github) ? `<a class="icon-link" href="${esc(c.person.github)}" target="_blank" rel="noopener" aria-label="GitHub">${icon.github}</a>` : ''}
      </div>
      <a class="btn btn-sm btn-primary nav-cv" href="${esc(c.person.cv)}" download="${esc(
        c.person.cvDownloadName
      )}" aria-label="Download CV">${icon.download}<span>Download CV</span></a>
    </div>
  </nav>`;
}

const heroKpis = (kpis) => `
  <ul class="hero-kpis reveal">
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
    <div class="glow glow-hero" aria-hidden="true"></div>
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="pill-hero reveal"><span class="dot-live"></span>${esc(h.eyebrow)}</span>
        <h1 class="h1 reveal">${lines.map((l) => `<span>${esc(l)}</span>`).join('')}</h1>
        <p class="hero-sub reveal">${esc(h.subline)}</p>
        <div class="hero-ctas reveal">
          ${cvLink(c, 'btn btn-primary', h.primaryCta)}
          <a class="btn btn-ghost" href="#research"><span>${esc(h.secondaryCta)}</span>${icon.arrow}</a>
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
    <div class="container affil-inner">
      <span class="mono-label">${esc(a.label)}</span>
      <ul class="affil-list">${items.map((i) => `<li class="wordmark">${esc(i)}</li>`).join('')}</ul>
    </div>
  </section>`;
}

function about(c) {
  const a = c.about;
  const degree = [a.degree, has(a.minor) ? a.minor : ''].filter(Boolean).join(' · ');
  return `
  <section class="section" id="about">
    <div class="container">
      <div class="about-grid reveal">
        <h2 class="h2">${esc(a.title)}</h2>
        <div class="about-copy">
          ${keep(a.paragraphs).map((p) => `<p>${esc(p)}</p>`).join('')}
          <p class="degree">${esc(degree)}</p>
        </div>
      </div>
    </div>
  </section>`;
}

function roleCard(c, r) {
  const advisors = r.supervisors
    .map((p) => `<li><strong>${esc(has(p.fullName) ? p.fullName : p.name)}</strong>, ${esc(p.affil)}</li>`)
    .join('');
  return `
  <article class="card role reveal">
    <div class="role-meta">
      <div class="role-top">
        ${has(r.relevant) ? `<span class="relevant">${esc(c.research.relevantLabel)}: ${esc(r.relevant)}</span>` : '<span></span>'}
        ${has(r.dates) ? `<span class="date">${esc(r.dates)}</span>` : ''}
      </div>
      <span class="mono-label">${esc(r.org)}</span>
      <h3 class="h3">${esc(r.role)}</h3>
      <p class="role-project">${esc(r.project)}</p>
      <div class="advisors"><span class="advisors-label">${esc(c.research.advisorsLabel)}</span><ul>${advisors}</ul></div>
      ${has(r.funding) ? `<p class="funding">${esc(r.funding)}</p>` : ''}
    </div>
    <div class="role-body">
      ${bullets(r.bullets)}
    </div>
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
  const meta = [k.org, k.role].join(' · ');
  return `
  <section class="section" id="case">
    <div class="container">
      ${sectionHead(k.title)}
      <article class="card report reveal">
        <div class="report-bar">
          <span class="mono-label">${esc(meta)}</span>
          ${has(k.dates) ? `<span class="date">${esc(k.dates)}</span>` : ''}
          <span class="report-title">“${esc(k.reportTitle)}”</span>
        </div>
        <div class="case-body">
          <div class="case-row">
            <h3 class="case-label">Question</h3>
            <p class="case-question">${esc(k.question)}</p>
          </div>
          <div class="case-row">
            <h3 class="case-label">${esc(k.approachLabel)}</h3>
            <div>
              <ul class="design">
                ${k.approach
                  .map((a) => `<li><span class="design-value">${esc(a.value)}</span><span class="design-label">${esc(a.label)}</span></li>`)
                  .join('')}
              </ul>
              ${has(k.approachNote) ? `<p class="design-note">${esc(k.approachNote)}</p>` : ''}
            </div>
          </div>
          ${
            findings.length
              ? `<div class="case-row"><h3 class="case-label">${esc(k.findingsLabel)}</h3><ol class="findings">${findings
                  .map((f) => `<li>${esc(f)}</li>`)
                  .join('')}</ol></div>`
              : ''
          }
          <div class="case-row">
            <h3 class="case-label">${esc(k.outcomeLabel)}</h3>
            <p class="case-outcome">${esc(k.outcome)}</p>
          </div>
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
      <article class="card report reveal">
        <div class="report-bar">
          <span class="mono-label">${esc(p.reportId)}</span>
          <span class="report-title">${esc(p.title)}</span>
        </div>
        <div class="report-body">
          <ol class="report-steps">
            ${steps
              .map(([k, v], i) => `<li><span class="step-n">0${i + 1}</span><div><h3>${k}</h3><p>${esc(v)}</p></div></li>`)
              .join('')}
            <li class="finding" data-finding-row hidden><span class="step-n">0${steps.length + 1}</span><div><h3>${esc(
              p.findingLabel
            )}</h3><p data-finding></p></div></li>
          </ol>
          <div class="report-chart" data-report-chart hidden>
            <div class="dpanel-head">
              <div><h4>${esc(p.chartTitle)}</h4><span class="mono-label" data-xlabel></span></div>
              <div class="report-kpi"><span class="kpi-value" data-headline-value></span><span class="kpi-note" data-headline-label></span></div>
            </div>
            <div class="chart-box chart-event"><canvas data-chart="event" aria-label="Event study chart" role="img"></canvas></div>
            ${
              has(p.github)
                ? `<div class="report-foot"><a class="btn btn-ghost btn-sm" href="${esc(p.github)}" target="_blank" rel="noopener">${
                    icon.code
                  }<span>${esc(p.githubLabel)}</span>${icon.ext}</a></div>`
                : ''
            }
          </div>
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
            const head = `<span class="mono-label">${esc(s.label)}</span><h3 class="h4">${esc(s.title)}</h3>`;
            if (s.kind === 'details')
              return `<details class="card sample reveal"><summary>${head}<span class="sample-more">${esc(s.more)}</span></summary><p>${esc(
                s.abstract
              )}</p></details>`;
            const attrs = s.external ? ' target="_blank" rel="noopener"' : '';
            return `<a class="card sample reveal" href="${esc(s.href)}"${attrs}>${head}<p>${esc(s.text)}</p></a>`;
          })
          .join('')}
      </div>
    </div>
  </section>`;
}

// Appends a filled-in `result` to the first bullet; otherwise just closes the sentence
const withResult = (x) => {
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
          <article class="card tl-card reveal">
            <div class="tl-top"><h3 class="h4">${esc(x.role)}</h3>${has(x.dates) ? `<span class="date">${esc(x.dates)}</span>` : ''}</div>
            <span class="tl-org">${esc(x.org)}</span>
            ${bullets(withResult(x))}
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
      <div class="card skill-table reveal">
        ${s.groups
          .map((g) => `<div class="skill-row"><h3 class="mono-label">${esc(g.name)}</h3><ul class="chips">${chips(g.items)}</ul></div>`)
          .join('')}
      </div>
    </div>
  </section>`;
}

function contact(c) {
  const k = c.contact;
  const p = c.person;
  const github = has(p.github);
  return `
  <section class="section contact" id="contact">
    <div class="glow glow-contact" aria-hidden="true"></div>
    <div class="container contact-inner reveal">
      <h2 class="h-cta">${esc(k.title)}</h2>
      <p class="lead">${esc(k.text)}</p>
      <a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)}</a>
      <div class="hero-ctas">
        <a class="btn btn-primary" href="mailto:${esc(p.email)}">${icon.mail}<span>${esc(k.emailCta)}</span></a>
        <a class="btn btn-ghost" href="${esc(p.linkedin)}" target="_blank" rel="noopener"><span>${esc(k.linkedinCta)}</span>${icon.ext}</a>
        ${github ? `<a class="btn btn-ghost" href="${esc(p.github)}" target="_blank" rel="noopener"><span>${esc(k.githubCta)}</span>${icon.ext}</a>` : ''}
        ${cvLink(c, 'btn btn-ghost', k.cvCta)}
      </div>
    </div>
    <footer class="container footer">
      <span>© ${new Date().getFullYear()} ${esc(k.footer)}</span>
      <ul class="footer-links">
        <li><a href="mailto:${esc(p.email)}">Email</a></li>
        <li><a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>
        ${github ? `<li><a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a></li>` : ''}
        <li><span class="mono-label">${esc(k.updated)}</span></li>
      </ul>
    </footer>
  </section>`;
}

export function renderPage(c) {
  return [
    nav(c),
    '<main>',
    hero(c),
    affiliations(c),
    about(c),
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
