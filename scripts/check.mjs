/* check.mjs — pre-deploy sanity check on dist/.
   Run: node scripts/check.mjs
   Catches the failure modes that only show up after deploy: a link or image
   pointing at a file that was never built, an unreplaced {{token}}, or a
   placeholder that was supposed to be filled in before go-live.
   Exits non-zero on a hard error; placeholders are reported as warnings. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));

const errors = [];
const warnings = [];

const isExternal = (href) => /^(https?:|mailto:|tel:|#)/.test(href);

for (const site of fs.readdirSync(distDir)) {
  const siteDir = path.join(distDir, site);
  if (!fs.statSync(siteDir).isDirectory()) continue;

  const pages = fs.readdirSync(siteDir).filter((f) => f.endsWith('.html'));
  if (!pages.length) errors.push(`${site}: no HTML pages built`);

  for (const page of pages) {
    const file = path.join(siteDir, page);
    const html = fs.readFileSync(file, 'utf8');
    const where = `${site}/${page}`;

    if (html.charCodeAt(0) === 0xfeff) errors.push(`${where}: file starts with a UTF-8 BOM`);

    const leftoverTokens = html.match(/\{\{\w+\}\}/g);
    if (leftoverTokens) errors.push(`${where}: unreplaced tokens ${[...new Set(leftoverTokens)].join(', ')}`);

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (isExternal(target)) continue;
      const resolved = path.join(siteDir, target.split('#')[0]);
      if (!fs.existsSync(resolved)) errors.push(`${where}: dead reference -> ${target}`);
    }

    if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${where}: missing or empty <title>`);
    if (!/name="description" content="[^"]+"/.test(html)) errors.push(`${where}: missing meta description`);
    if (!/<h1[ >]/.test(html)) errors.push(`${where}: no <h1>`);

    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    for (const img of imgs) {
      if (!/\balt="/.test(img)) errors.push(`${where}: <img> without alt: ${img.slice(0, 70)}`);
    }

    if (html.includes('TODO-')) warnings.push(`${where}: contains a TODO- placeholder`);
    if (html.includes('[CONFIRM')) warnings.push(`${where}: contains a [CONFIRM ...] legal placeholder`);
  }

  // Shipping an image no page references is dead weight on a mobile-first site.
  const imgDir = path.join(siteDir, 'assets', 'img');
  if (fs.existsSync(imgDir)) {
    const referenced = new Set();
    for (const page of pages) {
      const html = fs.readFileSync(path.join(siteDir, page), 'utf8');
      for (const m of html.matchAll(/assets\/img\/([\w.-]+)/g)) referenced.add(m[1]);
    }
    const css = fs.readFileSync(path.join(siteDir, 'assets', 'site.css'), 'utf8');
    for (const m of css.matchAll(/url\(["']?img\/([\w.-]+)/g)) referenced.add(m[1]);
    for (const image of fs.readdirSync(imgDir)) {
      if (!referenced.has(image)) warnings.push(`${site}: ships unused image assets/img/${image}`);
    }
  }

  for (const required of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'assets/site.css']) {
    if (!fs.existsSync(path.join(siteDir, required))) errors.push(`${site}: missing ${required}`);
  }
}

if (config.contactEmailIsPlaceholder) warnings.push(`config: contactEmail is still ${config.contactEmail}`);
if (!config.playStoreUrl) warnings.push('config: playStoreUrl is empty (Play button renders as "Coming soon")');
for (const key of ['legalEntity']) {
  if (String(config[key] || '').includes('[CONFIRM')) {
    warnings.push(`config: ${key} still needs a confirmed public value`);
  }
}
for (const [key, site] of Object.entries(config.sites)) {
  if (site.baseUrl.includes('TODO-')) warnings.push(`config: ${key} baseUrl is still a placeholder domain`);
}

for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const error of errors) console.log(`ERROR ${error}`);

console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
if (warnings.length && !errors.length) {
  console.log('Warnings are the go-live blockers listed in DEPLOY.md, not build failures.');
}
process.exit(errors.length ? 1 : 0);
