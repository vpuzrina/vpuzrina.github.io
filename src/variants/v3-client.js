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
toggle?.addEventListener('click', () => {
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
const links = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('[data-sec]')];
let ticking = false;
function update() {
  ticking = false;
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
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
