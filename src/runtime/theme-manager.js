export class ThemeManager {
  constructor(root = document, { storage = globalThis.localStorage, storageKey = 'kata-ui-theme' } = {}) {
    this.root = root;
    this.storage = storage;
    this.storageKey = storageKey;
  }

  set(theme, { persist = true } = {}) {
    if (!theme) return false;
    this.root.documentElement.dataset.theme = theme;
    if (persist) {
      try { this.storage?.setItem(this.storageKey, theme); } catch { /* Storage may be unavailable. */ }
    }
    return true;
  }

  load(fallback = 'default') {
    let theme = fallback;
    try { theme = this.storage?.getItem(this.storageKey) || fallback; } catch { /* Use fallback. */ }
    this.set(theme, { persist: false });
    return theme;
  }

  applyToFrame(frame, theme = this.root.documentElement.dataset.theme) {
    const frameRoot = frame.contentDocument?.documentElement;
    if (!frameRoot || !theme) return false;
    frameRoot.dataset.theme = theme;
    return true;
  }
}
