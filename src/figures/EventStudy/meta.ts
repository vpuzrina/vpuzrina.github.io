import { DEFAULT_SIM as p } from '../../lib/stats/eventStudy';
export const FIG1_TAG = 'Simulated · market model · not market data';
export const FIG1_PARAMS =
  `R_m ~ N(${p.mktMean}, ${p.mktSd}) · α = ${p.alpha}, β = ${p.beta}, σ(ε) = ${p.epsSd} · ` +
  `shock −${Math.abs(p.shock * 100)}% on day 0, −${Math.abs(p.drift * 100)}% a day on days +${p.driftDays[0]} to +${p.driftDays[1]} · seed ${p.seed}`;
