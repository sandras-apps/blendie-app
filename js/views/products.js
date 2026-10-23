// I miei prodotti: servono solo a ricordare quali principi attivi si stanno già usando.
// Ogni prodotto ha tipo, principi attivi (almeno uno, farmaci compresi) e quando si usa.
import { t, pick, getLang } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle, emptyState, withData, drugBadge, setError, goTo } from '../ui.js';
import { getIngredient } from '../data.js';
import { getProducts, getProduct, saveProduct, deleteProduct } from '../storage.js';
import { comboHtml, setupCombo, rankedIngredients } from '../combo.js';

const TYPES = ['cleanser', 'toner', 'serum', 'cream', 'gel', 'oil', 'mask', 'eye_cream', 'sunscreen', 'other'];
const WHEN = ['morning', 'evening', 'both'];

// Messaggio da leggere quando si torna all'elenco (es. "Prodotto salvato.").
let flash = '';

function activesOf(product) {
  return (product.actives || []).map(getIngredient).filter(Boolean);
}

// "Siero · Sera · Retinolo, Niacinamide" come testo semplice.
function productText(product) {
  return [t(`type.${product.type}`), t(`when.${product.when}`), activesOf(product).map((ing) => pick(ing.name)).join(', ')].join(' · ');
}

// La stessa riga, con gli ingredienti da toccare: Confronta, oppure la scheda se è un farmaco.
function productLine(product) {
  const actives = activesOf(product).map((ing) => {
    const name = pick(ing.name);
    const href = ing.drug ? `#/ingredient/${encodeURIComponent(ing.id)}` : `#/compare?a=${encodeURIComponent(ing.id)}`;
    const label = t(ing.drug ? 'products.cardLabel' : 'products.compareLabel', { name });
    return `<a class="product-active" href="${href}" aria-label="${esc(label)}">${esc(name)}${ing.drug ? icon('pill', 'icon icon-small') : ''}</a>`;
  });
  return `<p class="product-line">
    <span class="product-type">${esc(t(`type.${product.type}`))}</span>
    <span aria-hidden="true">·</span> ${esc(t(`when.${product.when}`))}
    <span aria-hidden="true">·</span> ${actives.join(', ')}
  </p>`;
}

// Torna all'elenco: indietro nella cronologia se si arriva da lì, altrimenti lo apre.
function backToList() {
  const depth = history.state && typeof history.state.depth === 'number' ? history.state.depth : 0;
  if (depth > 0) history.back();
  else goTo('#/products', { replace: true });
}

