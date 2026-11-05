# vpuzrina.github.io

Personal site of Varvara Puzrina: a home page that works as a table of contents, four short working papers,
an interactive event study, /about and a one-page CV. Astro + MDX, Preact islands for the figures,
plain CSS, no third-party requests.

## Where to edit

| What | File |
|---|---|
| Name, contact, availability line, home-page experience | `src/data/site.ts` |
| /about and /cv (roles, bullets, coursework, skills); `cv:` holds the shorter CV bullets | `src/data/about.ts` |
| Paper text, title, context line, summary, provenance | `src/content/papers/*.mdx` (frontmatter + Markdown) |
| Cobre Panamá returns for the figure | `src/data/cobre-panama/returns.csv` + `config.json` (`eventDate`) |
| Synthetic table on the mortality page | `src/data/imperial-mortality/synthetic.json` |
| Colours, type sizes, spacing | `src/styles/tokens.css` |

Write unknown facts as `[TODO: ...]`. They show highlighted on the page, and the main-site deploy refuses
to publish while any are left.

Cobre Panamá data: put daily simple returns in `returns.csv` (`date,firm_ret,mkt_ret`) and the event date in
`config.json`. From prices: `node scripts/prices-to-returns.mjs prices.csv > src/data/cobre-panama/returns.csv`
(columns `date,firm_close,mkt_close`). Until both are filled, the figure shows "Data coming soon".

## Commands

```bash
npm install
npm run dev          # http://localhost:4321
npm test             # statistics and sum-check unit tests (vitest)
npm run build        # build, check copy and third-party resources, print the CV PDF, render OG images
npm run preview      # serve dist/ at http://localhost:4321
npm run check:all    # with preview running: tests, HTML validation, links, contrast, axe, network, keyboard
```

`npm run build` fails if a banned word from the writing rules appears, if a paragraph has more than one
em dash, if anything loads from another domain, or if the CV PDF runs past one page. `STRICT=1 npm run build`
also fails on any `[TODO]`.

## Deploy

- `main` → https://vpuzrina.github.io via `.github/workflows/deploy.yml` (strict build).
- `v2-papers` → https://vpuzrina.github.io/site-preview/, built by the workflow in
  [vpuzrina/site-preview](https://github.com/vpuzrina/site-preview) with `SITE_BASE=/site-preview PREVIEW=1`.

The CV PDF is printed from /cv by Chromium after every build (`scripts/postbuild.mjs`) and also served
as `/resume.pdf`, so older links keep working.
