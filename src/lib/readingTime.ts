// Word count and reading time from a paper's MDX source, at build time.
// Counts prose only: imports, JSX tags, math, TODO markers and Markdown syntax are left out.
export function readingStats(body: string) {
  const text = body
    .replace(/^import .*$/gm, '')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[TODO[^\]]*\]/g, ' ')
    .replace(/\[\^\d+\]:?/g, ' ')
    .replace(/\[@[^\]]+\]/g, ' cite ')
    .replace(/^Status:.*$/gm, '')
    .replace(/[#*_`|>-]+/g, ' ');
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,–-]*/gu) || []).length;
  const minutes = Math.max(1, Math.round(words / 230));
  return { words, minutes, label: `${words.toLocaleString('en-US')} words · ${minutes} min` };
}
