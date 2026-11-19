// Interactive Figure 2 of the Cobre Panamá paper: distribution of group CARs over [0, +1] on 639 dates
// without Cobre Panamá news, against the real core events. Data from placebo_draws.csv and
// abnormal_returns_daily.csv (scripts/cobre-figure-data.mjs). Server-rendered SVG first, then hydrated.
import { useMemo, useState } from 'preact/hooks';
import '../StackedBars/stacked-bars.css';
import './placebo.css';

type Group = { key: string; label: string; draws: number[]; real: Record<string, { car: number; n: number }> };
type Props = { id: string; groups: Group[]; events: { id: string; label: string }[]; initial?: string };

const MINUS = '−';
const pct = (v: number, d = 1) => (v > 0 ? '+' : v < 0 ? MINUS : '') + Math.abs(v * 100).toFixed(d) + '%';

export default function PlaceboHist({ id, groups, events, initial = 'owner' }: Props) {
  const [gk, setGk] = useState(initial);
  const g = groups.find((x) => x.key === gk)!;
  const N = g.draws.length;
  const evs = events.filter((e) => g.real[e.id]);
  const { bins, lo, hi, max } = useMemo(() => {
    const vals = [...g.draws, ...evs.map((e) => g.real[e.id].car)];
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
    const nb = 40, w = (hi - lo) / nb;
    const bins = Array.from({ length: nb }, (_, i) => ({ a: lo + i * w, b: lo + (i + 1) * w, n: 0 }));
    for (const v of g.draws) bins[Math.min(nb - 1, Math.floor((v - lo) / w))].n++;
    return { bins, lo, hi, max: Math.max(...bins.map((b) => b.n)) };
  }, [gk]);
  const share = (c: number) => (g.draws.filter((x) => Math.abs(x) >= Math.abs(c)).length + 1) / (N + 1);

  const W = 640, H = 260, ml = 40, mr = 14, mt = 34, mb = 40;
  const x = (v: number) => ml + ((v - lo) / (hi - lo)) * (W - ml - mr);
  const y = (n: number) => mt + (H - mt - mb) * (1 - n / max);
  const span = hi - lo;
  const step = span > 0.5 ? 0.2 : span > 0.2 ? 0.1 : span > 0.1 ? 0.05 : 0.02;
  const xt: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) xt.push(Math.round(t / step) * step);

  return (
    <div class="ph">
      <div class="sb-controls" role="group" aria-label="Group">
        {groups.map((x) => <button type="button" class="sb-btn" aria-pressed={gk === x.key} onClick={() => setGk(x.key)}>{x.label}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} class="ph-svg" role="img" aria-labelledby={`${id}-desc`}>
        <desc id={`${id}-desc`}>
          {`Histogram of ${N} placebo group CARs for ${g.label}, with the real core events marked: ` +
            evs.map((e) => `${e.id} at ${pct(g.real[e.id].car)}`).join(', ') + '.'}
        </desc>
        {bins.map((b) => b.n > 0 && <rect class="bin" x={x(b.a) + 0.5} y={y(b.n)} width={Math.max(1, x(b.b) - x(b.a) - 1)} height={H - mb - y(b.n)} />)}
        <line class="axis" x1={ml} x2={W - mr} y1={H - mb} y2={H - mb} />
        {xt.map((t) => <text class="tick" x={x(t)} y={H - mb + 16} text-anchor="middle">{pct(t, 0)}</text>)}
        <text class="tick" x={ml - 6} y={y(max) + 4} text-anchor="end">{max}</text>
        <text class="tick" x={ml - 6} y={H - mb} text-anchor="end">0</text>
        {evs.map((e, k) => {
          const c = g.real[e.id].car;
          return (
            <g class="ev">
              <line x1={x(c)} x2={x(c)} y1={mt - 4} y2={H - mb} />
              <text x={x(c)} y={mt - 8 - (k % 2) * 13} text-anchor="middle">{e.id}</text>
            </g>
          );
        })}
        <text class="axis-label" x={W - mr} y={H - 6} text-anchor="end">mean CAR [0, +1] of the group, % (log)</text>
      </svg>
      <table class="cp-table">
        <caption class="visually-hidden">Real event CARs for {g.label} against the placebo distribution</caption>
        <thead><tr><th scope="col">Event</th><th scope="col">Firms</th><th scope="col">Real CAR (log)</th><th scope="col">Ordinary days at least as extreme</th></tr></thead>
        <tbody>
          {evs.map((e) => {
            const r = g.real[e.id], s = share(r.car);
            return <tr><th scope="row">{e.id} {e.label}</th><td>{r.n}</td><td>{pct(r.car)}</td><td class={s < 0.05 ? 'hit' : ''}>{(s * 100).toFixed(1)}%</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
