// Interactive Figure 1 of the Cobre Panamá paper: cumulative log abnormal returns of First Quantum and
// Franco-Nevada around each core event, from Varvara's abnormal_returns_daily.csv (see
// scripts/cobre-figure-data.mjs). Server-rendered SVG first, then hydrated. No estimation happens here.
import { useMemo, useState } from 'preact/hooks';
import '../StackedBars/stacked-bars.css';
import './car-paths.css';

type Ev = { id: string; label: string; date: string };
type Firm = { ticker: string; name: string; ar: Record<string, (number | null)[]> };
type Props = { id: string; days: number[]; events: Ev[]; firms: Firm[]; from?: number; to?: number; initial?: string };

const MINUS = '−';
const pct = (v: number, d = 1) => (v > 0 ? '+' : v < 0 ? MINUS : '') + Math.abs(v * 100).toFixed(d) + '%';

export default function CarPaths({ id, days, events, firms, from = -5, to = 10, initial = 'E2' }: Props) {
  const [ev, setEv] = useState(initial);
  const [day, setDay] = useState(0);
  const shown = days.filter((d) => d >= from && d <= to);
  // CAR cumulated from the first shown day, as in the paper's figure
  const paths = useMemo(() => firms.map((f) => {
    let c = 0;
    return shown.map((d) => { const a = f.ar[ev][days.indexOf(d)]; c += a ?? 0; return { d, ar: a, car: c }; });
  }), [ev, firms]);
  const win = firms.map((f) => (f.ar[ev][days.indexOf(0)] ?? 0) + (f.ar[ev][days.indexOf(1)] ?? 0));

  const W = 640, H = 300, ml = 52, mr = 14, mt = 16, mb = 40;
  const all = paths.flat().map((p) => p.car);
  const lo = Math.min(0, ...all), hi = Math.max(0, ...all);
  const pad = Math.max(0.02, (hi - lo) * 0.08);
  const y0 = lo - pad, y1 = hi + pad;
  const x = (d: number) => ml + ((d - from) / (to - from)) * (W - ml - mr);
  const y = (v: number) => mt + (H - mt - mb) * (1 - (v - y0) / (y1 - y0));
  const step = (y1 - y0) > 0.4 ? 0.2 : (y1 - y0) > 0.15 ? 0.05 : 0.02;
  const yt: number[] = [];
  for (let t = Math.ceil(y0 / step) * step; t <= y1 + 1e-9; t += step) yt.push(Math.round(t / step) * step);
  const evInfo = events.find((e) => e.id === ev)!;
  const at = paths.map((p) => p.find((q) => q.d === day)!);

  return (
    <div class="cp">
      <div class="sb-controls" role="group" aria-label="Event">
        {events.map((e) => (
          <button type="button" class="sb-btn" aria-pressed={ev === e.id} onClick={() => setEv(e.id)}>{e.id}</button>
        ))}
      </div>
      <p class="cp-ev mono">{evInfo.id}: {evInfo.label} · day 0 = {evInfo.date}</p>
      <svg viewBox={`0 0 ${W} ${H}`} class="cp-svg" role="img" aria-labelledby={`${id}-desc`}>
        <desc id={`${id}-desc`}>
          {`Cumulative log abnormal returns from day ${from} to day +${to} around ${evInfo.id}. ` +
            firms.map((f, k) => `${f.name} ends at ${pct(paths[k][paths[k].length - 1].car)}`).join('; ') + '.'}
        </desc>
        {yt.map((t) => (
          <g>
            <line class={Math.abs(t) < 1e-9 ? 'zero' : 'grid'} x1={ml} x2={W - mr} y1={y(t)} y2={y(t)} />
            <text class="tick" x={ml - 8} y={y(t) + 4} text-anchor="end">{pct(t, 0)}</text>
          </g>
        ))}
        <line class="day0" x1={x(0)} x2={x(0)} y1={mt} y2={H - mb} />
        <line class="cursor" x1={x(day)} x2={x(day)} y1={mt} y2={H - mb} />
        {paths.map((p, k) => (
          <g class={`firm f${k}`}>
            <path d={p.map((q, i) => `${i ? 'L' : 'M'}${x(q.d).toFixed(1)},${y(q.car).toFixed(1)}`).join('')} />
            {p.map((q) => <circle cx={x(q.d)} cy={y(q.car)} r={q.d === day ? 4 : 2.2} />)}
          </g>
        ))}
        {[from, 0, 5, to].map((d) => <text class="tick" x={x(d)} y={H - mb + 18} text-anchor="middle">{d > 0 ? `+${d}` : d < 0 ? `${MINUS}${-d}` : '0'}</text>)}
        <text class="axis" x={W - mr} y={H - 6} text-anchor="end">trading days relative to the event (day 0)</text>
        <text class="axis" x={ml} y={10}>cumulative abnormal return, % (log)</text>
      </svg>
      <label class="cp-slider mono">
        <span>day {day > 0 ? `+${day}` : day < 0 ? `${MINUS}${-day}` : '0'}</span>
        <input type="range" min={from} max={to} step={1} value={day} onInput={(e) => setDay(Number((e.currentTarget as HTMLInputElement).value))} aria-label="Day relative to the event" />
      </label>
      <table class="cp-table">
        <caption class="visually-hidden">Abnormal returns on the selected day and CAR over the main window</caption>
        <thead><tr><th scope="col"><span class="visually-hidden">Measure</span></th>{firms.map((f, k) => <th scope="col"><span class={`key f${k}`} aria-hidden="true"></span>{f.name}</th>)}</tr></thead>
        <tbody>
          <tr><th scope="row">AR on day {day > 0 ? `+${day}` : day < 0 ? `${MINUS}${-day}` : '0'} (log)</th>{at.map((a) => <td><output aria-live="polite">{a.ar == null ? 'n/a' : pct(a.ar)}</output></td>)}</tr>
          <tr><th scope="row">CAR from day {from < 0 ? `${MINUS}${-from}` : from} (log)</th>{at.map((a) => <td><output aria-live="polite">{pct(a.car)}</output></td>)}</tr>
          <tr class="win"><th scope="row">CAR [0, +1], log / simple</th>{win.map((c) => <td>{pct(c)} / {pct(Math.exp(c) - 1)}</td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}
