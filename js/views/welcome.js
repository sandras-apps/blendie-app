// Benvenuto: si vede solo alla prima apertura dell'app.
import { t } from '../i18n.js';
import { markWelcomeSeen } from '../storage.js';
import { esc, goTo } from '../ui.js';

export function renderWelcome(main) {
  main.innerHTML = `<div class="welcome">
    <img class="welcome-mascot" src="assets/mascot/welcome.png" alt="${esc(t('welcome.alt'))}" width="200" height="200">
    <h1 class="welcome-brand" tabindex="-1">${esc(t('app.name'))}</h1>
    <p class="welcome-text">${esc(t('welcome.text'))}</p>
    <button class="btn btn-primary btn-wide" type="button" id="welcome-start">${esc(t('welcome.start'))}</button>
  </div>`;

  main.querySelector('#welcome-start').addEventListener('click', () => {
    markWelcomeSeen();
    goTo('#/compare', { replace: true });
  });
}
