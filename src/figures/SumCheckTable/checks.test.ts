import { describe, it, expect } from 'vitest';
import { check } from './checks';
import data from '../../data/imperial-mortality/synthetic.json';

describe('sum checks on the synthetic table', () => {
  it('the typed table fails one row and one column by the same gap and points at the bad cell', () => {
    const r = check(data);
    expect(r.failing).toBe(2);
    expect(r.total).toBe(12);
    expect(r.rowDiff[3]).toBe(-36);
    expect(r.colDiff[2]).toBe(-36);
    expect(r.suspect).toEqual([data.error.row, data.error.col]);
  });
  it('passes every check once the cell is corrected', () => {
    const typed = data.typed.map((r) => [...r]);
    typed[data.error.row][data.error.col] = data.error.printed;
    const r = check({ ...data, typed });
    expect(r.failing).toBe(0);
    expect(r.suspect).toBeNull();
  });
  it('flags a non-numeric cell', () => {
    const typed = data.typed.map((r) => [...r]);
    typed[0][0] = NaN;
    expect(check({ ...data, typed }).failing).toBeGreaterThan(0);
  });
});
