import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePaper from './src/lib/rehype/paper.mjs';

// Production: https://vpuzrina.github.io (root). Preview: SITE_BASE=/site-preview PREVIEW=1,
// served from the vpuzrina/site-preview repo with noindex on every page.
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site: 'https://vpuzrina.github.io',
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  // unified so the paper plugins run on MDX: KaTeX at build time (no client JS), then rehypePaper
  // (TODO removal, status notes, abstract, sidenotes, citations). smartypants off keeps straight quotes.
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, { output: 'htmlAndMathml' }], rehypePaper], smartypants: false }),
  },
  integrations: [mdx(), preact(), sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
  devToolbar: { enabled: false },
});
