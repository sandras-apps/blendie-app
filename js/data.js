// Carica data/data.json, cerca gli ingredienti e confronta due ingredienti.
import { pick } from './i18n.js';

let loading = null;
let data = null;
const byId = new Map();
const searchKeys = new Map(); // id → [{ norm, text }]
const pairIndex = new Map(); // "idA|idB" (in ordine alfabetico) → voce di pairs

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
  // Una voce di pairs vale per ogni combinazione tra un id di a e uno di b, in entrambi i sensi.
  pairIndex.clear();
  for (const pair of json.pairs) {
    for (const a of pair.a) {
      for (const b of pair.b) {
        const key = pairKey(a, b);
        if (!pairIndex.has(key)) pairIndex.set(key, pair);
      }
    }
  }
  return json;
}

function pairKey(a, b) {
  return [a, b].sort().join('|');
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

// Cerca nel nome IT e EN, nei sinonimi e nei nomi INCI, senza distinguere
// maiuscole, accenti e trattini. Per ogni ingrediente trovato restituisce:
// - also: il sinonimo con cui è stato trovato, se non è il nome nella lingua scelta
//   (per mostrare "Anche: tocopherol");
// - score: quanto è vicino (0 = il nome inizia così, 1 = una parola inizia così, 2 = contiene).
// Con la ricerca vuota restituisce tutti gli ingredienti.
export function searchIngredients(query) {
  const q = normalize(query);
  const results = [];
  for (const ing of data ? data.ingredients : []) {
    const name = pick(ing.name);
    if (!q) {
      results.push({ ing, name, also: null, score: 0 });
      continue;
    }
    const own = normalize(name);
    if (own.includes(q)) {
      results.push({ ing, name, also: null, score: own.startsWith(q) ? 0 : own.includes(` ${q}`) ? 1 : 2 });
      continue;
    }
    let best = null;
    for (const key of searchKeys.get(ing.id) || []) {
      if (!key.norm.includes(q)) continue;
      const score = key.norm.startsWith(q) || key.norm.includes(` ${q}`) ? 1 : 2;
      if (!best || score < best.score) best = { text: key.text, score };
    }
    if (best) results.push({ ing, name, also: best.text, score: best.score });
  }
  return results;
}

// Confronta due ingredienti, seguendo la logica del brief:
// 1. stesso ingrediente → 'same' (non si confronta)
// 2. almeno un farmaco → 'drug'
// 3. coppia in pairs → il suo livello (green, yellow, red)
// 4. altrimenti → 'unknown'
export function comparePair(idA, idB) {
  const a = getIngredient(idA);
  const b = getIngredient(idB);
  if (!a || !b) return null;
  if (a.id === b.id) return { state: 'same', a, b };
  if (a.drug || b.drug) return { state: 'drug', a, b, drugs: [a, b].filter((ing) => ing.drug) };
  const pair = pairIndex.get(pairKey(a.id, b.id));
  if (pair) return { state: pair.level, a, b, pair };
  return { state: 'unknown', a, b };
}