export function renderProducts(main) {
  withData(main, () => {
    const products = getProducts();
    const add = `<a class="btn btn-primary btn-wide" href="#/product/new">${icon('plus')}${esc(t('products.add'))}</a>`;

    if (!products.length) {
      main.innerHTML = `${pageTitle(t('title.products'))}${emptyState('products.empty', add)}
        <p class="visually-hidden" aria-live="polite" id="products-status"></p>`;
    } else {
      main.innerHTML = `${pageTitle(t('title.products'))}
        <p class="intro">${esc(t('products.hint'))}</p>
        <div class="products-add">${add}</div>
        <ul class="product-list">${products.map((product) => {
          const name = productText(product);
          return `<li class="card product-item" data-id="${esc(product.id)}" data-name="${esc(name)}">
            ${productLine(product)}
            <div class="product-actions">
              <a class="btn btn-small btn-ghost" href="#/product/${encodeURIComponent(product.id)}" aria-label="${esc(t('products.editLabel', { name }))}">${icon('pencil', 'icon icon-small')}${esc(t('products.edit'))}</a>
              <button class="btn btn-small btn-ghost product-delete" type="button" aria-label="${esc(t('products.deleteLabel', { name }))}">${icon('trash', 'icon icon-small')}${esc(t('products.delete'))}</button>
            </div>
          </li>`;
        }).join('')}</ul>
        <dialog class="confirm" id="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-text">
          <h2 class="confirm-title" id="confirm-title">${esc(t('confirm.title'))}</h2>
          <p class="confirm-text" id="confirm-text"></p>
          <div class="confirm-actions">
            <button class="btn btn-ghost" type="button" id="confirm-no" autofocus>${esc(t('confirm.no'))}</button>
            <button class="btn btn-delete" type="button" id="confirm-yes">${icon('trash')}${esc(t('confirm.yes'))}</button>
          </div>
        </dialog>
        <p class="visually-hidden" aria-live="polite" id="products-status"></p>`;

      // Conferma prima di eliminare: una finestra dentro l'app, non quella del browser.
      const dialog = main.querySelector('#confirm');
      let pending = null;

      main.querySelectorAll('.product-delete').forEach((button) => {
        button.addEventListener('click', () => {
          pending = button.closest('.product-item');
          main.querySelector('#confirm-text').textContent = pending.dataset.name;
          dialog.showModal();
          main.querySelector('#confirm-no').focus();
        });
      });

      main.querySelector('#confirm-no').addEventListener('click', () => dialog.close());

      // Chiudendo senza eliminare, il focus torna sul bottone "Elimina" di quel prodotto.
      dialog.addEventListener('close', () => {
        if (pending && pending.isConnected) pending.querySelector('.product-delete').focus();
        pending = null;
      });

      main.querySelector('#confirm-yes').addEventListener('click', () => {
        const item = pending;
        pending = null;
        dialog.close();
        if (!item) return;
        deleteProduct(item.dataset.id);
        const next = item.nextElementSibling || item.previousElementSibling;
        item.remove();
        if (!next) {
          flash = t('products.deleted');
          main.focus({ preventScroll: true });
          renderProducts(main); // era l'ultimo: torna Coco
          return;
        }
        main.querySelector('#products-status').textContent = t('products.deleted');
        next.querySelector('.product-delete').focus();
      });
    }

    if (flash) {
      const message = flash;
      flash = '';
      setTimeout(() => {
        const status = main.querySelector('#products-status');
        if (status) status.textContent = message;
      }, 100);
    }
  });
}

