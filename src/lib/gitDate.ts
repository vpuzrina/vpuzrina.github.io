// Last-commit date of a file, from git, for the "updated" line in provenance.
// Falls back to the given date (or today) outside a git checkout. In a shallow CI clone every file
// shares the latest commit's date, so the deploy workflows fetch full history.
import { execFileSync } from 'node:child_process';

export function gitDate(file: string, fallback?: Date): Date {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { encoding: 'utf8' }).trim();
    if (out) return new Date(out);
  } catch {}
  return fallback ?? new Date();
}
