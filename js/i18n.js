// Testi dell'interfaccia (bottoni, titoli, messaggi), sempre in italiano e inglese.
// I contenuti (schede, abbinamenti, miti...) invece stanno in data/data.json.

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
  },
};

// Lingua del telefono: italiano se è italiano, altrimenti inglese.
// (La scelta manuale e il salvataggio arrivano nel passo "Lingua".)
function detectLang() {
  const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  return String(list[0]).toLowerCase().startsWith('it') ? 'it' : 'en';
}

let lang = detectLang();

export function getLang() {
  return lang;
}

export function t(key) {
  return strings[lang][key] ?? strings.it[key] ?? key;
}
