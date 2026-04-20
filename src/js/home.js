// home.js — Home page logic: nav, theme, search, featured cards, bucket teaser

import { renderNav, renderFooter } from './components.js';
import { initTheme }               from './theme.js';
import { getCount }                from './storage.js';

// ── Shared setup ─────────────────────────────────────────────────────────────
renderNav('home');
renderFooter();
initTheme();

// ── Featured destinations ─────────────────────────────────────────────────────
// Hardcoded spotlight list. Flags come from flagcdn.com (free, no key needed).
const FEATURED = [
  { name: 'Japan',       code: 'jp', tagline: 'Cherry blossoms & ancient temples' },
  { name: 'Italy',       code: 'it', tagline: 'Art, history & incredible cuisine' },
  { name: 'Morocco',     code: 'ma', tagline: 'Vibrant souks & Saharan sunsets'   },
  { name: 'Brazil',      code: 'br', tagline: 'Carnival, Amazon & golden beaches' },
  { name: 'Iceland',     code: 'is', tagline: 'Northern lights & volcanic wonders'},
  { name: 'Thailand',    code: 'th', tagline: 'Temples, street food & islands'    },
  { name: 'New Zealand', code: 'nz', tagline: 'Fjords, Maori culture & adventure' },
  { name: 'Egypt',       code: 'eg', tagline: 'Pharaohs, pyramids & the Red Sea'  },
];

function buildFeaturedCards() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  grid.innerHTML = FEATURED.map(({ name, code, tagline }) => `
    <a href="country.html?name=${encodeURIComponent(name)}"
       class="country-card"
       aria-label="${name} — ${tagline}">
      <img
        class="country-card-flag"
        src="https://flagcdn.com/w320/${code}.png"
        alt="Flag of ${name}"
        loading="lazy"
        width="320"
        height="213"
      >
      <div class="country-card-body">
        <p class="country-card-name">${name}</p>
        <p class="country-card-tagline">${tagline}</p>
      </div>
    </a>`).join('');
}

buildFeaturedCards();

// ── Bucket list teaser ────────────────────────────────────────────────────────
function updateBucketTeaser() {
  const count  = getCount();
  const teaser = document.getElementById('bucket-teaser');
  const text   = document.getElementById('bucket-teaser-text');
  if (!teaser || !text) return;

  if (count > 0) {
    text.textContent = count === 1
      ? 'You have 1 country saved to your bucket list.'
      : `You have ${count} countries saved to your bucket list.`;
    teaser.classList.remove('hidden');
  }
}

updateBucketTeaser();

// ── Hero search ───────────────────────────────────────────────────────────────
const heroForm  = document.getElementById('hero-form');
const heroInput = document.getElementById('hero-input');

heroForm.addEventListener('submit', e => {
  e.preventDefault();
  const query = heroInput.value.trim();
  if (query) {
    window.location.href = `country.html?name=${encodeURIComponent(query)}`;
  } else {
    heroInput.focus();
  }
});
