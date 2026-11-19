// Cobre Fig. 2: placebo test. Histogram of a group's mean CAR [0,+1] on 639 random dates
// (placebo_draws.csv from 03_robustness.R), with the real core events marked. Server-rendered, then hydrated.
import { useState } from 'preact/hooks';
import './car-paths.css';

type Real = { event: string; car: number; n: number; p: number; pct: number };
type Group = { key: string; label: string; members: string[]; draws: number[]; real: Real[] };
type Props = { id: string; events: { id: string; label: string }[]; groups: Group[]; initialGroup?: string; initialEvent?: string };

const pct = (v: number, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v * 100).toFixed(d) + '%';
const share = (p: number) => (p * 100).toFixed(1) + '%';

export default function Placebo({ id, events, groups, initialGroup = 'owner', initialEvent = 'E2' }: Props) {
  const [gKey, setG] = useState(initialGroup);
  const [eId, setE] = useState(initialEvent);
  const g = groups.find((x) => x.key === gKey) ?? groups[0];
  const r = g.real.find((x) => x.event === eId) ?? g.real[0];

  const draws = g.draws;
  const mean = draws.reduce((a, b) => a + b, 0) / draws.length;
  const sd = Math.sqrt(draws.reduce((a, b) => a + (b - mean) ** 2, 0) / (draws.length - 1));
  const dMin = Math.min(...draws), dMax = Math.max(...draws);
  const NB = 40;
  const bw = (dMax - dMin) / NB;
  const counts = new Array(NB).fill(0);
  for (const v of draws) counts[Math.min(NB - 1, Math.floor((v - dMin) / bw))]++;
  const cMax = Math.max(...counts);

  const xs = [dMin, dMax, ...g.real.map((x) => x.car)];
  const lo = Math.min(...xs), hi = Math.max(...xs);
  const pad = (hi - lo) * 0.04;
  const W = 640, H = 310, ml = 44, mr = 16, mt = 30, mb = 54;
  const x = (v: number) => ml + (W - ml - mr) * (v - lo + pad) / (hi - lo + 2 * pad);
  const yc = (c: number) => H - mb - (H - mt - mb) * c / cMax;
  const span = hi - lo;
  const tStep = [0.01, 0.02, 0.05, 0.1, 0.2].find((s) => span / s <= 7) ?? 0.2;
  const ticks: number[] = [];
  for (let t = Math.ceil((lo - pad) / tStep) * tStep; t <= hi + pad + 1e-9; t += tStep) ticks.push(Math.round(t * 1000) / 1000);
  const cStep = [5, 10, 20, 50, 100].find((s) => cMax / s <= 5) ?? 100;
  const cTicks = Array.from({ length: Math.floor(cMax / cStep) + 1 }, (_, i) => i * cStep);
  const evLabel = events.find((e) => e.id === r.event)?.label ?? r.event;
  const below = r.car < mean;

  return (
    <div class="cpth">
      <fieldset class="cpth-radio">
        <legend class="mono">Group</legend>
        {groups.map((x) => (
          <label class={gKey === x.key ? 'on' : ''}>
            <input type="radio" name={`${id}-g`} checked={gKey === x.key} onChange={() => setG(x.key)} />
            {x.label}
          </label>
        ))}
      </fieldset>
      <fieldset class="cpth-radio" style="margin-top:0.35rem">
        <legend class="mono">Real event</legend>
        {events.map((e) => (
          <label class={eId === e.id ? 'on' : ''}>
            <input type="radio" name={`${id}-e`} checked={eId === e.id} onChange={() => setE(e.id)} />
            {e.id}
          </label>
        ))}
      </fieldset>
      <p class="cpth-ev mono">{g.label}: {g.members.join(', ')}</p>

      <div class="cpth-grid">
        <svg viewBox={`0 0 ${W} ${H}`} class="cpth-svg plc" role="img" aria-labelledby={`${id}-desc`}>
          <desc id={`${id}-desc`}>
            {`Histogram of ${g.label} mean CAR over [0, +1] on ${draws.length} random dates without Cobre Panamá news. ${evLabel}: ${pct(r.car)}; ${share(r.p)} of random dates were at least as extreme.`}
          </desc>
          {cTicks.map((c) => (
            <g>
              <line class={c === 0 ? 'axisline' : 'grid'} x1={ml} x2={W - mr} y1={yc(c)} y2={yc(c)} />
              <text class="tick" x={ml - 8} y={yc(c) + 4} text-anchor="end">{c}</text>
            </g>
          ))}
          {counts.map((c, i) => (c ? <rect class="bin" x={x(dMin + i * bw) + 0.5} y={yc(c)} width={Math.max(1, x(dMin + (i + 1) * bw) - x(dMin + i * bw) - 1)} height={yc(0) - yc(c)} /> : null))}
          {g.real.filter((q) => q.event !== r.event).map((q) => (
            <line class="other" x1={x(q.car)} x2={x(q.car)} y1={mt + 18} y2={H - mb} />
          ))}
          <line class="real" x1={x(r.car)} x2={x(r.car)} y1={mt - 6} y2={H - mb} />
          <text class="lab" x={x(r.car) + (x(r.car) > W * 0.7 ? -6 : 6)} y={mt + 4} text-anchor={x(r.car) > W * 0.7 ? 'end' : 'start'}>
            {r.event} {pct(r.car)}
          </text>
          {ticks.map((t) => <text class="tick" x={x(t)} y={H - mb + 20} text-anchor="middle">{Math.abs(t) < 1e-9 ? '0' : pct(t, 0)}</text>)}
          <text class="axis" x={W - mr} y={H - 4} text-anchor="end">mean CAR [0, +1], log</text>
        </svg>

        <div class="cpth-side" aria-live="polite">
          <table class="cpth-read">
            <caption class="mono">{evLabel}</caption>
            <tbody>
              <tr><th scope="row">Real CAR</th><td>{pct(r.car)}</td></tr>
              <tr><th scope="row">Firms in group</th><td>{r.n}</td></tr>
              <tr><th scope="row">Random dates</th><td>{draws.length}</td></tr>
              <tr><th scope="row">Their mean</th><td>{pct(mean, 2)}</td></tr>
              <tr><th scope="row">Their std. dev.</th><td>{pct(sd, 2).replace('+', '')}</td></tr>
              <tr><th scope="row">At least as extreme</th><td>{share(r.p)}</td></tr>
              <tr><th scope="row">{below ? 'Dates at or below' : 'Dates at or above'}</th><td>{share(below ? r.pct : 1 - r.pct)}</td></tr>
            </tbody>
          </table>
          <p class="cpth-note muted">
            "At least as extreme": share of random dates at least as far from their mean as the real event, either side (with +1 for the event itself, so the floor is 0.2%). Thin lines: the other core events.
          </p>
        </div>
      </div>

      <details class="cpth-table">
        <summary class="mono">Show as a table</summary>
        <table>
          <caption class="visually-hidden">Real group CAR over [0, +1] and share of random dates at least as extreme</caption>
          <thead><tr><th scope="col">Group</th>{events.map((e) => <th scope="col">{e.id}</th>)}</tr></thead>
          <tbody>
            {groups.map((x) => (
              <tr>
                <th scope="row">{x.label}</th>
                {events.map((e) => {
                  const q = x.real.find((z) => z.event === e.id)!;
                  return <td>{pct(q.car)} ({share(q.p)})</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
