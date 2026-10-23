// Piccoli aiuti condivisi tra le schermate.
import { t } from './i18n.js';

// Rende sicuro un testo prima di inserirlo nell'HTML.
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Titolo principale della schermata (riceve il focus quando si cambia pagina).
export function pageTitle(text) {
  return `<h1 class="page-title" tabindex="-1">${esc(text)}</h1>`;
}

// Segnaposto per le schermate non ancora costruite.
export function soon(titleKey) {
  return `${pageTitle(t(titleKey))}<div class="card"><p class="muted">${esc(t('soon'))}</p></div>`;
}

// Pagina vuota (Preferiti, I miei prodotti): mascotte sopra il testo che spiega cosa fare.
// La mascotte si usa solo qui e nel benvenuto, mai nel risultato.
export function emptyState(textKey) {
  return `<div class="empty-state">
    <img class="empty-mascot" src="assets/mascot/empty.png" alt="${esc(t('empty.alt'))}" width="160" height="160">
    <p>${esc(t(textKey))}</p>
  </div>`;
}

// Va a un'altra schermata. Con replace la pagina attuale non resta nella
// cronologia (il tasto "indietro" non ci torna).
export function goTo(hash, { replace = false } = {}) {
  if (replace) {
    const depth = history.state && typeof history.state.depth === 'number' ? history.state.depth : 0;
    history.replaceState({ depth }, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = hash;
  }
}
