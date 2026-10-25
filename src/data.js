// Chart data is bundled at build time (not fetched), so the page also works when opened from file://.
const files = import.meta.glob('./data/*.json', { import: 'default' });

export const getData = (name) => {
  const load = files[`./data/${name}`];
  if (!load) return Promise.reject(new Error(`Missing data file: src/data/${name}`));
  return load();
};
