// Piccoli aiuti condivisi tra le schermate.
import { t } from './i18n.js';
import { loadData } from './data.js';
import { icon } from './icons.js';

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
export function emptyState(textKey, actionHtml = '') {
  return `<div class="empty-state">
    <img class="empty-mascot" src="assets/mascot/empty.png" alt="${esc(t('empty.alt'))}" width="160" height="160">
    <p>${esc(t(textKey))}</p>
    ${actionHtml ? `<div class="empty-action">${actionHtml}</div>` : ''}
  </div>`;
}

// Disegna una schermata che ha bisogno di data.json: aspetta i dati,
// e se non arrivano mostra un messaggio con il bottone "Riprova".
export function withData(main, draw) {
  const request = {};
  main.pendingRequest = request;
  main.innerHTML = `<p class="muted status-message">${esc(t('loading'))}</p>`;
  loadData().then(
    (data) => {
      if (main.pendingRequest !== request) return; // nel frattempo si è cambiata pagina
      const hadFocus = document.activeElement === main;
      draw(data);
      if (hadFocus) {
        const heading = main.querySelector('h1');
        if (heading) heading.focus({ preventScroll: true });
      }
    },
    () => {
      if (main.pendingRequest !== request) return;
      main.innerHTML = `<div class="card status-message" role="alert">
        <p>${esc(t('data.error'))}</p>
        <button class="btn btn-primary" type="button">${esc(t('retry'))}</button>
      </div>`;
      main.querySelector('button').addEventListener('click', () => withData(main, draw));
    },
  );
}

// Elenco delle fonti: link che si aprono in una nuova scheda.
export function sourcesList(sources) {
  return `<ul class="sources">${(sources || []).map((source) => {
    const safe = /^https?:\/\//i.test(source.url || '');
    return `<li>${safe
      ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}<span class="visually-hidden"> ${esc(t('newTab'))}</span>${icon('external', 'icon icon-small')}</a>`
      : esc(source.title)}</li>`;
  }).join('')}</ul>`;
}

// Cuore per salvare nei preferiti: un piccolo bottone a icona che si accende.
// Il nome letto dal lettore di schermo resta uguale, cambia solo lo stato "premuto".
export function heartButton(saved, label) {
  return `<button class="heart-button" type="button" aria-pressed="${saved}" aria-label="${esc(label)}" title="${esc(label)}">
    ${icon('heart')}
  </button>`;
}

// toggle() salva o toglie e restituisce true se ora è salvato.
export function bindHeart(button, toggle) {
  button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', String(toggle()));
  });
}

// Colori di un livello (da data.json → levels) come variabili CSS.
export function levelStyle(level) {
  return `--level:${esc(level.color)};--tint:${esc(level.tint)};--level-text:${esc(level.text)}`;
}

// Etichetta "Farmaco" per gli ingredienti con drug: true.
export function drugBadge() {
  return `<span class="badge badge-drug">${icon('pill', 'icon icon-small')}${esc(t('drug.badge'))}</span>`;
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
