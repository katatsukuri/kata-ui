import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const CURRENT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const HTACCESS_PATH = path.resolve(CURRENT_DIRECTORY, '..', '.htaccess');

test('.htaccess applies the static-site security baseline without duplicating HTTPS redirects', async () => {
  const content = await fs.readFile(HTACCESS_PATH, 'utf8');

  assert.match(content, /^Options -Indexes$/m);
  assert.match(content, /Content-Security-Policy/);
  assert.match(content, /Strict-Transport-Security "max-age=31536000"/);
  assert.match(content, /X-Content-Type-Options "nosniff"/);
  assert.match(content, /AddOutputFilterByType DEFLATE/);
  assert.doesNotMatch(content, /^\s*Rewrite(?:Cond|Rule|Engine)\b/m);
  assert.doesNotMatch(content, /includeSubDomains|preload/);
});
