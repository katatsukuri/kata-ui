document.addEventListener('htmx:historyRestore', () => {
  const pagination = document.querySelector('#results-pagination');
  const savedItems = document.querySelector('#pagination-results [data-pagination-items]');

  if (!pagination || !savedItems) return;

  pagination.replaceChildren(savedItems.content.cloneNode(true));
  globalThis.htmx?.process(pagination);
});