// Aggiunta o modifica di un prodotto: #/product/new oppure #/product/<id>
export function renderProduct(main, { args }) {
  withData(main, () => {
    const id = args[0] && args[0] !== 'new' ? args[0] : null;
    const existing = id ? getProduct(id) : null;
    if (id && !existing) {
      main.innerHTML = `${pageTitle(t('product.editTitle'))}
        <div class="card status-message">
          <p>${esc(t('product.notFound'))}</p>
          <a class="btn btn-primary" href="#/products">${esc(t('product.toList'))}</a>
        </div>`;
      return;
    }

    const title = t(existing ? 'product.editTitle' : 'products.add');
    document.title = `${title} · ${t('app.name')}`;
    const collator = new Intl.Collator(getLang(), { sensitivity: 'base' });
    const state = {
      type: existing ? existing.type : '',
      actives: existing ? existing.actives.filter((a) => getIngredient(a)) : [],
      when: existing ? existing.when : '',
    };

    const radios = (name, values, labelPrefix) => values.map((value) => `
      <label class="pill-option">
        <input class="visually-hidden" type="radio" name="${name}" value="${value}"${state[name] === value ? ' checked' : ''}>
        <span>${esc(t(`${labelPrefix}.${value}`))}</span>
      </label>`).join('');

    main.innerHTML = `${pageTitle(title)}
      <form class="card product-form" id="product-form" novalidate>
        <fieldset class="form-field" id="type-field" aria-describedby="type-error">
          <legend class="field-label">${esc(t('product.type'))}</legend>
          <div class="pill-options">${radios('type', TYPES, 'type')}</div>
          <p class="form-error" id="type-error" role="alert"></p>
        </fieldset>

        <div class="form-field" id="actives-group">
          ${comboHtml('active-search', t('product.actives'), {
            placeholder: t('compare.placeholder'),
            clearLabel: t('compare.clearField', { field: t('product.actives') }),
            hint: t('product.activesHint'),
          })}
          <ul class="active-tags" id="active-tags" aria-label="${esc(t('product.chosen'))}"></ul>
          <p class="form-error" id="actives-error" role="alert"></p>
        </div>

        <fieldset class="form-field" id="when-field" aria-describedby="when-error">
          <legend class="field-label">${esc(t('product.when'))}</legend>
          <div class="pill-options">${radios('when', WHEN, 'when')}</div>
          <p class="form-error" id="when-error" role="alert"></p>
        </fieldset>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit">${esc(t('product.save'))}</button>
          <button class="btn btn-ghost" type="button" id="product-cancel">${esc(t('product.cancel'))}</button>
        </div>
        <p class="visually-hidden" aria-live="polite" id="product-status"></p>
      </form>`;

    const form = main.querySelector('#product-form');
    const tags = main.querySelector('#active-tags');
    const status = main.querySelector('#product-status');
    const errors = {
      type: main.querySelector('#type-error'),
      actives: main.querySelector('#actives-error'),
      when: main.querySelector('#when-error'),
    };

    function renderTags() {
      tags.hidden = !state.actives.length;
      tags.innerHTML = state.actives.map((activeId) => {
        const ing = getIngredient(activeId);
        const name = pick(ing.name);
        return `<li class="active-tag">
          <span>${esc(name)}</span>${ing.drug ? drugBadge() : ''}
          <button class="active-tag-remove" type="button" data-id="${esc(activeId)}" aria-label="${esc(t('product.remove', { name }))}">${icon('x', 'icon icon-small')}</button>
        </li>`;
      }).join('');
    }

    // Stessa ricerca di Confronta (sinonimi compresi); qui i farmaci ci sono.
    const combo = setupCombo(main, 'active-search', {
      options: (text) => rankedIngredients(text, collator).map((o) => {
        const added = state.actives.includes(o.ing.id);
        return { ...o, badge: o.ing.drug, disabled: added, note: added ? t('product.alreadyAdded') : '' };
      }),
      onChoose: (option) => {
        state.actives.push(option.ing.id);
        combo.input.value = '';
        combo.updateClear();
        combo.input.removeAttribute('aria-invalid');
        setError(errors.actives, '');
        renderTags();
        status.textContent = t('product.added', { name: option.name });
      },
    });

    // Chi usa un lettore di schermo sente anche l'eventuale messaggio d'errore del campo.
    combo.input.setAttribute('aria-describedby', 'active-search-hint actives-error');

    tags.addEventListener('click', (event) => {
      const button = event.target.closest('.active-tag-remove');
      if (!button) return;
      const index = state.actives.indexOf(button.dataset.id);
      const name = pick(getIngredient(button.dataset.id).name);
      state.actives.splice(index, 1);
      renderTags();
      status.textContent = t('product.removed', { name });
      // Il focus va al prossimo ingrediente aggiunto, o al campo di ricerca.
      const buttons = tags.querySelectorAll('.active-tag-remove');
      (buttons[Math.min(index, buttons.length - 1)] || combo.input).focus();
    });

    ['type', 'when'].forEach((name) => {
      form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
        input.addEventListener('change', () => {
          state[name] = input.value;
          setError(errors[name], '');
        });
      });
    });

    main.querySelector('#product-cancel').addEventListener('click', backToList);

    // Se manca qualcosa, il messaggio compare vicino al campo e niente di quello
    // che è già stato inserito si perde.
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const problems = [];
      if (!state.type) problems.push(['type', 'product.errType', main.querySelector('input[name="type"]')]);
      if (!state.actives.length) problems.push(['actives', 'product.errActives', combo.input]);
      if (!state.when) problems.push(['when', 'product.errWhen', main.querySelector('input[name="when"]')]);

      Object.keys(errors).forEach((name) => setError(errors[name], ''));
      combo.input.removeAttribute('aria-invalid');

      if (problems.length) {
        problems.forEach(([name, key]) => {
          setError(errors[name], t(key));
          if (name === 'actives') combo.input.setAttribute('aria-invalid', 'true');
        });
        problems[0][2].focus();
        return;
      }

      saveProduct({ id: existing ? existing.id : null, ...state });
      flash = t('products.saved');
      backToList();
    });

    renderTags();
  });
}
