// Preferiti (l'elenco si costruisce nel passo "Preferiti").
import { t } from '../i18n.js';
import { pageTitle, emptyState } from '../ui.js';

export function renderFavorites(main) {
  main.innerHTML = `${pageTitle(t('title.favorites'))}${emptyState('favorites.empty')}`;
}
