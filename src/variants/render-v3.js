// Design preview /v3/: v1's editorial type and section numbers, dark by default, compact card layout.
import { esc, has, keep, joinPeople, withResult, icon, renderHead } from '../render.js';

const bullets = (items) => {
  const list = keep(items);
  return list.length ? `<ul class="bullets">${list.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
};
const cvHref = (c) => `/${c.person.cv}`;
const cvLink = (c, cls, label) =>
  `<a class="${cls}" href="${esc(cvHref(c))}" download="${esc(c.person.cvDownloadName)}">${icon.download}<span>${esc(label)}</span></a>`;
const meta = (parts) => {
  const list = parts.filter(Boolean);
  return list.length ? `<p class="meta">${list.join('<span class="sep" aria-hidden="true"> · </span>')}</p>` : '';
};
const title = (role, org) => `<h3 class="entry-title">${esc(role)}<span class="sep" aria-hidden="true"> · </span>${esc(org)}</h3>`;
const pad = (n) => String(n).padStart(2, '0');

// Framed label "02 · Research" above the heading. When the section title is just its name,
// the label itself is the heading, so nothing is repeated.
function section(id, n, name, heading, body, extra = '') {
  const label = `<span class="label-frame"><span class="num">${pad(n)}</span><span class="dot" aria-hidden="true">·</span>${esc(name)}</span>`;
  const head = has(heading)
    ? `<p class="sec-label">${label}</p><h2 class="h2">${esc(heading)}</h2>`
    : `<h2 class="sec-label">${label}</h2>`;
  return `
  <section class="sec${extra}" id="${id}" data-sec>
    <div class="wrap">
      <header class="sec-head">${head}<span class="head-line" aria-hidden="true"></span></header>
      ${body}
    </div>
  </section>`;
}

function nav(c, links) {
  return `
  <div class="progress" aria-hidden="true"><span data-progress></span></div>
  <nav class="nav" aria-label="Main">
    <div class="wrap nav-inner">
      <a class="brand" href="#top">${esc(c.person.name)}</a>
      <ul class="nav-links">${links.map((l) => `<li><a class="u" href="#${l.id}">${esc(l.label)}</a></li>`).join('')}</ul>
      <div class="nav-tools">
        <button class="icon-link" type="button" data-theme-toggle aria-label="Switch to light theme">${icon.sun}${icon.moon}</button>
        <a class="icon-link" href="${esc(c.person.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon.linkedin}</a>
        ${has(c.person.github) ? `<a class="icon-link" href="${esc(c.person.github)}" target="_blank" rel="noopener" aria-label="GitHub">${icon.github}</a>` : ''}
        <a class="btn btn-outline btn-sm nav-cv" href="${esc(cvHref(c))}" download="${esc(c.person.cvDownloadName)}" aria-label="Download CV">${icon.download}<span>Download CV</span></a>
      </div>
    </div>
  </nav>`;
}

function hero(c) {
  const h = c.hero;
  const lines = h.headlineOptions[h.headline] || h.headlineOptions[0];
  const affil = keep(c.affiliations.items);
  return `
  <header class="hero" id="top">
    <div class="glow glow-hero" aria-hidden="true"></div>
    <div class="wrap">
      <h1 class="h1">${lines.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h1>
      <p class="hero-sub">${esc(h.subline)}</p>
      ${has(h.availability) ? `<p class="availability">${esc(h.availability)}</p>` : ''}
      <div class="ctas">
        ${cvLink(c, 'btn btn-primary', h.primaryCta)}
        <a class="btn btn-outline" href="#research"><span>${esc(h.secondaryCta)}</span>${icon.arrow}</a>
      </div>
      <ul class="kpis">
        ${h.kpis
          .filter((k) => has(k.value))
          .map(
            (k) => `<li class="card kpi" data-count-wrap><span class="kpi-value" data-count>${esc(k.value)}</span><span class="kpi-label">${esc(
              k.label
            )}</span><span class="kpi-note">${esc(k.note)}</span></li>`
          )
          .join('')}
      </ul>
      ${
        affil.length
          ? `<p class="affil"><span class="affil-label">${esc(c.affiliations.label)}</span> ${affil
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
  const img = photo && has(a.photo) ? `<img class="photo" src="/${esc(a.photo)}" alt="${esc(a.photoAlt)}" width="104" height="104">` : '';
  return `
    <div class="about${img ? ' has-photo' : ''}">
      ${img}
      <div class="about-copy">
        ${keep(a.paragraphs).map((p) => `<p>${esc(p)}</p>`).join('')}
        <p class="degree">${esc(degree)}</p>
      </div>
    </div>`;
}

const entryCard = (head, list) => `
  <article class="card entry">
    <div class="entry-head">${head}</div>
    <div class="entry-body">${list}</div>
  </article>`;

function researchBody(c) {
  return `<div class="stack">${c.research.roles
    .map((r) =>
      entryCard(
        `${has(r.relevant) ? `<p class="relevant">${esc(c.research.relevantLabel)}: ${esc(r.relevant)}</p>` : ''}
         ${title(r.role, r.orgShort || r.org)}
         <p class="project">${esc(r.project)}</p>
         ${meta([has(r.dates) ? `<span class="date">${esc(r.dates)}</span>` : '', r.supervisors?.length ? `with ${joinPeople(r.supervisors)}` : '', has(r.funding) ? esc(r.funding) : ''])}`,
        bullets(r.bullets)
      )
    )
    .join('')}</div>`;
}

function caseBody(c) {
  const k = c.caseStudy;
  const findings = keep(k.findings);
  return `
    <article class="card case">
      <p class="byline">${esc(k.role)}<span class="sep" aria-hidden="true"> · </span>${esc(k.org)}${
        has(k.dates) ? `<span class="sep" aria-hidden="true"> · </span><span class="date">${esc(k.dates)}</span>` : ''
      }<span class="sep" aria-hidden="true"> · </span><span class="report-title">“${esc(k.reportTitle)}”</span></p>
      <blockquote class="pullquote"><p>${esc(k.question)}</p></blockquote>
      <h3 class="sub">${esc(k.approachLabel)}</h3>
      <ul class="figures">
        ${k.approach
          .map((a) => `<li data-count-wrap><span class="figure-num" data-count>${esc(a.value)}</span><span class="figure-label">${esc(a.label)}</span></li>`)
          .join('')}
      </ul>
      ${findings.length ? `<h3 class="sub">${esc(k.findingsLabel)}</h3><ol class="findings">${findings.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>` : ''}
      <div class="case-foot">
        ${has(k.approachNote) ? `<p class="note">${esc(k.approachNote)}</p>` : '<span></span>'}
        <div><h3 class="sub">${esc(k.outcomeLabel)}</h3><p class="outcome">${esc(k.outcome)}</p></div>
      </div>
    </article>`;
}

function experienceBody(c) {
  return `<div class="stack">${c.experience.items
    .map((x) =>
      entryCard(`${title(x.role, x.org)}${meta([has(x.dates) ? `<span class="date">${esc(x.dates)}</span>` : '', has(x.place) ? esc(x.place) : ''])}`, bullets(withResult(x)))
    )
    .join('')}</div>`;
}

const skillsBody = (c) => `
  <dl class="card skills">
    ${c.skills.groups.map((g) => `<div><dt>${esc(g.name)}</dt><dd>${keep(g.items).map(esc).join(', ')}</dd></div>`).join('')}
  </dl>`;

function contactBody(c) {
  const k = c.contact;
  const p = c.person;
  return `
    <p class="lead">${esc(k.text)}</p>
    <p><a class="email u" href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>
    <div class="ctas">
      <a class="btn btn-primary" href="mailto:${esc(p.email)}">${icon.mail}<span>${esc(k.emailCta)}</span></a>
      <a class="btn btn-outline" href="${esc(p.linkedin)}" target="_blank" rel="noopener"><span>${esc(k.linkedinCta)}</span>${icon.ext}</a>
      ${has(p.github) ? `<a class="btn btn-outline" href="${esc(p.github)}" target="_blank" rel="noopener"><span>${esc(k.githubCta)}</span>${icon.ext}</a>` : ''}
      ${cvLink(c, 'btn btn-outline', k.cvCta)}
    </div>`;
}

export function renderV3(c, { photo = false } = {}) {
  const caseHeading = c.caseStudy.title.replace(/^Case study:\s*/i, '');
  // Same section order as the homepage; hidden sections stay hidden
  const parts = [
    ['about', 'About', c.about.title, aboutBody(c, photo)],
    ['research', 'Research', '', researchBody(c)],
    ['case', 'Case study', caseHeading.charAt(0).toUpperCase() + caseHeading.slice(1), caseBody(c)],
    ['experience', 'Experience', '', experienceBody(c)],
    ['skills', 'Skills', '', skillsBody(c)],
  ];
  const visible = (n) => !n.section || c[n.section]?.visible !== false;
  const links = c.nav.filter(visible).map((n) => ({ id: n.href.slice(1), label: n.label }));
  const p = c.person;
  return [
    nav(c, links),
    '<main>',
    hero(c),
    parts.map(([id, name, heading, body], i) => section(id, i + 1, name, heading, body, ` sec-${id}`)).join('\n'),
    section('contact', parts.length + 1, 'Contact', c.contact.title, contactBody(c), ' sec-contact').replace(
      '<div class="wrap">',
      '<div class="glow glow-contact" aria-hidden="true"></div><div class="wrap">'
    ),
    '</main>',
    `<footer class="wrap footer"><span>© ${new Date().getFullYear()} ${esc(c.contact.footer)}</span><span><a class="u" href="mailto:${esc(
      p.email
    )}">Email</a> · <a class="u" href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>${
      has(p.github) ? ` · <a class="u" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a>` : ''
    } · ${esc(c.contact.updated)}</span></footer>`,
    `<div class="preview-bar" role="group" aria-label="Design preview controls">
      <span>Preview V3 · accent</span>
      ${['claret', 'teal', 'violet']
        .map((a) => `<button type="button" data-accent="${a}" aria-pressed="${a === 'claret'}"><i class="sw sw-${a}"></i>${a[0].toUpperCase() + a.slice(1)}</button>`)
        .join('')}
      <button type="button" class="hide" data-hide-preview aria-label="Hide preview controls">Hide</button>
    </div>`,
  ].join('\n');
}

// Same title, description, Open Graph and Twitter tags as the homepage; noindex because it is a preview
export const renderV3Head = (c) => `${renderHead(c)}\n    <meta name="robots" content="noindex, nofollow">`;
