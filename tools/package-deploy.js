#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_FILE = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = path.resolve(path.dirname(CURRENT_FILE), '..');
const DEFAULT_OUTPUT_ROOT = path.join(REPOSITORY_ROOT, 'dist', 'onamae');

const PUBLIC_ROOT_FILES = [
  'architecture-manifest.json',
  'docs.css',
  'docs.html',
  'index.html',
  'LICENSE',
  'README.md',
];
const PUBLIC_DIRECTORIES = ['assets', 'docs', 'src'];

function isExcluded(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  const segments = normalized.split('/');
  const basename = segments.at(-1) ?? '';

  return normalized === 'src/server.js'
    || basename.endsWith('.test.js')
    || segments.includes('test-utils');
}

function assertSafeOutputRoot(sourceRoot, outputRoot) {
  const distributionRoot = path.join(sourceRoot, 'dist');
  const relative = path.relative(distributionRoot, outputRoot);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Output directory must be a child of ${distributionRoot}: ${outputRoot}`);
  }
}

async function copyPublicPath(sourceRoot, outputRoot, relativePath, summary) {
  if (isExcluded(relativePath)) return;

  const sourcePath = path.join(sourceRoot, relativePath);
  const destinationPath = path.join(outputRoot, relativePath);
  const stats = await fs.lstat(sourcePath);

  if (stats.isSymbolicLink()) {
    throw new Error(`Symbolic links are not allowed in the deployment package: ${relativePath}`);
  }

  if (stats.isDirectory()) {
    await fs.mkdir(destinationPath, { recursive: true });
    const entries = await fs.readdir(sourcePath, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      await copyPublicPath(
        sourceRoot,
        outputRoot,
        path.join(relativePath, entry.name),
        summary,
      );
    }
    return;
  }

  if (!stats.isFile()) {
    throw new Error(`Unsupported file type in deployment package: ${relativePath}`);
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourcePath, destinationPath);
  summary.files += 1;
  summary.bytes += stats.size;
}

export async function createDeployPackage({
  sourceRoot = REPOSITORY_ROOT,
  outputRoot = DEFAULT_OUTPUT_ROOT,
} = {}) {
  const resolvedSourceRoot = path.resolve(sourceRoot);
  const resolvedOutputRoot = path.resolve(outputRoot);
  assertSafeOutputRoot(resolvedSourceRoot, resolvedOutputRoot);

  const stagingRoot = path.join(
    path.dirname(resolvedOutputRoot),
    `.${path.basename(resolvedOutputRoot)}.tmp-${process.pid}`,
  );
  const summary = { files: 0, bytes: 0, outputRoot: resolvedOutputRoot };

  await fs.rm(stagingRoot, { recursive: true, force: true });
  await fs.mkdir(stagingRoot, { recursive: true });

  try {
    for (const relativePath of [...PUBLIC_ROOT_FILES, ...PUBLIC_DIRECTORIES]) {
      await copyPublicPath(resolvedSourceRoot, stagingRoot, relativePath, summary);
    }

    // 完成済み成果物だけが見えるよう、全コピー成功後に公開用ディレクトリを入れ替える。
    await fs.rm(resolvedOutputRoot, { recursive: true, force: true });
    await fs.rename(stagingRoot, resolvedOutputRoot);
  } catch (error) {
    await fs.rm(stagingRoot, { recursive: true, force: true });
    throw error;
  }

  return summary;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === CURRENT_FILE;

if (isMain) {
  try {
    const summary = await createDeployPackage();
    console.log(`Deployment package created: ${summary.outputRoot}`);
    console.log(`Files: ${summary.files}, bytes: ${summary.bytes}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
