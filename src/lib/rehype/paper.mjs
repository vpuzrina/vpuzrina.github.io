// Rehype plugin for paper pages (MDX in src/content/papers/).
//  1. [TODO: ...] markers are removed from the public HTML; a paragraph left empty is dropped.
//     The full list is kept in todo-report.md by scripts/todo-report.mjs.
//  2. A paragraph that starts with "Status: " becomes a neutral status note.
//  3. Reader layout only (frontmatter reader: true):
//     - the first paragraph is wrapped in an Abstract block;
//     - GFM footnotes ([^1]) become sidenotes: margin notes on wide screens, tap-to-expand on phones;
//     - citations written [@key] or [@a; @b] link to the paper's reference list
//       (src/data/<slug>/references.yaml), rendered as (Author Year).
import { readFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import YAML from 'yaml';

const TODO = /\[TODO[^\]]*\]/g;
const CITE = /\[@([\w-]+(?:\s*;\s*@[\w-]+)*)\]/g;

const el = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const txt = (value) => ({ type: 'text', value });
const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));

export function citeWho(ref) {
  const last = ref.authors.map((a) => a.split(',')[0].trim());
  return last.length === 1 ? last[0] : last.length === 2 ? `${last[0]} and ${last[1]}` : `${last[0]} et al.`;
}
// parenthetical (Author, Year) and narrative Author (Year)
export const citeLabel = (ref) => `${citeWho(ref)}, ${ref.year}`;
export const citeNarrative = (ref) => `${citeWho(ref)} (${ref.year})`;

export function readRefs(path) {
  if (!existsSync(path)) return { references: [], sources: [] };
  const y = YAML.parse(readFileSync(path, 'utf8')) || [];
  return Array.isArray(y) ? { references: y, sources: [] } : { references: y.references || [], sources: y.sources || [] };
}

function loadRefs(file) {
  const slug = basename(file.path || '', '.mdx');
  return Object.fromEntries(readRefs(`src/data/${slug}/references.yaml`).references.map((r) => [r.id, r]));
}

function mergeText(node) {
  const out = [];
  for (const c of node.children) {
    const last = out[out.length - 1];
    if (c.type === 'text' && last && last.type === 'text') last.value += c.value;
    else out.push(c.type === 'text' ? { ...c } : c);
  }
  node.children = out;
}

