// Info e Privacy (il resto dei testi arriva nel passo "Info e Privacy").
import { t, getLang, setLang, languages } from '../i18n.js';
import { esc, pageTitle, soon } from '../ui.js';

export function renderInfo(main) {
  const current = getLang();
  main.innerHTML = `${pageTitle(t('title.info'))}
    <section class="card">
      <h2 class="card-title" id="lang-title">${esc(t('info.language'))}</h2>
      <div class="segmented" role="radiogroup" aria-labelledby="lang-title">
        ${languages.map((l) => `
          <label class="segment">
            <input class="visually-hidden" type="radio" name="lang" id="lang-${l.id}" value="${l.id}" lang="${l.id}"${l.id === current ? ' checked' : ''}>
            <span lang="${l.id}">${esc(l.name)}</span>
          </label>`).join('')}
      </div>
    </section>
    <div class="card"><p class="muted">${esc(t('soon'))}</p></div>`;

  main.querySelectorAll('input[name="lang"]').forEach((input) => {
    input.addEventListener('change', () => setLang(input.value));
  });
}

export function renderPrivacy(main) {
  main.innerHTML = soon('title.privacy');
}
