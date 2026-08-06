#!/usr/bin/env node
/**
 * Mock server for kata-table examples.
 * Serves the repository root so that relative paths like
 * ../../kata-table.js resolve correctly.
 *
 * Usage: node kata-table/examples/server.js
 *        PORT=3000 node kata-table/examples/server.js
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const NORMALIZED_ROOT = path.normalize(ROOT);

const ALL_ROWS = [
  { name: 'Yoshua Nakashima', role: 'Maintainer' },
  { name: 'Kata UI', role: 'Prototype' },
  { name: 'Alice', role: 'Developer' },
  { name: 'Bob', role: 'Designer' },
  { name: 'Charlie', role: 'Tester' },
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rowsToHtml(rows) {
  return rows
    .map(r => `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.role)}</td></tr>`)
    .join('\n');
}

function tableToHtml(view) {
  const templateId = view === 'maintainers'
    ? 'maintainers-table-template'
    : 'all-users-table-template';
  return `<kata-table template="${templateId}"></kata-table>`;
}

const server = http.createServer((req, res) => {
  let urlPath;
  let queryString = '';
  try {
    const parts = req.url.split('?');
    urlPath = decodeURIComponent(parts[0]);
    queryString = parts[1] || '';
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  if (urlPath === '/api/rows') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(rowsToHtml(ALL_ROWS));
    return;
  }

  if (urlPath === '/api/maintainers') {
    const maintainers = ALL_ROWS.filter(r => r.role === 'Maintainer');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(rowsToHtml(maintainers));
    return;
  }

  if (urlPath === '/api/table') {
    const params = new URLSearchParams(queryString);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(tableToHtml(params.get('view')));
    return;
  }

  if (urlPath === '/api/search') {
    const params = new URLSearchParams(queryString);
    const q = (params.get('q') || '').toLowerCase();
    const filtered = ALL_ROWS.filter(
      r => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q),
    );
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(rowsToHtml(filtered));
    return;
  }

  if (urlPath === '/') {
    urlPath = '/kata-table/examples/static/index.html';
  }

  const filePath = path.normalize(path.join(NORMALIZED_ROOT, urlPath));

  // Prevent path traversal outside ROOT
  if (!filePath.startsWith(NORMALIZED_ROOT + path.sep) && filePath !== NORMALIZED_ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Not Found' : 'Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`kata-table examples server running at http://localhost:${PORT}/`);
});
