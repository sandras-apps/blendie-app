// Icone lineari (24×24, colore del testo). Uso: icon('heart')

const paths = {
  // Barra in basso
  blend: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  drop: '<path d="M12 3.5s-6 6.4-6 10.8a6 6 0 0 0 12 0C18 9.9 12 3.5 12 3.5z"/>',
  jar: '<rect x="6" y="9" width="12" height="12" rx="3"/><path d="M8 9V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V9"/><path d="M6 14h12"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',

  // Navigazione
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  x: '<path d="M6.5 6.5l11 11"/><path d="M17.5 6.5l-11 11"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  swap: '<path d="M8 4v15"/><path d="M4.5 7.5L8 4l3.5 3.5"/><path d="M16 20V5"/><path d="M12.5 16.5L16 20l3.5-3.5"/>',
  restart: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
  filter: '<path d="M4 7h16"/><path d="M7 12h10"/><path d="M10 17h4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevron: '<path d="M9 18l6-6-6-6"/>',

  // I miei prodotti
  pencil: '<path d="M15.5 5.5l3 3"/><path d="M5 19l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L9 18z"/>',
  trash: '<path d="M4.5 7h15"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 12.5h9l1-12.5"/>',

  // Scheda
  external: '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5L11 13"/><path d="M17.5 13.5v4.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 6 6.5h4.5"/>',
  alert: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4.5"/><path d="M12 17.2v.1"/>',

  // Farmaci
  pill: '<g transform="rotate(-45 12 12)"><rect x="2.6" y="8.3" width="18.8" height="7.4" rx="3.7"/><path d="M12 8.3H6.3a3.7 3.7 0 0 0 0 7.4H12z" fill="currentColor"/></g>',

  // Schermata Altro
  sparkle: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  book: '<path d="M12 6.5C10.3 5.2 8 4.5 4 4.5v13c4 0 6.3.7 8 2 1.7-1.3 4-2 8-2v-13c-4 0-6.3.7-8 2z"/><path d="M12 6.5v13"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 7.8v.1"/>',
};

export function icon(name, className = 'icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || ''}</svg>`;
}
