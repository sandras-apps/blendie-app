// Elenco degli ingredienti e scheda del singolo ingrediente
// (si costruiscono nei passi "Ingredienti" e "Scheda").
import { soon } from '../ui.js';

export function renderIngredients(main) {
  main.innerHTML = soon('title.ingredients');
}

export function renderIngredient(main) {
  main.innerHTML = soon('title.ingredient');
}
