# Domain hookup — ready to run the moment a domain is registered

Registrar-agnostic. Works whether the domain is bought at **Cloudflare
Registrar** or **Porkbun**, and whether the sites are hosted on **Cloudflare
Pages** or **GitHub Pages**.

**Division of labour.** Gavin registers the domain and signs into the host
account. That is the whole list. Everything below — DNS records, host config,
HTTPS, the `CNAME` file, rebuilding both sites against the new URLs,
redeploying, and wiring the support address — is mine. Payment and account
signup are the only things off-limits to me.

> **One caveat, stated up front.** This session has no outbound network access,
> so nothing here was verified live. The Cloudflare Pages steps need no
> hardcoded IPs and cannot go stale. The four GitHub Pages IPs below are the
> long-standing published set — confirm them against GitHub's current "Managing
> a custom domain" doc at setup time before trusting them. Availability of any
> domain is likewise unverified; the registrar confirms that at checkout.

---

## Path A — Cloudflare Pages (recommended)

Fewest moving parts, and if the domain is also registered at Cloudflare the DNS
is already in the right account.

### A1. Apex domain (`gr0sstech.com`)

**If DNS is at Cloudflare** — do not hand-write a record. In the Pages project:
**Custom domains → Set up a domain →** enter the apex. Cloudflare creates the
record itself and flattens the CNAME at the apex (plain DNS cannot put a CNAME
on a bare domain; this is Cloudflare doing the work for you).

**If DNS is at Porkbun** — add:

| Type | Host | Value | TTL |
|---|---|---|---|
| `ALIAS` | `@` | `gr0sstech.pages.dev` | 600 |
| `CNAME` | `www` | `gr0sstech.pages.dev` | 600 |

Porkbun's `ALIAS` is what makes the bare domain work. A plain `CNAME` on `@` is
invalid DNS and will silently misbehave.

### A2. HTTPS

Automatic. Cloudflare issues and renews the certificate once the domain
validates — usually a couple of minutes. Nothing to click, nothing to pay.

---

## Path B — GitHub Pages

Use this if the sites end up in GitHub repos instead.

### B1. Apex domain

| Type | Host | Value | TTL |
|---|---|---|---|
| `A` | `@` | `185.199.108.153` | 600 |
| `A` | `@` | `185.199.109.153` | 600 |
| `A` | `@` | `185.199.110.153` | 600 |
| `A` | `@` | `185.199.111.153` | 600 |
| `CNAME` | `www` | `<user>.github.io` | 600 |

Optionally add the IPv6 `AAAA` records (`2606:50c0:8000::153` through
`…8003::153`). Verify all of these against GitHub's current doc first.

### B2. The `CNAME` file

GitHub Pages needs a file literally named `CNAME` in the published root
containing the bare domain and nothing else. **The build generates this** — set
`customDomain` for the site in `site.config.json` and run
`node scripts/build.mjs`. Do not hand-create it; a hand-made file gets wiped by
the next build.

### B3. HTTPS

Repo → **Settings → Pages → Custom domain** → enter it → wait for the
certificate → tick **Enforce HTTPS**.

---

## What I do the moment the domain exists

1. Set `baseUrl` (and `customDomain` for GitHub Pages) in `site.config.json`.
2. `node scripts/build.mjs` — canonical tags, Open Graph URLs, `sitemap.xml`,
   `robots.txt` and the cross-links between the two sites all regenerate from
   that one value. The cross-site links stop rendering as plain text and become
   real links.
3. `node scripts/check.mjs` — confirms no placeholder domain survived.
4. Deploy, then verify the live URL serves over HTTPS with no mixed content.

DNS propagation is typically minutes, but allow up to 24h before calling
anything broken.

---

## Support email on the domain

Registering a domain does **not** give you a mailbox. Two free ways to get
`support@<domain>` working:

### Cloudflare Email Routing — free, recommended

Requires DNS at Cloudflare. **Email → Email Routing →** add `support@<domain>`
as a custom address and point it at any existing inbox. Cloudflare adds the MX
and SPF records automatically.

- **Cost:** $0, no mailbox to manage.
- **Catch:** it *forwards only*. Replies come from the destination Gmail unless
  you also configure Gmail's "Send mail as" with an SMTP relay — an extra
  15-minute step, worth doing before the address goes on a store listing so
  replies to parents look right.

### Porkbun email forwarding — free with the domain

Same idea, included with registration. Same forward-only caveat.

### Then

Set `contactEmail` in `site.config.json` to `support@<domain>`, flip
`contactEmailIsPlaceholder` to `false`, rebuild. The placeholder warning boxes
on Contact and Support disappear on their own, and the deliberately-bouncing
`TODO-support@gr0sstech.invalid` address is gone from both sites.

This replaces the Gmail plan in `DEPLOY.md` step 1 — a domain address is
strictly better on a store listing than `gr0sstech.support@gmail.com`. If no
domain is bought, the Gmail plan still stands.
