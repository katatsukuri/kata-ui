import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const consolidatedComponents = [
  'kata-avatar',
  'kata-badge',
  'kata-button',
  'kata-checkbox',
  'kata-popover',
  'kata-slider',
  'kata-switch',
  'kata-textarea',
  'kata-tooltip',
];

test('visual and state variants use one canonical template per component', () => {
  for (const name of consolidatedComponents) {
    const componentRoot = path.join(repositoryRoot, 'src', 'components', name);
    const template = fs.readFileSync(path.join(componentRoot, `${name}.html`), 'utf8');
    const example = fs.readFileSync(path.join(componentRoot, 'examples', 'index.html'), 'utf8');

    assert.equal([...template.matchAll(/<template\b/g)].length, 1, `${name} template count`);
    assert.equal([...example.matchAll(/<template\b/g)].length, 1, `${name} example template count`);
  }
});
