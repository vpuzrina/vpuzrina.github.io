const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Preview-only accent switcher (claret / teal), remembered per browser */
const accentButtons = [...document.querySelectorAll('[data-accent]:not(html)')];
const setAccent = (name) => {
  root.dataset.accent = name;
  accentButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.accent === name)));
};
accentButtons.forEach((b) =>
  b.addEventListener('click', () => {
    setAccent(b.dataset.accent);
    try {
      localStorage.setItem('preview-accent', b.dataset.accent);
    } catch {}
  })
);
setAccent(root.dataset.accent || 'claret');
document.querySelector('[data-hide-preview]')?.addEventListener('click', (e) => (e.currentTarget.closest('.preview-bar').hidden = true));

/* Active nav link: the section whose top has passed 40% of the viewport */
const links = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('main section[id]')];
let ticking = false;
function updateNav() {
  ticking = false;
  let current = null;
  for (const s of sections) if (s.getBoundingClientRect().top <= innerHeight * 0.4) current = s.id;
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = sections.at(-1)?.id;
  links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}
addEventListener('scroll', () => ticking || ((ticking = true), requestAnimationFrame(updateNav)), { passive: true });
updateNav();

/* Count-up: numbers inside "5,000+", "$3,000–4,000", "19 + 60+" rise once when first visible.
   The final text is in the HTML, so without JS (or with reduced motion) it is simply shown. */
const fmt = (n, withComma) => (withComma ? Math.round(n).toLocaleString('en-US') : String(Math.round(n)));
function countUp(el) {
  const text = el.textContent;
  const parts = text.split(/(\d[\d,]*)/);
  if (parts.length < 2) return;
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;
  const targets = parts.map((p, i) => (i % 2 ? { value: Number(p.replace(/,/g, '')), comma: p.includes(',') } : p));
  const start = performance.now();
  const dur = 1000;
  const frame = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const k = 1 - (1 - t) ** 3;
    el.textContent = targets.map((p) => (typeof p === 'string' ? p : fmt(p.value * k, p.comma))).join('');
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = text;
  };
  requestAnimationFrame(frame);
}
if (!reduced) {
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
  document.querySelectorAll('[data-count]').forEach((el) => obs.observe(el));
}

/* v2 hero: scanned table → clean grid → line chart, played once on load */
const fig = document.querySelector('[data-archive]');
if (fig) {
  const steps = [...fig.querySelectorAll('[data-step]')];
  const replay = fig.querySelector('[data-replay]');
  const mobile = matchMedia('(max-width: 760px)').matches;
  const markSteps = (n) => steps.forEach((s) => s.classList.toggle('on', Number(s.dataset.step) <= n));
  const timers = [];
  const showFinal = () => {
    fig.classList.remove('is-scan', 'is-chart');
    fig.classList.add('is-final');
    markSteps(3);
  };
  const play = () => {
    timers.splice(0).forEach(clearTimeout);
    fig.classList.remove('is-scan', 'is-chart', 'is-final');
    markSteps(0);
    void fig.getBoundingClientRect(); // restart transitions from the scanned state
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    at(350, () => (fig.classList.add('is-scan'), markSteps(1)));
    at(1500, () => markSteps(2));
    at(2700, () => (fig.classList.add('is-chart'), markSteps(3)));
    at(4400, () => {
      showFinal();
      if (replay) replay.hidden = false;
    });
  };
  if (reduced || mobile) showFinal();
  else {
    play();
    replay?.addEventListener('click', play);
  }
}
