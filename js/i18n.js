// Testi dell'interfaccia (bottoni, titoli, messaggi), sempre in italiano e inglese.
// I contenuti (schede, abbinamenti, miti...) invece stanno in data/data.json.
import { loadLang, saveLang } from './storage.js';

const strings = {
  it: {
    'app.name': 'Blendie',
    'nav.label': 'Navigazione principale',
    'nav.compare': 'Confronta',
    'nav.ingredients': 'Ingredienti',
    'nav.products': 'Prodotti',
    'nav.favorites': 'Preferiti',
    'nav.more': 'Altro',
    'title.compare': 'Confronta',
    'title.ingredients': 'Ingredienti',
    'title.ingredient': 'Scheda ingrediente',
    'title.products': 'I miei prodotti',
    'title.favorites': 'Preferiti',
    'title.more': 'Altro',
    'title.myths': 'Falsi miti',
    'title.guides': 'Guide',
    'title.info': 'Info',
    'title.privacy': 'Privacy',
    'back': 'Indietro',
    'home': 'Blendie, vai a Confronta',
    'soon': 'Questa schermata arriva nei prossimi passi.',
    'welcome.text': 'Ciao! Scegli due ingredienti e ti dico se vanno d\'accordo.',
    'welcome.start': 'Iniziamo',
    'welcome.alt': 'Coco, il coccodrillo di Blendie, che saluta e sbircia da sotto una fetta di cetriolo',
    'empty.alt': 'Coco, il coccodrillo di Blendie, con un barattolo di crema in mano',
    'favorites.empty': 'Non hai ancora preferiti. Tocca il cuore su un risultato o sulla scheda di un ingrediente per salvarlo qui.',
    'products.empty': 'Non hai ancora salvato prodotti. Aggiungi il primo: scrivi il nome del prodotto e scegli gli ingredienti attivi che contiene.',
    'info.language': 'Lingua',
    'loading': 'Caricamento…',
    'data.error': 'Non riesco a caricare i dati. Controlla la connessione e riprova.',
    'retry': 'Riprova',
    'drug.badge': 'Farmaco',
    'ingredients.search': 'Cerca un ingrediente',
    'ingredients.placeholder': 'Nome, sinonimo o INCI',
    'ingredients.filters': 'Filtra per categoria',
    'ingredients.all': 'Tutti',
    'ingredients.count.one': '1 ingrediente',
    'ingredients.count': '{n} ingredienti',
    'ingredients.none': 'Nessun ingrediente trovato. Prova con un altro nome, un sinonimo o il nome INCI.',
    'ingredients.also': 'Anche: {text}',
  },
  en: {
    'app.name': 'Blendie',
    'nav.label': 'Main navigation',
    'nav.compare': 'Compare',
    'nav.ingredients': 'Ingredients',
    'nav.products': 'Products',
    'nav.favorites': 'Favourites',
    'nav.more': 'More',
    'title.compare': 'Compare',
    'title.ingredients': 'Ingredients',
    'title.ingredient': 'Ingredient card',
    'title.products': 'My products',
    'title.favorites': 'Favourites',
    'title.more': 'More',
    'title.myths': 'Myths',
    'title.guides': 'Guides',
    'title.info': 'Info',
    'title.privacy': 'Privacy',
    'back': 'Back',
    'home': 'Blendie, go to Compare',
    'soon': 'This screen is coming in the next steps.',
    'welcome.text': 'Hi! Pick two ingredients and I\'ll tell you if they get along.',
    'welcome.start': 'Let\'s start',
    'welcome.alt': 'Coco, Blendie\'s crocodile, waving and peeking out from under a cucumber slice',
    'empty.alt': 'Coco, Blendie\'s crocodile, holding a jar of cream',
    'favorites.empty': 'No favourites yet. Tap the heart on a result or on an ingredient card to save it here.',
    'products.empty': 'You haven\'t saved any products yet. Add your first one: type the product name and choose the active ingredients it contains.',
    'info.language': 'Language',
    'loading': 'Loading…',
    'data.error': 'I can\'t load the data. Check your connection and try again.',
    'retry': 'Try again',
    'drug.badge': 'Medicine',
    'ingredients.search': 'Search for an ingredient',
    'ingredients.placeholder': 'Name, synonym or INCI',
    'ingredients.filters': 'Filter by category',
    'ingredients.all': 'All',
    'ingredients.count.one': '1 ingredient',
    'ingredients.count': '{n} ingredients',
    'ingredients.none': 'No ingredients found. Try another name, a synonym or the INCI name.',
    'ingredients.also': 'Also: {text}',
  },
};

export const languages = [
  { id: 'it', name: 'Italiano' },
  { id: 'en', name: 'English' },
];

// Lingua del telefono: italiano se è italiano, altrimenti inglese.
function detectLang() {
  const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  return String(list[0]).toLowerCase().startsWith('it') ? 'it' : 'en';
}

// Prima la scelta salvata, poi la lingua del telefono.
let lang = loadLang() || detectLang();

export function getLang() {
  return lang;
}

// Cambia lingua, la salva sul dispositivo e avvisa l'app di ridisegnare la pagina.
export function setLang(next) {
  if (next !== 'it' && next !== 'en') return;
  saveLang(next);
  if (next === lang) return;
  lang = next;
  window.dispatchEvent(new Event('langchange'));
}

// Testo dell'interfaccia. I valori tra graffe si riempiono: t('x', { n: 3 })
export function t(key, values) {
  const text = strings[lang][key] ?? strings.it[key] ?? key;
  return values ? text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match) : text;
}

// Testo di data.json nella lingua scelta: pick({ it: '...', en: '...' })
export function pick(text) {
  if (!text) return '';
  return text[lang] ?? text.it ?? '';
}
