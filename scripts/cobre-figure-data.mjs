// Builds the data for the two interactive Cobre Panamá figures from Varvara's R outputs.
//   node scripts/cobre-figure-data.mjs <abnormal_returns_daily.csv> <placebo_draws.csv> <cobre-panama-event-study repo dir>
// Writes src/data/cobre-panama/car-paths.json (First Quantum and Franco-Nevada daily log abnormal returns,
// days -10..+10, core events) and src/data/cobre-panama/placebo.json (639 placebo group CARs per group and
// each core event's real group CAR over [0, +1], with the firm-event exclusions from exclusions.csv).
// Groups follow the paper: rival miners split by Latin American share of copper output (> 50%).
import { readFileSync, writeFileSync } from 'node:fs';

const [arFile, plFile, repo] = process.argv.slice(2);
if (!arFile || !plFile || !repo) {
  console.error('usage: node scripts/cobre-figure-data.mjs <abnormal_returns_daily.csv> <placebo_draws.csv> <repo dir>');
  process.exit(1);
}
function csv(path) {
  const [head, ...rows] = readFileSync(path, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  return rows.map((line) => {
    const out = [], re = /("([^"]*)"|[^,]*)(,|$)/g;
    let m;
    while ((m = re.exec(line)) && out.length < cols.length) { out.push(m[2] ?? m[1]); if (m[3] === '') break; }
    return Object.fromEntries(cols.map((c, i) => [c, out[i]]));
  });
}
const CORE = [
  ['E2', 'Referendum announced', '30 Oct 2023'],
  ['E3', 'Assembly reverses', '2 Nov 2023'],
  ['E6', 'Court ruling (day 0) and closure order (day +1)', '28 Nov 2023'],
  ['F3', 'Audit finds the mine broadly compliant', '19 Jun 2026'],
  ['F6', 'Closure recommended', '30 Sep 2026'],
];
const ar = {};
for (const r of csv(arFile)) ((ar[r.ticker] ||= {})[r.event_id] ||= {})[Number(r.rel)] = Number(r.ar);

// 1. CAR paths
const firms = [['FM.TO', 'First Quantum'], ['FNV.TO', 'Franco-Nevada']];
const days = Array.from({ length: 21 }, (_, i) => i - 10);
const carPaths = {
  _source: 'abnormal_returns_daily.csv from 02_event_study.R: daily log abnormal returns, market model with home index and copper, estimated on days -250 to -30.',
  days,
  events: CORE.map(([id, label, date]) => ({ id, label, date })),
  firms: firms.map(([ticker, name]) => ({
    ticker, name,
    ar: Object.fromEntries(CORE.map(([id]) => [id, days.map((d) => ar[ticker]?.[id]?.[d] ?? null)])),
  })),
};
writeFileSync('src/data/cobre-panama/car-paths.json', JSON.stringify(carPaths));

// 2. Placebo
const group = {};
for (const r of csv(`${repo}/companies.csv`)) {
  let g = r.group;
  if (g === 'rival miner') g = Number(r.latam_share || 0) > 0.5 ? 'rival miner, Latin America' : 'rival miner, other';
  group[r.ticker_yahoo] = g;
}
const excluded = new Set(csv(`${repo}/exclusions.csv`).map((r) => `${r.ticker}|${r.event_id}`));
const draws = {};
for (const r of csv(plFile)) (draws[r.group] ||= []).push(Number(r.car));
const GROUPS = [
  ['owner', 'Owner (First Quantum)'],
  ['stream holder', 'Stream holder (Franco-Nevada)'],
  ['rival miner, Latin America', 'Rival miners, Latin America'],
  ['rival miner, other', 'Rival miners, other'],
  ['merchant smelter', 'Merchant smelters'],
  ['integrated smelter', 'Integrated smelters'],
];
const placebo = {
  _source: 'placebo_draws.csv from 03_robustness.R (639 dates without Cobre Panamá news) and the group mean of firm log CARs over [0, +1] on each core event, excluding the pairs in exclusions.csv.',
  events: CORE.map(([id, label]) => ({ id, label })),
  groups: GROUPS.map(([key, label]) => {
    const firmsIn = Object.keys(group).filter((t) => group[t] === key);
    const real = {};
    for (const [id] of CORE) {
      const cars = firmsIn.filter((t) => ar[t]?.[id] && !excluded.has(`${t}|${id}`)).map((t) => (ar[t][id][0] ?? 0) + (ar[t][id][1] ?? 0));
      if (cars.length) real[id] = { car: cars.reduce((a, b) => a + b, 0) / cars.length, n: cars.length };
    }
    return { key, label, draws: (draws[key] || []).map((x) => Math.round(x * 1e6) / 1e6), real };
  }),
};
writeFileSync('src/data/cobre-panama/placebo.json', JSON.stringify(placebo));
console.log(`car-paths.json: ${firms.length} firms x ${CORE.length} events; placebo.json: ${placebo.groups.map((g) => `${g.key} ${g.draws.length}`).join(', ')}`);
