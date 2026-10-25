// Chart.js setup for the featured project. Loaded only when a chart canvas exists on the page.
// Rule: a chart is drawn only from real data. Files marked "placeholder": true are never drawn.
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import { getData } from './data.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const C = { violet: '#7C6CFF', blue: '#4F8BFF', grid: 'rgba(255,255,255,0.05)', tick: '#7A7D94', text: '#ECEDF3' };

Chart.defaults.color = C.tick;
Chart.defaults.font.family = "'Inter Variable', system-ui, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.maintainAspectRatio = false;
Object.assign(Chart.defaults.plugins.tooltip, {
  backgroundColor: 'rgba(14,15,24,0.95)',
  borderColor: 'rgba(255,255,255,0.14)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 10,
  titleColor: C.text,
  bodyColor: '#C4C6D6',
});

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};
const areaFill = (ctx) => {
  const a = ctx.chart.chartArea;
  if (!a) return 'transparent';
  const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
  g.addColorStop(0, hexA(C.violet, 0.3));
  g.addColorStop(1, hexA(C.violet, 0));
  return g;
};

// Dashed vertical line at the event date (t = 0)
const eventLine = {
  id: 'eventLine',
  afterDatasetsDraw(chart, _args, opts) {
    if (opts.index == null) return;
    const x = chart.scales.x.getPixelForValue(opts.index);
    const { top, bottom } = chart.chartArea;
    const { ctx } = chart;
    ctx.save();
    ctx.strokeStyle = 'rgba(169,159,255,0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  },
};

const builders = {
  async event(canvas) {
    const d = await getData('cobre.json');
    if (d.placeholder) return null;
    const report = canvas.closest('.report');
    report.querySelector('[data-finding]').textContent = d.finding;
    report.querySelector('[data-finding-row]').hidden = false;
    report.querySelector('[data-headline-value]').textContent = d.headline.value;
    report.querySelector('[data-headline-label]').textContent = d.headline.label;
    report.querySelector('[data-xlabel]').textContent = d.xLabel;
    report.querySelector('[data-report-chart]').hidden = false;
    return {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: d.series.map((s, i) => ({
          label: s.name,
          data: s.values,
          borderColor: i === 0 ? C.violet : 'rgba(236,237,243,0.55)',
          backgroundColor: i === 0 ? areaFill : undefined,
          fill: i === 0 ? 'start' : false,
          borderWidth: i === 0 ? 2.5 : 1.5,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
        })),
      },
      options: {
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } },
          y: { grid: { color: C.grid }, border: { display: false }, title: { display: true, text: d.yLabel } },
        },
        plugins: { eventLine: { index: d.eventIndex } },
      },
      plugins: [eventLine],
    };
  },
};

export async function mount(canvas, { reduced }) {
  const build = builders[canvas.dataset.chart];
  if (!build) return;
  try {
    const cfg = await build(canvas);
    if (!cfg) return; // no real data yet: show no chart
    cfg.options.animation = reduced ? false : { duration: 900, easing: 'easeOutQuart' };
    cfg.options.plugins = { legend: { display: false }, ...cfg.options.plugins };
    new Chart(canvas, cfg);
  } catch (err) {
    console.error('Chart failed', canvas.dataset.chart, err);
  }
}
