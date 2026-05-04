// explore.js — Explore page: loads all countries, search + filter + sort

import { renderNav, renderFooter } from './components.js';
import { initTheme }               from './theme.js';

renderNav('explore');
renderFooter();
initTheme();

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loadingEl     = document.getElementById('loading');
const errorEl       = document.getElementById('error-message');
const errorTextEl   = document.getElementById('error-text');
const noResultsEl   = document.getElementById('no-results');
const grid          = document.getElementById('explore-grid');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('explore-input');
const exploreForm   = document.getElementById('explore-form');
const regionFilter  = document.getElementById('region-filter');
const sortSelect    = document.getElementById('sort-select');
const clearBtn      = document.getElementById('clear-btn');
const noResultsClear= document.getElementById('no-results-clear');

// ── State ─────────────────────────────────────────────────────────────────────
let allCountries = [];   // full dataset from API
let query        = '';
let region       = '';
let sort         = 'name-asc';

// ── URL sync (S35 — shareable URLs) ───────────────────────────────────────────
function readURLParams() {
  const p = new URLSearchParams(location.search);
  query  = p.get('q')      || '';
  region = p.get('region') || '';
  sort   = p.get('sort')   || 'name-asc';
  searchInput.value  = query;
  regionFilter.value = region;
  sortSelect.value   = sort;
}

function pushURLState() {
  const p = new URLSearchParams();
  if (query)               p.set('q',      query);
  if (region)              p.set('region', region);
  if (sort !== 'name-asc') p.set('sort',   sort);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

// ── Fetch all countries ───────────────────────────────────────────────────────
async function loadAllCountries() {
  showLoading(true);
  hideError();

  try {
    const res = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,flags,capital,region,population,cca2'
    );
    if (!res.ok) throw new Error('api');
    allCountries = await res.json();
    showLoading(false);
    applyFilters();
  } catch (err) {
    showLoading(false);
    if (!navigator.onLine || err.message === 'Failed to fetch') {
      showError('No internet connection. Please check your network and try again.');
    } else {
      showError('Could not load countries. The service may be unavailable.');
    }
    console.error('Explore fetch failed:', err);
  }
}

// ── Filter + sort + render ────────────────────────────────────────────────────
function applyFilters() {
  pushURLState();
  const q = query.toLowerCase().trim();

  let results = allCountries.filter(c => {
    const nameMatch = !q || c.name.common.toLowerCase().includes(q);
    const regionMatch = !region || c.region === region;
    return nameMatch && regionMatch;
  });

  // Sort
  results.sort((a, b) => {
    switch (sort) {
      case 'name-asc':  return a.name.common.localeCompare(b.name.common);
      case 'name-desc': return b.name.common.localeCompare(a.name.common);
      case 'pop-desc':  return b.population - a.population;
      case 'pop-asc':   return a.population - b.population;
      default:          return 0;
    }
  });

  renderGrid(results);
  updateClearBtn();
}

function renderGrid(countries) {
  const total = allCountries.length;

  // Results count
  if (countries.length === total && !query && !region) {
    resultsCount.textContent = `${total} countries`;
  } else {
    resultsCount.textContent = `${countries.length} of ${total} countries`;
  }

  // No results state
  if (countries.length === 0) {
    grid.innerHTML = '';
    noResultsEl.classList.remove('hidden');
    return;
  }
  noResultsEl.classList.add('hidden');

  grid.innerHTML = countries.map(c => {
    const name    = c.name.common;
    const flag    = c.flags?.svg || c.flags?.png || '';
    const capital = c.capital?.[0] ?? 'N/A';
    const pop     = c.population.toLocaleString();
    const reg     = c.region || '';

    return `
      <a href="country.html?name=${encodeURIComponent(name)}"
         class="country-card"
         aria-label="${name}, ${reg}">
        <img
          class="country-card-flag"
          src="${flag}"
          alt="Flag of ${name}"
          loading="lazy"
          width="320"
          height="120"
        >
        <div class="country-card-body">
          <p class="country-card-name">${name}</p>
          <p class="country-card-tagline">${capital} · ${pop} people</p>
          <span class="region-badge">${reg}</span>
        </div>
      </a>`;
  }).join('');
}

function updateClearBtn() {
  const active = query || region;
  clearBtn.classList.toggle('hidden', !active);
}

function clearFilters() {
  query = '';
  region = '';
  searchInput.value = '';
  regionFilter.value = '';
  applyFilters();
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showLoading(visible) {
  loadingEl.classList.toggle('hidden', !visible);
}

function hideError() {
  errorEl.classList.add('hidden');
}

function showError(message) {
  errorTextEl.textContent = message;
  errorEl.classList.remove('hidden');
}

// ── Event listeners ───────────────────────────────────────────────────────────

// Live search as user types (debounced)
let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    query = searchInput.value;
    applyFilters();
  }, 250);
});

// Form submit (Enter key)
exploreForm.addEventListener('submit', e => {
  e.preventDefault();
  query = searchInput.value;
  applyFilters();
});

// Region filter
regionFilter.addEventListener('change', () => {
  region = regionFilter.value;
  applyFilters();
});

// Sort
sortSelect.addEventListener('change', () => {
  sort = sortSelect.value;
  applyFilters();
});

// Clear buttons
clearBtn.addEventListener('click', clearFilters);
noResultsClear.addEventListener('click', clearFilters);

// ── Boot ──────────────────────────────────────────────────────────────────────
readURLParams();
loadAllCountries();