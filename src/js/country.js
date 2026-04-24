// country.js — Logic for the Country Detail Page

import { fetchAllCountryInfo }  from './api.js';
import { renderNav, renderFooter } from './components.js';
import { initTheme }            from './theme.js';

renderNav('');   // no active page since country isn't in the nav
renderFooter();
initTheme();

// ─── 1. Read country name from URL ───────────────────────────────────────────

const params = new URLSearchParams(window.location.search);
const countryName = params.get("name");

// If no country name in URL, show an error immediately
if (!countryName) {
  showError("No country specified. Please go back and select a country.");
}

// ─── 2. DOM References ────────────────────────────────────────────────────────

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error-message");
const contentEl = document.getElementById("country-content");

// Tab buttons
const tabButtons = document.querySelectorAll(".tab-btn");
// Tab panels
const tabPanels = document.querySelectorAll(".tab-panel");

// Bucket list form elements
const bucketNote = document.getElementById("bucket-note");
const bucketLabel = document.getElementById("bucket-label");
const bucketBtn = document.getElementById("bucket-btn");
const bucketMsg = document.getElementById("bucket-msg");

// ─── 3. Fetch & Render ────────────────────────────────────────────────────────

async function loadCountry() {
  showLoading(true);

  try {
    const { country, wiki } = await fetchAllCountryInfo(countryName);
    renderPage(country, wiki);
    showLoading(false);
    contentEl.classList.remove("hidden");
  } catch (err) {
    showLoading(false);
    showError(
      "We couldn't load data for this country. Please check your connection and try again."
    );
    console.error(err);
  }
}

function renderPage(country, wiki) {
  // ── Page title ──
  document.title = `${country.name.common} — Travel Planner`;
  document.getElementById("country-name").textContent = country.name.common;
  document.getElementById("country-flag").src = country.flags.svg;
  document.getElementById("country-flag").alt = `Flag of ${country.name.common}`;

  // ── Overview Tab ──
  document.getElementById("capital").textContent =
    country.capital?.[0] ?? "N/A";
  document.getElementById("population").textContent =
    country.population.toLocaleString();
  document.getElementById("region").textContent =
    `${country.region} — ${country.subregion ?? ""}`;
  document.getElementById("languages").textContent =
    country.languages ? Object.values(country.languages).join(", ") : "N/A";
  document.getElementById("currencies").textContent = country.currencies
    ? Object.values(country.currencies)
        .map((c) => `${c.name} (${c.symbol})`)
        .join(", ")
    : "N/A";

  // ── History & Culture Tab (Wikipedia) ──
  document.getElementById("wiki-extract").textContent =
    wiki.extract ?? "No summary available.";

  if (wiki.thumbnail?.source) {
    const img = document.getElementById("wiki-thumbnail");
    img.src = wiki.thumbnail.source;
    img.alt = `${country.name.common} — Wikipedia image`;
    img.classList.remove("hidden");
  }

  // ── Best Time to Visit Tab ──
  // Uses a small hardcoded dataset for a few countries,
  // falls back to a generic message for others.
  const seasons = getBestSeasons(country.name.common);
  document.getElementById("seasons-content").innerHTML = seasons;

  // ── Major Cities Tab ──
  // REST Countries doesn't provide cities, so we list the capital
  // and note that more info can be found on Wikipedia.
  const capital = country.capital?.[0] ?? "Unknown";
  document.getElementById("cities-content").innerHTML = `
    <p><strong>Capital:</strong> ${capital}</p>
    <p>For a full list of major cities and what they offer, visit the 
      <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(country.name.common)}" 
         target="_blank" rel="noopener">Wikipedia page for ${country.name.common}</a>.
    </p>
  `;

  // ── Bucket list button: show if already saved ──
  updateBucketButtonState(country.name.common);
}

// ─── 4. Tab Switching ─────────────────────────────────────────────────────────

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    // Deactivate all tabs
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabPanels.forEach((p) => p.classList.remove("active"));

    // Activate selected tab
    btn.classList.add("active");
    document.getElementById(target).classList.add("active");
  });

  // Keyboard support: Enter or Space activates tab
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
});

// ─── 5. Add to Bucket List ────────────────────────────────────────────────────

