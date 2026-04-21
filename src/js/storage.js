// storage.js — Single source of truth for bucket list persistence
// Uses the "bucketList" key so it stays compatible with country.js writes.

const KEY = 'bucketList';

/** @returns {Array} all saved entries */
export function getAll() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

function persist(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

/** @returns {Object|null} single entry by country name, or null */
export function getEntry(name) {
  return getAll().find(e => e.name === name) ?? null;
}

/** Add new entry or merge into existing one by name */
export function addEntry(entry) {
  const all = getAll();
  const idx = all.findIndex(e => e.name === entry.name);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...entry };
  } else {
    all.push({ visited: false, favorite: false, dateSaved: new Date().toISOString().split('T')[0], ...entry });
  }
  persist(all);
}

export function removeEntry(name) {
  persist(getAll().filter(e => e.name !== name));
}

export function toggleVisited(name) {
  const all = getAll();
  const idx = all.findIndex(e => e.name === name);
  if (idx >= 0) {
    all[idx].visited = !all[idx].visited;
    persist(all);
  }
}

export function toggleFavorite(name) {
  const all = getAll();
  const idx = all.findIndex(e => e.name === name);
  if (idx >= 0) {
    all[idx].favorite = !all[idx].favorite;
    persist(all);
  }
}

/** @returns {number} total saved entries */
export function getCount() {
  return getAll().length;
}

/** @returns {string} pretty-printed JSON for export */
export function exportData() {
  return JSON.stringify(getAll(), null, 2);
}

/**
 * Replaces stored data with parsed JSON string.
 * @returns {boolean} true on success, false on bad input
 */
export function importData(json) {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) throw new Error('Expected an array');
    persist(data);
    return true;
  } catch {
    return false;
  }
}
