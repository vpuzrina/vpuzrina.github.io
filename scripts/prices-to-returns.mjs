// Converts daily closing prices to simple returns for the event-study figure.
//   node scripts/prices-to-returns.mjs prices.csv > src/data/cobre-panama/returns.csv
// Input header: date,firm_close,mkt_close (ISO dates). Rows are sorted by date; a day with a
// missing or non-positive price is dropped, and the return is taken from the previous valid day.
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/prices-to-returns.mjs prices.csv > returns.csv');
  process.exit(1);
}
const lines = readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const head = lines[0].split(',').map((h) => h.trim().toLowerCase());
const iD = head.indexOf('date'), iF = head.indexOf('firm_close'), iM = head.indexOf('mkt_close');
if (iD < 0 || iF < 0 || iM < 0) {
  console.error('prices.csv needs the columns date,firm_close,mkt_close');
  process.exit(1);
}
const rows = [];
let dropped = 0;
for (const line of lines.slice(1)) {
  const c = line.split(',');
  const f = c[iF]?.trim() ? Number(c[iF]) : NaN, m = c[iM]?.trim() ? Number(c[iM]) : NaN;
  if (!(f > 0) || !(m > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(c[iD]?.trim() ?? '')) { dropped++; continue; }
  rows.push({ date: c[iD].trim(), f, m });
}
rows.sort((a, b) => a.date.localeCompare(b.date));
const out = ['date,firm_ret,mkt_ret'];
for (let i = 1; i < rows.length; i++) {
  out.push(`${rows[i].date},${(rows[i].f / rows[i - 1].f - 1).toFixed(8)},${(rows[i].m / rows[i - 1].m - 1).toFixed(8)}`);
}
process.stdout.write(out.join('\n') + '\n');
console.error(`${out.length - 1} returns written${dropped ? `, ${dropped} rows dropped for missing or bad prices` : ''}.`);
