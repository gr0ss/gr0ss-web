# Deploying the two sites

**Nothing is live.** No domain has been bought, no hosting account created, no
DNS touched. Both sites are built and sitting in `dist/`, waiting on decisions
only Gavin can make.

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

## Part 2 — publishing (GitHub Pages)

Recommended because Gavin already has the GitHub account and it costs nothing.
Each site is a separate repo so each can have its own domain later.

```bash
# once per site, from D:\Projects\gr0ss-web
gh repo create gr0ss-tech-site --public
git -C dist/gr0ss-tech init
git -C dist/gr0ss-tech add .
git -C dist/gr0ss-tech commit -m "publish gr0ss tech site"
git -C dist/gr0ss-tech remote add origin https://github.com/<user>/gr0ss-tech-site.git
git -C dist/gr0ss-tech push -u origin main
```

Then in the repo: **Settings → Pages → Source: Deploy from a branch → `main`
→ `/ (root)` → Save.** Live in a few minutes at
`https://<user>.github.io/gr0ss-tech-site/`.

Repeat for `dist/poison-hotdogs`.

`.nojekyll` is already generated in each folder so GitHub serves the files
untouched.

**Updating later:** edit `content/`, run `node scripts/build.mjs`, commit and
push `dist/<site>` again. Same URL forever.

### Custom domain (only if step 2 picked one)

1. Add a `CNAME` file containing the bare domain to the site's repo root.
2. At the registrar, point the apex A records at GitHub's four Pages IPs and
   `www` at `<user>.github.io`.
3. Repo → Settings → Pages → Custom domain → enter it → tick **Enforce HTTPS**
   once the certificate is issued.
4. Set `baseUrl` in `site.config.json`, rebuild, push.

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

- No accounts created, no domains bought, no DNS changed, no credentials entered.
- Nothing published anywhere.
- No forum backend. The forum page is a clearly-marked phase-2 placeholder that
  collects nothing.
- No paid image generation. Every image is cut from art the game already ships.
