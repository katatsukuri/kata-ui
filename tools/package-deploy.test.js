import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createDeployPackage } from './package-deploy.js';

const REQUIRED_ROOT_FILES = [
  '.htaccess',
  'architecture-manifest.json',
  'docs.css',
  'docs.html',
  'index.html',
  'LICENSE',
  'README.md',
];

async function writeFixture(root, relativePath, content = relativePath) {
  const target = path.join(root, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

test('createDeployPackage copies only deployable static files', async (context) => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'kata-ui-package-'));
  context.after(() => fs.rm(fixtureRoot, { recursive: true, force: true }));

  for (const relativePath of REQUIRED_ROOT_FILES) {
    await writeFixture(fixtureRoot, relativePath);
  }

  await writeFixture(fixtureRoot, 'assets/logo.svg');
  await writeFixture(fixtureRoot, 'docs/architecture.md');
  await writeFixture(fixtureRoot, 'src/runtime/index.js');
  await writeFixture(fixtureRoot, 'src/components/kata-card/kata-card.js');
  await writeFixture(fixtureRoot, 'src/components/kata-card/kata-card.html');
  await writeFixture(fixtureRoot, 'src/components/kata-card/kata-card.css');
  await writeFixture(fixtureRoot, 'src/components/kata-card/kata-card.spec.md');
  await writeFixture(fixtureRoot, 'src/components/kata-card/examples/index.html');

  await writeFixture(fixtureRoot, 'package.json');
  await writeFixture(fixtureRoot, 'src/server.js');
  await writeFixture(fixtureRoot, 'src/server.test.js');
  await writeFixture(fixtureRoot, 'src/components/kata-card/kata-card.test.js');
  await writeFixture(fixtureRoot, 'src/components/test-utils/helper.js');

  const outputRoot = path.join(fixtureRoot, 'dist', 'onamae');
  const summary = await createDeployPackage({ sourceRoot: fixtureRoot, outputRoot });

  assert.equal(summary.files, 15);
  await assert.doesNotReject(fs.access(path.join(outputRoot, '.htaccess')));
  await assert.doesNotReject(fs.access(path.join(outputRoot, 'index.html')));
  await assert.doesNotReject(fs.access(path.join(outputRoot, 'docs/architecture.md')));
  await assert.doesNotReject(fs.access(path.join(
    outputRoot,
    'src/components/kata-card/examples/index.html',
  )));

  await assert.rejects(fs.access(path.join(outputRoot, 'package.json')));
  await assert.rejects(fs.access(path.join(outputRoot, 'src/server.js')));
  await assert.rejects(fs.access(path.join(outputRoot, 'src/server.test.js')));
  await assert.rejects(fs.access(path.join(
    outputRoot,
    'src/components/kata-card/kata-card.test.js',
  )));
  await assert.rejects(fs.access(path.join(
    outputRoot,
    'src/components/test-utils/helper.js',
  )));
});

test('createDeployPackage accepts only an output directory below dist', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'kata-ui-package-'));

  try {
    await assert.rejects(
      createDeployPackage({ sourceRoot: fixtureRoot, outputRoot: fixtureRoot }),
      /Output directory must be a child of/,
    );
    await assert.rejects(
      createDeployPackage({
        sourceRoot: fixtureRoot,
        outputRoot: path.join(fixtureRoot, 'src'),
      }),
      /Output directory must be a child of/,
    );
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});
