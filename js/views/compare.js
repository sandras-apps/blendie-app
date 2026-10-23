// Confronta + Risultato.
// La scelta dei due ingredienti resta nell'indirizzo (#/compare?a=retinol&b=niacinamide),
// così il risultato si può riaprire dai Preferiti o da un link.
import { t, pick, getLang } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle, withData, sourcesList, heartButton, bindHeart, levelStyle, setError } from '../ui.js';
import { getIngredient, comparePair } from '../data.js';
import { isFavoritePair, toggleFavoritePair } from '../storage.js';
import { comboHtml, setupCombo, rankedIngredients } from '../combo.js';

const KEYS = ['a', 'b'];

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

    const field = (key) => comboHtml(`combo-${key}`, labels[key], {
      placeholder: t('compare.placeholder'),
      clearLabel: t('compare.clearField', { field: labels[key] }),
    });

    main.innerHTML = `${pageTitle(t('title.compare'))}
      <p class="intro">${esc(t('compare.intro'))}</p>
      <form class="card compare-form" id="compare-form" novalidate>
        ${field('a')}
        <div class="swap-row">
          <button class="swap-button" type="button" id="swap" aria-label="${esc(t('compare.swapLabel'))}">
            ${icon('swap')}<span>${esc(t('compare.swap'))}</span>
          </button>
        </div>
        ${field('b')}
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
      bindHeart(resultArea.querySelector('.heart-button'), () => toggleFavoritePair(res.a.id, res.b.id));
      if (moveFocus) {
        resultArea.querySelector('#result-title').focus({ preventScroll: true });
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        resultArea.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }

    function hideResult() {
      resultArea.innerHTML = '';
    }

    // Mostra nel campo l'ingrediente scelto (lilla) oppure lo svuota.
    function refresh(key) {
      const { input, field: wrapper, updateClear } = combos[key];
      const ing = getIngredient(selected[key]);
      if (ing) input.value = pick(ing.name);
      else if (document.activeElement !== input) input.value = '';
      wrapper.classList.toggle('is-selected', Boolean(ing));
      updateClear();
    }

    function setSelected(key, id) {
      selected[key] = id;
      refresh(key);
      setError(error, '');
      hideResult();
      syncUrl();
    }

    KEYS.forEach((key) => {
      const other = key === 'a' ? 'b' : 'a';
      combos[key] = setupCombo(main, `combo-${key}`, {
        // Niente farmaci; l'ingrediente scelto nell'altro campo è "già scelto".
        options: (text) => rankedIngredients(text, collator)
          .filter((o) => canCompare(o.ing))
          .map((o) => {
            const taken = o.ing.id === selected[other];
            return { ...o, disabled: taken, note: taken ? t('compare.taken') : '' };
          }),
        onChoose: (option) => {
          setSelected(key, option.ing.id);
          // Scelto il primo, si passa al secondo se è ancora vuoto.
          if (key === 'a' && !selected.b) combos.b.input.focus();
        },
        onEdit: () => {
          setError(error, '');
          if (selected[key]) {
            selected[key] = null;
            combos[key].field.classList.remove('is-selected');
            hideResult();
            syncUrl();
          }
        },
        onClear: () => setSelected(key, null),
      });
      refresh(key);
    });
    syncUrl();

    main.querySelector('#swap').addEventListener('click', () => {
      [selected.a, selected.b] = [selected.b, selected.a];
      KEYS.forEach((key) => {
        if (!selected[key]) combos[key].input.value = '';
        refresh(key);
      });
      syncUrl();
      if (resultArea.innerHTML) showResult(false);
    });

    main.querySelector('#restart').addEventListener('click', () => {
      KEYS.forEach((key) => {
        selected[key] = null;
        combos[key].input.value = '';
        refresh(key);
        combos[key].close();
      });
      setError(error, '');
      hideResult();
      syncUrl();
      combos.a.input.focus();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const missing = KEYS.find((key) => !selected[key]);
      if (missing) {
        setError(error, t('compare.missing'));
        combos[missing].input.focus();
        return;
      }
      KEYS.forEach((key) => combos[key].close());
      showResult(true);
    });

    // Arrivando con tutti e due gli ingredienti (Preferiti, link) il risultato si vede subito.
    if (selected.a && selected.b) showResult(false);
  });
}
