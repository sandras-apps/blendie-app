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

// Copia dei preferiti salvati: { ingredients: [id], pairs: [[idA, idB]] }
export function getFavorites() {
  return loadFavorites();
}

export function removeFavoriteIngredient(id) {
  const favorites = loadFavorites();
  favorites.ingredients = favorites.ingredients.filter((other) => other !== id);
  write('favorites', favorites);
}

export function removeFavoritePair(a, b) {
  const favorites = loadFavorites();
  favorites.pairs = favorites.pairs.filter((pair) => !samePair(pair, a, b));
  write('favorites', favorites);
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

// I miei prodotti: { id, type, actives: [id ingredienti], when }.
// Niente nome, niente brand, niente foto. Gli ultimi aggiunti stanno in cima.
export function getProducts() {
  const saved = read('products', []);
  return Array.isArray(saved) ? saved.filter((p) => p && p.id) : [];
}

export function getProduct(id) {
  return getProducts().find((p) => p.id === id) || null;
}

// Salva un prodotto nuovo (senza id) o aggiorna quello esistente; restituisce l'id.
export function saveProduct(product) {
  const products = getProducts();
  const clean = { type: product.type, actives: [...product.actives], when: product.when };
  if (product.id && products.some((p) => p.id === product.id)) {
    write('products', products.map((p) => (p.id === product.id ? { ...clean, id: p.id } : p)));
    return product.id;
  }
  const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  write('products', [{ ...clean, id }, ...products]);
  return id;
}

export function deleteProduct(id) {
  write('products', getProducts().filter((p) => p.id !== id));
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
