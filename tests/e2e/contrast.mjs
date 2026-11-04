// WCAG contrast for every text/background token pair used on the site, both themes.
const L = (hex) => {
  const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const themes = {
  dark: { bg: '0f1113', surface: '16191c', text: 'e6e3dc', muted: '9a968d', accent: 'c47a4a', rule: '2a2e33', todoBg: '2e2716', todoText: 'e9d9a6' },
  light: { bg: 'f7f5f0', surface: 'efece5', text: '1a1a1a', muted: '6b675f', accent: '9c5629', rule: 'ddd8ce', todoBg: 'f3e6b8', todoText: '3d3110' },
};
let fail = 0;
for (const [name, t] of Object.entries(themes)) {
  const pairs = [
    ['text', 'bg', 4.5], ['text', 'surface', 4.5], ['muted', 'bg', 4.5], ['muted', 'surface', 4.5],
    ['accent', 'bg', 4.5], ['accent', 'surface', 4.5], ['todoText', 'todoBg', 4.5],
    ['muted', 'bg', 3, 'non-text: chart lines, handles'], ['accent', 'bg', 3, 'non-text: focus ring, day-0 rule'],
  ];
  for (const [fg, bgk, min, note] of pairs) {
    const r = ratio(t[fg], t[bgk]);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`${name.padEnd(5)} ${fg.padEnd(8)} on ${bgk.padEnd(7)} ${r.toFixed(2).padStart(5)}:1  ${ok ? 'pass' : 'FAIL'} (AA ${min})${note ? '  ' + note : ''}`);
  }
}
process.exit(fail ? 1 : 0);
