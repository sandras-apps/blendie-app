// Avvio dell'app e navigazione tra le schermate.
// Ogni schermata ha un indirizzo dopo il "#", per esempio #/ingredient/retinol:
// così il tasto "indietro" del telefono funziona e GitHub Pages non dà errori.
import { t, getLang } from './i18n.js';
import { icon } from './icons.js';
import { esc } from './ui.js';
import { hasSeenWelcome } from './storage.js';
import { renderWelcome } from './views/welcome.js';
import { renderCompare } from './views/compare.js';
import { renderIngredients, renderIngredient } from './views/ingredients.js';
import { renderProducts, renderProduct } from './views/products.js';
import { renderFavorites } from './views/favorites.js';
import { renderMore } from './views/more.js';
import { renderMyths } from './views/myths.js';
import { renderGuides } from './views/guides.js';
import { renderInfo, renderPrivacy } from './views/info.js';

const tabs = [
  { id: 'compare', icon: 'blend' },
  { id: 'ingredients', icon: 'drop' },
  { id: 'products', icon: 'jar' },
  { id: 'favorites', icon: 'heart' },
  { id: 'more', icon: 'more' },
];

// tab: quale voce della barra in basso è accesa; parent: dove porta "Indietro";
// bare: schermata senza barre (solo il benvenuto)
const routes = {
  welcome: { bare: true, title: 'app.name', render: renderWelcome },
  compare: { tab: 'compare', title: 'title.compare', render: renderCompare },
  ingredients: { tab: 'ingredients', title: 'title.ingredients', render: renderIngredients },
  ingredient: { tab: 'ingredients', title: 'title.ingredient', parent: 'ingredients', render: renderIngredient },
  products: { tab: 'products', title: 'title.products', render: renderProducts },
  product: { tab: 'products', title: 'products.add', parent: 'products', render: renderProduct },
  favorites: { tab: 'favorites', title: 'title.favorites', render: renderFavorites },
  more: { tab: 'more', title: 'title.more', render: renderMore },
  myths: { tab: 'more', title: 'title.myths', parent: 'more', render: renderMyths },
  guides: { tab: 'more', title: 'title.guides', parent: 'more', render: renderGuides },
  info: { tab: 'more', title: 'title.info', parent: 'more', render: renderInfo },
  privacy: { tab: 'more', title: 'title.privacy', parent: 'info', render: renderPrivacy },
};

const topbar = document.getElementById('topbar');
const main = document.getElementById('main');
const tabbar = document.getElementById('tabbar');

let current = null;
let firstRender = true;

// Legge l'indirizzo: "#/ingredient/retinol?x=1" → { name, args, query }
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const [name = 'compare', ...args] = path.split('/').filter(Boolean);
  return { name, args: args.map(decodeURIComponent), query: new URLSearchParams(query) };
}

// Quante pagine dell'app ci sono prima di questa nella cronologia:
// serve a "Indietro" per sapere se può tornare alla pagina precedente.
let depth = 0;
function syncDepth() {
  const state = history.state;
  if (state && typeof state.depth === 'number') {
    depth = state.depth;
  } else {
    depth += 1;
    history.replaceState({ depth }, '');
  }
}

function goBack() {
  if (depth > 0) {
    history.back();
  } else {
    history.replaceState({ depth: 0 }, '', `#/${current.parent}`);
    render();
  }
}

function renderTopbar(route) {
  if (route.parent) {
    topbar.innerHTML = `<div class="topbar-inner">
      <button class="back-button" type="button" id="back">${icon('back')}<span>${esc(t('back'))}</span></button>
    </div>`;
    document.getElementById('back').addEventListener('click', goBack);
  } else {
    topbar.innerHTML = `<div class="topbar-inner">
      <a class="brand" href="#/compare" aria-label="${esc(t('home'))}">
        <img src="assets/logo/logo.png" alt="" width="40" height="40">
        <span class="brand-name" aria-hidden="true">${esc(t('app.name'))}</span>
      </a>
    </div>`;
  }
}

function renderTabbar(route) {
  tabbar.setAttribute('aria-label', t('nav.label'));
  tabbar.innerHTML = `<ul>${tabs.map((tab) => `
    <li><a class="tab" href="#/${tab.id}"${tab.id === route.tab ? ' aria-current="page"' : ''}>
      <span class="tab-icon">${icon(tab.icon)}</span>
      <span>${esc(t(`nav.${tab.id}`))}</span>
    </a></li>`).join('')}</ul>`;
}

function render({ keepFocusId = null } = {}) {
  const { name, args, query } = parseHash();
  const route = routes[name];
  if (!route) {
    history.replaceState({ depth }, '', '#/compare');
    render();
    return;
  }
  current = route;

  document.documentElement.lang = getLang();
  document.title = route.title === 'app.name' || name === 'compare' ? t('app.name') : `${t(route.title)} · ${t('app.name')}`;
  document.body.classList.toggle('is-bare', Boolean(route.bare));
  if (route.bare) {
    topbar.innerHTML = '';
    tabbar.innerHTML = '';
  } else {
    renderTopbar(route);
    renderTabbar(route);
  }

  main.innerHTML = '';
  route.render(main, { args, query });

  // Cambio di lingua: si resta dov'eri, con il focus sullo stesso elemento.
  const keep = keepFocusId && document.getElementById(keepFocusId);
  if (keep) {
    keep.focus({ preventScroll: true });
    return;
  }

  window.scrollTo(0, 0);
  // Dopo un cambio di pagina il focus va sul titolo, così chi usa
  // un lettore di schermo sente subito dove si trova.
  if (!firstRender) {
    const heading = main.querySelector('h1');
    (heading || main).focus({ preventScroll: true });
  }
  firstRender = false;
}

window.addEventListener('hashchange', () => {
  syncDepth();
  render();
});

window.addEventListener('langchange', () => {
  render({ keepFocusId: document.activeElement && document.activeElement.id });
});

// Prima apertura: se si arriva su Confronta, si mostra il benvenuto.
if (!hasSeenWelcome() && parseHash().name === 'compare') {
  history.replaceState({ depth: 0 }, '', '#/welcome');
} else if (!location.hash) {
  history.replaceState({ depth: 0 }, '', '#/compare');
} else if (!history.state || typeof history.state.depth !== 'number') {
  history.replaceState({ depth: 0 }, '');
} else {
  depth = history.state.depth;
}
render();
