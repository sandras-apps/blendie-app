// I miei prodotti: tipo di prodotto, principi attivi e quando si usa
// (aggiunta, modifica ed elenco si costruiscono nel passo "I miei prodotti").
import { t } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle, emptyState, soon } from '../ui.js';

export function renderProducts(main) {
  const add = `<a class="btn btn-primary btn-wide" href="#/product/new">${icon('plus')}${esc(t('products.add'))}</a>`;
  main.innerHTML = `${pageTitle(t('title.products'))}${emptyState('products.empty', add)}`;
}

// Aggiunta o modifica di un prodotto: #/product/new oppure #/product/<id>
export function renderProduct(main) {
  main.innerHTML = soon('products.add');
}
