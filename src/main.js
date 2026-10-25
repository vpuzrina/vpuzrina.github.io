const root = document.documentElement;
root.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Nav: glass background after scroll, active link per section */
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 12);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const links = [...document.querySelectorAll('.nav-links a')];
const sectionObs = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
    }
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
links.forEach((a) => {
  const s = document.querySelector(a.getAttribute('href'));
  if (s) sectionObs.observe(s);
});

/* Scroll reveal, staggered among siblings */
const revealObs = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 70}ms`;
      el.classList.add('in');
      revealObs.unobserve(el);
    }
  },
  { rootMargin: '0px 0px -8% 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => (reduced ? el.classList.add('in') : revealObs.observe(el)));

/* Hero dashboard tilt (mouse only, off for reduced motion) */
const tiltWrap = document.querySelector('[data-tilt]');
if (tiltWrap && !reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dash = tiltWrap.querySelector('.dash');
  let frame = 0;
  addEventListener(
    'mousemove',
    (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        dash.style.setProperty('--ry', `${(x * 5).toFixed(2)}deg`);
        dash.style.setProperty('--rx', `${(-y * 4).toFixed(2)}deg`);
      });
    },
    { passive: true }
  );
}

/* Charts and map load only when they come near the viewport */
let chartsMod;
const loadCharts = () => (chartsMod ||= __HAS_CHARTS__ ? import('./charts.js') : Promise.resolve(null));
const chartObs = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      chartObs.unobserve(e.target);
      loadCharts().then((m) => m?.mount(e.target, { reduced }));
    }
  },
  { rootMargin: '200px 0px' }
);
if (__HAS_CHARTS__) document.querySelectorAll('canvas[data-chart]').forEach((c) => chartObs.observe(c));