document.getElementById("bucket-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");

  // Read current bucket list from localStorage
  const existing = JSON.parse(localStorage.getItem("bucketList") || "[]");

  // Check if already saved
  if (existing.find((entry) => entry.name === name)) {
    bucketMsg.textContent = "Already in your bucket list!";
    bucketMsg.className = "bucket-msg info";
    return;
  }

  // Build new entry — matches the agreed data shape
  const newEntry = {
    name: name,
    flag: document.getElementById("country-flag").src,
    capital: document.getElementById("capital").textContent,
    label: bucketLabel.value,
    note: bucketNote.value.trim(),
    visited: false,
    dateSaved: new Date().toISOString().split("T")[0],
  };

  existing.push(newEntry);
  localStorage.setItem("bucketList", JSON.stringify(existing));

  // Feedback to user
  bucketMsg.textContent = `${name} added to your bucket list! 🌍`;
  bucketMsg.className = "bucket-msg success";
  bucketBtn.textContent = "✓ Saved";
  bucketBtn.disabled = true;
});

function updateBucketButtonState(name) {
  const existing = JSON.parse(localStorage.getItem("bucketList") || "[]");
  if (existing.find((entry) => entry.name === name)) {
    bucketBtn.textContent = "✓ Already Saved";
    bucketBtn.disabled = true;
  }
}

// ─── 6. Best Seasons Data ─────────────────────────────────────────────────────
// Hardcoded for popular destinations; generic fallback for others.

function getBestSeasons(countryName) {
  const data = {
    Japan: `
      <ul>
        <li>🌸 <strong>Spring (Mar–May):</strong> Cherry blossom season — the most popular time to visit.</li>
        <li>🍂 <strong>Autumn (Sep–Nov):</strong> Mild weather and stunning fall foliage.</li>
        <li>❄️ <strong>Winter (Dec–Feb):</strong> Great for skiing and fewer crowds.</li>
        <li>☔ <strong>Summer (Jun–Aug):</strong> Hot, humid, and rainy — least recommended.</li>
      </ul>`,
    France: `
      <ul>
        <li>🌸 <strong>Spring (Apr–Jun):</strong> Ideal weather, flowers in bloom, fewer tourists than summer.</li>
        <li>🍂 <strong>Autumn (Sep–Oct):</strong> Harvest season, great food and wine events.</li>
        <li>☀️ <strong>Summer (Jul–Aug):</strong> Warm and lively, but very crowded.</li>
        <li>❄️ <strong>Winter (Nov–Mar):</strong> Cold, but great for Christmas markets.</li>
      </ul>`,
    Italy: `
      <ul>
        <li>🌸 <strong>Spring (Apr–Jun):</strong> Perfect weather, ideal for sightseeing.</li>
        <li>🍂 <strong>Autumn (Sep–Oct):</strong> Harvest season, great food, fewer crowds.</li>
        <li>☀️ <strong>Summer (Jul–Aug):</strong> Very hot and busy — especially coastal areas.</li>
        <li>❄️ <strong>Winter (Nov–Mar):</strong> Quieter, cheaper, but cold in the north.</li>
      </ul>`,
    Morocco: `
      <ul>
        <li>🌸 <strong>Spring (Mar–May):</strong> Warm and pleasant across the country.</li>
        <li>🍂 <strong>Autumn (Sep–Nov):</strong> Great alternative to spring with similar conditions.</li>
        <li>☀️ <strong>Summer (Jun–Aug):</strong> Extremely hot, especially in the Sahara.</li>
        <li>❄️ <strong>Winter (Dec–Feb):</strong> Cool nights, but comfortable in southern regions.</li>
      </ul>`,
    Brazil: `
      <ul>
        <li>☀️ <strong>Dry Season (May–Sep):</strong> Best time to visit — less rain, more sunshine.</li>
        <li>🌊 <strong>Carnival (Feb–Mar):</strong> Iconic festival but very crowded.</li>
        <li>🌧️ <strong>Wet Season (Oct–Apr):</strong> Heavy rain, especially in the Amazon.</li>
      </ul>`,
  };

  return (
    data[countryName] ||
    `<p>Seasonal travel information for <strong>${countryName}</strong> isn't in our dataset yet. 
     We recommend checking 
     <a href="https://www.weatherbase.com" target="_blank" rel="noopener">Weatherbase</a> 
     or 
     <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}#Climate" 
        target="_blank" rel="noopener">Wikipedia's climate section</a> 
     for detailed seasonal info.</p>`
  );
}

// ─── 7. UI Helpers ────────────────────────────────────────────────────────────

function showLoading(visible) {
  loadingEl.classList.toggle("hidden", !visible);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  loadingEl.classList.add("hidden");
}

// ─── 8. Kick everything off ───────────────────────────────────────────────────

if (countryName) {
  loadCountry();
}