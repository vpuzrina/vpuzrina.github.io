// Quarterly event-study coefficients with 95% intervals. Server-rendered SVG first, then hydrated.
// Values come straight from the paper's replication output (event_study.csv); nothing is estimated here.
import { useRef, useState } from 'preact/hooks';
import './coef-plot.css';

type Quarter = { q: string; coef: number | null; se: number | null; china: number; other: number };
type Marker = { date: string; q: string };
type Props = {
  id: string;
  base: string;
  quarters: Quarter[];
  proposed: Marker;
  effective: Marker;
  initial?: string;
  partial?: Record<string, string>; // quarter -> note, e.g. data end mid-quarter
};
type Scale = 'log' | 'pct';

const Z = 1.96;
const YMIN = -3.5, YMAX = 2;

export default function CoefPlot({ id, base, quarters, proposed, effective, initial, partial = {} }: Props) {
  const startIdx = Math.max(0, quarters.findIndex((d) => d.q === initial));
  const [sel, setSel] = useState(startIdx);
  const [scale, setScale] = useState<Scale>('log');
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 720, H = 330, ml = 58, mr = 40, mt = 30, mb = 44;
  const n = quarters.length;
  const band = (W - ml - mr) / n;
  const x = (i: number) => ml + band * (i + 0.5);
  const y = (v: number) => mt + (H - mt - mb) * (YMAX - Math.max(YMIN, Math.min(YMAX, v))) / (YMAX - YMIN);
  const iProp = quarters.findIndex((d) => d.q === proposed.q);
  const iEff = quarters.findIndex((d) => d.q === effective.q);
  const xLine = (i: number) => ml + band * i;

  const pctOf = (v: number) => Math.exp(v) - 1;
  const fmtPct = (v: number) => {
    const p = pctOf(v) * 100;
    const r = Math.abs(p) >= 10 ? p.toFixed(0) : p.toFixed(1);
    return (p > 0 ? '+' : p < 0 ? '−' : '') + r.replace('-', '') + '%';
  };
  const fmtLog = (v: number) => (v < 0 ? '−' : v > 0 ? '+' : '') + Math.abs(v).toFixed(2);
  const fmt = (v: number) => (scale === 'log' ? fmtLog(v) : fmtPct(v));
  const tickLabel = (t: number) => (scale === 'log' ? (t === 0 ? '0' : fmtLog(t).replace('.00', '')) : t === 0 ? '0' : fmtPct(t));

  const ticks = [-3, -2, -1, 0, 1, 2];
  const d = quarters[sel];
  const lo = d.coef !== null && d.se !== null ? d.coef - Z * d.se : null;
  const hi = d.coef !== null && d.se !== null ? d.coef + Z * d.se : null;

  const pick = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const m = svg.getScreenCTM();
    if (!m) return;
    const px = (clientX - m.e) / m.a;
    const i = Math.floor((px - ml) / band);
    if (i >= 0 && i < n) setSel(i);
  };
  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step) { e.preventDefault(); setSel((s) => Math.max(0, Math.min(n - 1, s + step))); }
    else if (e.key === 'Home') { e.preventDefault(); setSel(0); }
    else if (e.key === 'End') { e.preventDefault(); setSel(n - 1); }
  };

  const years = quarters.map((q, i) => ({ i, yr: q.q.slice(0, 4), first: q.q.endsWith('Q1') })).filter((t) => t.first);
  // fixed format, so the server-rendered text and the hydrated text always match
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateText = (s: string) => { const [yy, mm, dd] = s.split('-').map(Number); return `${dd} ${MON[mm - 1]} ${yy}`; };

  return (
    <div class="cp">
      <fieldset class="cp-scale">
        <legend class="mono">Units</legend>
        {(['log', 'pct'] as Scale[]).map((s) => (
          <label class={scale === s ? 'on' : ''}>
            <input type="radio" name={`${id}-scale`} value={s} checked={scale === s} onChange={() => setScale(s)} />
            {s === 'log' ? 'log ratio' : '% change in China IPOs'}
          </label>
        ))}
      </fieldset>
      <div class="cp-grid">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          class="cp-svg"
          role="slider"
          tabIndex={0}
          aria-label="Quarter"
          aria-valuemin={0}
          aria-valuemax={n - 1}
          aria-valuenow={sel}
          aria-valuetext={d.q}
          aria-describedby={`${id}-desc`}
          onPointerMove={(e) => e.pointerType === 'mouse' && pick(e.clientX)}
          onPointerDown={(e) => pick(e.clientX)}
          onKeyDown={onKey}
        >
          <desc id={`${id}-desc`}>
            Estimates by quarter relative to {base}, with 95% intervals. Use the arrow keys to move between quarters; the values appear beside the chart.
          </desc>
          <rect class="cp-after" x={xLine(iProp)} y={mt} width={W - mr - xLine(iProp)} height={H - mt - mb} />
          {ticks.map((t) => (
            <g>
              <line class={t === 0 ? 'zero' : 'grid'} x1={ml} x2={W - mr} y1={y(t)} y2={y(t)} />
              <text class="tick" x={ml - 8} y={y(t) + 4} text-anchor="end">{tickLabel(t)}</text>
            </g>
          ))}
          {[{ i: iProp, lab: 'proposed', left: true }, { i: iEff, lab: 'effective', left: false }].map((m) => (
            <g>
              <line class="mark" x1={xLine(m.i)} x2={xLine(m.i)} y1={mt - 14} y2={H - mb} />
              <text class="mark-label" x={xLine(m.i) + (m.left ? -5 : 5)} y={mt - 4} text-anchor={m.left ? 'end' : 'start'}>{m.lab}</text>
            </g>
          ))}
          <rect class="cp-hover" x={ml + band * sel} y={mt} width={band} height={H - mt - mb} />
          {quarters.map((q, i) => {
            const cls = `pt${i === sel ? ' sel' : ''}${q.q === base ? ' base' : ''}`;
            if (q.coef === null || q.se === null) {
              const ty = y(YMIN) - 2;
              return <path class={`${cls} empty`} d={`M${x(i) - 6},${ty - 9} L${x(i) + 6},${ty - 9} L${x(i)},${ty} Z`} />;
            }
            const l = q.coef - Z * q.se, h = q.coef + Z * q.se;
            const clipped = l < YMIN;
            return (
              <g class={cls}>
                {q.se > 0 && <line class="ci" x1={x(i)} x2={x(i)} y1={y(h)} y2={y(l)} />}
                {q.se > 0 && <line class="cap" x1={x(i) - 4} x2={x(i) + 4} y1={y(h)} y2={y(h)} />}
                {q.se > 0 && !clipped && <line class="cap" x1={x(i) - 4} x2={x(i) + 4} y1={y(l)} y2={y(l)} />}
                {clipped && <path class="arrow" d={`M${x(i) - 4},${y(YMIN) - 7} L${x(i)},${y(YMIN)} L${x(i) + 4},${y(YMIN) - 7}`} />}
                <circle class="dot" cx={x(i)} cy={y(q.coef)} r={q.q === base ? 4 : 5} />
              </g>
            );
          })}
          {years.map((t) => (
            <g>
              <line class="axis" x1={xLine(t.i)} x2={xLine(t.i)} y1={H - mb} y2={H - mb + 6} />
              <text class="tick year" x={xLine(t.i) + band * 2} y={H - mb + 22} text-anchor="middle">{t.yr}</text>
            </g>
          ))}
          <line class="axis" x1={ml} x2={W - mr} y1={H - mb} y2={H - mb} />
        </svg>

        <div class="cp-side">
        <dl class="cp-read" aria-live="polite">
          <div class="cp-q"><dt class="visually-hidden">Quarter</dt><dd>{d.q}{partial[d.q] ? <span class="muted"> · {partial[d.q]}</span> : null}</dd></div>
          {d.q === base ? (
            <div><dt>Estimate</dt><dd>0 <span class="muted">(base quarter)</span></dd></div>
          ) : d.coef === null ? (
            <div><dt>Estimate</dt><dd class="muted">none: no China/HK IPOs this quarter</dd></div>
          ) : (
            <>
              <div><dt>Estimate</dt><dd>{fmt(d.coef)}</dd></div>
              <div><dt>95% interval</dt><dd>{fmt(lo!)} to {fmt(hi!)}</dd></div>
              <div><dt>Std. error</dt><dd>{d.se!.toFixed(2)}</dd></div>
            </>
          )}
          <div><dt>China/HK IPOs</dt><dd>{d.china}</dd></div>
          <div><dt>Other foreign IPOs</dt><dd>{d.other}</dd></div>

        </dl>
        <p class="cp-note muted">
            Proposed {dateText(proposed.date)}, effective {dateText(effective.date)}. {scale === 'pct' ? 'The % is e^estimate − 1, against ' + base + '.' : 'Log ratio against ' + base + '.'}
          </p>
        </div>
      </div>

      <details class="cp-table">
        <summary class="mono">Show as a table</summary>
        <table>
          <thead><tr><th scope="col">Quarter</th><th scope="col">Estimate</th><th scope="col">95% interval</th><th scope="col">China/HK IPOs</th><th scope="col">Other IPOs</th></tr></thead>
          <tbody>
            {quarters.map((q) => (
              <tr>
                <th scope="row">{q.q}</th>
                <td>{q.q === base ? '0 (base)' : q.coef === null ? '—' : fmt(q.coef)}</td>
                <td>{q.coef === null || q.se === null || q.se === 0 ? '—' : `${fmt(q.coef - Z * q.se)} to ${fmt(q.coef + Z * q.se)}`}</td>
                <td>{q.china}</td>
                <td>{q.other}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
