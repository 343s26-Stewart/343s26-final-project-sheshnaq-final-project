// api.js — Shared API utility functions for the Travel Planner app
// Used by: country.js, explore.js (and any other page that needs country data)

const REST_COUNTRIES_BASE = "https://restcountries.com/v3.1";
const WIKIPEDIA_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";

/**
 * Fetches country data from REST Countries API by country name.
 * Returns the first match (most relevant result).
 * @param {string} countryName - e.g. "Japan"
 * @returns {Promise<Object>} - country data object
 */
export async function fetchCountryData(countryName) {
  const response = await fetch(
    `${REST_COUNTRIES_BASE}/name/${encodeURIComponent(countryName)}?fullText=false`
  );
  if (!response.ok) {
    throw new Error(`Could not find country: "${countryName}"`);
  }
  const data = await response.json();
  return data[0]; // REST Countries returns an array, we take the best match
}

/**
 * Fetches a Wikipedia summary/blurb for a given country name.
 * @param {string} countryName - e.g. "Japan"
 * @returns {Promise<Object>} - Wikipedia summary object { title, extract, thumbnail }
 */
export async function fetchWikipediaSummary(countryName) {
  const response = await fetch(
    `${WIKIPEDIA_BASE}/${encodeURIComponent(countryName)}`
  );
  if (!response.ok) {
    throw new Error(`Could not load Wikipedia summary for "${countryName}"`);
  }
  return await response.json();
}

/**
 * Fetches both country data and Wikipedia summary in parallel.
 * This is the main function country.js should use.
 * @param {string} countryName
 * @returns {Promise<{ country: Object, wiki: Object }>}
 */
export async function fetchAllCountryInfo(countryName) {
  const [country, wiki] = await Promise.all([
    fetchCountryData(countryName),
    fetchWikipediaSummary(countryName),
  ]);
  return { country, wiki };
}