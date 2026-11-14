// Prefixes site paths with the deploy base ('/' in production, '/site-preview/' on the preview).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (path: string) => (/^(https?:|mailto:|#)/.test(path) ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`);

export const buildDate = new Date();
export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Removes [TODO: ...] markers (and the space around them) from public text.
export const stripTodo = (s: string) => s.replace(/\s*\[TODO[^\]]*\]\s*/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
export const isTodoOnly = (s: string) => stripTodo(s) === '';
