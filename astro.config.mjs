import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeTodo from './src/lib/rehype/todo.mjs';

// Production: https://vpuzrina.github.io (root). Preview: SITE_BASE=/site-preview PREVIEW=1,
// served from the vpuzrina/site-preview repo with noindex on every page.
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site: 'https://vpuzrina.github.io',
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  // unified so the [TODO] highlighter runs on MDX; smartypants off keeps straight quotes and apostrophes
  markdown: { processor: unified({ rehypePlugins: [rehypeTodo], smartypants: false }) },
  integrations: [mdx(), preact(), sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
  devToolbar: { enabled: false },
});
