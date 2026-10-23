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
