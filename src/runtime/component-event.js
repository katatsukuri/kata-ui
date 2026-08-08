export function emitComponentEvent(target, name, detail = {}, options = {}) {
  return target.dispatchEvent(new CustomEvent(name, {
    detail,
    bubbles: true,
    composed: true,
    ...options,
  }));
}
