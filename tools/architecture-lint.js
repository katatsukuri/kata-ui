#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const componentsRoot = path.join(repositoryRoot, 'src', 'components');
const manifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'architecture-manifest.json'), 'utf8'));
const failures = [];
const definedTags = new Map();
const templateIds = new Map();

const requiredStyleFiles = [
  'src/styles/kata-ui.css',
  'src/styles/tokens.css',
  'src/styles/themes/theme-default.css',
  'src/styles/themes/theme-blue.css',
  'src/styles/themes/theme-dark.css',
];

for (const relativeFile of requiredStyleFiles) {
  const file = path.join(repositoryRoot, relativeFile);
  if (!fs.existsSync(file)) report(file, 'required theme artifact is missing.');
}

function report(file, message) {
  failures.push(`${path.relative(repositoryRoot, file)}: ${message}`);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function verifyPageReferences(file, source) {
  for (const attribute of source.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const reference = attribute[1];
    if (/^(?:https?:|data:|mailto:|#)/i.test(reference)) continue;
    if (reference.startsWith('/')) {
      report(file, `root-relative reference is not GitHub Pages safe: ${reference}`);
      continue;
    }

    const target = reference.split(/[?#]/, 1)[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) report(file, `local reference does not exist: ${reference}`);
  }
}

function verifyPinnedDependencies(file, source) {
  const normalizedSource = source.replaceAll('@@', '@');
  const checks = [
    [/htmx\.org@([^/'"@]+)/g, 'htmx'],
    [/@picocss\/pico@([^/'"@]+)/g, 'pico'],
    [/chart\.js@([^/'"@]+)/g, 'chart.js'],
  ];

  for (const [pattern, library] of checks) {
    for (const match of normalizedSource.matchAll(pattern)) {
      if (match[1] !== manifest.libraries[library]) {
        report(file, `${library} must be pinned to ${manifest.libraries[library]} (found ${match[1]}).`);
      }
    }
  }
}

if (!fs.existsSync(componentsRoot)) {
  failures.push('src/components/: component root is required.');
} else {
  const componentNames = fs.readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('kata-'))
    .map((entry) => entry.name)
    .sort();

  for (const name of componentNames) {
    const directory = path.join(componentsRoot, name);
    const requiredFiles = [
      `${name}.spec.md`,
      `${name}.html`,
      `${name}.js`,
      `${name}.css`,
      `${name}.test.js`,
    ];

    for (const requiredFile of requiredFiles) {
      const file = path.join(directory, requiredFile);
      if (!fs.existsSync(file)) report(file, 'required component artifact is missing.');
    }

    const examples = path.join(directory, 'examples');
    const pagesExample = path.join(examples, 'index.html');
    if (!fs.existsSync(pagesExample)) {
      report(pagesExample, 'a GitHub Pages-compatible example is required.');
    } else {
      verifyPageReferences(pagesExample, read(pagesExample));
    }

    if (requiredFiles.some((file) => !fs.existsSync(path.join(directory, file)))) continue;

    const specFile = path.join(directory, `${name}.spec.md`);
    const templateFile = path.join(directory, `${name}.html`);
    const scriptFile = path.join(directory, `${name}.js`);
    const styleFile = path.join(directory, `${name}.css`);
    const spec = read(specFile);
    const template = read(templateFile);
    const script = read(scriptFile);
    const style = read(styleFile);

    if (!spec.includes(`# ${name}`)) report(specFile, `contract heading must identify ${name}.`);
    if (!/<template\b/i.test(template)) report(templateFile, 'at least one template is required.');
    if (/<script\b/i.test(template)) report(templateFile, 'script elements are forbidden in component templates.');
    if (/\son[a-z]+\s*=/i.test(template)) report(templateFile, 'inline event attributes are forbidden.');
    if (/\bx-html\s*=/i.test(template)) report(templateFile, 'x-html is forbidden.');
    if (/\bhx-(?:get|post|put|patch|delete)\s*=\s*["']https?:\/\//i.test(template)) {
      report(templateFile, 'external HTMX request URLs are forbidden.');
    }
    for (const templateElement of template.matchAll(/<template\b[^>]*\bid\s*=\s*["']([^"']+)["']/gi)) {
      const templateId = templateElement[1];
      if (!templateId.startsWith(`${name}-`)) {
        report(templateFile, `template id must use the ${name}- prefix: ${templateId}`);
      } else if (templateIds.has(templateId)) {
        report(templateFile, `template id duplicates ${path.relative(repositoryRoot, templateIds.get(templateId))}: ${templateId}`);
      } else {
        templateIds.set(templateId, templateFile);
      }
    }
    for (const classAttribute of template.matchAll(/\bclass\s*=\s*["']([^"']+)["']/gi)) {
      for (const className of classAttribute[1].split(/\s+/).filter(Boolean)) {
        if (className !== name && !className.startsWith(`${name}__`) && !className.startsWith(`${name}--`)) {
          report(templateFile, `class must use the ${name} BEM block: ${className}`);
        }
      }
    }

    const defaultTemplate = script.match(/DEFAULT_TEMPLATE_ID\s*=\s*['"]([^'"]+)['"]/);
    if (defaultTemplate && !template.includes(`id="${defaultTemplate[1]}"`) && !template.includes(`id='${defaultTemplate[1]}'`)) {
      report(templateFile, `default template ${defaultTemplate[1]} is missing.`);
    }

    const definition = script.match(/customElements\.define\(\s*['"]([^'"]+)['"]/);
    if (!definition) {
      report(scriptFile, 'customElements.define() is required.');
    } else if (definition[1] !== name) {
      report(scriptFile, `custom element tag must be ${name} (found ${definition[1]}).`);
    } else if (definedTags.has(definition[1])) {
      report(scriptFile, `custom element tag duplicates ${path.relative(repositoryRoot, definedTags.get(definition[1]))}.`);
    } else {
      definedTags.set(definition[1], scriptFile);
    }

    const forbiddenJavaScript = [
      [/\.innerHTML\b/, 'innerHTML'],
      [/\.insertAdjacentHTML\b/, 'insertAdjacentHTML'],
      [/\.attachShadow\b/, 'attachShadow'],
      [/\bfetch\s*\(/, 'fetch'],
      [/\bhistory\.(?:pushState|replaceState)\s*\(/, 'History API'],
      [/\beval\s*\(/, 'eval'],
      [/\bnew\s+Function\s*\(/, 'Function constructor'],
    ];
    for (const [pattern, label] of forbiddenJavaScript) {
      if (pattern.test(script)) report(scriptFile, `${label} is forbidden by architecture.md.`);
    }

    if (/!important\b/.test(style)) report(styleFile, '!important is forbidden.');
    if (/\[data-theme(?:=|\])/.test(style)) {
      report(styleFile, 'component styles must not branch on a concrete theme.');
    }
    for (const [index, line] of style.split(/\r?\n/).entries()) {
      if (/var\(--pico-/.test(line) && !/var\(--kata-/.test(line)) {
        report(styleFile, `line ${index + 1} must access Pico colors through a --kata-* semantic token.`);
      }
    }
    const styleWithoutComments = style.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const block of styleWithoutComments.matchAll(/([^{}]+)\{/g)) {
      const selectors = block[1].trim();
      if (selectors.startsWith('@') || selectors.includes(':root')) continue;
      for (const selector of selectors.split(',')) {
        if (!selector.trim().startsWith(name)) {
          report(styleFile, `selector must be scoped by ${name}: ${selector.trim()}`);
        }
      }
    }

    for (const file of fs.readdirSync(examples, { recursive: true })) {
      const exampleFile = path.join(examples, file);
      if (fs.statSync(exampleFile).isFile()) verifyPinnedDependencies(exampleFile, read(exampleFile));
    }
  }

  const docsIndex = path.join(repositoryRoot, 'index.html');
  if (!fs.existsSync(docsIndex)) {
    report(docsIndex, 'repository-root component catalog is required.');
  } else {
    const docs = read(docsIndex);
    verifyPageReferences(docsIndex, docs);
    for (const name of componentNames) {
      if (!docs.includes(`./src/components/${name}/examples/index.html`)) {
        report(docsIndex, `catalog example link is missing for ${name}.`);
      }
      if (!docs.includes(`./src/components/${name}/${name}.spec.md`)) {
        report(docsIndex, `catalog contract link is missing for ${name}.`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`architecture-lint failed with ${failures.length} violation(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('architecture-lint passed.');
}
