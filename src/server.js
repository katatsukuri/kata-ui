#!/usr/bin/env node

import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_FILE = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = path.resolve(path.dirname(CURRENT_FILE), '..');
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;
const PUBLIC_ROOT_FILES = new Set([
  'architecture-manifest.json',
  'architecture.md',
  'component_architecture.md',
  'docs.css',
  'docs.html',
  'index.html',
  'LICENSE',
  'README.md',
]);
const PUBLIC_DIRECTORIES = new Set(['assets', 'src', 'theming']);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const ALL_ROWS = [
  { name: 'Yoshua Nakashima', role: 'Maintainer' },
  { name: 'Kata UI', role: 'Prototype' },
  { name: 'Alice', role: 'Developer' },
  { name: 'Bob', role: 'Designer' },
  { name: 'Charlie', role: 'Tester' },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rowsToHtml(rows) {
  return rows
    .map(({ name, role }) => `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(role)}</td></tr>`)
    .join('\n');
}

function tableToHtml(view) {
  const maintainers = view === 'maintainers';
  const heading = maintainers ? 'Maintainer' : 'Name';
  const endpoint = maintainers ? '/api/maintainers' : '/api/rows';
  return `<kata-table><table class="kata-table"><thead><tr><th scope="col">${heading}</th><th scope="col">Role</th></tr></thead><tbody hx-get="${endpoint}" hx-trigger="load" hx-target="this" hx-swap="innerHTML"></tbody></table></kata-table>`;
}

function send(response, statusCode, contentType, body, method = 'GET') {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(method === 'HEAD' ? undefined : body);
}

function resolveStaticPath(root, urlPath) {
  const relativePath = urlPath.replace(/^[/\\]+/, '') || 'index.html';
  const [topLevel] = relativePath.split(/[/\\]/);
  if (!PUBLIC_ROOT_FILES.has(relativePath) && !PUBLIC_DIRECTORIES.has(topLevel)) return null;

  const candidate = path.resolve(root, relativePath);
  const relative = path.relative(root, candidate);

  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return candidate;
}

async function serveStaticFile(request, response, root, urlPath) {
  let filePath = resolveStaticPath(root, urlPath);
  if (!filePath) {
    send(response, 403, 'text/plain; charset=utf-8', 'Forbidden', request.method);
    return;
  }

  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) filePath = path.join(filePath, 'index.html');
    const data = await fs.readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
    send(response, 200, contentType, data, request.method);
  } catch (error) {
    const statusCode = error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500;
    const message = statusCode === 404 ? 'Not Found' : 'Internal Server Error';
    send(response, statusCode, 'text/plain; charset=utf-8', message, request.method);
  }
}

async function handleRequest(request, response, root) {
  const method = request.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    send(response, 405, 'text/plain; charset=utf-8', 'Method Not Allowed', method);
    return;
  }

  let url;
  let urlPath;
  try {
    url = new URL(request.url ?? '/', 'http://127.0.0.1');
    urlPath = decodeURIComponent(url.pathname);
  } catch {
    send(response, 400, 'text/plain; charset=utf-8', 'Bad Request', method);
    return;
  }

  if (urlPath === '/api/rows') {
    send(response, 200, 'text/html; charset=utf-8', rowsToHtml(ALL_ROWS), method);
    return;
  }

  if (urlPath === '/api/maintainers') {
    send(
      response,
      200,
      'text/html; charset=utf-8',
      rowsToHtml(ALL_ROWS.filter(({ role }) => role === 'Maintainer')),
      method,
    );
    return;
  }

  if (urlPath === '/api/table') {
    send(response, 200, 'text/html; charset=utf-8', tableToHtml(url.searchParams.get('view')), method);
    return;
  }

  if (urlPath === '/api/search') {
    const query = (url.searchParams.get('q') ?? '').toLowerCase();
    const rows = ALL_ROWS.filter(({ name, role }) => (
      name.toLowerCase().includes(query) || role.toLowerCase().includes(query)
    ));
    send(response, 200, 'text/html; charset=utf-8', rowsToHtml(rows), method);
    return;
  }

  await serveStaticFile(request, response, root, urlPath);
}

export function createDocsServer({ root = REPOSITORY_ROOT } = {}) {
  const normalizedRoot = path.resolve(root);
  return http.createServer((request, response) => {
    handleRequest(request, response, normalizedRoot).catch(() => {
      if (!response.headersSent) {
        send(response, 500, 'text/plain; charset=utf-8', 'Internal Server Error', request.method);
      } else {
        response.destroy();
      }
    });
  });
}

function parsePort(value) {
  const port = Number(value ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new RangeError(`PORT must be an integer between 0 and 65535: ${value}`);
  }
  return port;
}

export function startDocsServer({
  host = process.env.HOST || DEFAULT_HOST,
  port = parsePort(process.env.PORT),
  root = REPOSITORY_ROOT,
} = {}) {
  const server = createDocsServer({ root });
  server.listen(port, host, () => {
    const address = server.address();
    const listeningPort = typeof address === 'object' && address ? address.port : port;
    console.log(`kata-ui docs server running at http://${host}:${listeningPort}/`);
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === CURRENT_FILE) {
  startDocsServer();
}
