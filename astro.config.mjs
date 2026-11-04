import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';

// Production: https://vpuzrina.github.io (root). Preview: SITE_BASE=/site-preview PREVIEW=1,
// served from the vpuzrina/site-preview repo with noindex on every page.
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site: 'https://vpuzrina.github.io',
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [mdx(), preact()],
  devToolbar: { enabled: false },
});
