const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Theme: light by default, dark via the header toggle. Without a saved choice, CSS follows
   prefers-color-scheme; a click saves an explicit choice. */
const toggle = document.querySelector('[data-theme-toggle]');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
const labelToggle = () => {
  if (!toggle) return;
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  toggle.setAttribute('aria-label', `Switch to ${next} theme`);
  toggle.title = `Switch to ${next} theme`;
};
toggle?.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {}
  labelToggle();
});
systemDark.addEventListener?.('change', labelToggle);
labelToggle();

/* Nav: solid background after scroll; the active link is the section whose top has passed
   40% of the viewport (or the last one at the bottom of the page) */
const nav = document.querySelector('.nav');
const links = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('main section[id], body > section[id]')];
let ticking = false;
function update() {
  ticking = false;
  nav.classList.toggle('scrolled', scrollY > 8);
  const line = innerHeight * 0.4;
  let current = null;
  for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = sections.at(-1)?.id;
  for (const a of links) {
    const on = a.getAttribute('href') === `#${current}`;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
}
addEventListener('scroll', () => ticking || ((ticking = true), requestAnimationFrame(update)), { passive: true });
addEventListener('resize', update);
update();

/* The featured-project chart is bundled only while that section is visible (see vite.config.js) */
if (__HAS_CHARTS__) {
  const chartObs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        chartObs.unobserve(e.target);
        import('./charts.js').then((m) => m.mount(e.target, { reduced }));
      }
    },
    { rootMargin: '200px 0px' }
  );
  document.querySelectorAll('canvas[data-chart]').forEach((c) => chartObs.observe(c));
}
