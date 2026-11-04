// Prefixes site paths with the deploy base ('/' in production, '/site-preview/' on the preview).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (path: string) => (/^(https?:|mailto:|#)/.test(path) ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`);

export const buildDate = new Date();
export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Splits a string into plain text and [TODO: ...] markers so the markers can be highlighted.
export function todoParts(s: string): { todo: boolean; text: string }[] {
  return s.split(/(\[TODO[^\]]*\])/).filter(Boolean).map((text) => ({ todo: text.startsWith('[TODO'), text }));
}
