import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

// Renders content.js into index.html at build time (and on every dev request),
// so the page ships as static HTML and all copy stays in one file.
const load = async (file) => await import(`${pathToFileURL(resolve(file)).href}?t=${Date.now()}`);

function contentPlugin() {
  return {
    name: 'render-content',
    async transformIndexHtml(html, ctx) {
      const content = (await load('src/content.js')).default;
      const { renderPage, renderHead, collectTodos } = await load('src/render.js');
      const todos = collectTodos(content);
      // The About photo appears only once public/<about.photo> exists
      const photo = existsSync(resolve('public', content.about.photo || 'photo.jpg'));
      let out = html.replace('<!--head-->', renderHead(content)).replace('<!--app-->', renderPage(content, { photo }));
      if (todos.length) {
        // Hidden TODOs: always in the terminal; in the browser console only on the dev server
        if (!ctx.server) console.log(`\n\x1b[33mHidden TODOs (not shown on the page):\x1b[0m\n  - ${todos.join('\n  - ')}\n`);
        else
          out = out.replace(
            '</body>',
            `<script>console.groupCollapsed('%cHidden TODOs: ${todos.length}','color:#E5B567');${JSON.stringify(todos)}.forEach(function(t){console.log(t)});console.groupEnd();</script>\n</body>`
          );
      }
      return out;
    },
    handleHotUpdate({ file, server }) {
      if (/src[\\/](content|render)\.js$/.test(file)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

// `npm run build:single`: one index.html that works from file:// with no server.
// Inlines the favicon and the CV. From file:// a sibling PDF is not reliable, so download links get
// a blob URL. The normal build links to public/resume.pdf as a real file.
function offlinePlugin() {
  return {
    name: 'offline-extras',
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        const content = (await load('src/content.js')).default;
        const svg = readFileSync('public/favicon.svg').toString('base64');
        const pdf = readFileSync(resolve('public', content.person.cv)).toString('base64');
        const cvScript = `<script>(function(){var b="${pdf}";function go(){var s=atob(b),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);var url=URL.createObjectURL(new Blob([u],{type:"application/pdf"}));document.querySelectorAll("a[download]").forEach(function(a){a.href=url;a.setAttribute("download",${JSON.stringify(
          content.person.cvDownloadName
        )})})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",go):go()})();</script>`;
        let out = html
          .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml;base64,${svg}" type="image/svg+xml">`)
          .replace(/<link rel="apple-touch-icon"[^>]*>\s*/, '')
          .replace('</body>', `${cvScript}\n</body>`);
        // A relative OG image cannot resolve from file://; keep it only when an absolute URL is set
        if (!content.meta.url) out = out.replace(/\s*<meta property="og:image[^>]*>/g, '');
        return out;
      },
    },
  };
}

export default defineConfig(async ({ mode }) => {
  const single = mode === 'single';
  const content = (await load('src/content.js')).default;
  return {
    // Chart code (and its data) is only bundled while the featured project is visible
    define: { __HAS_CHARTS__: JSON.stringify(Boolean(content.featuredProject?.visible)) },
    // User site on https://vpuzrina.github.io is served from the root. The single file uses
    // relative paths so it also opens from disk.
    base: single ? './' : '/',
    plugins: [contentPlugin(), ...(single ? [viteSingleFile(), offlinePlugin()] : [])],
    build: {
      target: 'es2020',
      cssMinify: true,
      ...(single ? { outDir: 'dist-single', copyPublicDir: false } : {}),
    },
  };
});
