import { renderNav, renderFooter } from './components.js';
import { initTheme } from './theme.js';
import * as storage from './storage.js';

// ── Shared setup ─────────────────────────────────────────────────────────────
renderNav('bucket-list');
renderFooter();
initTheme();

const grid = document.getElementById('bucket-grid');
const emptyState = document.getElementById('empty-state');
const countEl = document.getElementById('bucket-count');

function render() {
  const entries = storage.getAll()
  .slice()
  .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  grid.innerHTML = '';

  countEl.textContent = `${entries.length} destination${entries.length !== 1 ? 's' : ''}`;

  // Empty state (when there are no bucketList objects in local storage)
  if (entries.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  entries.forEach(entry => {
    const card = document.createElement('article');
    card.className = 'bucket-card';

card.innerHTML = `
    <img 
      src="${entry.flag}" 
      alt="Flag of ${entry.name}" 
    />

    <div class="bucket-card-body">
      
      <div class="bucket-card-header">
        <h3 class="bucket-card-title">${entry.name}</h3>

        <span 
          class="bucket-status ${entry.visited ? 'visited' : 'planned'}"
          role="status"
          aria-label="Status: ${entry.visited ? 'Visited' : 'Planned'}"
        >
          ${entry.visited ? 'Visited' : 'Planned'}
        </span>
      </div>

      <div class="bucket-meta" aria-label="Destination details">
        <p><strong>Capital:</strong> ${entry.capital || 'N/A'}</p>
        <p><strong>Category:</strong> ${entry.label || 'N/A'}</p>
        <p><strong>Saved:</strong> ${entry.dateSaved || '—'}</p>
      </div>

      <label class="sr-only" for="notes-${entry.name}">
        Trip notes for ${entry.name}
      </label>

      <textarea 
        id="notes-${entry.name}"
        class="bucket-notes" 
        placeholder="Write your trip notes..."
        aria-label="Trip notes for ${entry.name}"
      >${entry.note || ''}</textarea>

      <div class="bucket-actions" aria-label="Card actions for ${entry.name}">
        
        <button 
          class="btn btn-outline toggle-btn"
          aria-label="${entry.visited ? 'Mark as planned' : 'Mark as visited'} for ${entry.name}"
        >
          ${entry.visited ? 'Mark Planned' : 'Mark Visited'}
        </button>

        <button 
          class="btn btn-outline remove-btn"
          aria-label="Remove ${entry.name} from bucket list"
        >
          Remove
        </button>
      </div>

      <button 
        class="favorite-btn ${entry.favorite ? 'active' : ''}" 
        aria-label="${entry.favorite ? 'Remove from favorites' : 'Add to favorites'} for ${entry.name}"
        aria-pressed="${entry.favorite ? 'true' : 'false'}"
      >
        ${entry.favorite ? '★' : '☆'}
      </button>

    </div>
  </article>
`;

const textarea = card.querySelector('.bucket-notes');

textarea.addEventListener('input', () => {
  const all = storage.getAll();
  const idx = all.findIndex(e => e.name === entry.name);

  if (idx >= 0) {
    all[idx].note = textarea.value;
    localStorage.setItem('bucketList', JSON.stringify(all));
  }
});

    // visited
    card.querySelector('.toggle-btn').addEventListener('click', () => {
      storage.toggleVisited(entry.name);
      render();
    });

    // Remove
    card.querySelector('.remove-btn').addEventListener('click', () => {
      storage.removeEntry(entry.name);
      render();
    });

    // favorite
    card.querySelector('.favorite-btn').addEventListener('click', () => {
      storage.toggleFavorite(entry.name);
      render();
    });

    grid.appendChild(card);
  });
}

render();