// Confronta + Risultato.
// La scelta dei due ingredienti resta nell'indirizzo (#/compare?a=retinol&b=niacinamide),
// così il risultato si può riaprire dai Preferiti o da un link.
import { t, pick, getLang } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle, withData, sourcesList, heartButton, bindHeart, levelStyle } from '../ui.js';
import { searchIngredients, getIngredient, comparePair } from '../data.js';
import { isFavoritePair, toggleFavoritePair } from '../storage.js';

const KEYS = ['a', 'b'];

function comboField(key, label) {
  return `<div class="combo-field" id="field-${key}">
    <label class="combo-label" for="combo-${key}">${esc(label)}</label>
    <div class="combo">
      ${icon('search', 'icon combo-icon')}
      <input class="combo-input" id="combo-${key}" type="text" role="combobox"
        aria-autocomplete="list" aria-expanded="false" aria-controls="combo-${key}-list"
        autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search"
        placeholder="${esc(t('compare.placeholder'))}">
      <button class="combo-clear" type="button" id="combo-${key}-clear"
        aria-label="${esc(t('compare.clearField', { field: label }))}" hidden>${icon('x')}</button>
    </div>
    <ul class="combo-list" id="combo-${key}-list" role="listbox" aria-label="${esc(label)}" hidden></ul>
  </div>`;
}

// I farmaci non si possono scegliere in Confronta: hanno solo la scheda informativa.
const canCompare = (ing) => Boolean(ing && !ing.drug);

// Il riquadro del risultato. Qui parlano solo la scienza e le fonti: niente mascotte.
function resultHtml(res, data) {
  const level = data.levels[res.state];
  const names = `<p class="result-pair">
    <a href="#/ingredient/${encodeURIComponent(res.a.id)}">${esc(pick(res.a.name))}</a>
    <span aria-hidden="true">+</span>
    <a href="#/ingredient/${encodeURIComponent(res.b.id)}">${esc(pick(res.b.name))}</a>
  </p>`;

  let body = '';
  if (res.state === 'unknown') {
    body = `<p class="result-note">${esc(pick(level.note))}</p>`;
  } else {
    const basis = data.basis[res.pair.basis];
    body = `<p class="result-advice">${esc(pick(res.pair.advice))}</p>
      ${basis ? `<p class="result-basis"><strong>${esc(t('result.basis'))}:</strong> ${esc(pick(basis))}</p>` : ''}
      <h3 class="result-subtitle">${esc(t('result.sources'))}</h3>
      ${sourcesList(res.pair.sources)}`;
  }

  return `<section class="result result-${esc(res.state)}" aria-labelledby="result-title" style="${levelStyle(level)}">
    <div class="result-head">
      <span class="level-circle">${icon(level.icon)}</span>
      <div class="result-heading">
        <p class="result-kicker">${esc(t('result.label'))}</p>
        <h2 class="result-title" id="result-title" tabindex="-1">${esc(pick(level))}</h2>
      </div>
      ${heartButton(isFavoritePair(res.a.id, res.b.id), t('result.favorite'))}
    </div>
    ${names}
    ${body}
    <p class="disclaimer">${esc(pick(data.disclaimer))}</p>
  </section>`;
}

