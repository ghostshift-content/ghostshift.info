// Contact links — email assembled at runtime to avoid scraping
(function () {
  const grid = document.getElementById('contactGrid');
  if (!grid) return;

  const email = 'jay' + String.fromCharCode(64) + 'ghostshift.info';

  const items = [
    {
      href: 'mailto:' + email,
      label: email,
      sub: 'primary · direct',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 5h18v14H3z M3 5l9 8 9-8" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>'
    },
    {
      href: 'https://linkedin.com/in/jaypatelk',
      label: 'linkedin / jaypatelk',
      sub: 'track record',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M7 10v7M7 7.5v.01M11 17v-7M11 13c0-2 4-2 4 0v4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
      ext: true
    },
    {
      href: 'https://github.com/ghostshift-content',
      label: 'github / ghostshift-content',
      sub: 'tooling · poc',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.52 9.52 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .26.18.58.69.48A10 10 0 0 0 12 2z" fill="currentColor"/></svg>',
      ext: true
    },
    {
      href: 'https://signal.me/#p/+61...',
      label: 'signal / on request',
      sub: 'encrypted · preferred for sensitive scopes',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.5-1.2A9 9 0 1 0 12 3z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>',
      ext: true
    }
  ];

  items.forEach(it => {
    const a = document.createElement(it.href ? 'a' : 'div');
    a.className = 'c-link';
    if (it.href) a.href = it.href;
    if (it.ext) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = `
      <span class="c-link-ico">${it.icon}</span>
      <span class="c-link-text">
        <b>${it.label}</b>
        <span>${it.sub}</span>
      </span>
      <span class="c-link-arrow">→</span>
    `;
    grid.appendChild(a);
  });
})();
