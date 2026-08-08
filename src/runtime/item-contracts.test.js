import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const itemComponents = [
  'kata-breadcrumb',
  'kata-dropdown-menu',
  'kata-pagination',
  'kata-radio-group',
  'kata-toggle-group',
  'kata-tabs',
];

test('repeatable item contracts do not expose numbered slots', () => {
  const numberedSlot = /slot\s*=\s*["'](?:item|option|page|tab|panel)-\d+["']/;
  for (const name of itemComponents) {
    const root = path.join(repositoryRoot, 'src', 'components', name);
    for (const relative of [`${name}.html`, `${name}.spec.md`, 'examples/index.html']) {
      const source = fs.readFileSync(path.join(root, relative), 'utf8');
      assert.equal(numberedSlot.test(source), false, `${name}/${relative}`);
    }
  }
});

test('tabs accepts repeatable category slots instead of paired numbered slots', () => {
  const source = fs.readFileSync(
    path.join(repositoryRoot, 'src/components/kata-tabs/kata-tabs.html'),
    'utf8',
  );
  assert.match(source, /<slot name="tab">/);
  assert.match(source, /<slot name="panel">/);
});
