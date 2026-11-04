// Simple OLS of y on a constant and one regressor.

export type OlsResult = {
  alpha: number;
  beta: number;
  /** residual standard deviation, sqrt(SSR / (n - 2)) */
  sigma: number;
  n: number;
};

export function ols(x: readonly number[], y: readonly number[]): OlsResult {
  const n = x.length;
  if (n !== y.length) throw new Error('ols: x and y differ in length');
  if (n < 3) throw new Error('ols: need at least 3 observations');
  let mx = 0, my = 0;
  for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; }
  mx /= n; my /= n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    sxx += dx * dx;
    sxy += dx * (y[i] - my);
  }
  if (sxx === 0) throw new Error('ols: x has no variance');
  const beta = sxy / sxx;
  const alpha = my - beta * mx;
  let ssr = 0;
  for (let i = 0; i < n; i++) {
    const e = y[i] - alpha - beta * x[i];
    ssr += e * e;
  }
  return { alpha, beta, sigma: Math.sqrt(ssr / (n - 2)), n };
}

export function mean(v: readonly number[]): number {
  let s = 0;
  for (const x of v) s += x;
  return s / v.length;
}

/** sample standard deviation with n - 1 in the denominator */
export function sd(v: readonly number[]): number {
  const m = mean(v);
  let s = 0;
  for (const x of v) s += (x - m) ** 2;
  return Math.sqrt(s / (v.length - 1));
}
