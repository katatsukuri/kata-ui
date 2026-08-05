const TEMPLATE_REGISTRY = new WeakMap();

function getTemplateRegistry(root) {
  let registry = TEMPLATE_REGISTRY.get(root);
  if (!registry) {
    registry = new Map();
    TEMPLATE_REGISTRY.set(root, registry);
  }

  return registry;
}

export function resolveTemplate(templateId, root = document) {
  if (!templateId) {
    throw new Error('templateId is required.');
  }

  const registry = getTemplateRegistry(root);
  const cached = registry.get(templateId);
  if (cached && cached.isConnected) {
    return cached;
  }

  const template = root.getElementById(templateId);
  if (!(template instanceof HTMLTemplateElement)) {
    throw new Error(`Template \"${templateId}\" was not found.`);
  }

  registry.set(templateId, template);
  return template;
}

export function instantiateTemplate(templateId, root = document) {
  return resolveTemplate(templateId, root).content.cloneNode(true);
}
