const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

/* Theme: dark for everyone by default; the toggle switches and remembers */
const toggle = document.querySelector('[data-theme-toggle]');
const labelToggle = () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  toggle?.setAttribute('aria-label', `Switch to ${next} theme`);
  if (toggle) toggle.title = `Switch to ${next} theme`;
};
let themeTimer;
toggle?.addEventListener('click', () => {
  // 200ms colour cross-fade, only while switching
  if (!reduced) {
    root.classList.add('theme-anim');
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => root.classList.remove('theme-anim'), 260);
  }
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  store('v3-theme', root.dataset.theme);
  labelToggle();
});
labelToggle();

/* Preview-only accent switcher */
const accentButtons = [...document.querySelectorAll('.preview-bar [data-accent]')];
const setAccent = (a) => {
  root.dataset.accent = a;
  accentButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.accent === a)));
};
accentButtons.forEach((b) => b.addEventListener('click', () => (setAccent(b.dataset.accent), store('v3-accent', b.dataset.accent))));
setAccent(root.dataset.accent || 'claret');
document.querySelector('[data-hide-preview]')?.addEventListener('click', (e) => (e.currentTarget.closest('.preview-bar').hidden = true));

/* Scroll: progress line, active nav link, and section labels that light up and stay lit.
   Text is never hidden; only the label frame, its glow and the heading line animate. */
const bar = document.querySelector('[data-progress]');
const toTop = document.querySelector('[data-to-top]');
toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
const links = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('[data-sec]')];
let ticking = false;
function update() {
  ticking = false;
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  toTop?.classList.toggle('show', max > 0 && scrollY / max > 0.5);
  let current = null;
  for (const s of sections) {
    const top = s.getBoundingClientRect().top;
    if (top <= innerHeight * 0.82) s.classList.add('lit'); // passed or in view: lit for good
    if (top <= innerHeight * 0.4) current = s.id;
  }
  if (innerHeight + scrollY >= doc.scrollHeight - 2) current = sections.at(-1)?.id;
  links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}
if (reduced) sections.forEach((s) => s.classList.add('lit'));
addEventListener('scroll', () => ticking || ((ticking = true), requestAnimationFrame(update)), { passive: true });
addEventListener('resize', update);
update();

/* Count-up for KPIs and the case-study figures, once, when first visible. The final text is
   already in the HTML; with reduced motion it simply stays as is. */
const fmt = (n, comma) => (comma ? Math.round(n).toLocaleString('en-US') : String(Math.round(n)));
function countUp(el) {
  const wrap = el.closest('[data-count-wrap]');
  wrap?.classList.add('counted');
  const text = el.textContent;
  const parts = text.split(/(\d[\d,]*)/);
  if (parts.length < 2) return;
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;
  const targets = parts.map((p, i) => (i % 2 ? { v: Number(p.replace(/,/g, '')), c: p.includes(',') } : p));
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min(1, (now - start) / 1000);
    const k = 1 - (1 - t) ** 3;
    el.textContent = targets.map((p) => (typeof p === 'string' ? p : fmt(p.v * k, p.c))).join('');
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = text;
  };
  requestAnimationFrame(frame);
}
const counters = document.querySelectorAll('[data-count]');
if (reduced) counters.forEach((el) => el.closest('[data-count-wrap]')?.classList.add('counted'));
else {
  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        obs.unobserve(e.target);
        countUp(e.target);
      }
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => obs.observe(el));
}

/* KPI source footnotes: hover or focus on desktop, tap to open on touch */
const notes = [...document.querySelectorAll('.fn')];
const closeNotes = (except) => notes.forEach((n) => n !== except && n.classList.remove('open'));
notes.forEach((n) =>
  n.querySelector('.fn-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeNotes(n);
    n.classList.toggle('open');
  })
);
document.addEventListener('click', () => closeNotes());

/* Skill filter: highlight the cards whose text uses the skill, dim the rest, jump to the first */
const skillButtons = [...document.querySelectorAll('.skill')];
const cards = [...document.querySelectorAll('[data-card]')];
const status = document.querySelector('[data-filter-status]');
const chip = document.querySelector('[data-filter-chip]');
const chipLabel = document.querySelector('[data-filter-chip-label]');
const statusDefault = status?.textContent || '';
let activeSkill = null;
function clearFilter() {
  activeSkill = null;
  document.body.classList.remove('filtering');
  cards.forEach((c) => c.classList.remove('match'));
  skillButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  if (status) status.textContent = statusDefault;
  if (chip) chip.hidden = true;
}
function applyFilter(btn) {
  const skill = btn.dataset.skill;
  if (activeSkill === skill) return clearFilter();
  clearFilter();
  const name = btn.textContent;
  const hits = cards.filter((c) => c.dataset.skills.split(' ').includes(skill));
  activeSkill = skill;
  btn.setAttribute('aria-pressed', 'true');
  if (!hits.length) {
    status.textContent = `No card on this page shows ${name}; it is listed on the CV.`;
    return;
  }
  document.body.classList.add('filtering');
  hits.forEach((c) => c.classList.add('match'));
  status.textContent = `${hits.length} ${hits.length === 1 ? 'card uses' : 'cards use'} ${name}. Press Esc or click it again to clear.`;
  if (chip) {
    chipLabel.textContent = `Showing work that uses ${name}`;
    chip.hidden = false;
  }
  hits[0].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
}
skillButtons.forEach((b) => b.addEventListener('click', () => applyFilter(b)));
document.querySelector('[data-filter-clear]')?.addEventListener('click', clearFilter);
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeNotes();
  if (activeSkill) clearFilter();
});

/* Spotlight along card borders, pointer devices only, off with reduced motion */
if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let target = null;
  let pos = null;
  let queued = false;
  addEventListener(
    'pointermove',
    (e) => {
      target = e.target.closest?.('.card');
      if (!target) return;
      pos = [e.clientX, e.clientY];
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (!target) return;
        const r = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${pos[0] - r.left}px`);
        target.style.setProperty('--my', `${pos[1] - r.top}px`);
      });
    },
    { passive: true }
  );
}

/* Case-study flow: connector lines draw in when the strip is visible (numbers use the count-up above) */
const flow = document.querySelector('[data-flow]');
if (flow) {
  if (reduced) flow.classList.add('drawn');
  else
    new IntersectionObserver(
      (entries, o) => entries.forEach((e) => e.isIntersecting && (flow.classList.add('drawn'), o.disconnect())),
      { threshold: 0.5 }
    ).observe(flow);
}

/* Copy email on click; the "Email me" button still opens the mail app */
const email = document.querySelector('[data-copy]');
const copied = document.querySelector('[data-copied]');
let copyTimer;
email?.addEventListener('click', async (e) => {
  if (!navigator.clipboard) return; // fall back to the mailto link
  e.preventDefault();
  try {
    await navigator.clipboard.writeText(email.dataset.copy);
    copied.textContent = 'Copied';
  } catch {
    location.href = email.href;
    return;
  }
  copied.classList.add('show');
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => copied.classList.remove('show'), 1500);
});

/* Footer clock: Boston local time, refreshed on each minute */
const clock = document.querySelector('[data-clock]');
if (clock) {
  const fmtTime = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
  const t = clock.querySelector('time');
  const tick = () => {
    const now = new Date();
    t.textContent = fmtTime.format(now);
    t.dateTime = now.toISOString();
    setTimeout(tick, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50);
  };
  tick();
  clock.hidden = false;
}
