// Row, column and grand-total checks for a digitized table against its printed totals.
export type Table = { typed: number[][]; printedRowTotals: number[]; printedColTotals: number[]; printedGrandTotal: number };

export type CheckResult = {
  rowSums: number[];
  colSums: number[];
  rowDiff: number[]; // computed − printed
  colDiff: number[];
  grandDiff: number; // printed row totals vs printed grand total
  failing: number;
  total: number;
  suspect: [number, number] | null; // the one cell where a failing row meets a failing column with the same gap
};

export function check(t: Table): CheckResult {
  const rowSums = t.typed.map((r) => r.reduce((a, b) => a + b, 0));
  const colSums = t.printedColTotals.map((_, j) => t.typed.reduce((a, r) => a + r[j], 0));
  const rowDiff = rowSums.map((s, i) => s - t.printedRowTotals[i]);
  const colDiff = colSums.map((s, j) => s - t.printedColTotals[j]);
  const grandDiff = t.printedRowTotals.reduce((a, b) => a + b, 0) - t.printedGrandTotal;
  const bad = (d: number) => !Number.isFinite(d) || d !== 0;
  const badRows = rowDiff.flatMap((d, i) => (bad(d) ? [i] : []));
  const badCols = colDiff.flatMap((d, j) => (bad(d) ? [j] : []));
  const suspect =
    badRows.length === 1 && badCols.length === 1 && rowDiff[badRows[0]] === colDiff[badCols[0]]
      ? ([badRows[0], badCols[0]] as [number, number])
      : null;
  return {
    rowSums, colSums, rowDiff, colDiff, grandDiff, suspect,
    failing: badRows.length + badCols.length + (grandDiff !== 0 ? 1 : 0),
    total: rowDiff.length + colDiff.length + 1,
  };
}
