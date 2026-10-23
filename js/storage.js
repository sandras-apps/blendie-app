// Tutto quello che l'app salva sul dispositivo passa da qui.
// Nella v2 questi dati passeranno all'account: basterà cambiare questo file.
//
// Ogni lettura e scrittura è protetta: se il salvataggio non funziona
// (per esempio in navigazione privata), l'app continua a funzionare
// e ricorda le scelte almeno finché resta aperta.

const PREFIX = 'blendie.';
const memory = {};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    // salvataggio non disponibile: si usa la memoria temporanea
  }
  return key in memory ? memory[key] : fallback;
}

function write(key, value) {
  memory[key] = value;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // salvataggio non disponibile: resta solo in memoria
  }
}

// Lingua scelta dall'utente ('it' o 'en'), oppure null se non l'ha mai scelta.
export function loadLang() {
  const lang = read('lang', null);
  return lang === 'it' || lang === 'en' ? lang : null;
}

export function saveLang(lang) {
  write('lang', lang);
}

// Schermata di benvenuto: si vede solo alla prima apertura.
export function hasSeenWelcome() {
  return read('welcomeSeen', false) === true;
}

export function markWelcomeSeen() {
  write('welcomeSeen', true);
}

// Preferiti: singoli ingredienti (id) e abbinamenti (coppie di id).
// Gli ultimi salvati stanno in cima.
function loadFavorites() {
  const saved = read('favorites', null) || {};
  return {
    ingredients: Array.isArray(saved.ingredients) ? saved.ingredients : [],
    pairs: Array.isArray(saved.pairs) ? saved.pairs : [],
  };
}

export function isFavoriteIngredient(id) {
  return loadFavorites().ingredients.includes(id);
}

// Aggiunge o toglie l'ingrediente dai preferiti; restituisce true se ora è salvato.
export function toggleFavoriteIngredient(id) {
  const favorites = loadFavorites();
  const saved = favorites.ingredients.includes(id);
  favorites.ingredients = saved
    ? favorites.ingredients.filter((other) => other !== id)
    : [id, ...favorites.ingredients];
  write('favorites', favorites);
  return !saved;
}

// Un abbinamento è lo stesso in tutti e due i sensi: A+B = B+A.
function samePair(pair, a, b) {
  return Array.isArray(pair) && ((pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a));
}

export function isFavoritePair(a, b) {
  return loadFavorites().pairs.some((pair) => samePair(pair, a, b));
}

// Aggiunge o toglie l'abbinamento dai preferiti; restituisce true se ora è salvato.
export function toggleFavoritePair(a, b) {
  const favorites = loadFavorites();
  const saved = favorites.pairs.some((pair) => samePair(pair, a, b));
  favorites.pairs = saved
    ? favorites.pairs.filter((pair) => !samePair(pair, a, b))
    : [[a, b], ...favorites.pairs];
  write('favorites', favorites);
  return !saved;
}
