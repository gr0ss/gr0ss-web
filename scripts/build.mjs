/* build.mjs — generates dist/ for both static sites.
   Run: node scripts/build.mjs
   Everything in dist/ is committed and deployable as-is; a host only needs to
   serve the folder. There is no runtime dependency and no npm install. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from './layout.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...parts) => path.join(root, ...parts);

const config = JSON.parse(fs.readFileSync(p('site.config.json'), 'utf8'));
config.year = 2026;

/* ---------------------------------------------------------------- sites --- */

const sharedFooterLegal = [
  { href: 'privacy.html', label: 'Privacy policy' },
  { href: 'changelog.html', label: "What's new" },
];

const sites = [
  {
    key: 'gr0ss-tech',
    title: 'gr0ss tech',
    baseUrl: config.sites['gr0ss-tech'].baseUrl,
    themeColor: '#0e1116',
    theme: 'theme-gr0ss-tech.css',
    favicon: 'gr0ss-mark.svg',
    appleIcon: 'gr0ss-icon-180.png',
    ogImage: 'og-gr0ss-tech.png',
    nav: [
      { href: 'index.html', label: 'Home' },
      { href: 'games.html', label: 'Games' },
      { href: 'changelog.html', label: 'Changelog' },
      { href: 'privacy.html', label: 'Privacy' },
      { href: 'contact.html', label: 'Contact' },
    ],
    footerLinks: [
      { href: 'games.html', label: 'Games' },
      ...sharedFooterLegal,
      { href: 'contact.html', label: 'Contact' },
    ],
    images: [
      'gr0ss-mark.svg',
      'gr0ss-icon-180.png',
      'og-gr0ss-tech.png',
      'phd-hero-wide.jpg',
      'phd-icon-180.png',
    ],
    pages: [
      {
        file: 'index.html',
        source: 'gr0ss-tech/index.html',
        title: 'gr0ss tech — games for small humans',
        description: config.sites['gr0ss-tech'].description,
      },
      {
        file: 'games.html',
        source: 'gr0ss-tech/games.html',
        title: 'Games',
        description: 'Every game gr0ss tech has made or is making, and where each one stands.',
      },
      {
        file: 'changelog.html',
        source: 'shared/changelog-gr0ss-tech.html',
        title: 'Changelog',
        description: 'A public, plain-English record of what gr0ss tech shipped and when.',
      },
      {
        file: 'privacy.html',
        source: 'shared/privacy-poison-hotdogs.html',
        title: 'Privacy policy',
        description:
          'The privacy policy for Stay Away From Poison Hotdogs: what the game collects, why, and how to have it deleted.',
      },
      {
        file: 'contact.html',
        source: 'gr0ss-tech/contact.html',
        title: 'Contact',
        description: 'How to reach gr0ss tech about a game, a bug, a data request, or anything else.',
      },
      {
        file: '404.html',
        source: 'gr0ss-tech/404.html',
        title: 'Page not found',
        description: 'That page does not exist.',
        noIndex: true,
      },
    ],
  },

  {
    key: 'poison-hotdogs',
    title: 'Stay Away From Poison Hotdogs',
    baseUrl: config.sites['poison-hotdogs'].baseUrl,
    themeColor: '#1b1a2b',
    theme: 'theme-poison-hotdogs.css',
    favicon: 'phd-icon-32.png',
    appleIcon: 'phd-icon-180.png',
    ogImage: 'og-poison-hotdogs.png',
    nav: [
      { href: 'index.html', label: 'Home' },
      { href: 'changelog.html', label: "What's new" },
      { href: 'support.html', label: 'Support' },
      { href: 'privacy.html', label: 'Privacy' },
    ],
    footerLinks: [
      { href: 'support.html', label: 'Support' },
      ...sharedFooterLegal,
    ],
    images: [
      'phd-icon-32.png',
      'phd-icon-180.png',
      'phd-hero-wide.jpg',
      'og-poison-hotdogs.png',
      'rexy.png',
      'rexy-dizzy.webp',
      'world-swamp.webp',
      // The eight real in-game captures (2026-09-07 QA sweep of the game), in
      // the order the gallery shows them. Generated from art-src/ by
      // scripts/processArt.ps1, which documents where each frame came from.
      'shot-01-title-splash.jpg',
      'shot-02-pick-a-game.jpg',
      'shot-03-rotten-rescue-condiments.jpg',
      'shot-04-boss-sneeze-machine.jpg',
      'shot-05-abc-gameplay.jpg',
      'shot-06-world-map-stars.jpg',
      'shot-07-rescued-buddy.jpg',
      'shot-08-daily-treat.jpg',
    ],
    pages: [
      {
        file: 'index.html',
        source: 'poison-hotdogs/index.html',
        title: "Stay Away From Poison Hotdogs — don't eat the green ones!",
        description: config.sites['poison-hotdogs'].description,
      },
      {
        file: 'changelog.html',
        source: 'shared/changelog-poison-hotdogs.html',
        title: "What's new",
        description: 'Every update to Stay Away From Poison Hotdogs, in plain English.',
      },
      {
        file: 'support.html',
        source: 'poison-hotdogs/support.html',
        title: 'Support',
        description:
          'Get help with Stay Away From Poison Hotdogs: contact, common questions, purchases, and data deletion.',
      },
      {
        file: 'forum.html',
        source: 'poison-hotdogs/forum.html',
        title: 'Forum',
        description: 'The Poison Hotdogs community forum is planned for a later phase. It is not open yet.',
        noIndex: true,
      },
      {
        file: 'privacy.html',
        source: 'shared/privacy-poison-hotdogs.html',
        title: 'Privacy policy',
        description:
          'The privacy policy for Stay Away From Poison Hotdogs: what the game collects, why, and how to have it deleted.',
      },
      {
        file: '404.html',
        source: 'poison-hotdogs/404.html',
        title: 'Page not found',
        description: 'That page does not exist.',
        noIndex: true,
      },
    ],
  },
];

