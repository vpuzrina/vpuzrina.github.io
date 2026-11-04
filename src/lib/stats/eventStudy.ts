// Event study on daily returns: expected-return model fitted on an estimation window,
// abnormal returns (AR), their cumulative sum (CAR) over an event window, and a t-test.
// Pure functions, no DOM: the figure and the tests both use this module.
import { mulberry32, normal } from './rng';
import { ols, mean, sd } from './ols';
import { tPValue } from './dist';

/** Daily returns indexed by trading day relative to the event (day 0). */
export type Series = {
  day: number[]; // strictly increasing, contains 0
  firm: number[]; // simple returns, 0.01 = 1%
  mkt: number[];
};

export type Model = 'market' | 'adjusted' | 'mean';
export const MODEL_LABEL: Record<Model, string> = {
  market: 'Market model',
  adjusted: 'Market-adjusted (β = 1)',
  mean: 'Mean-adjusted',
};

export type Window = readonly [number, number]; // inclusive day range

export type SimParams = {
  seed: number;
  firstDay: number; // e.g. -300
  lastDay: number; // e.g. 10
  mktMean: number;
  mktSd: number;
  alpha: number;
  beta: number;
  epsSd: number;
  shock: number; // added to the firm return on day 0
  drift: number; // added on each day in driftDays
  driftDays: Window;
};

export const DEFAULT_SIM: SimParams = {
  seed: 2027,
  firstDay: -300,
  lastDay: 10,
  mktMean: 0.0003,
  mktSd: 0.01,
  alpha: 0,
  beta: 1.2,
  epsSd: 0.015,
  shock: -0.25,
  drift: -0.01,
  driftDays: [1, 3],
};

export const DEFAULT_EST: Window = [-250, -11];
export const DEFAULT_EVT: Window = [-1, 1];

/** Firm return = alpha + beta * market + eps, plus the shock on day 0 and the drift after it. */
export function simulate(p: SimParams = DEFAULT_SIM): Series {
  const draw = normal(mulberry32(p.seed));
  const s: Series = { day: [], firm: [], mkt: [] };
  for (let d = p.firstDay; d <= p.lastDay; d++) {
    const m = draw(p.mktMean, p.mktSd);
    let f = p.alpha + p.beta * m + draw(0, p.epsSd);
    if (d === 0) f += p.shock;
    if (d >= p.driftDays[0] && d <= p.driftDays[1]) f += p.drift;
    s.day.push(d);
    s.firm.push(f);
    s.mkt.push(m);
  }
  return s;
}

function slice(s: Series, w: Window) {
  const firm: number[] = [], mkt: number[] = [];
  for (let i = 0; i < s.day.length; i++) {
    if (s.day[i] >= w[0] && s.day[i] <= w[1]) {
      firm.push(s.firm[i]);
      mkt.push(s.mkt[i]);
    }
  }
  return { firm, mkt };
}

export type Fit = { alpha: number; beta: number; sigma: number; n: number; df: number };

/** Fits the expected-return model on the estimation window. */
export function fit(s: Series, est: Window, model: Model): Fit {
  const { firm, mkt } = slice(s, est);
  const n = firm.length;
  if (model === 'market') {
    const r = ols(mkt, firm);
    return { alpha: r.alpha, beta: r.beta, sigma: r.sigma, n, df: n - 2 };
  }
  if (model === 'adjusted') {
    const ar = firm.map((f, i) => f - mkt[i]);
    return { alpha: 0, beta: 1, sigma: sd(ar), n, df: n - 1 };
  }
  return { alpha: mean(firm), beta: 0, sigma: sd(firm), n, df: n - 1 };
}

/** AR_t = R_t - (alpha + beta * R_m,t) for every day in the series. */
export function abnormal(s: Series, f: Fit): number[] {
  return s.firm.map((r, i) => r - (f.alpha + f.beta * s.mkt[i]));
}

export type CarStats = { car: number; se: number; t: number; p: number; L: number };

/**
 * CAR over L days with SE(CAR) = sigma * sqrt(L). This ignores the sampling error in alpha-hat and
 * beta-hat and any autocorrelation, which is the usual simplification for a single firm.
 */
export function carStats(ar: readonly number[], sigma: number, df: number): CarStats {
  const L = ar.length;
  const car = ar.reduce((a, b) => a + b, 0);
  const se = sigma * Math.sqrt(L);
  const t = car / se;
  return { car, se, t, p: tPValue(t, df), L };
}

export type EventStudyResult = {
  fit: Fit;
  /** days shown in the CAR panel and the CAR cumulated from the first of them, with a 95% band */
  path: { day: number; car: number; lo: number; hi: number }[];
  window: CarStats;
};

export const T95 = 1.96;

export function runEventStudy(s: Series, est: Window, evt: Window, model: Model, shown: Window = [-10, 10]): EventStudyResult {
  if (est[1] >= evt[0]) throw new Error('estimation window must end before the event window starts');
  const f = fit(s, est, model);
  const ar = abnormal(s, f);
  const path: EventStudyResult['path'] = [];
  let cum = 0, k = 0;
  const evtAr: number[] = [];
  for (let i = 0; i < s.day.length; i++) {
    const d = s.day[i];
    if (d >= evt[0] && d <= evt[1]) evtAr.push(ar[i]);
    if (d < shown[0] || d > shown[1]) continue;
    cum += ar[i];
    k++;
    const half = T95 * f.sigma * Math.sqrt(k);
    path.push({ day: d, car: cum, lo: cum - half, hi: cum + half });
  }
  return { fit: f, path, window: carStats(evtAr, f.sigma, f.df) };
}
