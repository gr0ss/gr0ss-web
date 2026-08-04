/* serve.mjs — zero-dependency static preview server for dist/.
   Run: node scripts/serve.mjs [port]
   Serves both sites side by side so cross-links can be checked locally:
     http://localhost:4173/gr0ss-tech/
     http://localhost:4173/poison-hotdogs/
   This is a preview tool only. Production hosting serves each dist/<site>
   folder at its own domain root. */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2]) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  if (url === '/') {
    const links = fs
      .readdirSync(root)
      .map((site) => `<li><a href="/${site}/">${site}</a></li>`)
      .join('');
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    res.end(`<!doctype html><meta charset="utf-8"><title>gr0ss-web preview</title><ul>${links}</ul>`);
    return;
  }

  let filePath = path.join(root, url);
  // block anything that escapes dist/
  if (!filePath.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    const site = url.split('/')[1];
    const notFound = path.join(root, site, '404.html');
    const body = fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found';
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    res.end(body);
    return;
  }

  res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
});

server.listen(port, () => {
  console.log(`gr0ss-web preview on http://localhost:${port}/`);
});
