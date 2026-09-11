/* layout.mjs — the page shell both sites share.
   Content fragments in content/ are page bodies only; everything structural
   (head, header, nav, footer) is generated here so the two sites can never
   drift apart on the parts that should stay identical. */

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const gr0ssWordmark = (className = 'wordmark') =>
  `<span class="${className}">gr<span class="${className}__zero">0</span>ss tech</span>`;

const navHtml = (nav, currentHref) =>
  nav
    .map(({ href, label }) => {
      const current = href === currentHref ? ' aria-current="page"' : '';
      return `<a href="${href}"${current}>${escapeHtml(label)}</a>`;
    })
    .join('\n        ');

const headerHtml = (site, currentHref) => {
  const brand =
    site.key === 'gr0ss-tech'
      ? gr0ssWordmark()
      : `<img src="assets/img/phd-icon-32.png" width="32" height="32" alt="" /><span>Poison Hotdogs</span>`;

  return `  <header class="siteHeader">
    <div class="wrap siteHeader__inner">
      <a class="brandLink" href="index.html">${brand}</a>
      <nav class="nav" aria-label="Main">
        ${navHtml(site.nav, currentHref)}
      </nav>
    </div>
  </header>`;
};

const footerHtml = (site, config) => {
  const links = site.footerLinks
    .map(({ href, label, external }) => {
      const rel = external ? ' rel="noopener"' : '';
      return `<li><a href="${href}"${rel}>${escapeHtml(label)}</a></li>`;
    })
    .join('\n        ');

  const contact = config.contactEmailIsPlaceholder
    ? `<p>Contact: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>
        <span class="tag tag--soon">placeholder inbox</span></p>`
    : `<p>Contact: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>`;

  return `  <footer class="siteFooter">
    <div class="wrap">
      <ul class="siteFooter__links">
        ${links}
      </ul>
      ${contact}
      <p>&copy; ${config.year} ${gr0ssWordmark()}. Games for small humans.</p>
    </div>
  </footer>`;
};

/**
 * Build one complete HTML document.
 * @param {object} options
 * @param {object} options.site   site definition from build.mjs
 * @param {object} options.config resolved site.config.json plus derived values
 * @param {object} options.page   { file, title, description, body, ogImage }
 */
export function renderPage({ site, config, page }) {
  const title =
    page.file === 'index.html' ? page.title : `${page.title} — ${site.title}`;
  const canonical = `${site.baseUrl.replace(/\/$/, '')}/${page.file === 'index.html' ? '' : page.file}`;
  const ogImage = `${site.baseUrl.replace(/\/$/, '')}/assets/img/${page.ogImage || site.ogImage}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta name="theme-color" content="${site.themeColor}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtml(site.title)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(page.description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="assets/img/${site.favicon}" />
  <link rel="apple-touch-icon" href="assets/img/${site.appleIcon}" />
  <link rel="stylesheet" href="assets/site.css" />
</head>
<body class="site site--${escapeHtml(site.key)}">
  <a class="skip" href="#main">Skip to content</a>
${headerHtml(site, page.file)}
  <main id="main">
${page.body.trimEnd()}
  </main>
${footerHtml(site, config)}
</body>
</html>
`;
}

export { gr0ssWordmark, escapeHtml };
