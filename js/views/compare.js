// Confronta + Risultato (si costruisce nel passo "Confronta e Risultato").
import { soon } from '../ui.js';

export function renderCompare(main) {
  main.innerHTML = `<img class="hero-logo" src="assets/logo/logo.png" alt="" width="112" height="112">${soon('title.compare')}`;
}
