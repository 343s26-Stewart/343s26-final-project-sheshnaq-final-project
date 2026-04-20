// components.js — Shared nav and footer injection
// Usage: import { renderNav, renderFooter } from './components.js';
//        Call renderNav('home') before initTheme() so the toggle button exists in the DOM.

const NAV_PAGES = [
  { href: 'index.html',       label: 'Home',        id: 'home'        },
  { href: 'explore.html',     label: 'Explore',     id: 'explore'     },
  { href: 'bucket-list.html', label: 'Bucket List', id: 'bucket-list' },
  { href: 'about.html',       label: 'About',       id: 'about'       },
];

/**
 * Injects the shared header + skip link into #nav-placeholder.
 * @param {string} activePage - one of the id values in NAV_PAGES ('home', 'explore', etc.)
 */
export function renderNav(activePage = '') {
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  const listItems = NAV_PAGES.map(({ href, label, id }) => {
    const isActive = id === activePage;
    return `
      <li>
        <a href="${href}"
           class="nav-link${isActive ? ' active' : ''}"
           ${isActive ? 'aria-current="page"' : ''}>
          ${label}
        </a>
      </li>`;
  }).join('');

  placeholder.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header class="site-header">
      <nav class="navbar" aria-label="Main navigation">
        <a href="index.html" class="nav-brand" aria-label="Wanderlist — go to home">
          Wanderlist
        </a>

        <button class="nav-toggle"
                aria-label="Toggle navigation menu"
                aria-expanded="false"
                aria-controls="nav-links">
          <span></span><span></span><span></span>
        </button>

        <ul class="nav-links" id="nav-links" role="list">
          ${listItems}
        </ul>

        <button class="theme-toggle" id="theme-toggle" aria-label="Switch to dark mode">
          &#9790;
        </button>
      </nav>
    </header>`;

  // Wire up mobile hamburger
  const toggle  = placeholder.querySelector('.nav-toggle');
  const navList = placeholder.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('open', !expanded);
  });

  // Close menu when a link is clicked
  navList.addEventListener('click', e => {
    if (e.target.closest('.nav-link')) {
      toggle.setAttribute('aria-expanded', 'false');
      navList.classList.remove('open');
    }
  });
}

/**
 * Injects the shared footer into #footer-placeholder.
 */
export function renderFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = `
    <footer class="site-footer">
      <p>&copy; 2026 Wanderlist &mdash; Sheshnaq Team</p>
    </footer>`;
}
