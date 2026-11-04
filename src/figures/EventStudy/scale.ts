// Minimal linear scale and tick helpers, so the figure does not need d3.

export type Linear = ((v: number) => number) & { invert: (px: number) => number; domain: [number, number] };

export function linear(domain: [number, number], range: [number, number]): Linear {
  const [d0, d1] = domain, [r0, r1] = range;
  const k = (r1 - r0) / (d1 - d0 || 1);
  const f = ((v: number) => r0 + (v - d0) * k) as Linear;
  f.invert = (px: number) => d0 + (px - r0) / k;
  f.domain = domain;
  return f;
}

/** About `count` round tick values covering [lo, hi]. */
export function ticks(lo: number, hi: number, count = 5): number[] {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const raw = span / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}

const MINUS = '−';
export const signed = (s: string) => s.replace(/^-/, MINUS);
export const pct = (v: number, d = 2) => signed((v * 100).toFixed(d)) + '%';
export const num = (v: number, d = 3) => signed(v.toFixed(d));
export const day = (d: number) => (d > 0 ? `+${d}` : signed(String(d)));
export const pval = (p: number) => (p < 0.001 ? '< 0.001' : p.toFixed(3));
