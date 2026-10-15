# gr0ss-web

The two public websites for gr0ss tech, as static HTML. No framework or build
dependencies. The Poison Hotdogs homepage includes a small progressive-enhancement
script for its carousel, outfit picker, game-mode tabs, and motion.

| Site | Lives in | What it is |
|---|---|---|
| **gr0ss tech** | `dist/gr0ss-tech/` | Company landing, games list, contact. Hosts the privacy policy and the public changelog. |
| **Stay Away From Poison Hotdogs** | `dist/poison-hotdogs/` | Game landing, support, privacy policy, and plain-English release notes. |

`dist/` is committed. A host only has to serve one of those folders - there is
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
art-src/             raw art (gitignored) - source for processArt.ps1
content/             page bodies (plain HTML fragments)
  gr0ss-tech/          pages unique to the company site
  poison-hotdogs/      pages unique to the game site
  shared/              the privacy policy and changelogs, built into BOTH sites
assets-src/
  css/base.css         shared reset, layout, components
  css/theme-*.css      per-site colours, fonts and shapes
  css/experience-*.css interactive homepage presentation
  img/                 web-sized art cut from the game repo
  js/                  small dependency-free homepage interaction scripts
scripts/
  layout.mjs           the page shell: head, header, nav, footer
  build.mjs            the site manifest and the generator
  check.mjs            pre-deploy validation
  serve.mjs            local preview server
  processArt.ps1       art-src/ -> web-sized assets-src/img/
dist/                  generated output - do not hand-edit
```

The privacy policy exists once, in `content/shared/`, and is built into both
sites. That is the point of the generator: a legal document duplicated by hand
across two sites eventually says two different things.

`{{tokens}}` in content fragments (`{{contactEmail}}`, `{{legalEntity}}`,
`{{privacyLastUpdated}}`, …) are filled from `site.config.json` at build time.
`scripts/check.mjs` fails the build if one is left unresolved.

## Editing

- **Change copy** - edit the fragment in `content/`, run `build.mjs`.
- **Change a placeholder value** - edit `site.config.json`, run `build.mjs`.
- **Add a page** - add the fragment, then add an entry to that site's `pages`
  array in `scripts/build.mjs`. Nav, sitemap, and title all follow from it.
- **Add an image** - put it in `assets-src/img/`, list it in that site's
  `images` array. Only listed images are copied, so neither site ships the
  other's art.

## Art

Almost everything in `assets-src/img/` is cut from the shipping game art in
`D:\Projects\Unity\PoisonHotDogs\PoisonHotDogs`, resized for the web by
`scripts/processArt.ps1` from raw copies in the gitignored `art-src/`. The
script's header records where every piece comes from. In particular:

- `outfit-art-*.png` / `outfit-thumb-*.png` are the game's own full-body
  outfit paintings (`Assets/Resources/ShopItems/`), the exact sprite the My
  Crew pedestal shows, not crops of the shop cards.
- `mode-art-*.jpg` are the game's Pick a Game tiles (`Assets/Resources/ModeTiles/`).
- `capture-*-v2.webp` are **genuine captures of the game running** on a
  development build, cropped 22px at the bottom to remove Unity's
  "Development Build" watermark. `shot-04-boss-sneeze-machine.jpg` is a frame
  from the game's own Play Mode QA sweep (2026-09-07, v1.0.0).

Three pieces have no game source and were AI-generated during the 2026-09
redesign, in the style of the game's own title art: the horizontal header
lockup (`phd-header-lockup-v2.png`), the outfit-stage pedestal
(`outfit-pedestal-v2.png`) and its backdrop (`outfit-stage-backdrop-v2.jpg`).
The hero illustration (`phd-hero-arcade-v2.webp` and its mobile crop) and the
arrow button are from the same hand-off. The social-share cards and the gr0ss
tech mark are composed from game art plus system fonts.

## Deploying

See [DEPLOY.md](DEPLOY.md). Short version: nothing is live, no accounts were
created, and the steps that need Gavin are listed there in order.
