import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const themeDirectory = path.dirname(fileURLToPath(import.meta.url));

function readTheme(name) {
  return fs.readFileSync(path.join(themeDirectory, `theme-${name}.css`), 'utf8');
}

test('facility theme uses the compact dimensions from the facility prototype', () => {
  const css = readTheme('facility');

  assert.match(css, /--kata-font-size-root:\s*14px/);
  assert.match(css, /--kata-font-size-sm:\s*14px/);
  assert.match(css, /--kata-line-height-control:\s*18px/);
  assert.match(css, /--kata-space-md:\s*4px/);
  assert.match(css, /--kata-space-xl:\s*8px/);
  assert.match(css, /--kata-toggle-track-height:\s*20px/);
  assert.match(css, /--kata-toggle-thumb-size:\s*16px/);
});

test('winforms theme uses the compact dimensions from the WinForms sample', () => {
  const css = readTheme('winforms');

  assert.match(css, /--kata-font-size-root:\s*12px/);
  assert.match(css, /--kata-font-size-sm:\s*12px/);
  assert.match(css, /--kata-line-height-control:\s*17px/);
  assert.match(css, /--kata-space-md:\s*4px/);
  assert.match(css, /--kata-space-xl:\s*8px/);
  assert.match(css, /--kata-toggle-track-height:\s*18px/);
  assert.match(css, /--kata-toggle-thumb-size:\s*14px/);
});
