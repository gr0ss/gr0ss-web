# gr0ss-web

The two public websites for gr0ss tech, as static HTML. No framework, no build
dependencies, no runtime JavaScript.

| Site | Lives in | What it is |
|---|---|---|
| **gr0ss tech** | `dist/gr0ss-tech/` | Company landing, games list, contact. Hosts the privacy policy and the public changelog. |
| **Stay Away From Poison Hotdogs** | `dist/poison-hotdogs/` | Game landing, support, privacy policy, what's new, and a phase-2 forum placeholder. |

`dist/` is committed. A host only has to serve one of those folders — there is
nothing to install and nothing to compile at deploy time.

## Commands

```bash
node scripts/build.mjs     # regenerate dist/ from content/ + site.config.json
node scripts/check.mjs     # dead links, missing alt text, leftover placeholders
node scripts/serve.mjs     # preview both sites at http://localhost:4173/
```

There is no `npm install`. Node 18+ is the only requirement.

## How it fits together

```
site.config.json     every placeholder that needs a real value before go-live
art-src/             raw art (gitignored) — source for processArt.ps1
content/             page bodies (plain HTML fragments)
  gr0ss-tech/          pages unique to the company site
  poison-hotdogs/      pages unique to the game site
  shared/              the privacy policy and changelogs, built into BOTH sites
assets-src/
  css/base.css         shared reset, layout, components
  css/theme-*.css      per-site colours, fonts and shapes
  img/                 web-sized art cut from the game repo
scripts/
  layout.mjs           the page shell: head, header, nav, footer
  build.mjs            the site manifest and the generator
  check.mjs            pre-deploy validation
  serve.mjs            local preview server
  processArt.ps1       art-src/ -> web-sized assets-src/img/
dist/                  generated output — do not hand-edit
```

The privacy policy exists once, in `content/shared/`, and is built into both
sites. That is the point of the generator: a legal document duplicated by hand
across two sites eventually says two different things.

`{{tokens}}` in content fragments (`{{contactEmail}}`, `{{legalEntity}}`,
`{{privacyLastUpdated}}`, …) are filled from `site.config.json` at build time.
`scripts/check.mjs` fails the build if one is left unresolved.

## Editing

- **Change copy** — edit the fragment in `content/`, run `build.mjs`.
- **Change a placeholder value** — edit `site.config.json`, run `build.mjs`.
- **Add a page** — add the fragment, then add an entry to that site's `pages`
  array in `scripts/build.mjs`. Nav, sitemap, and title all follow from it.
- **Add an image** — put it in `assets-src/img/`, list it in that site's
  `images` array. Only listed images are copied, so neither site ships the
  other's art.

## Art

Everything in `assets-src/img/` is cut from the shipping game art and the Play
Store listing assets in `D:\Projects\Unity\PoisonHotDogs\PoisonHotDogs`, resized
for the web. Nothing was generated from scratch and no paid generation was used.
The two social-share cards and the gr0ss tech mark are composed from that same
art plus system fonts.

The eight `shot-*.jpg` files are **genuine captures of the game running**, not
mockups. They are frames from the game's own Play Mode QA sweep (the same
source the Play listing screenshots are cut from) — real screens at phone
aspect, but captured in the editor rather than off a handset. The current set
is the 2026-09-07 sweep at v1.0.0. The raw sources live in the gitignored
`art-src/`; `scripts/processArt.ps1` regenerates the web-sized versions from
them and records which sweep frame each one is.

## Deploying

See [DEPLOY.md](DEPLOY.md). Short version: nothing is live, no accounts were
created, and the steps that need Gavin are listed there in order.
