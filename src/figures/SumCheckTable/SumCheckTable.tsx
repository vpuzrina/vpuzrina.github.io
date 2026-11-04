// Synthetic digitized table with live row and column checks against printed totals.
// Every data cell is an input; edit one and the checks recompute. Server-rendered first.
import { useMemo, useState } from 'preact/hooks';
import { check, type Table } from './checks';
import './sum-check.css';

type Props = Table & { rows: string[]; cols: string[]; id: string };

const MINUS = '−';
const signed = (d: number) => (d > 0 ? `+${d}` : d < 0 ? `${MINUS}${-d}` : '0');

export default function SumCheckTable({ rows, cols, typed: initial, printedRowTotals, printedColTotals, printedGrandTotal, id }: Props) {
  const [typed, setTyped] = useState<number[][]>(() => initial.map((r) => [...r]));
  const [raw, setRaw] = useState<string[][]>(() => initial.map((r) => r.map(String)));
  const r = useMemo(
    () => check({ typed, printedRowTotals, printedColTotals, printedGrandTotal }),
    [typed, printedRowTotals, printedColTotals, printedGrandTotal]
  );
  const dirty = typed.some((row, i) => row.some((v, j) => v !== initial[i][j]));

  function edit(i: number, j: number, s: string) {
    const v = /^\s*\d+\s*$/.test(s) ? parseInt(s, 10) : NaN;
    setRaw((p) => p.map((row, a) => (a === i ? row.map((c, b) => (b === j ? s : c)) : row)));
    setTyped((p) => p.map((row, a) => (a === i ? row.map((c, b) => (b === j ? v : c)) : row)));
  }
  function reset() {
    setTyped(initial.map((x) => [...x]));
    setRaw(initial.map((x) => x.map(String)));
  }

  const status =
    r.failing === 0
      ? `All ${r.total} checks pass.`
      : r.suspect
        ? `${r.failing} of ${r.total} checks fail: the ${rows[r.suspect[0]]} row and the ${cols[r.suspect[1]]} column are both off by ${signed(r.rowDiff[r.suspect[0]])}. The likely error is the cell where they cross.`
        : `${r.failing} of ${r.total} checks fail.${r.rowDiff.some((d) => !Number.isFinite(d)) ? ' A cell is empty or not a whole number.' : ''}`;

  return (
    <div class="sct">
      <p class="sct-hint mono" aria-hidden="true">table scrolls sideways →</p>
      <section class="sct-scroll" aria-label="Synthetic table, scrolls sideways on small screens" tabIndex={0}>
        <table>
          <caption class="visually-hidden">Synthetic deaths by district and month, with printed totals and checks</caption>
          <thead>
            <tr>
              <th scope="col"><span class="visually-hidden">District</span></th>
              {cols.map((c) => <th scope="col">{c}</th>)}
              <th scope="col" class="tot">printed total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((name, i) => {
              const bad = r.rowDiff[i] !== 0;
              return (
                <tr>
                  <th scope="row">{name}</th>
                  {cols.map((c, j) => {
                    const sus = r.suspect && r.suspect[0] === i && r.suspect[1] === j;
                    const nan = !Number.isFinite(typed[i][j]);
                    return (
                      <td class={sus || nan ? 'cell flag' : 'cell'}>
                        <input
                          id={`${id}-${i}-${j}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          spellcheck={false}
                          aria-label={`${name}, ${c}`}
                          aria-invalid={sus || nan ? 'true' : undefined}
                          value={raw[i][j]}
                          onInput={(e) => edit(i, j, (e.currentTarget as HTMLInputElement).value)}
                        />
                      </td>
                    );
                  })}
                  <td class={bad ? 'tot flag' : 'tot ok'}>
                    {printedRowTotals[i]}
                    <span class="sum">{bad ? (Number.isFinite(r.rowSums[i]) ? `Σ ${r.rowSums[i]}` : 'Σ ?') : 'ok'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" class="tot">printed total</th>
              {cols.map((_, j) => {
                const bad = r.colDiff[j] !== 0;
                return (
                  <td class={bad ? 'tot flag' : 'tot ok'}>
                    {printedColTotals[j]}
                    <span class="sum">{bad ? (Number.isFinite(r.colSums[j]) ? `Σ ${r.colSums[j]}` : 'Σ ?') : 'ok'}</span>
                  </td>
                );
              })}
              <td class={r.grandDiff !== 0 ? 'tot flag' : 'tot ok'}>
                {printedGrandTotal}
                <span class="sum">{r.grandDiff !== 0 ? 'Σ ≠' : 'ok'}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
      <p class="sct-status mono" aria-live="polite">
        {status}
        {dirty && (
          <button type="button" class="sct-reset mono" onClick={reset}>reset</button>
        )}
      </p>
    </div>
  );
}
