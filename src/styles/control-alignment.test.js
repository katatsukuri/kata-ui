import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const stylesRoot = path.dirname(fileURLToPath(import.meta.url));
const componentsRoot = path.resolve(stylesRoot, '..', 'components');

function readComponentStyle(name) {
  return fs.readFileSync(path.join(componentsRoot, name, `${name}.css`), 'utf8');
}

test('kata-toggle centers itself and uses density-aware geometry tokens', () => {
  const css = readComponentStyle('kata-toggle');

  assert.match(css, /kata-toggle\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(css, /kata-toggle\s*\{[^}]*align-items:\s*center/s);
  assert.match(css, /width:\s*var\(--kata-toggle-track-width/);
  assert.match(css, /height:\s*var\(--kata-toggle-track-height/);
});

test('kata-switch centers label and native switch in the same inline row', () => {
  const css = readComponentStyle('kata-switch');

  assert.match(css, /kata-switch\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(css, /kata-switch\s*\{[^}]*align-items:\s*center/s);
  assert.match(css, /kata-switch\s*\{[^}]*gap:\s*var\(--kata-space-md\)/s);
});
