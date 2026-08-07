const markdownLinks = document.querySelectorAll('a[href]');

for (const link of markdownLinks) {
  const url = new URL(link.href, document.baseURI);
  const siteRoot = new URL('./', document.baseURI);

  if (
    url.origin !== siteRoot.origin
    || !url.pathname.startsWith(siteRoot.pathname)
    || !url.pathname.endsWith('.md')
  ) continue;

  const relativePath = url.pathname.slice(siteRoot.pathname.length);
  link.href = `./docs.html?doc=${encodeURIComponent(`./${relativePath}`)}${url.hash}`;
}
