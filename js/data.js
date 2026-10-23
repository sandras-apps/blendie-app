// Carica data/data.json e offre la ricerca degli ingredienti.
// (La logica del confronto arriva nel passo "Confronta e Risultato".)

let loading = null;
let data = null;
const byId = new Map();
const searchKeys = new Map(); // id → [{ norm, text }]

// Toglie accenti, maiuscole e segni: "Acido ialurónico" → "acido ialuronico",
// "alfa-idrossiacido" → "alfa idrossiacido".
export function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-'’.,/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function prepare(json) {
  data = json;
  byId.clear();
  searchKeys.clear();
  for (const ing of json.ingredients) {
    byId.set(ing.id, ing);
    const texts = [ing.name.it, ing.name.en, ...(ing.synonyms || []), ...(ing.inci || [])];
    const seen = new Set();
    const keys = [];
    for (const text of texts) {
      const norm = normalize(text);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        keys.push({ norm, text });
      }
    }
    searchKeys.set(ing.id, keys);
  }
  return json;
}

// Carica i dati una volta sola; se il caricamento fallisce, si può riprovare.
export function loadData() {
  if (!loading) {
    loading = fetch('data/data.json')
      .then((response) => {
        if (!response.ok) throw new Error(`data.json: ${response.status}`);
        return response.json();
      })
      .then(prepare)
      .catch((error) => {
        loading = null;
        throw error;
      });
  }
  return loading;
}

export function getData() {
  return data;
}

export function getIngredient(id) {
  return byId.get(id) || null;
}

// Cerca nel nome IT e EN, nei sinonimi e nei nomi INCI.
// Restituisce null se l'ingrediente non corrisponde, altrimenti il testo
// con cui è stato trovato (utile per mostrare "Anche: tocopherol").
export function matchIngredient(ing, query) {
  const q = normalize(query);
  if (!q) return { text: null };
  for (const key of searchKeys.get(ing.id) || []) {
    if (key.norm.includes(q)) return { text: key.text };
  }
  return null;
}
