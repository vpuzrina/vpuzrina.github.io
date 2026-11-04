// Wraps "[TODO: ...]" in paper text with <mark class="todo">, so open facts stay visible in MDX.
export default function rehypeTodo() {
  const re = /(\[TODO[^\]]*\])/;
  function walk(node) {
    if (!node.children) return;
    // merge adjacent text nodes first, so a marker split across nodes is still found
    const merged = [];
    for (const c of node.children) {
      const last = merged[merged.length - 1];
      if (c.type === 'text' && last && last.type === 'text') last.value += c.value;
      else merged.push(c.type === 'text' ? { ...c } : c);
    }
    const out = [];
    for (const child of merged) {
      if (child.type === 'text' && re.test(child.value)) {
        for (const part of child.value.split(re)) {
          if (!part) continue;
          out.push(part.startsWith('[TODO')
            ? { type: 'element', tagName: 'mark', properties: { className: ['todo'] }, children: [{ type: 'text', value: part }] }
            : { type: 'text', value: part });
        }
      } else {
        walk(child);
        out.push(child);
      }
    }
    node.children = out;
  }
  return (tree) => walk(tree);
}
