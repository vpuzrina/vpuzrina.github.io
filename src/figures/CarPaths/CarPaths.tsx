// Cobre Fig. 1: CAR paths of First Quantum and Franco-Nevada around three events, from the daily
// abnormal returns written by 02_event_study.R. Server-rendered SVG first, then hydrated. Nothing is
// estimated here: the CAR is the running sum of the stored daily abnormal (log) returns.
import { useRef, useState } from 'preact/hooks';
import './car-paths.css';

type Firm = { ticker: string; name: string; ar: number[] };
type Ev = { id: string; label: string; date: string; dates: string[]; firms: Firm[] };
type Win = { id: string; label: string; from: number; to: number };
type Props = { id: string; days: number[]; events: Ev[]; windows: Win[]; initialEvent?: string };

const pct = (v: number, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v * 100).toFixed(d) + '%';
const cum = (xs: number[]) => xs.reduce<number[]>((acc, v) => (acc.push((acc.at(-1) ?? 0) + v), acc), []);
const fmtDate = (s: string) => {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = s.split('-').map(Number);
  return `${d} ${M[m - 1]} ${y}`;
};

export default function CarPaths({ id, days, events, windows, initialEvent = 'E2' }: Props) {
  const [evId, setEvId] = useState(initialEvent);
  const [winId, setWinId] = useState('main');
  const [on, setOn] = useState<Record<string, boolean>>({ 'FM.TO': true, 'FNV.TO': true });
  const [sel, setSel] = useState(days.indexOf(1));
  const svgRef = useRef<SVGSVGElement>(null);

  const ev = events.find((e) => e.id === evId) ?? events[0];
  const win = windows.find((w) => w.id === winId) ?? windows[0];
  const paths = ev.firms.map((f) => ({ ...f, car: cum(f.ar) }));
  const shown = paths.filter((f) => on[f.ticker]);

  const W = 640, H = 340, ml = 52, mr = 16, mt = 16, mb = 54;
  const n = days.length;
  const step = (W - ml - mr) / (n - 1 + 1);
  const x = (i: number) => ml + step * (i + 0.5);
  const all = paths.flatMap((f) => f.car);
  const lo = Math.min(0, ...all), hi = Math.max(0, ...all);
  const span = hi - lo || 0.1;
  const y0 = lo - span * 0.06, y1 = hi + span * 0.08;
  const y = (v: number) => mt + (H - mt - mb) * (y1 - v) / (y1 - y0);
  const tStep = [0.02, 0.05, 0.1, 0.2].find((s) => span / s <= 6) ?? 0.2;
  const ticks: number[] = [];
  for (let t = Math.ceil(y0 / tStep) * tStep; t <= y1 + 1e-9; t += tStep) ticks.push(Math.round(t * 1000) / 1000);

  const i0 = days.indexOf(win.from), i1 = days.indexOf(win.to);
  const winCar = (f: Firm) => f.ar.slice(i0, i1 + 1).reduce((a, b) => a + b, 0);

  const pick = (clientX: number) => {
    const m = svgRef.current?.getScreenCTM();
    if (!m) return;
    const i = Math.floor(((clientX - m.e) / m.a - ml) / step);
    if (i >= 0 && i < n) setSel(i);
  };
  const onKey = (e: KeyboardEvent) => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (k) { e.preventDefault(); setSel((s) => Math.max(0, Math.min(n - 1, s + k))); }
    else if (e.key === 'Home') { e.preventDefault(); setSel(0); }
    else if (e.key === 'End') { e.preventDefault(); setSel(n - 1); }
  };
  const toggle = (t: string) => setOn((p) => (p[t] && Object.values(p).filter(Boolean).length === 1 ? p : { ...p, [t]: !p[t] }));
  const d = days[sel];

  return (
    <div class="cpth">
      <div class="cpth-controls">
        <fieldset class="cpth-radio">
          <legend class="mono">Event</legend>
          {events.map((e) => (
            <label class={evId === e.id ? 'on' : ''}>
              <input type="radio" name={`${id}-ev`} checked={evId === e.id} onChange={() => setEvId(e.id)} />
              {e.id}
            </label>
          ))}
        </fieldset>
        <div class="cpth-firms" role="group" aria-label="Firms">
          {ev.firms.map((f, k) => (
            <button type="button" class={`cpth-btn f${k}`} aria-pressed={on[f.ticker]} onClick={() => toggle(f.ticker)}>
              <svg width="22" height="8" aria-hidden="true"><line class={`f${k}`} x1="1" x2="21" y1="4" y2="4" /></svg>
              {f.name}
            </button>
          ))}
        </div>
        <fieldset class="cpth-radio">
          <legend class="mono">CAR window</legend>
          {windows.map((w) => (
            <label class={winId === w.id ? 'on' : ''}>
              <input type="radio" name={`${id}-win`} checked={winId === w.id} onChange={() => setWinId(w.id)} />
              {w.label}
            </label>
          ))}
        </fieldset>
      </div>
      <p class="cpth-ev mono">{ev.label} · {ev.date}</p>

      <div class="cpth-grid">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          class="cpth-svg"
          role="slider"
          tabIndex={0}
          aria-label="Trading day"
          aria-valuemin={days[0]}
          aria-valuemax={days[n - 1]}
          aria-valuenow={d}
          aria-valuetext={`day ${d > 0 ? '+' : ''}${d}, ${fmtDate(ev.dates[sel])}`}
          aria-describedby={`${id}-desc`}
          onPointerMove={(e) => e.pointerType === 'mouse' && pick(e.clientX)}
          onPointerDown={(e) => pick(e.clientX)}
          onKeyDown={onKey}
        >
          <desc id={`${id}-desc`}>
            Cumulative abnormal returns from day −5 to day +10 around {ev.label}. Use the arrow keys to move between days; the values appear beside the chart.
          </desc>
          <rect class="win" x={x(i0) - step / 2} y={mt} width={step * (i1 - i0 + 1)} height={H - mt - mb} />
          {ticks.map((t) => (
            <g>
              <line class={Math.abs(t) < 1e-9 ? 'zero' : 'grid'} x1={ml} x2={W - mr} y1={y(t)} y2={y(t)} />
              <text class="tick" x={ml - 8} y={y(t) + 4} text-anchor="end">{Math.abs(t) < 1e-9 ? '0' : pct(t, 0)}</text>
            </g>
          ))}
          <line class="day0" x1={x(days.indexOf(0))} x2={x(days.indexOf(0))} y1={mt} y2={H - mb} />
          <rect class="hover" x={x(sel) - step / 2} y={mt} width={step} height={H - mt - mb} />
          {paths.map((f, k) =>
            on[f.ticker] ? (
              <g class={`line f${k}`}>
                <path d={f.car.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')} />
                {f.car.map((v, i) => <circle cx={x(i)} cy={y(v)} r={i === sel ? 4.5 : 2.5} class={i === sel ? 'sel' : ''} />)}
              </g>
            ) : null
          )}
          {days.map((dd, i) => (dd % 5 === 0 ? <text class="tick" x={x(i)} y={H - mb + 20} text-anchor="middle">{dd > 0 ? `+${dd}` : dd}</text> : null))}
          <text class="axis" x={W - mr} y={H - 6} text-anchor="end">trading days from day 0</text>
          <line class="axisline" x1={ml} x2={W - mr} y1={H - mb} y2={H - mb} />
        </svg>

        <div class="cpth-side" aria-live="polite">
          <table class="cpth-read">
            <caption class="mono">Day {d > 0 ? '+' : ''}{d} · {fmtDate(ev.dates[sel])}</caption>
            <thead><tr><td></td><th scope="col">AR</th><th scope="col">CAR</th></tr></thead>
            <tbody>
              {shown.map((f) => (
                <tr><th scope="row">{f.name}</th><td>{pct(f.ar[sel])}</td><td>{pct(f.car[sel])}</td></tr>
              ))}
            </tbody>
          </table>
          <table class="cpth-read">
            <caption class="mono">CAR over {win.label}</caption>
            <thead><tr><td></td><th scope="col">log</th><th scope="col">simple</th></tr></thead>
            <tbody>
              {shown.map((f) => {
                const c = winCar(f);
                return <tr><th scope="row">{f.name}</th><td>{pct(c)}</td><td>{pct(Math.exp(c) - 1)}</td></tr>;
              })}
            </tbody>
          </table>
          <p class="cpth-note muted">AR: abnormal return that day. CAR: running sum from day −5. Simple = e^CAR − 1, the scale of Table 3.</p>
        </div>
      </div>

      <details class="cpth-table">
        <summary class="mono">Show as a table</summary>
        <table>
          <caption class="visually-hidden">Daily abnormal returns and CAR, {ev.label}</caption>
          <thead>
            <tr><th scope="col">Day</th><th scope="col">Date</th>{paths.map((f) => <><th scope="col">{f.name} AR</th><th scope="col">{f.name} CAR</th></>)}</tr>
          </thead>
          <tbody>
            {days.map((dd, i) => (
              <tr>
                <th scope="row">{dd > 0 ? `+${dd}` : dd}</th>
                <td>{ev.dates[i]}</td>
                {paths.map((f) => <><td>{pct(f.ar[i])}</td><td>{pct(f.car[i])}</td></>)}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
