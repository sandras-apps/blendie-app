// Elenco degli ingredienti (con ricerca e filtro per categoria) e scheda del singolo ingrediente.
import { t, pick, getLang } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle, withData, drugBadge, sourcesList, heartButton, bindHeart } from '../ui.js';
import { searchIngredients, normalize, getIngredient } from '../data.js';
import { isFavoriteIngredient, toggleFavoriteIngredient } from '../storage.js';

// Ricerca e filtro restano come li hai lasciati quando torni all'elenco.
const state = { query: '', category: 'all' };

export function renderIngredients(main) {
  withData(main, (data) => {
    const categoryNames = new Map(data.categories.map((c) => [c.id, pick(c)]));

    main.innerHTML = `${pageTitle(t('title.ingredients'))}
      <div class="search-field">
        <label class="visually-hidden" for="ingredient-search">${esc(t('ingredients.search'))}</label>
        ${icon('search', 'icon search-icon')}
        <input class="search-input" id="ingredient-search" type="search" value="${esc(state.query)}"
          placeholder="${esc(t('ingredients.placeholder'))}" autocomplete="off" autocapitalize="none"
          spellcheck="false" enterkeyhint="search">
      </div>
      <div class="filter" id="category-filter">
        <label class="filter-label" for="category-select">${esc(t('filter.category'))}</label>
        <div class="filter-control">
          <select class="filter-select" id="category-select">
            <option value="all">${esc(t('filter.all'))}</option>
            ${data.categories.map((c) => `<option value="${esc(c.id)}">${esc(pick(c))}</option>`).join('')}
          </select>
          ${icon('chevron', 'icon filter-arrow')}
        </div>
        <button class="filter-clear" type="button" id="category-clear">${icon('x', 'icon icon-small')}<span>${esc(t('filter.clear'))}</span></button>
      </div>
      <p class="list-count muted" id="ingredient-count" aria-live="polite"></p>
      <ul class="ingredient-list" id="ingredient-list"></ul>`;

    const input = main.querySelector('#ingredient-search');
    const select = main.querySelector('#category-select');
    const clear = main.querySelector('#category-clear');
    const filter = main.querySelector('#category-filter');
    const list = main.querySelector('#ingredient-list');
    const count = main.querySelector('#ingredient-count');
    const collator = new Intl.Collator(getLang(), { sensitivity: 'base' });

    function showFilter() {
      const active = state.category !== 'all';
      select.value = state.category;
      filter.classList.toggle('is-active', active);
      clear.hidden = !active;
    }

    function update() {
      const rows = searchIngredients(state.query)
        .filter(({ ing }) => state.category === 'all' || ing.categories.includes(state.category));
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

    select.addEventListener('change', () => {
      state.category = select.value;
      showFilter();
      update();
    });

    clear.addEventListener('click', () => {
      state.category = 'all';
      showFilter();
      update();
      select.focus();
    });

    if (!data.categories.some((c) => c.id === state.category)) state.category = 'all';
    showFilter();
    update();
  });
}

// Una sezione della scheda; se il testo è vuoto, la sezione non si mostra.
function section(titleKey, text, { className = '', iconName = '' } = {}) {
  if (!text) return '';
  return `<section class="card card-section ${className}">
    <h2 class="section-title">${iconName ? icon(iconName) : ''}${esc(t(titleKey))}</h2>
    <p>${esc(text)}</p>
  </section>`;
}

export function renderIngredient(main, { args }) {
  withData(main, (data) => {
    const ing = getIngredient(args[0]);
    if (!ing) {
      main.innerHTML = `${pageTitle(t('title.ingredient'))}
        <div class="card status-message">
          <p>${esc(t('card.notFound'))}</p>
          <a class="btn btn-primary" href="#/ingredients">${esc(t('card.toList'))}</a>
        </div>`;
      return;
    }

    const name = pick(ing.name);
    document.title = `${name} · ${t('app.name')}`;

    const categoryNames = new Map(data.categories.map((c) => [c.id, pick(c)]));
    const tags = ing.categories.map((c) => categoryNames.get(c)).filter(Boolean);

    // I sinonimi uguali al nome (es. "squalane" per Squalane) non si ripetono.
    const ownNames = new Set([normalize(ing.name.it), normalize(ing.name.en)]);
    const synonyms = (ing.synonyms || []).filter((s) => !ownNames.has(normalize(s)));
    const inci = ing.inci || [];

    const drug = data.levels.drug;
    const studies = pick(ing.studies) || [];
    const saved = isFavoriteIngredient(ing.id);

    main.innerHTML = `
      <header class="ingredient-header">
        <div class="title-row">
          ${pageTitle(name)}
          ${heartButton(saved, t('card.favorite'))}
        </div>
        ${ing.drug ? drugBadge() : ''}
        ${tags.length ? `<ul class="tags">${tags.map((tag) => `<li class="tag">${esc(tag)}</li>`).join('')}</ul>` : ''}
        ${ing.drug ? '' : `<a class="btn btn-primary btn-block" href="#/compare?a=${encodeURIComponent(ing.id)}">${icon('blend')}${esc(t('card.compare'))}</a>`}
      </header>

      ${ing.notAcid ? `<div class="callout callout-highlight"><p>${esc(pick(ing.notAcid))}</p></div>` : ''}

      ${ing.drug ? `<div class="callout callout-drug" style="background:${esc(drug.tint)};color:${esc(drug.text)};border-color:${esc(drug.color)}">
        ${icon('pill')}<p>${esc(pick(drug.note))}</p>
      </div>` : ''}

      ${synonyms.length || inci.length ? `<dl class="card names">
        ${synonyms.length ? `<div><dt>${esc(t('card.otherNames'))}</dt><dd>${esc(synonyms.join(', '))}</dd></div>` : ''}
        ${inci.length ? `<div><dt>${esc(t('card.inci'))}</dt><dd>${esc(inci.join(', '))}</dd></div>` : ''}
      </dl>` : ''}

      ${section('card.what', pick(ing.what))}
      ${section('card.percentages', pick(ing.percentages))}
      ${section('card.howto', pick(ing.howto))}
      ${section('card.warning', pick(ing.warning), { className: 'card-warning', iconName: 'alert' })}

      ${studies.length ? `<details class="card details">
        <summary class="section-title">${esc(t('card.studies'))} (${studies.length})</summary>
        <ul class="studies">${studies.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      </details>` : ''}

      <section class="card card-section">
        <h2 class="section-title">${esc(t('card.sources'))}</h2>
        ${sourcesList(ing.sources)}
        ${pick(ing.latest) ? `<p class="latest"><strong>${esc(t('card.latest'))}:</strong> ${esc(pick(ing.latest))}</p>` : ''}
      </section>`;

    bindHeart(main.querySelector('.heart-button'), () => toggleFavoriteIngredient(ing.id));
  });
}
