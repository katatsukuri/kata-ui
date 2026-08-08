const COMPONENT_LOADERS = new Map();

export function registerComponentLoader(name, loader) {
  if (!name?.includes('-')) throw new Error('A custom element name is required.');
  if (typeof loader !== 'function') throw new TypeError('loader must be a function.');
  COMPONENT_LOADERS.set(name, loader);
}

export async function ensureComponent(name) {
  if (customElements.get(name)) return customElements.get(name);
  const loader = COMPONENT_LOADERS.get(name);
  if (!loader) throw new Error(`Component loader was not registered: ${name}`);
  await loader();
  return customElements.whenDefined
    ? customElements.whenDefined(name)
    : customElements.get(name);
}

export function registeredComponentNames() {
  return [...COMPONENT_LOADERS.keys()];
}
