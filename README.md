# Varvara Puzrina: portfolio

A one-page portfolio built with Vite, vanilla JS and Chart.js. All page text lives in one file, so you can edit the copy without touching the layout.

## Edit the content

| What | Where |
|---|---|
| All page text (headline, roles, bullets, skills, contact) | `src/content.js` |
| Headline choice | `hero.headline` in `src/content.js` (0–3) |
| CV file | `public/resume.pdf` (visitors download it as `Varvara-Puzrina-CV.pdf`) |
| GitHub link | `person.github`. Footer and contact links stay hidden while it is empty |
| Yandex case study | `caseStudy` in `src/content.js` (findings and year stay hidden until filled) |
| Featured project (Cobre Panamá) | `featuredProject.visible` in `src/content.js`, plus `src/data/cobre.json` |
| Social preview image | `public/og.jpg` (1200×630) |
| Photo next to About | add `public/photo.jpg` (square works best); hidden while the file is missing |
| Colors and fonts | tokens at the top of `src/styles.css` (light default, dark via the header toggle or system setting) |

### Unfinished content is never shown

- Any field that contains `[TODO ...]` or `[FILL ...]` is hidden on the page: the date pill, the bullet, the findings block, a work-sample card. Replace the marker with real text and the element appears.
- The Work samples section appears only once at least one card has text (and a link, for the GitHub card).
- A `todos: [...]` array on an item is never rendered. Use it for notes to yourself.
- The full list of hidden TODOs prints in the terminal on every build, and in the browser console when you run `npm run dev`. It is not included in production builds.

### Charts only from real data

The site has no charts right now. The only chart in the code is the event-study chart in the featured project. It reads `src/data/cobre.json` and draws nothing while that file has `"placeholder": true`. To publish the project:

1. Put the real estimates in `src/data/cobre.json` (`labels`, `series`, `eventIndex`, `finding`, `headline`) and set `"placeholder": false`.
2. Fill `question`, `data`, `method` and `github` under `featuredProject`.
3. Set `featuredProject.visible: true`. The section and its "Projects" nav link appear together.

The hero "Research timeline" is drawn from the real start dates in `heroDashboard.timeline`, up to the month of the build.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173, reloads when content.js changes
npm run build     # production build into dist/
npm run preview   # serve dist/ at http://localhost:4173
npm run build:single  # one self-contained dist-single/index.html (see below)
```

### Single-file version

`npm run build:single` writes `dist-single/index.html`, one file of about 625 KB that holds all CSS, JS, fonts, data, the favicon and the CV. It works when opened straight from disk (`file://`) with no server and no internet, so it suits emailing or a USB stick. The "Download CV" buttons save the embedded PDF. The Open Graph image is left out of this version unless `meta.url` is set, because a relative image path cannot resolve from disk.

Requires Node 18 or newer.

## Deploy

### Option A: Vercel (simplest)

1. Push this folder to a GitHub repository.
2. On vercel.com choose **Add New → Project** and import the repository.
3. Vercel detects Vite. Keep the defaults (build `npm run build`, output `dist`) and click **Deploy**.
4. Copy the final URL into `meta.url` in `src/content.js` and push again, so link previews use the full image URL.

### Option B: GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.

1. Push this folder to a GitHub repository, on the `main` branch.
2. In the repository open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push any commit, or run the workflow by hand from the **Actions** tab. The site appears at `https://<username>.github.io/<repo>/`.
4. Put that URL into `meta.url` in `src/content.js`.

`vite.config.js` uses `base: './'`, so the same build works on a sub-path (Pages) and at the root (Vercel) without changes.

## How it is built

- `vite.config.js` contains a small plugin that renders `src/content.js` into static HTML at build time (`src/render.js`). The page is readable before any JavaScript runs, which helps first load and SEO.
- `src/main.js` handles scroll reveal, the active nav link, hero tilt, and lazy loading of the featured-project chart.
- `src/charts.js` sets up the featured-project chart. It loads only when that chart is on the page. Data is bundled from `src/data/` through `src/data.js`, not fetched, so edits to the JSON need a rebuild (the dev server picks them up live).
- No scroll animations: everything is visible on load. A print stylesheet produces a two-page light summary with links written out.
- Fonts (Manrope, Inter, JetBrains Mono) are self-hosted through Fontsource. The site makes no third-party requests.