export default function rehypePaper() {
  return (tree, file) => {
    const fm = file.data?.astro?.frontmatter || {};
    const reader = fm.reader === true;
    const refs = reader ? loadRefs(file) : {};

    // 1 + citations: walk text
    (function walk(node) {
      if (!node.children) return;
      mergeText(node);
      const out = [];
      for (const c of node.children) {
        if (c.type !== 'text') { walk(c); out.push(c); continue; }
        let v = c.value.replace(TODO, '');
        if (reader && /(^|[\s(])@[a-z]/i.test(v) && !CITE.test(v)) {
          CITE.lastIndex = 0;
          let last = 0;
          for (const m of v.matchAll(/(^|[\s(])@([a-z][\w-]*)/gi)) {
            const r = refs[m[2]];
            if (!r) continue;
            const at = m.index + m[1].length;
            if (at > last) out.push(txt(v.slice(last, at)));
            out.push(el('a', { href: `#ref-${m[2]}`, className: ['cite'] }, [txt(citeNarrative(r))]));
            last = at + 1 + m[2].length;
          }
          if (last < v.length) out.push(txt(v.slice(last)));
          continue;
        }
        CITE.lastIndex = 0;
        if (!reader || !CITE.test(v)) { if (v) out.push({ ...c, value: v }); continue; }
        CITE.lastIndex = 0;
        let last = 0;
        for (const m of v.matchAll(CITE)) {
          if (m.index > last) out.push(txt(v.slice(last, m.index)));
          const keys = m[1].split(';').map((k) => k.trim().replace(/^@/, ''));
          out.push(txt('('));
          keys.forEach((k, i) => {
            if (i) out.push(txt('; '));
            const r = refs[k];
            if (!r) throw new Error(`${file.path}: citation @${k} is not in references.yaml`);
            out.push(el('a', { href: `#ref-${k}`, className: ['cite'] }, [txt(citeLabel(r))]));
          });
          out.push(txt(')'));
          last = m.index + m[0].length;
        }
        if (last < v.length) out.push(txt(v.slice(last)));
      }
      node.children = out;
    })(tree);

    // drop paragraphs emptied by TODO removal; turn "Status: ..." paragraphs into notes
    (function clean(node) {
      if (!node.children) return;
      node.children = node.children.filter((c) => {
        if (c.type === 'element' && c.tagName === 'p') {
          const t = textOf(c).trim();
          if (!t && !(c.children || []).some((k) => k.type === 'element')) return false;
          const first = c.children[0];
          if (first && first.type === 'text' && /^\s*Status:\s*/.test(first.value)) {
            first.value = first.value.replace(/^\s*Status:\s*/, '');
            c.properties = { ...c.properties, className: ['status-note'] };
            c.children.unshift(el('span', { className: ['status-label'] }, [txt('Status')]));
          }
        }
        clean(c);
        return true;
      });
    })(tree);

    // Display equations can scroll sideways on a phone, so they must be reachable by keyboard
    (function eq(n) {
      if (n.type === 'element' && (n.properties?.className || []).includes('katex-display')) {
        n.properties.tabIndex = 0;
        n.properties.role = 'group';
        n.properties.ariaLabel = 'Equation';
        return;
      }
      (n.children || []).forEach(eq);
    })(tree);

    if (!reader) return;

    // Markdown tables scroll sideways on a phone: wrap each in a focusable, labelled section
    tree.children = tree.children.flatMap((c, k, all) => {
      if (!(c.type === 'element' && c.tagName === 'table')) return [c];
      let label = 'Table';
      for (let j = k - 1; j >= 0; j--) {
        const prev = all[j];
        if (prev.type === 'text' && !prev.value.trim()) continue;
        const isLabel =
          (prev.type === 'element' && (prev.properties?.className || []).includes('table-label')) ||
          (prev.type === 'mdxJsxFlowElement' && (prev.attributes || []).some((a) => (a.name === 'class' || a.name === 'className') && String(a.value).includes('table-label')));
        if (isLabel) label = textOf(prev).trim();
        break;
      }
      return [el('section', { className: ['table-wrap'], tabIndex: 0, ariaLabel: `${label} (scrolls sideways on small screens)` }, [c])];
    });

    // Abstract: the first top-level paragraph
    const i = tree.children.findIndex((c) => c.type === 'element' && c.tagName === 'p');
    if (i >= 0) {
      const p = tree.children[i];
      tree.children[i] = el('section', { className: ['abstract'], ariaLabel: 'Abstract' }, [
        el('p', { className: ['abstract-label'] }, [txt('Abstract')]),
        p,
      ]);
    }

    // Sidenotes from GFM footnotes
    const notes = {};
    const fnSection = (function find(n) {
      if (n.type === 'element' && n.tagName === 'section' && n.properties && 'dataFootnotes' in n.properties) return n;
      for (const c of n.children || []) { const f = find(c); if (f) return f; }
      return null;
    })(tree);
    if (fnSection) {
      (function collect(n) {
        if (n.type === 'element' && n.tagName === 'li' && String(n.properties.id || '').startsWith('user-content-fn-')) {
          const id = String(n.properties.id).replace('user-content-fn-', '');
          const parts = [];
          for (const c of n.children) {
            if (c.type === 'element' && c.tagName === 'p') parts.push(...c.children.filter((k) => !(k.type === 'element' && k.properties && 'dataFootnoteBackref' in k.properties)));
          }
          notes[id] = parts;
          return;
        }
        (n.children || []).forEach(collect);
      })(fnSection);
      (function remove(n) {
        if (!n.children) return;
        n.children = n.children.filter((c) => c !== fnSection);
        n.children.forEach(remove);
      })(tree);
      let count = 0;
      (function replace(n) {
        if (!n.children) return;
        n.children = n.children.map((c) => {
          const a = c.type === 'element' && c.tagName === 'sup' && c.children[0];
          if (a && a.tagName === 'a' && a.properties && 'dataFootnoteRef' in a.properties) {
            const id = String(a.properties.href).replace('#user-content-fn-', '');
            const n2 = ++count;
            const sid = `sn-${id}`;
            return el('span', { className: ['sn'] }, [
              el('label', { htmlFor: sid, className: ['sn-ref'] }, [txt(String(n2))]),
              el('input', { type: 'checkbox', id: sid, className: ['sn-toggle'], ariaLabel: `Show note ${n2}` }),
              el('span', { className: ['sidenote'], role: 'note' }, [el('span', { className: ['sn-num'] }, [txt(`${n2} `)]), ...(notes[id] || [])]),
            ]);
          }
          replace(c);
          return c;
        });
      })(tree);
    }
  };
}
