# Deploying the two sites

**Both sites are LIVE as of 2026-08-31** on free GitHub Pages:

- gr0ss tech: <https://gr0ss.github.io/gr0ss-web/gr0ss-tech/>
- Poison Hotdogs: <https://gr0ss.github.io/gr0ss-web/poison-hotdogs/>
- Privacy policy (the URL used for the Play Console):
  <https://gr0ss.github.io/gr0ss-web/poison-hotdogs/privacy.html>

Hosting: single public repo <https://github.com/gr0ss/gr0ss-web> (full source,
history secret-scanned before publishing), with a `gh-pages` branch that
mirrors `dist/` — Pages serves it from the branch root. No domain has been
bought and no DNS touched; the Domain Decision card is still open and a custom
domain can be layered on later without changing the hosting.

Run `node scripts/check.mjs` at any point — every warning it prints is an item
on this page.

---

## Part 1 — the four decisions (Gavin only)

Nothing below can happen until these are answered. They are listed in the order
they unblock things.

### 1. The support inbox — ✅ RESOLVED 2026-08-21

`contactEmail` is now the real, monitored `gr0sstech.support@gmail.com` (one
shared inbox for everything). `privacyEmail` points at the same address. Keep
the game repo's Play Store policy documentation aligned with this public inbox.

The placeholder warning boxes on Contact and Support have been removed from
`content/` and both sites rebuilt. If a domain is bought later,
`support@<domain>` supersedes the Gmail via free forwarding — see
[docs/DOMAIN-HOOKUP.md](docs/DOMAIN-HOOKUP.md).

### 2. The domains

`site.config.json` → `sites.<site>.baseUrl` currently points at the live GitHub
Pages URLs. A custom domain is optional; `sites.<site>.customDomain` remains
empty until one is chosen.

**This is now a decision card on the dashboard** (Launch / Brand → Domain
Decision) with per-option pros/cons — pick there rather than here. Summary,
cheapest first, using verified 2026 `.com` pricing:

| Option | URLs | Cost |
|---|---|---|
| Free subdomains, no purchase | `https://gr0sstech.pages.dev/` and `https://poisonhotdogs.pages.dev/` | **$0 forever** |
| One domain, game on a path | `https://gr0sstech.com/` and `https://gr0sstech.com/poison-hotdogs/` | ~$10.46/yr |
| Two domains | `https://gr0sstech.com/` and `https://poisonhotdogs.com/` | ~$20.92/yr |

A `.com` is genuinely ~$10-11/yr at Cloudflare Registrar (at cost, flat
renewal) or Porkbun (~$11.08/yr, flat) — **not the ~$2 you may have seen**;
those are year-one teasers that spike on renewal. The free path is not a
downgrade you get stuck with: a real `.com` can be pointed at the same free
hosting later at no extra cost.

Once a domain exists, the exact DNS records, HTTPS steps and the
`support@<domain>` email setup are already written up in
[docs/DOMAIN-HOOKUP.md](docs/DOMAIN-HOOKUP.md).

The privacy policy URL goes into the Play Console and into the app, and moving
it later means re-submitting. Worth deciding once.

If a custom domain is chosen, set both `baseUrl` values and rebuild — canonical
tags, `sitemap.xml`, `robots.txt`, the social-share URLs, and the links between
the two sites all follow from them. The existing GitHub Pages URLs are real, so
cross-site links already work today.

### 3. Public contact boundary — ✅ DECIDED 2026-09-11

The operator is `Gavin John Gross`, doing business as gr0ss tech. The website
publishes the monitored privacy email and does **not** publish a residential
mailing address or personal telephone number. This is a deliberate owner
decision, not an unfinished placeholder; do not add either field later without
explicit permission.

Known tradeoff: the FTC's COPPA guidance says a child-directed operator's
online notice should include a name, address, telephone number, and email. The
email-only contact block intentionally does not satisfy that particular list.
Google Play acceptance and legal compliance are separate questions.

### 4. Ads: did they ship?

The advertising section describes one optional contextual ad via AdMob. If the
submitted build ships **without** ads, that section must be swapped back to the
2026-07-19 "no ads" wording (`git log` on the game repo's
`docs/PlayStore/PRIVACY-POLICY.md` has it). Edit
`content/shared/privacy-poison-hotdogs.html` and rebuild; both sites update
together.

---

## Part 2 — publishing (GitHub Pages) — DONE 2026-08-31

What actually shipped (differs from the original per-site-repo plan): ONE
public repo, `github.com/gr0ss/gr0ss-web`, holding the full source. A
`gh-pages` branch mirrors `dist/` (both site folders side by side, plus a root
`.nojekyll`), and Pages serves that branch from `/ (root)`. One repo keeps the
source and the deploy in the same history, and still supports a custom domain
later — either both sites under one domain on paths, or split into per-site
repos then if two domains are ever bought.

**Updating the live sites:** edit `content/`, then:

```bash
node scripts/build.mjs           # regenerate dist/
node scripts/check.mjs           # validate
git add -A && git commit
git push origin master
git push origin $(git subtree split --prefix dist master):refs/heads/gh-pages --force
```

The `--force` on the last line is fine: `gh-pages` is a generated mirror of
`dist/`, never edited by hand — `master` is the history that matters.

### Custom domain (only if step 2 picked one)

1. Set `customDomain` in `site.config.json` (the build emits the `CNAME` into
   `dist/`), set `baseUrl`, rebuild, push per the update flow above.
2. At the registrar, point the apex A records at GitHub's four Pages IPs and
   `www` at `gr0ss.github.io`.
3. Repo → Settings → Pages → Custom domain → enter it → tick **Enforce HTTPS**
   once the certificate is issued.

### If not GitHub Pages

Any static host works — Cloudflare Pages, Netlify, or plain nginx. The build
output has no server-side requirements. Point the host at `dist/<site>` and
serve `404.html` as the not-found page.

---

## Part 3 — after go-live

1. Paste the privacy URL into **Play Console → App content → Privacy policy**
   and into `[PRIVACY-POLICY-URL]` in the game repo's
   `docs/PlayStore/LISTING-COPY.md`.
2. Wire the in-app Parents' Corner privacy button to the same URL (it has been
   waiting on this URL since the 2026-07-19 readiness sweep).
3. Once the game is live, set `playStoreUrl` in `site.config.json` and rebuild
   — the "Coming soon to Google Play" chip becomes a real "Get it on Google
   Play" button, and the changelog entries lose their "not released yet" tags.
4. Add the launch entry to `content/shared/changelog-poison-hotdogs.html`.

---

## What Claude did not do, on purpose

- No accounts created, no domains bought, and no DNS changed as part of the
  original site launch.
- Residential address and personal telephone details are deliberately omitted
  from the public policy (see Part 1 §3); no placeholders remain.
- No forum backend. The old noindex placeholder page remains available only by
  direct URL and is no longer promoted in the site navigation.
- No paid image generation. Every image is cut from art the game already ships.
