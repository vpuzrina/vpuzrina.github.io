// Turns a CSV of daily returns into a Series indexed by trading day relative to the event.
// Expected header: date,firm_ret,mkt_ret  (ISO dates, simple returns: 0.01 = 1%).
import type { Series } from './eventStudy';

export type ReturnRow = { date: string; firm: number; mkt: number };

export function parseReturnsCsv(text: string): ReturnRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  if (lines.length === 0) return [];
  const head = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const iD = head.indexOf('date'), iF = head.indexOf('firm_ret'), iM = head.indexOf('mkt_ret');
  if (iD < 0 || iF < 0 || iM < 0) throw new Error('returns.csv needs the columns date,firm_ret,mkt_ret');
  const rows: ReturnRow[] = [];
  for (const [n, line] of lines.slice(1).entries()) {
    const c = line.split(',');
    // Number('') is 0, so empty cells are checked first: a missing return must not become a 0% return
    const num = (v: string | undefined) => (v === undefined || v.trim() === '' ? NaN : Number(v));
    const firm = num(c[iF]), mkt = num(c[iM]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c[iD]?.trim() ?? '')) throw new Error(`returns.csv line ${n + 2}: bad date "${c[iD]}"`);
    if (!Number.isFinite(firm) || !Number.isFinite(mkt)) throw new Error(`returns.csv line ${n + 2}: missing or non-numeric return`);
    rows.push({ date: c[iD].trim(), firm, mkt });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

/** Day 0 is the first trading date on or after eventDate. */
export function toSeries(rows: ReturnRow[], eventDate: string): Series | null {
  const i0 = rows.findIndex((r) => r.date >= eventDate);
  if (i0 < 0) return null;
  return {
    day: rows.map((_, i) => i - i0),
    firm: rows.map((r) => r.firm),
    mkt: rows.map((r) => r.mkt),
  };
}
