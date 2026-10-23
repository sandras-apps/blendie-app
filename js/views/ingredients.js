// Elenco degli ingredienti (con ricerca e filtri) e scheda del singolo ingrediente
// (la scheda si costruisce nel passo "Scheda").
import { t, pick, getLang } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle, soon, withData, drugBadge } from '../ui.js';
import { matchIngredient, normalize } from '../data.js';

// Ricerca e filtro restano come li hai lasciati quando torni all'elenco.
const state = { query: '', category: 'all' };

export function renderIngredients(main) {
  withData(main, (data) => {
    const categoryNames = new Map(data.categories.map((c) => [c.id, pick(c)]));
    const chips = [{ id: 'all', label: t('ingredients.all') }, ...data.categories.map((c) => ({ id: c.id, label: pick(c) }))];

    main.innerHTML = `${pageTitle(t('title.ingredients'))}
      <div class="search-field">
        <label class="visually-hidden" for="ingredient-search">${esc(t('ingredients.search'))}</label>
        ${icon('search', 'icon search-icon')}
        <input class="search-input" id="ingredient-search" type="search" value="${esc(state.query)}"
          placeholder="${esc(t('ingredients.placeholder'))}" autocomplete="off" autocapitalize="none"
          spellcheck="false" enterkeyhint="search">
      </div>
      <div class="chips" role="group" aria-label="${esc(t('ingredients.filters'))}">
        ${chips.map((chip) => `<button class="chip" type="button" data-category="${chip.id}"
          aria-pressed="${chip.id === state.category}">${esc(chip.label)}</button>`).join('')}
      </div>
      <p class="list-count muted" id="ingredient-count" aria-live="polite"></p>
      <ul class="ingredient-list" id="ingredient-list"></ul>`;

    const input = main.querySelector('#ingredient-search');
    const list = main.querySelector('#ingredient-list');
    const count = main.querySelector('#ingredient-count');
    const collator = new Intl.Collator(getLang(), { sensitivity: 'base' });

    function update() {
      const q = normalize(state.query);
      const rows = [];
      for (const ing of data.ingredients) {
        if (state.category !== 'all' && !ing.categories.includes(state.category)) continue;
        const match = matchIngredient(ing, state.query);
        if (!match) continue;
        const name = pick(ing.name);
        // Se l'ingrediente è stato trovato per un sinonimo, lo diciamo.
        const also = q && !normalize(name).includes(q) ? match.text : null;
        rows.push({ ing, name, also });
      }
      rows.sort((a, b) => collator.compare(a.name, b.name));

      count.textContent = rows.length === 1 ? t('ingredients.count.one') : t('ingredients.count', { n: rows.length });
      if (!rows.length) {
        list.innerHTML = `<li class="card list-empty">${esc(t('ingredients.none'))}</li>`;
        return;
      }
      list.innerHTML = rows.map(({ ing, name, also }) => {
        const cats = ing.categories.filter((c) => c !== 'drugs').map((c) => categoryNames.get(c)).filter(Boolean);
        return `<li><a class="ingredient-row" href="#/ingredient/${encodeURIComponent(ing.id)}">
          <span class="ingredient-text">
            <span class="ingredient-name">${esc(name)}</span>
            ${ing.drug ? drugBadge() : ''}
            ${also ? `<span class="ingredient-also">${esc(t('ingredients.also', { text: also }))}</span>` : ''}
            ${cats.length ? `<span class="ingredient-meta">${esc(cats.join(' · '))}</span>` : ''}
          </span>
          ${icon('chevron', 'icon chevron')}
        </a></li>`;
      }).join('');
    }

    input.addEventListener('input', () => {
      state.query = input.value;
      update();
    });

    main.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        state.category = chip.dataset.category;
        main.querySelectorAll('.chip').forEach((other) => {
          other.setAttribute('aria-pressed', String(other === chip));
        });
        update();
      });
    });

    update();
    const active = main.querySelector('.chip[aria-pressed="true"]');
    if (active && state.category !== 'all') active.scrollIntoView({ block: 'nearest', inline: 'center' });
  });
}

export function renderIngredient(main) {
  main.innerHTML = soon('title.ingredient');
}
