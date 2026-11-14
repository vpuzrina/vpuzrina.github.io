// Papers in Contents order, with reading stats and last-commit dates, shared by the home page,
// the footer and the paper pages.
import { getCollection } from 'astro:content';
import { readingStats } from './readingTime';
import { gitDate } from './gitDate';

export async function papers() {
  const all = (await getCollection('papers')).sort((a, b) => a.data.order - b.data.order);
  return all.map((p) => ({
    entry: p,
    slug: p.id,
    stats: readingStats(p.body ?? ''),
    updated: gitDate(`src/content/papers/${p.id}.mdx`, p.data.updated),
  }));
}
