import { describe, it, expect } from 'vitest';
import { ols } from './ols';
import { tPValue } from './dist';
import { mulberry32 } from './rng';
import { simulate, runEventStudy, carStats, fit, DEFAULT_SIM, DEFAULT_EST, DEFAULT_EVT, type Series } from './eventStudy';
import { parseReturnsCsv, toSeries } from './returns';

describe('ols', () => {
  it('matches a hand-computed example', () => {
    // x = 1..5, y = 2,4,5,4,5. x̄ = 3, ȳ = 4, Sxy = 6, Sxx = 10.
    // β = 0.6, α = 4 − 0.6·3 = 2.2. Residuals −0.8, 0.6, 1.0, −0.6, −0.2, SSR = 2.4, σ² = 2.4 / 3 = 0.8.
    const r = ols([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
    expect(r.beta).toBeCloseTo(0.6, 12);
    expect(r.alpha).toBeCloseTo(2.2, 12);
    expect(r.sigma).toBeCloseTo(Math.sqrt(0.8), 12);
    expect(r.n).toBe(5);
  });

  it('recovers the parameters of an exact line', () => {
    const x = [0.01, -0.02, 0.005, 0.03, -0.01];
    const r = ols(x, x.map((v) => 0.001 + 1.5 * v));
    expect(r.alpha).toBeCloseTo(0.001, 12);
    expect(r.beta).toBeCloseTo(1.5, 12);
    expect(r.sigma).toBeCloseTo(0, 12);
  });
});

describe('t distribution', () => {
  it('gives textbook two-sided p-values', () => {
    expect(tPValue(2.228, 10)).toBeCloseTo(0.05, 3); // t(0.975, 10) = 2.228
    expect(tPValue(2.0, 10)).toBeCloseTo(0.0734, 4);
    expect(tPValue(1.96, 1e6)).toBeCloseTo(0.05, 3);
    expect(tPValue(0, 30)).toBeCloseTo(1, 12);
  });
});

describe('rng', () => {
  it('is reproducible for a seed', () => {
    const a = mulberry32(2027), b = mulberry32(2027);
    for (let i = 0; i < 5; i++) expect(a()).toBe(b());
  });
  it('simulate() returns the same series on every call', () => {
    expect(simulate()).toEqual(simulate());
  });
});

describe('carStats', () => {
  it('computes CAR, SE = σ√L, t and p on a known case', () => {
    // AR = 1%, 2%, 3%, σ = 1%: CAR = 6%, SE = 0.01·√3 = 0.017321, t = 0.06 / 0.017321 = 3.4641
    const r = carStats([0.01, 0.02, 0.03], 0.01, 1e6);
    expect(r.car).toBeCloseTo(0.06, 12);
    expect(r.se).toBeCloseTo(0.01 * Math.sqrt(3), 12);
    expect(r.t).toBeCloseTo(2 * Math.sqrt(3), 10);
    expect(r.p).toBeCloseTo(0.000532, 5); // normal limit, two-sided
    expect(r.L).toBe(3);
  });
});

describe('event study', () => {
  it('finds the injected shock on the default simulation', () => {
    const r = runEventStudy(simulate(), DEFAULT_EST, [0, 0], 'market');
    // −25% shock plus one day of noise with σ = 1.5%
    expect(r.window.car).toBeLessThan(-0.2);
    expect(r.window.car).toBeGreaterThan(-0.3);
    expect(r.window.t).toBeLessThan(-10);
    expect(r.fit.n).toBe(240);
    expect(r.fit.beta).toBeGreaterThan(1.0);
    expect(r.fit.beta).toBeLessThan(1.4);
  });

  it('CAR is zero in expectation when there is no shock (1,000 seeds, all three models)', () => {
    const cars = { market: [] as number[], adjusted: [] as number[], mean: [] as number[] };
    const ts: number[] = [];
    for (let seed = 1; seed <= 1000; seed++) {
      const s = simulate({ ...DEFAULT_SIM, seed, shock: 0, drift: 0 });
      for (const model of ['market', 'adjusted', 'mean'] as const) {
        const r = runEventStudy(s, DEFAULT_EST, DEFAULT_EVT, model);
        cars[model].push(r.window.car);
        if (model === 'market') ts.push(r.window.t);
      }
    }
    const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
    // Market model: SE of the mean ≈ 0.015·√3 / √1000 ≈ 0.00082; allow 4 SE.
    expect(Math.abs(avg(cars.market))).toBeLessThan(0.0033);
    // Misspecified models are still unbiased here (β = 1.2 only adds noise); their SE is ≈ 0.0009 and ≈ 0.0011.
    expect(Math.abs(avg(cars.adjusted))).toBeLessThan(0.004);
    expect(Math.abs(avg(cars.mean))).toBeLessThan(0.0045);
    // Under the null the t-stat is roughly standard normal: about 5% beyond ±1.96
    const rej = ts.filter((t) => Math.abs(t) > 1.96).length / ts.length;
    expect(rej).toBeGreaterThan(0.03);
    expect(rej).toBeLessThan(0.075);
  });

  it('market-adjusted and mean-adjusted models use β = 1 and β = 0', () => {
    const s = simulate();
    expect(fit(s, DEFAULT_EST, 'adjusted')).toMatchObject({ alpha: 0, beta: 1 });
    expect(fit(s, DEFAULT_EST, 'mean').beta).toBe(0);
  });

  it('rejects an estimation window that overlaps the event window', () => {
    expect(() => runEventStudy(simulate(), [-250, 0], [-1, 1], 'market')).toThrow();
  });

  it('builds a CAR path from day −10 to +10 with a band that widens', () => {
    const r = runEventStudy(simulate(), DEFAULT_EST, DEFAULT_EVT, 'market');
    expect(r.path.map((p) => p.day)).toEqual(Array.from({ length: 21 }, (_, i) => i - 10));
    const w = r.path.map((p) => p.hi - p.lo);
    expect(w[20]).toBeGreaterThan(w[0]);
    expect(w[0]).toBeCloseTo(2 * 1.96 * r.fit.sigma, 12);
  });
});

describe('returns csv', () => {
  const csv = `date,firm_ret,mkt_ret
2023-11-27,0.01,0.002
2023-11-28,-0.25,-0.001
2023-11-24,0.003,0.001`;
  it('parses, sorts by date and indexes days from the event date', () => {
    const rows = parseReturnsCsv(csv);
    expect(rows.map((r) => r.date)).toEqual(['2023-11-24', '2023-11-27', '2023-11-28']);
    const s = toSeries(rows, '2023-11-26') as Series; // a Sunday: day 0 is the next trading day
    expect(s.day).toEqual([-1, 0, 1]);
    expect(s.firm[1]).toBe(0.01);
  });
  it('returns nothing for a header-only file and rejects bad rows', () => {
    expect(parseReturnsCsv('date,firm_ret,mkt_ret\n')).toEqual([]);
    expect(() => parseReturnsCsv('date,firm_ret,mkt_ret\n2023-11-27,,0.1')).toThrow();
    expect(() => parseReturnsCsv('day,ret\n1,2')).toThrow();
  });
});
