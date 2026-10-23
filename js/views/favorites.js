// Preferiti: abbinamenti e ingredienti salvati sul dispositivo.
// Degli abbinamenti si salvano solo i due id: il risultato si calcola ogni volta
// da data.json, così se un abbinamento cambia, qui si vede quello nuovo.
import { t, pick } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle, emptyState, withData, drugBadge, levelStyle } from '../ui.js';
import { comparePair, getIngredient } from '../data.js';
import { getFavorites, removeFavoriteIngredient, removeFavoritePair } from '../storage.js';

const SHOWN_STATES = ['green', 'yellow', 'red', 'unknown'];

function removeButton(name) {
  return `<button class="fav-remove" type="button" aria-label="${esc(t('fav.remove', { name }))}" title="${esc(t('fav.remove', { name }))}">
    ${icon('heart')}
  </button>`;
}

function pairItem(res, data) {
  const level = data.levels[res.state];
  const name = `${pick(res.a.name)} + ${pick(res.b.name)}`;
  const href = `#/compare?a=${encodeURIComponent(res.a.id)}&b=${encodeURIComponent(res.b.id)}`;
  return `<li class="fav-item" data-a="${esc(res.a.id)}" data-b="${esc(res.b.id)}" data-name="${esc(name)}" style="${levelStyle(level)}">
    <a class="fav-link" href="${href}">
      <span class="fav-level-icon">${icon(level.icon)}</span>
      <span class="fav-text">
        <span class="fav-name">${esc(name)}</span>
        <span class="fav-level">${esc(pick(level))}</span>
      </span>
    </a>
    ${removeButton(name)}
  </li>`;
}

function ingredientItem(ing) {
  const name = pick(ing.name);
  return `<li class="fav-item" data-id="${esc(ing.id)}" data-name="${esc(name)}">
    <a class="fav-link" href="#/ingredient/${encodeURIComponent(ing.id)}">
      <span class="fav-text">
        <span class="fav-name">${esc(name)}</span>
        ${ing.drug ? drugBadge() : ''}
      </span>
    </a>
    ${removeButton(name)}
  </li>`;
}

export function renderFavorites(main) {
  withData(main, (data) => {
    const favorites = getFavorites();
    // Si mostrano solo i preferiti che esistono ancora in data.json.
    const pairs = favorites.pairs
      .map(([a, b]) => comparePair(a, b))
      .filter((res) => res && SHOWN_STATES.includes(res.state));
    const ingredients = favorites.ingredients.map(getIngredient).filter(Boolean);

    // Coco solo quando non c'è niente di salvato.
    if (!pairs.length && !ingredients.length) {
      main.innerHTML = `${pageTitle(t('title.favorites'))}${emptyState('favorites.empty')}`;
      return;
    }

    const section = (id, titleKey, emptyKey, items) => `
      <section class="fav-section" aria-labelledby="${id}-title">
        <h2 class="fav-section-title" id="${id}-title" tabindex="-1">${esc(t(titleKey))}</h2>
        <ul class="fav-list" id="${id}-list">${items.join('')}</ul>
        <p class="fav-empty muted" id="${id}-empty"${items.length ? ' hidden' : ''}>${esc(t(emptyKey))}</p>
      </section>`;

    main.innerHTML = `${pageTitle(t('title.favorites'))}
      ${section('fav-pairs', 'fav.pairs', 'fav.noPairs', pairs.map((res) => pairItem(res, data)))}
      ${section('fav-ingredients', 'fav.ingredients', 'fav.noIngredients', ingredients.map(ingredientItem))}
      <p class="visually-hidden" aria-live="polite" id="fav-status"></p>`;

    main.querySelectorAll('.fav-remove').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.fav-item');
        const list = item.parentElement;
        const sectionEl = item.closest('.fav-section');
        const next = item.nextElementSibling || item.previousElementSibling;

        if (item.dataset.id) removeFavoriteIngredient(item.dataset.id);
        else removeFavoritePair(item.dataset.a, item.dataset.b);
        item.remove();
        main.querySelector('#fav-status').textContent = t('fav.removed', { name: item.dataset.name });

        if (!main.querySelector('.fav-item')) {
          // Era l'ultimo preferito: torna la pagina vuota con Coco (e il focus va al titolo).
          main.focus({ preventScroll: true });
          renderFavorites(main);
          return;
        }
        if (!list.children.length) {
          sectionEl.querySelector('.fav-empty').hidden = false;
        }
        // Il focus non si perde: va al preferito vicino o al titolo della sezione.
        (next ? next.querySelector('.fav-remove') : sectionEl.querySelector('.fav-section-title')).focus();
      });
    });
  });
}
