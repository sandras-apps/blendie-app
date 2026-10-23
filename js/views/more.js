// Altro: porta a Falsi miti, Guide e Info.
import { t } from '../i18n.js';
import { icon } from '../icons.js';
import { esc, pageTitle } from '../ui.js';

const items = [
  { id: 'myths', icon: 'sparkle', color: 'pink' },
  { id: 'guides', icon: 'book', color: 'sage' },
  { id: 'info', icon: 'info', color: '' },
];

export function renderMore(main) {
  main.innerHTML = `${pageTitle(t('title.more'))}
    <ul class="menu-list">${items.map((item) => `
      <li><a class="menu-link" href="#/${item.id}">
        <span class="menu-icon ${item.color}">${icon(item.icon)}</span>
        <span>${esc(t(`title.${item.id}`))}</span>
        ${icon('chevron', 'icon chevron')}
      </a></li>`).join('')}
    </ul>`;
}