/* -------------------------------------------------------------- helpers --- */

/** A link to the *other* site. Until its domain is decided the URL is a
 *  placeholder, so render plain text rather than a link that 404s. */
function crossSiteLink(siteKey, label) {
  const url = config.sites[siteKey].baseUrl;
  if (!url || url.includes('TODO-')) return label;
  return `<a href="${url.replace(/\/$/, '')}/">${label}</a>`;
}

/** Replace every {{token}} in a fragment with its configured value. */
function applyTokens(html, site) {
  const tokens = {
    contactEmail: config.contactEmail,
    privacyEmail: config.privacyEmail,
    legalEntity: config.legalEntity,
    privacyLastUpdated: config.privacyLastUpdated,
    year: String(config.year),
    siteTitle: site.title,
    gr0ssTechLink: crossSiteLink(
      'gr0ss-tech',
      'gr<span class="wordmark__zero">0</span>ss tech'
    ),
    poisonHotdogsLink: crossSiteLink('poison-hotdogs', "the game's own site"),
  };

  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in tokens)) {
      throw new Error(`Unknown token ${match} in a content fragment.`);
    }
    return tokens[key];
  });
}

/** The Google Play button: a real link once the listing exists, a disabled
 *  "coming soon" chip until then. Generated so both states stay in sync. */
function playButton() {
  const glyph = `<svg class="playBtn__glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="#34a853" d="M6 4.5v39a2 2 0 0 0 1 1.7l21.3-21.2z"/>
        <path fill="#4285f4" d="M7 4.2a2 2 0 0 0-1 .3L28.3 24 35 17.3z"/>
        <path fill="#fbbc04" d="M35 17.3 28.3 24 35 30.7l7.6-4.3a2.7 2.7 0 0 0 0-4.8z"/>
        <path fill="#ea4335" d="M7 45.2a2 2 0 0 0 1 .3L35 30.7 28.3 24z"/>
      </svg>`;

  if (config.playStoreUrl) {
    return `<a class="playBtn" href="${config.playStoreUrl}" rel="noopener">
      ${glyph}
      <span class="playBtn__text"><small>Get it on</small><strong>Google Play</strong></span>
    </a>`;
  }

  return `<span class="playBtn" aria-disabled="true" role="link">
      ${glyph}
      <span class="playBtn__text"><small>Coming soon to</small><strong>Google Play</strong></span>
    </span>`;
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8'); // UTF-8, no BOM
}

/* ---------------------------------------------------------------- build --- */

function buildSite(site) {
  const outDir = p('dist', site.key);
  fs.rmSync(outDir, { recursive: true, force: true });

  // one stylesheet per site: shared base + the site's theme tokens
  const css = [
    fs.readFileSync(p('assets-src', 'css', 'base.css'), 'utf8'),
    fs.readFileSync(p('assets-src', 'css', site.theme), 'utf8'),
  ].join('\n');
  writeFile(path.join(outDir, 'assets', 'site.css'), css);

  for (const image of site.images) {
    const from = p('assets-src', 'img', image);
    if (!fs.existsSync(from)) throw new Error(`Missing image: ${from}`);
    fs.mkdirSync(path.join(outDir, 'assets', 'img'), { recursive: true });
    fs.copyFileSync(from, path.join(outDir, 'assets', 'img', image));
  }

  for (const page of site.pages) {
    const fragment = fs.readFileSync(p('content', page.source), 'utf8');
    const body = applyTokens(fragment, site).replace('<!--PLAY_BUTTON-->', playButton());
    let html = renderPage({ site, config, page: { ...page, body } });
    if (page.noIndex) {
      html = html.replace('<title>', '<meta name="robots" content="noindex" />\n  <title>');
    }
    writeFile(path.join(outDir, page.file), html);
  }

  // GitHub Pages: skip Jekyll so nothing is reinterpreted or dropped
  writeFile(path.join(outDir, '.nojekyll'), '');

  // GitHub Pages custom domain. The file must be named CNAME, sit in the
  // published root, and contain the bare domain and nothing else. Generated
  // rather than hand-made because a hand-made one is wiped by the next build.
  // Cloudflare Pages ignores it, so emitting it is harmless either way.
  const customDomain = config.sites[site.key].customDomain;
  if (customDomain && !customDomain.includes('TODO-')) {
    writeFile(path.join(outDir, 'CNAME'), `${customDomain.trim()}\n`);
  }

  const base = site.baseUrl.replace(/\/$/, '');
  writeFile(
    path.join(outDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`
  );

  const urls = site.pages
    .filter((page) => !page.noIndex)
    .map((page) => {
      const loc = `${base}/${page.file === 'index.html' ? '' : page.file}`;
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n');
  writeFile(
    path.join(outDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );

  const pageCount = site.pages.length;
  console.log(`built dist/${site.key}  (${pageCount} pages, ${site.images.length} images)`);
}

sites.forEach(buildSite);

if (config.contactEmailIsPlaceholder) {
  console.log(
    `\nTODO before go-live: contactEmail is still the placeholder ${config.contactEmail} — see DEPLOY.md.`
  );
}
if (!config.playStoreUrl) {
  console.log('TODO before go-live: playStoreUrl is empty — the Google Play button renders as "Coming soon".');
}
