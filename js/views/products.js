// I miei prodotti (aggiunta, modifica ed elenco si costruiscono nel passo "I miei prodotti").
import { t } from '../i18n.js';
import { pageTitle, emptyState } from '../ui.js';

export function renderProducts(main) {
  main.innerHTML = `${pageTitle(t('title.products'))}${emptyState('products.empty')}`;
}
