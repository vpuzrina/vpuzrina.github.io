// Stacked bars by period with series toggles. Server-rendered SVG first, then hydrated.
// Values come straight from a JSON file (here, Table 4 of the Nasdaq paper); nothing is estimated here.
import { useState } from 'preact/hooks';
import './stacked-bars.css';

type Series = { key: string; label: string; values: number[] };
type Props = { id: string; periods: string[]; series: Series[]; unit: string; digits?: number };

export default function StackedBars({ id, periods, series, unit, digits = 2 }: Props) {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(series.map((s) => [s.key, true])));
  const active = series.filter((s) => on[s.key]);
  const totals = periods.map((_, i) => active.reduce((a, s) => a + s.values[i], 0));
  const max = Math.max(1.4, ...periods.map((_, i) => series.reduce((a, s) => a + s.values[i], 0)));
  const W = 640, H = 340, ml = 48, mr = 12, mt = 40, mb = 56;
  const y = (v: number) => mt + (H - mt - mb) * (1 - v / max);
  const band = (W - ml - mr) / periods.length;
  const bw = Math.min(120, band * 0.5);
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4].filter((t) => t <= max + 1e-9);
  const fmt = (v: number) => v.toFixed(digits);
  const toggle = (k: string) => setOn((p) => (Object.values(p).filter(Boolean).length === 1 && p[k] ? p : { ...p, [k]: !p[k] }));

  return (
    <div class="sb">
      <div class="sb-controls" role="group" aria-label="Show issuer groups">
        {series.map((s, k) => (
          <button type="button" class={`sb-btn s${k}`} aria-pressed={on[s.key]} onClick={() => toggle(s.key)}>
            <span class="sw" aria-hidden="true"></span>{s.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} class="sb-svg" role="img" aria-labelledby={`${id}-desc`}>
        <desc id={`${id}-desc`}>
          {`Stacked bars of ${unit} by period. ` + periods.map((p, i) => `${p}: ` + series.map((s) => `${s.label} ${fmt(s.values[i])}`).join(', ')).join('; ') + '.'}
        </desc>
        {ticks.map((t) => (
          <g>
            <line class={t === 0 ? 'axis' : 'grid'} x1={ml} x2={W - mr} y1={y(t)} y2={y(t)} />
            <text class="tick" x={ml - 8} y={y(t) + 4} text-anchor="end">{t.toFixed(1)}</text>
          </g>
        ))}
        <text class="unit" x={ml - 40} y={14}>{unit}</text>
        {periods.map((p, i) => {
          const cx = ml + band * i + band / 2;
          let base = 0;
          return (
            <g>
              {series.map((s, k) => {
                if (!on[s.key] || s.values[i] === 0) return null;
                const y0 = y(base), y1 = y(base + s.values[i]);
                base += s.values[i];
                const h = y0 - y1;
                return (
                  <g>
                    <rect class={`seg s${k}`} x={cx - bw / 2} y={y1} width={bw} height={h} />
                    {h > 16 && <text class={`val s${k}`} x={cx} y={y1 + h / 2 + 4} text-anchor="middle">{fmt(s.values[i])}</text>}
                  </g>
                );
              })}
              <text class="total" x={cx} y={y(totals[i]) - 6} text-anchor="middle">{active.length > 1 ? fmt(totals[i]) : ''}</text>
              <text class="tick period" x={cx} y={H - mb + 20} text-anchor="middle">
                {split(p).map((line, j) => <tspan x={cx} dy={j === 0 ? 0 : '1.2em'}>{line}</tspan>)}
              </text>
            </g>
          );
        })}
      </svg>
      <details class="sb-table">
        <summary class="mono">Show as a table</summary>
        <table>
          <thead><tr><th scope="col">Period</th>{series.map((s) => <th scope="col">{s.label}</th>)}</tr></thead>
          <tbody>{periods.map((p, i) => <tr><th scope="row">{p}</th>{series.map((s) => <td>{fmt(s.values[i])}</td>)}</tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}

// Two lines per period label, broken at the space nearest the middle, so labels never run together
function split(label: string): string[] {
  const words = label.split(' ');
  if (words.length < 2) return [label];
  let best = 1, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < diff) { diff = d; best = i; }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}
