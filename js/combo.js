// Campo di ricerca degli ingredienti con la lista dei suggerimenti
// (usato in Confronta e in I miei prodotti). Segue lo schema "combobox"
// per i lettori di schermo e funziona con dito, mouse e tastiera.
import { t } from './i18n.js';
import { icon } from './icons.js';
import { esc, drugBadge } from './ui.js';
import { searchIngredients } from './data.js';

// Suggerimenti ordinati: prima chi inizia con il testo scritto, poi in ordine alfabetico.
export function rankedIngredients(query, collator) {
  return searchIngredients(query).sort((x, y) => x.score - y.score || collator.compare(x.name, y.name));
}

export function comboHtml(id, label, { placeholder, clearLabel, hint = '' }) {
  return `<div class="combo-field" id="${id}-field">
    <label class="combo-label" for="${id}">${esc(label)}</label>
    ${hint ? `<p class="combo-hint" id="${id}-hint">${esc(hint)}</p>` : ''}
    <div class="combo">
      ${icon('search', 'icon combo-icon')}
      <input class="combo-input" id="${id}" type="text" role="combobox"
        aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list"
        ${hint ? `aria-describedby="${id}-hint"` : ''}
        autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search"
        placeholder="${esc(placeholder)}">
      <button class="combo-clear" type="button" id="${id}-clear" aria-label="${esc(clearLabel)}" hidden>${icon('x')}</button>
    </div>
    <ul class="combo-list" id="${id}-list" role="listbox" aria-label="${esc(label)}" hidden></ul>
  </div>`;
}

// options(query) → [{ ing, name, also, disabled, note }]
// onChoose(option): scelta di un suggerimento
// onEdit(): il testo è cambiato a mano
// onClear(): premuta la ×
export function setupCombo(root, id, { options: getOptions, onChoose, onEdit = () => {}, onClear = () => {} }) {
  const field = root.querySelector(`#${id}-field`);
  const input = root.querySelector(`#${id}`);
  const list = root.querySelector(`#${id}-list`);
  const clear = root.querySelector(`#${id}-clear`);
  let options = [];
  let active = -1;

  function renderOptions() {
    if (!options.length) {
      list.innerHTML = `<li class="combo-empty" role="option" aria-disabled="true">${esc(t('compare.noMatch'))}</li>`;
      return;
    }
    list.innerHTML = options.map((o, i) => `
      <li class="combo-option${i === active ? ' is-active' : ''}" role="option" id="${id}-option-${i}"
        data-index="${i}" aria-selected="${i === active}"${o.disabled ? ' aria-disabled="true"' : ''}>
        <span class="combo-option-name">${esc(o.name)}</span>
        ${o.badge ? drugBadge() : ''}
        ${o.note ? `<span class="combo-option-note">${esc(o.note)}</span>` : ''}
        ${o.also ? `<span class="combo-option-also">${esc(t('ingredients.also', { text: o.also }))}</span>` : ''}
      </li>`).join('');
  }

  // I suggerimenti seguono sempre il testo del campo: la lista completa
  // si vede solo quando il campo è vuoto.
  function open() {
    options = getOptions(input.value);
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
    const li = list.querySelector(`#${id}-option-${index}`);
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
    } while (next >= 0 && next < options.length && options[next].disabled);
    if (next >= 0 && next < options.length) setActive(next);
  }

  function choose(index) {
    const option = options[index];
    if (!option || option.disabled) return;
    close();
    onChoose(option);
  }

  function updateClear() {
    clear.hidden = !input.value;
  }

  input.addEventListener('input', () => {
    onEdit();
    updateClear();
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
      const usable = options.filter((o) => !o.disabled);
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
    updateClear();
    onClear();
    input.focus();
  });

  return { field, input, open, close, updateClear };
}
