// Info e Privacy (si costruiscono nel passo "Info e Privacy").
import { soon } from '../ui.js';

export function renderInfo(main) {
  main.innerHTML = soon('title.info');
}

export function renderPrivacy(main) {
  main.innerHTML = soon('title.privacy');
}
