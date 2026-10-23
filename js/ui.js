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