export function renderCompare(main, { query }) {
  withData(main, (data) => {
    const collator = new Intl.Collator(getLang(), { sensitivity: 'base' });
    const labels = { a: t('compare.first'), b: t('compare.second') };
    const valid = (id) => (canCompare(getIngredient(id)) ? id : null);
    const selected = { a: valid(query.get('a')), b: valid(query.get('b')) };
    if (selected.a && selected.a === selected.b) selected.b = null;

    main.innerHTML = `${pageTitle(t('title.compare'))}
      <p class="intro">${esc(t('compare.intro'))}</p>
      <form class="card compare-form" id="compare-form" novalidate>
        ${comboField('a', labels.a)}
        <div class="swap-row">
          <button class="swap-button" type="button" id="swap" aria-label="${esc(t('compare.swapLabel'))}">
            ${icon('swap')}<span>${esc(t('compare.swap'))}</span>
          </button>
        </div>
        ${comboField('b', labels.b)}
        <p class="form-error" id="compare-error" role="alert"></p>
        <div class="compare-actions">
          <button class="btn btn-primary" type="submit">${esc(t('compare.check'))}</button>
          <button class="btn btn-ghost" type="button" id="restart">${icon('restart')}${esc(t('compare.restart'))}</button>
        </div>
      </form>
      <div class="result-area" id="result"></div>`;

    const form = main.querySelector('#compare-form');
    const resultArea = main.querySelector('#result');
    const error = main.querySelector('#compare-error');
    const combos = {};

    // L'indirizzo segue la scelta, senza aggiungere pagine alla cronologia.
    function syncUrl() {
      const params = new URLSearchParams();
      KEYS.forEach((key) => selected[key] && params.set(key, selected[key]));
      const hash = params.toString() ? `#/compare?${params}` : '#/compare';
      if (location.hash !== hash) history.replaceState(history.state, '', hash);
    }

    function showResult(moveFocus) {
      const res = comparePair(selected.a, selected.b);
      // 'same' e 'drug' qui non possono arrivare; il controllo resta per sicurezza.
      if (!res || res.state === 'same' || res.state === 'drug') return;
      resultArea.innerHTML = resultHtml(res, data);
      const heart = resultArea.querySelector('.heart-button');
      if (heart) bindHeart(heart, () => toggleFavoritePair(res.a.id, res.b.id));
      if (moveFocus) {
        const title = resultArea.querySelector('#result-title');
        title.focus({ preventScroll: true });
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        resultArea.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }

    function hideResult() {
      resultArea.innerHTML = '';
    }

    function setSelected(key, id) {
      selected[key] = id;
      combos[key].refresh();
      error.textContent = '';
      hideResult();
      syncUrl();
    }

    function setupCombo(key) {
      const other = key === 'a' ? 'b' : 'a';
      const field = main.querySelector(`#field-${key}`);
      const input = main.querySelector(`#combo-${key}`);
      const list = main.querySelector(`#combo-${key}-list`);
      const clear = main.querySelector(`#combo-${key}-clear`);
      let options = [];
      let active = -1;

      function refresh() {
        const ing = getIngredient(selected[key]);
        input.value = ing ? pick(ing.name) : input.value;
        if (!selected[key] && document.activeElement !== input) input.value = '';
        field.classList.toggle('is-selected', Boolean(ing));
        clear.hidden = !input.value;
      }

      function renderOptions() {
        if (!options.length) {
          list.innerHTML = `<li class="combo-empty" role="option" aria-disabled="true">${esc(t('compare.noMatch'))}</li>`;
          return;
        }
        list.innerHTML = options.map((o, i) => `
          <li class="combo-option${i === active ? ' is-active' : ''}" role="option" id="combo-${key}-option-${i}"
            data-index="${i}" aria-selected="${i === active}"${o.taken ? ' aria-disabled="true"' : ''}>
            <span class="combo-option-name">${esc(o.name)}</span>
            ${o.taken ? `<span class="combo-option-note">${esc(t('compare.taken'))}</span>` : ''}
            ${o.also ? `<span class="combo-option-also">${esc(t('ingredients.also', { text: o.also }))}</span>` : ''}
          </li>`).join('');
      }

      // I suggerimenti seguono sempre il testo del campo: la lista completa
      // si vede solo quando il campo è vuoto.
      function open() {
        options = searchIngredients(input.value)
          .filter((o) => canCompare(o.ing))
          .sort((x, y) => x.score - y.score || collator.compare(x.name, y.name))
          .map((o) => ({ ...o, taken: o.ing.id === selected[other] }));
        active = -1;
        input.removeAttribute('aria-activedescendant');
        renderOptions();
        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
      }

      function close() {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        active = -1;
      }

      function setActive(index) {
        active = index;
        list.querySelectorAll('.combo-option').forEach((li, i) => {
          li.classList.toggle('is-active', i === index);
          li.setAttribute('aria-selected', String(i === index));
        });
        const li = list.querySelector(`#combo-${key}-option-${index}`);
        if (li) {
          input.setAttribute('aria-activedescendant', li.id);
          li.scrollIntoView({ block: 'nearest' });
        }
      }

      function move(step) {
        if (list.hidden) open();
        let next = active;
        do {
          next += step;
        } while (next >= 0 && next < options.length && options[next].taken);
        if (next >= 0 && next < options.length) setActive(next);
      }

      function choose(index) {
        const option = options[index];
        if (!option || option.taken) return;
        close();
        setSelected(key, option.ing.id);
        // Scelto il primo, si passa al secondo se è ancora vuoto.
        if (key === 'a' && !selected.b) main.querySelector('#combo-b').focus();
      }

      input.addEventListener('input', () => {
        if (selected[key]) {
          selected[key] = null;
          field.classList.remove('is-selected');
          hideResult();
          syncUrl();
        }
        clear.hidden = !input.value;
        error.textContent = '';
        open();
      });

      // Toccando un campo già pieno il testo è tutto selezionato:
      // se si inizia a scrivere, lo si sostituisce subito.
      let keepSelection = false;
      input.addEventListener('focus', () => {
        open();
        if (input.value) {
          input.select();
          keepSelection = true;
          setTimeout(() => { keepSelection = false; }, 300);
        }
      });

      // Il clic che ha dato il focus non deve togliere la selezione del testo.
      input.addEventListener('mouseup', (event) => {
        if (keepSelection) event.preventDefault();
      });

      input.addEventListener('click', () => {
        if (keepSelection) input.select();
        if (list.hidden) open();
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          move(1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          move(-1);
        } else if (event.key === 'Enter' && !list.hidden) {
          const usable = options.filter((o) => !o.taken);
          if (active >= 0 || usable.length === 1) {
            event.preventDefault();
            choose(active >= 0 ? active : options.indexOf(usable[0]));
          }
        } else if (event.key === 'Escape' && !list.hidden) {
          event.preventDefault();
          close();
        }
      });

      // Toccare un'opzione non deve togliere il focus dal campo prima della scelta.
      list.addEventListener('mousedown', (event) => event.preventDefault());
      list.addEventListener('click', (event) => {
        const li = event.target.closest('.combo-option');
        if (li) choose(Number(li.dataset.index));
      });

      field.addEventListener('focusout', (event) => {
        if (!field.contains(event.relatedTarget)) close();
      });

      clear.addEventListener('click', () => {
        input.value = '';
        setSelected(key, null);
        input.focus();
      });

      return { refresh, close };
    }

    KEYS.forEach((key) => {
      combos[key] = setupCombo(key);
      combos[key].refresh();
    });
    syncUrl();

    main.querySelector('#swap').addEventListener('click', () => {
      [selected.a, selected.b] = [selected.b, selected.a];
      KEYS.forEach((key) => {
        if (!selected[key]) main.querySelector(`#combo-${key}`).value = '';
        combos[key].refresh();
      });
      syncUrl();
      if (resultArea.innerHTML) showResult(false);
    });

    main.querySelector('#restart').addEventListener('click', () => {
      KEYS.forEach((key) => {
        selected[key] = null;
        main.querySelector(`#combo-${key}`).value = '';
        combos[key].refresh();
        combos[key].close();
      });
      error.textContent = '';
      hideResult();
      syncUrl();
      main.querySelector('#combo-a').focus();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const missing = KEYS.find((key) => !selected[key]);
      if (missing) {
        error.textContent = t('compare.missing');
        main.querySelector(`#combo-${missing}`).focus();
        return;
      }
      KEYS.forEach((key) => combos[key].close());
      showResult(true);
    });

    // Arrivando con tutti e due gli ingredienti (Preferiti, link) il risultato si vede subito.
    if (selected.a && selected.b) showResult(false);
  });
}
