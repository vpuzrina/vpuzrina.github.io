// Fig. 1: interactive event study. Renders as static SVG on the server, then hydrates.
// The chart only sees a Series, so real returns (src/data/cobre-panama/returns.csv) drop in without changes here.
import { useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import {
  simulate, runEventStudy, MODEL_LABEL, DEFAULT_SIM, DEFAULT_EST, DEFAULT_EVT,
  type Series, type Model, type Window, type SimParams,
} from '../../lib/stats/eventStudy';
import { linear, ticks, pct, num, day, pval } from './scale';
import './event-study.css';

export type Source = { kind: 'sim'; params?: Partial<SimParams> } | { kind: 'data'; series: Series };

type Props = {
  source: Source;
  id: string; // unique prefix for element ids
  est?: Window;
  evt?: Window;
  model?: Model;
  size?: 'inline' | 'full';
};

const SHOWN: Window = [-10, 10];
const MIN_EST = 30; // shortest estimation window, trading days
const EST_LAST = -11; // estimation window always ends before the CAR panel starts

type Handle = 'est0' | 'est1' | 'evt0' | 'evt1';

export default function EventStudy({ source, id, est: est0 = DEFAULT_EST, evt: evt0 = DEFAULT_EVT, model: model0 = 'market', size = 'inline' }: Props) {
  const series = useMemo(
    () => (source.kind === 'sim' ? simulate({ ...DEFAULT_SIM, ...source.params }) : source.series),
    [source]
  );
  const firstDay = series.day[0];
  const [est, setEst] = useState<Window>(() => [Math.max(est0[0], firstDay), Math.min(est0[1], EST_LAST)]);
  const [evt, setEvt] = useState<Window>(evt0);
  const [model, setModel] = useState<Model>(model0);
  const [drag, setDrag] = useState<Handle | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const r = useMemo(() => runEventStudy(series, est, evt, model, SHOWN), [series, est, evt, model]);

  // Geometry (SVG user units)
  const W = 640;
  const ml = 52, mr = 14;
  const top = { y0: 18, y1: 236 };
  const trackEst = 324, trackEvt = 400;
  const H = 424;
  const x = linear([SHOWN[0] - 0.5, SHOWN[1] + 0.5], [ml, W - mr]);
  const xe = linear([firstDay, EST_LAST], [ml, W - mr]);

  const lo = Math.min(0, ...r.path.map((p) => p.lo));
  const hi = Math.max(0, ...r.path.map((p) => p.hi));
  const pad = (hi - lo) * 0.06;
  const y = linear([lo - pad, hi + pad], [top.y1, top.y0]);
  const yt = ticks(lo - pad, hi + pad, 5);

  const line = r.path.map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)},${y(p.car).toFixed(1)}`).join('');
  const band =
    r.path.map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)},${y(p.hi).toFixed(1)}`).join('') +
    r.path.slice().reverse().map((p) => `L${x(p.day).toFixed(1)},${y(p.lo).toFixed(1)}`).join('') + 'Z';

  // Window updates with constraints
  function set(h: Handle, v: number) {
    v = Math.round(v);
    if (h === 'evt0') setEvt(([, b]) => [clamp(v, SHOWN[0], b), b]);
    if (h === 'evt1') setEvt(([a]) => [a, clamp(v, a, SHOWN[1])]);
    if (h === 'est0') setEst(([, b]) => [clamp(v, firstDay, b - MIN_EST + 1), b]);
    if (h === 'est1') setEst(([a]) => [a, clamp(v, a + MIN_EST - 1, EST_LAST)]);
  }
  const value = (h: Handle) => (h === 'est0' ? est[0] : h === 'est1' ? est[1] : h === 'evt0' ? evt[0] : evt[1]);

  function toDay(h: Handle, e: PointerEvent) {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    // event handles sit on the outer edge of their day (±0.5)
    set(h, h === 'evt0' ? x.invert(pt.x) + 0.5 : h === 'evt1' ? x.invert(pt.x) - 0.5 : xe.invert(pt.x));
  }

  function onKey(h: Handle, e: KeyboardEvent) {
    const big = h.startsWith('est') ? 10 : 5;
    const v = value(h);
    const map: Record<string, number> = {
      ArrowLeft: v - 1, ArrowDown: v - 1, ArrowRight: v + 1, ArrowUp: v + 1,
      PageDown: v - big, PageUp: v + big, Home: -1e9, End: 1e9,
    };
    if (e.key in map) {
      e.preventDefault();
      set(h, map[e.key]);
    }
  }

  const handleLabel: Record<Handle, string> = {
    est0: 'Estimation window start', est1: 'Estimation window end',
    evt0: 'Event window start', evt1: 'Event window end',
  };

  function handleEl(h: Handle, cx: number, cy: number) {
    const [mn, mx] =
      h === 'evt0' ? [SHOWN[0], evt[1]] : h === 'evt1' ? [evt[0], SHOWN[1]] : h === 'est0' ? [firstDay, est[1] - MIN_EST + 1] : [est[0] + MIN_EST - 1, EST_LAST];
    return (
      <g
        key={h}
        class={`handle${drag === h ? ' active' : ''}`}
        tabIndex={0}
        role="slider"
        aria-label={handleLabel[h]}
        aria-valuemin={mn}
        aria-valuemax={mx}
        aria-valuenow={value(h)}
        aria-valuetext={`day ${day(value(h))}`}
        aria-orientation="horizontal"
        onKeyDown={(e) => onKey(h, e as unknown as KeyboardEvent)}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          (e.currentTarget as SVGGElement).focus();
          setDrag(h);
        }}
        onPointerMove={(e) => drag === h && toDay(h, e as unknown as PointerEvent)}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <rect class="hit" x={cx - 22} y={cy - 24} width={44} height={48} />
        <rect class="knob" x={cx - 3} y={cy - 12} width={6} height={24} rx={1} />
      </g>
    );
  }

  const w = r.window;
  const estN = r.fit.n;
  const evtLabel = `CAR(${day(evt[0])}, ${day(evt[1])})`;
  const hat = (c: string) => <span class={c === 'β' ? 'hat tall' : 'hat'}>{c}</span>;
  const rows: [ComponentChildren, string, string][] = [
    [hat('α'), model === 'market' ? pct(r.fit.alpha, 3) : model === 'adjusted' ? '0 (fixed)' : pct(r.fit.alpha, 3), 'alpha-hat'],
    [hat('β'), model === 'market' ? num(r.fit.beta, 3) : model === 'adjusted' ? '1 (fixed)' : '0 (fixed)', 'beta-hat'],
    [<>{hat('σ')}(ε)</>, pct(r.fit.sigma, 2), 'residual standard deviation'],
    [evtLabel, pct(w.car, 2), 'cumulative abnormal return over the event window'],
    ['SE(CAR)', pct(w.se, 2), 'standard error'],
    ['t-stat', num(w.t, 2), 't statistic'],
    ['p-value', pval(w.p), 'two-sided p-value'],
    ['N est. days', String(estN), 'estimation days'],
  ];

  const last = r.path[r.path.length - 1];
  const minPt = r.path.reduce((a, b) => (b.car < a.car ? b : a), r.path[0]);
  const desc =
    `Line chart of the cumulative abnormal return from day ${day(SHOWN[0])} to ${day(SHOWN[1])}, with a shaded 95% band. ` +
    `It reaches its lowest value, ${pct(minPt.car, 1)}, on day ${day(minPt.day)} and ends at ${pct(last.car, 1)} on day ${day(last.day)}. ` +
    `Below it, two bars show the estimation window, days ${day(est[0])} to ${day(est[1])}, and the event window, days ${day(evt[0])} to ${day(evt[1])}.`;

  return (
    <div class={`es es-${size}${drag ? ' dragging' : ''}`}>
      <fieldset class="es-models">
        <legend class="visually-hidden">Expected-return model</legend>
        {(Object.keys(MODEL_LABEL) as Model[]).map((m) => (
          <label class={model === m ? 'on' : ''}>
            <input type="radio" name={`${id}-model`} value={m} checked={model === m} onChange={() => setModel(m)} />
            {MODEL_LABEL[m]}
          </label>
        ))}
      </fieldset>

      <div class="es-grid">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} class="es-svg" role="group" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>Cumulative abnormal return around day 0</title>
          <desc id={`${id}-desc`}>{desc}</desc>

          {/* Top panel: CAR with 95% band */}
          <rect class="evt-shade" x={x(evt[0] - 0.5)} y={top.y0} width={x(evt[1] + 0.5) - x(evt[0] - 0.5)} height={top.y1 - top.y0} />
          {yt.map((t) => (
            <g>
              <line class={t === 0 ? 'zero' : 'grid'} x1={ml} x2={W - mr} y1={y(t)} y2={y(t)} />
              <text class="tick" x={ml - 8} y={y(t) + 4} text-anchor="end">{pct(t, Math.abs(yt[1] - yt[0]) < 0.01 ? 1 : 0)}</text>
            </g>
          ))}
          <path class="band" d={band} />
          <line class="day0" x1={x(0)} x2={x(0)} y1={top.y0 - 6} y2={top.y1} />
          <text class="day0-label" x={x(0) + 5} y={top.y0 + 4}>day 0</text>
          <path class="car" d={line} />
          {r.path.map((p) => <circle class="pt" cx={x(p.day)} cy={y(p.car)} r={2} />)}
          {[-10, -5, 0, 5, 10].map((d) => (
            <text class="tick" x={x(d)} y={top.y1 + 18} text-anchor="middle">{day(d)}</text>
          ))}
          <text class="axis" x={W - mr} y={top.y1 + 36} text-anchor="end">trading days relative to the event</text>
          <text class="axis" x={ml} y={top.y0 - 6}>CAR, summed from day {day(SHOWN[0])}</text>

          {/* Timeline strip: estimation window on its own scale, event window on the CAR panel's scale */}
          <text class="track-label" x={ml} y={trackEst - 26}>
            estimation window · days {day(est[0])} to {day(est[1])} · {estN} days
          </text>
          <line class="track" x1={ml} x2={W - mr} y1={trackEst} y2={trackEst} />
          <rect class="bar est" x={xe(est[0])} y={trackEst - 5} width={Math.max(1, xe(est[1]) - xe(est[0]))} height={10} />
          <text class="tick" x={ml} y={trackEst + 28}>{day(firstDay)}</text>
          <text class="tick" x={W - mr} y={trackEst + 28} text-anchor="end">{day(EST_LAST)}</text>
          {handleEl('est0', xe(est[0]), trackEst)}
          {handleEl('est1', xe(est[1]), trackEst)}

          <text class="track-label" x={ml} y={trackEvt - 26}>
            event window · days {day(evt[0])} to {day(evt[1])} · {w.L} {w.L === 1 ? 'day' : 'days'}
          </text>
          <line class="track" x1={ml} x2={W - mr} y1={trackEvt} y2={trackEvt} />
          <rect class="bar evt" x={x(evt[0] - 0.5)} y={trackEvt - 5} width={x(evt[1] + 0.5) - x(evt[0] - 0.5)} height={10} />
          <line class="day0 faint" x1={x(0)} x2={x(0)} y1={trackEvt - 10} y2={trackEvt + 10} />
          {handleEl('evt0', x(evt[0] - 0.5), trackEvt)}
          {handleEl('evt1', x(evt[1] + 0.5), trackEvt)}
        </svg>

        <table class="es-table">
          <caption class="visually-hidden">Event study estimates for the current windows and model</caption>
          <tbody>
            {rows.map(([k, v, name]) => (
              <tr>
                <th scope="row" aria-label={name}>{k}</th>
                <td><output aria-live="polite">{v}</output></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}
