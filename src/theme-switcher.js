const themeControl = document.querySelector('[data-theme-switcher]');
const exampleFrames = document.querySelectorAll('.component-card iframe');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  for (const frame of exampleFrames) {
    const frameRoot = frame.contentDocument?.documentElement;
    if (frameRoot) frameRoot.dataset.theme = theme;
  }
}

if (themeControl) {
  applyTheme(themeControl.value);
  themeControl.addEventListener('change', () => applyTheme(themeControl.value));

  for (const frame of exampleFrames) {
    frame.addEventListener('load', () => {
      const frameRoot = frame.contentDocument?.documentElement;
      if (frameRoot) frameRoot.dataset.theme = themeControl.value;
    });
  }
}
