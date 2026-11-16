// Converts a draft (.docx, or .pdf as plain text) into Markdown for a paper page, keeping the wording.
//   node scripts/import-draft.mjs <draft.docx|draft.pdf> <paper-slug>
// Headings move down one level (Word's Heading 1 becomes a section H2 under the paper title).
// Writes drafts/<paper-slug>/<file>.md for review; nothing is published until the text is moved
// into src/content/papers/<paper-slug>.mdx. Word footnotes become [^n] sidenotes, images go to
// public/papers/<slug>/media/. Characters MDX would read as code ({ } < >) are escaped.
// .docx goes through pandoc (headings, lists, tables, footnotes). pandoc cannot read PDF, so a .pdf
// goes through pdftotext and comes out as plain paragraphs: headings need to be marked by hand.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const [file, slug] = process.argv.slice(2);
if (!file || !slug || !existsSync(file)) {
  console.error('usage: node scripts/import-draft.mjs <draft.docx|draft.pdf> <paper-slug>');
  process.exit(1);
}
const ext = extname(file).toLowerCase();
let md;
if (ext === '.docx') {
  const media = join('public', 'papers', slug, 'media');
  md = execFileSync('pandoc', ['-f', 'docx', '-t', 'gfm+footnotes', '--wrap=none', '--shift-heading-level-by=1', `--extract-media=${media}`, file], { encoding: 'utf8', maxBuffer: 64 << 20 });
  md = md.replaceAll(`${media}/`, `/papers/${slug}/media/`);
} else if (ext === '.pdf') {
  md = execFileSync('pdftotext', ['-layout', '-nopgbrk', file, '-'], { encoding: 'utf8', maxBuffer: 64 << 20 })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/([^\n])\n(?=[^\n])/g, '$1 ') // join wrapped lines into paragraphs
    .replace(/ {2,}/g, ' ');
} else {
  console.error('Only .docx and .pdf are supported.');
  process.exit(1);
}
// MDX reads { } as expressions and < as JSX: escape them in prose
md = md.replace(/\\</g, '&lt;').replace(/([{}])/g, '\\$1').replace(/<(?!\/?(sup|sub|br)\b)/g, '&lt;');
// pandoc writes Word's curly quotes as straight ASCII already in gfm; normalise any that remain
md = md.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

const outDir = join('drafts', slug);
mkdirSync(outDir, { recursive: true });
const out = join(outDir, basename(file, ext) + '.md');
writeFileSync(out, `<!-- Imported from ${basename(file)} on ${new Date().toISOString().slice(0, 10)}. Wording unchanged. Review, then move into src/content/papers/${slug}.mdx. -->\n\n${md}`);
console.log(`Wrote ${out} (${md.split(/\s+/).length} words).`);
