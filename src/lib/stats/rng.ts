// Seeded random numbers, so the simulated figure is identical on every load.

/** mulberry32: small, fast 32-bit PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal draws by Box–Muller from a uniform generator. */
export function normal(uniform: () => number): (mean?: number, sd?: number) => number {
  let spare: number | null = null;
  return (mean = 0, sd = 1) => {
    if (spare !== null) {
      const z = spare;
      spare = null;
      return mean + sd * z;
    }
    let u = 0;
    while (u === 0) u = uniform();
    const v = uniform();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return mean + sd * r * Math.cos(2 * Math.PI * v);
  };
}
