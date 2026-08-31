# Deploying the two sites

**Both sites are LIVE as of 2026-08-31** on free GitHub Pages:

- gr0ss tech: <https://gr0ss.github.io/gr0ss-web/gr0ss-tech/>
- Poison Hotdogs: <https://gr0ss.github.io/gr0ss-web/poison-hotdogs/>
- Privacy policy (the Play Console URL once the legal fields below are filled):
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
shared inbox for everything). `privacyEmail` points at the same address — the
per-config note records that the game repo's Play Store policy doc still lists
`gavinjgross@gmail.com` and should be aligned at the next listing edit.

The placeholder warning boxes on Contact and Support have been removed from
`content/` and both sites rebuilt. If a domain is bought later,
`support@<domain>` supersedes the Gmail via free forwarding — see
[docs/DOMAIN-HOOKUP.md](docs/DOMAIN-HOOKUP.md).

### 2. The domains

`site.config.json` → `sites.<site>.baseUrl` are both placeholders.

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

Whatever is chosen, set both `baseUrl` values and rebuild — canonical tags,
`sitemap.xml`, `robots.txt`, the social-share URLs, and the links between the
two sites all follow from them. Until a real domain is set, each site renders
the other's name as plain text instead of a link that would 404.

### 3. The two legal fields

`legalEntity` and `businessAddress` still read `[CONFIRM ...]`, matching the
vault's `Legal-Entity.md`, which lists both as unconfirmed. They appear on the
privacy policy, which is a legal surface — **do not guess them.**

The policy page carries a visible "not final" banner until they are filled in.
That banner is the go-live gate: the sites can be published before the game
ships, but the policy URL should not be pasted into the Play Console while the
banner is there.

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

- No accounts created, no domains bought, no DNS changed, no credentials
  entered. (The 2026-08-31 deploy used the GitHub credential already stored in
  Git Credential Manager from previous PoisonHotDogs pushes — nothing new was
  created or entered.)
- The two `[CONFIRM ...]` legal fields were not guessed — the policy page still
  carries its "not final" banner until Gavin fills them (see Part 1 §3).
- No forum backend. The forum page is a clearly-marked phase-2 placeholder that
  collects nothing.
- No paid image generation. Every image is cut from art the game already ships.
