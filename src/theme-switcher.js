import { ThemeManager } from './runtime/theme-manager.js';

const themeControl = document.querySelector('[data-theme-switcher]');
const exampleFrames = document.querySelectorAll('.component-card iframe');
const themeManager = new ThemeManager(document);

if (themeControl) {
  const selectedTheme = themeManager.load(themeControl.value);
  if ([...themeControl.options].some((option) => option.value === selectedTheme)) {
    themeControl.value = selectedTheme;
  }

  const applyTheme = () => {
    themeManager.set(themeControl.value);
    for (const frame of exampleFrames) themeManager.applyToFrame(frame);
  };

  applyTheme();
  themeControl.addEventListener('change', applyTheme);

  for (const frame of exampleFrames) {
    frame.addEventListener('load', () => themeManager.applyToFrame(frame));
  }
}
