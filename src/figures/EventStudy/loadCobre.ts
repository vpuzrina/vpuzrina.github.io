// Build-time loader for the Cobre Panamá returns. Returns null until the CSV and the event date are filled.
import { parseReturnsCsv, toSeries } from '../../lib/stats/returns';
import type { Series, Window } from '../../lib/stats/eventStudy';
import csv from '../../data/cobre-panama/returns.csv?raw';
import config from '../../data/cobre-panama/config.json';

export function loadCobre(): { series: Series; est: Window; evt: Window; firm: string; market: string } | null {
  if (!config.eventDate) return null;
  const rows = parseReturnsCsv(csv);
  if (rows.length < 60) return null;
  const series = toSeries(rows, config.eventDate);
  if (!series) return null;
  return { series, est: config.estimation as unknown as Window, evt: config.event as unknown as Window, firm: config.firm, market: config.market };
}
