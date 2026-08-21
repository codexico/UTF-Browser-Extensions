/**
 * Modern UTF-8 & Unicode Extension Controller
 */

// Storage Keys
const STORAGE_FAVS = 'utf_favorites';
const STORAGE_RECENT = 'utf_recents';

// State
let categoryCache = {}; // group -> array of character objects
let currentCategory = 'home';
let activeGlyph = null;
let favoriteGlyphs = [];
let recentGlyphs = [];
let toastTimeout = null;

// High-frequency explicit Unicode Character Name Lookup
const UNICODE_EXACT_NAMES = {
  '0024': 'DOLLAR SIGN ($)',
  '00A2': 'CENT SIGN (¢)',
  '00A3': 'POUND SIGN (£)',
  '00A4': 'CURRENCY SIGN (¤)',
  '00A5': 'YEN SIGN (¥)',
  '20AC': 'EURO SIGN (€)',
  '20BF': 'BITCOIN SIGN (₿)',
  '2318': 'COMMAND KEY (⌘)',
  '2325': 'OPTION KEY (⌥)',
  '21E7': 'SHIFT KEY (⇧)',
  '232B': 'BACKSPACE KEY (⌫)',
  '221E': 'INFINITY (∞)'
};

/**
 * i18n Translation Helper
 */
function getMsg(key, fallback) {
  if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
    const msg = chrome.i18n.getMessage(key);
    if (msg) return msg;
  }
  return fallback;
}

function applyI18n() {
  if (typeof chrome === 'undefined' || !chrome.i18n || !chrome.i18n.getMessage) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.title = msg;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.placeholder = msg;
  });
}

/**
 * Dynamic Unicode Character Naming Engine
 */
function getUnicodeName(symbol, hex, section) {
  const upperHex = hex.toUpperCase();
  if (typeof OFFICIAL_UNICODE_NAMES !== 'undefined' && OFFICIAL_UNICODE_NAMES[upperHex]) {
    return OFFICIAL_UNICODE_NAMES[upperHex];
  }
  if (UNICODE_EXACT_NAMES && UNICODE_EXACT_NAMES[upperHex]) {
    return UNICODE_EXACT_NAMES[upperHex];
  }

  const code = parseInt(hex, 16);

  // Braille Patterns (0x2800 - 0x28FF)
  if (code >= 0x2800 && code <= 0x28FF) {
    const offset = code - 0x2800;
    if (offset === 0) return 'BRAILLE PATTERN BLANK';
    let dots = [];
    if (offset & 0x01) dots.push('1');
    if (offset & 0x02) dots.push('2');
    if (offset & 0x04) dots.push('3');
    if (offset & 0x08) dots.push('4');
    if (offset & 0x10) dots.push('5');
    if (offset & 0x20) dots.push('6');
    if (offset & 0x40) dots.push('7');
    if (offset & 0x80) dots.push('8');
    return `BRAILLE PATTERN DOTS-${dots.join('')}`;
  }

  // Circled Digits (0x2460 - 0x2473)
  if (code >= 0x2460 && code <= 0x2473) {
    return `CIRCLED DIGIT ${code - 0x245F}`;
  }
  // Circled Latin Capital Letters (0x24B6 - 0x24CF)
  if (code >= 0x24B6 && code <= 0x24CF) {
    const char = String.fromCharCode(65 + (code - 0x24B6));
    return `CIRCLED LATIN CAPITAL LETTER ${char}`;
  }

  return `${section || 'Unicode'} Character U+${upperHex}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  applyI18n();

  // Detect Side Panel mode via query param or window width
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'sidepanel' || window.innerWidth < 440) {
    document.body.classList.add('is-sidepanel');
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth < 440) {
      document.body.classList.add('is-sidepanel');
    } else if (urlParams.get('mode') !== 'sidepanel') {
      document.body.classList.remove('is-sidepanel');
    }
  });

  await initStorage();
  setupEventListeners();

  renderCategory('home');
});

/**
 * Initialize storage for favorites and recents
 */
async function initStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get([STORAGE_FAVS, STORAGE_RECENT]);
    favoriteGlyphs = data[STORAGE_FAVS] || [];
    recentGlyphs = data[STORAGE_RECENT] || [];
  } else {
    try {
      favoriteGlyphs = JSON.parse(localStorage.getItem(STORAGE_FAVS) || '[]');
      recentGlyphs = JSON.parse(localStorage.getItem(STORAGE_RECENT) || '[]');
    } catch (e) {
      favoriteGlyphs = [];
      recentGlyphs = [];
    }
  }
}

async function saveStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({
      [STORAGE_FAVS]: favoriteGlyphs,
      [STORAGE_RECENT]: recentGlyphs
    });
  } else {
    localStorage.setItem(STORAGE_FAVS, JSON.stringify(favoriteGlyphs));
    localStorage.setItem(STORAGE_RECENT, JSON.stringify(recentGlyphs));
  }
}

/**
 * Event Listener Setup
 */
function setupEventListeners() {
  // Category Pill Navigation Horizontal Scroll on Mouse Wheel
  const navScroll = id('navScroll');
  if (navScroll) {
    navScroll.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        navScroll.scrollLeft += e.deltaY * 1.2;
      }
    }, { passive: false });

    // Category Pill Clicks
    navScroll.addEventListener('click', (e) => {
      const pill = e.target.closest('.nav-pill');
      if (!pill) return;
      const cat = pill.dataset.category;
      if (cat) switchCategory(cat, pill);
    });
  }

  // Font Recommendation Modal Events
  const btnFontInfo = id('btnFontInfo');
  const fontsModal = id('fontsModal');
  const btnCloseModal = id('btnCloseModal');

  if (btnFontInfo && fontsModal) {
    btnFontInfo.addEventListener('click', () => {
      fontsModal.classList.remove('hidden');
    });
  }

  if (btnCloseModal && fontsModal) {
    btnCloseModal.addEventListener('click', () => {
      fontsModal.classList.add('hidden');
    });
  }

  if (fontsModal) {
    fontsModal.addEventListener('click', (e) => {
      if (e.target === fontsModal) {
        fontsModal.classList.add('hidden');
      }
    });
  }

  // Search Input Filter
  const searchInput = id('searchInput');
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    if (term.length > 0) {
      performSearch(term);
    } else {
      renderCategory(currentCategory);
    }
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'Escape') {
      if (fontsModal && !fontsModal.classList.contains('hidden')) {
        fontsModal.classList.add('hidden');
      } else if (document.activeElement === searchInput) {
        searchInput.value = '';
        renderCategory(currentCategory);
        searchInput.blur();
      }
    }
  });

  // Inspector Action Buttons
  id('btnCopyChar').addEventListener('click', () => {
    if (activeGlyph) copyToClipboard(activeGlyph.symbol, `${getMsg('copiedMsg', 'Copiado: ')}${activeGlyph.symbol}`);
  });

  id('btnCopyHex').addEventListener('click', () => {
    if (activeGlyph) copyToClipboard(`U+${activeGlyph.hex}`, `${getMsg('copiedMsg', 'Copiado: ')}U+${activeGlyph.hex}`);
  });

  id('btnFav').addEventListener('click', () => {
    if (activeGlyph) toggleFavorite(activeGlyph);
  });

  // Inspector Clickable Code Badges
  const inspectCodepoint = id('inspectCodepoint');
  if (inspectCodepoint) {
    inspectCodepoint.addEventListener('click', () => {
      if (activeGlyph) copyToClipboard(`U+${activeGlyph.hex}`, `${getMsg('copiedMsg', 'Copiado: ')}U+${activeGlyph.hex}`);
    });
  }

  const btnCopyHexVal = id('btnCopyHexVal');
  if (btnCopyHexVal) {
    btnCopyHexVal.addEventListener('click', () => {
      if (activeGlyph) copyToClipboard(activeGlyph.hex, `${getMsg('copiedMsg', 'Copiado: ')}${activeGlyph.hex}`);
    });
  }

  const btnCopyDecVal = id('btnCopyDecVal');
  if (btnCopyDecVal) {
    btnCopyDecVal.addEventListener('click', () => {
      if (activeGlyph) copyToClipboard(activeGlyph.dec, `${getMsg('copiedMsg', 'Copiado: ')}${activeGlyph.dec}`);
    });
  }

  const btnCopyEntityVal = id('btnCopyEntityVal');
  if (btnCopyEntityVal) {
    btnCopyEntityVal.addEventListener('click', () => {
      if (activeGlyph) copyToClipboard(`&#${activeGlyph.dec};`, `${getMsg('copiedMsg', 'Copiado: ')}&#${activeGlyph.dec};`);
    });
  }

  // Side Panel Pin Button
  const btnSidePanel = id('btnSidePanel');
  if (btnSidePanel) {
    btnSidePanel.addEventListener('click', async () => {
      if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.open) {
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.windowId) {
            await chrome.sidePanel.open({ windowId: tab.windowId });
            window.close();
          }
        } catch (err) {
          console.error('Error opening side panel:', err);
        }
      } else {
        showToast(getMsg('sidepanelOpenTip', 'Abra o Painel Lateral no menu de extensões do Chrome'));
      }
    });
  }
}

/**
 * Switch Category
 */
async function switchCategory(cat, pillElement) {
  currentCategory = cat;

  document.querySelectorAll('.nav-pill').forEach(btn => btn.classList.remove('active'));
  if (pillElement) pillElement.classList.add('active');

  id('searchInput').value = '';

  if (cat === 'home') {
    renderHomeView();
  } else if (cat === 'favorites') {
    renderGlyphList(favoriteGlyphs, getMsg('emptyFavoritesMsg', 'Nenhum favorito salvo. Clique no ★ no painel inferior para salvar!'));
  } else {
    await loadCategory(cat);
  }

  if (pillElement) {
    pillElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function renderCategory(cat) {
  const pill = document.querySelector(`.nav-pill[data-category="${cat}"]`);
  if (pill) switchCategory(cat, pill);
  else loadCategory(cat);
}

/**
 * Render ⚡ Início View (Sections: Recentes + Populares)
 */
function renderHomeView() {
  const grid = id('glyphGrid');
  const emptyState = id('emptyState');
  grid.innerHTML = '';
  grid.classList.remove('utility-hidden');
  emptyState.classList.add('hidden');

  const fragment = document.createDocumentFragment();

  // Section 1: Recentes
  const headerRecents = document.createElement('div');
  headerRecents.className = 'grid-section-header';
  const recentsTitle = getMsg('sectionRecents', 'Recentes');
  headerRecents.innerHTML = `<span>⏱ ${recentsTitle}</span>`;
  fragment.appendChild(headerRecents);

  if (recentGlyphs && recentGlyphs.length > 0) {
    recentGlyphs.forEach(g => {
      fragment.appendChild(createCardElement(g));
    });
  } else {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'grid-section-header';
    emptyNotice.style.textTransform = 'none';
    emptyNotice.style.fontWeight = '400';
    emptyNotice.style.color = 'var(--text-muted)';
    emptyNotice.textContent = getMsg('emptyRecentsNotice', 'Os caracteres que você copiar aparecerão aqui!');
    fragment.appendChild(emptyNotice);
  }

  // Section 2: Populares & Essenciais
  const headerPopular = document.createElement('div');
  headerPopular.className = 'grid-section-header';
  headerPopular.style.marginTop = '12px';
  const popularTitle = getMsg('sectionPopular', 'Mais Populares');
  headerPopular.innerHTML = `<span>🔥 ${popularTitle}</span>`;
  fragment.appendChild(headerPopular);

  const popularList = (typeof POPULAR_GLYPHS !== 'undefined') ? POPULAR_GLYPHS : [];
  popularList.forEach(g => {
    fragment.appendChild(createCardElement(g));
  });

  grid.appendChild(fragment);

  const firstGlyph = (recentGlyphs && recentGlyphs.length > 0) ? recentGlyphs[0] : popularList[0];
  if (firstGlyph) selectGlyph(firstGlyph, grid.querySelector('.glyph-card'));
}

/**
 * Helper to create a card element
 */
function createCardElement(g) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'glyph-card';
  card.dataset.hex = g.hex;

  const labelText = `${g.name} (U+${g.hex})`;
  card.setAttribute('aria-label', `${g.name}, U+${g.hex}, ${g.symbol}`);
  card.title = labelText;

  card.innerHTML = `
    <span class="glyph-symbol">${g.symbol}</span>
    <span class="glyph-code">U+${g.hex}</span>
  `;

  card.addEventListener('click', () => {
    selectGlyph(g, card);
    copyToClipboard(g.symbol, `${getMsg('copiedMsg', 'Copiado: ')}${g.symbol}`);
    addToRecent(g);
  });

  card.addEventListener('focus', () => {
    selectGlyph(g, card);
  });

  return card;
}

/**
 * Fetch and Parse Category HTML
 */
async function loadCategory(group) {
  if (categoryCache[group]) {
    renderGlyphList(categoryCache[group]);
    return;
  }

  try {
    const response = await fetch(`html/groups/${group}.html`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const htmlText = await response.text();
    const parsedGlyphs = parseGroupHTML(htmlText, group);
    categoryCache[group] = parsedGlyphs;
    renderGlyphList(parsedGlyphs);
  } catch (err) {
    console.error('Error loading category:', err);
    renderGlyphList([], `Erro ao carregar o grupo "${group}"`);
  }
}

/**
 * Parse Group HTML content into glyph objects
 */
function parseGroupHTML(htmlText, groupName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const paragraphs = doc.querySelectorAll('p');
  const glyphs = [];

  let currentSection = groupName;

  paragraphs.forEach(p => {
    const text = p.innerText.trim();
    if (!text) return;

    if (text.includes(' ') && text.match(/\d+$/)) {
      currentSection = text.replace(/\s+\d+$/, '').replace(/_/g, ' ');
    } else {
      const chars = Array.from(text);
      chars.forEach(ch => {
        if (!ch || ch === ' ' || ch === '\n') return;
        const codePoint = ch.codePointAt(0);
        const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
        const name = getUnicodeName(ch, hex, currentSection);

        glyphs.push({
          symbol: ch,
          hex: hex,
          dec: codePoint.toString(),
          section: currentSection,
          name: name
        });
      });
    }
  });

  return glyphs;
}

/**
 * Perform Fuzzy Token-Based Search with Synonym Expansion & Relevance Sorting
 */
async function performSearch(term) {
  let searchPool = [];

  Object.values(categoryCache).forEach(arr => {
    searchPool = searchPool.concat(arr);
  });

  const allGroups = [
    'emoticons', 'miscellaneous_symbols_and_pictographs', 'transport_and_map_symbols', 'miscellaneous_symbols',
    'dingbats', 'currency_symbols', 'mathematical_operators', 'arrows', 'miscellaneous_technical', 'enclosed_alphanumerics',
    'box_drawing', 'block_elements', 'geometric_shapes', 'general_punctuation', 'superscripts_and_subscripts',
    'letterlike_symbols', 'number_forms', 'games', 'latin', 'greek', 'hebrew', 'arabic', 'devanagari', 'thai',
    'tibetan', 'runic', 'ethiopic', 'cherokee', 'khmer', 'mongolian', 'hiragana', 'katakana', 'braile', 'cjk', 'yi'
  ];

  for (const group of allGroups) {
    if (!categoryCache[group]) {
      try {
        const res = await fetch(`html/groups/${group}.html`);
        if (res.ok) {
          const txt = await res.text();
          categoryCache[group] = parseGroupHTML(txt, group);
          searchPool = searchPool.concat(categoryCache[group]);
        }
      } catch (e) {}
    }
  }

  const seen = new Set();
  const uniquePool = searchPool.filter(g => {
    if (seen.has(g.hex)) return false;
    seen.add(g.hex);
    return true;
  });

  const cleanTerm = term.toLowerCase().trim();
  const tokens = cleanTerm.split(/\s+/).filter(Boolean);
  const synonymsDict = (typeof SYNONYMS !== 'undefined') ? SYNONYMS : {};

  const results = uniquePool.filter(g => {
    const textToSearch = `${g.symbol} U+${g.hex} ${g.dec} ${g.section} ${g.name || ''}`.toLowerCase();
    
    return tokens.every(token => {
      if (textToSearch.includes(token)) return true;
      if (synonymsDict[token]) {
        return synonymsDict[token].some(syn => textToSearch.includes(syn));
      }
      for (const [key, list] of Object.entries(synonymsDict)) {
        if (list.includes(token)) {
          if (textToSearch.includes(key) || list.some(syn => textToSearch.includes(syn))) return true;
        }
      }
      return false;
    });
  });

  results.sort((a, b) => {
    if (a.symbol === cleanTerm) return -1;
    if (b.symbol === cleanTerm) return 1;

    const hexTerm = cleanTerm.replace(/^u\+/, '').toUpperCase();
    if (a.hex === hexTerm) return -1;
    if (b.hex === hexTerm) return 1;

    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    if (aName.startsWith(cleanTerm) && !bName.startsWith(cleanTerm)) return -1;
    if (bName.startsWith(cleanTerm) && !aName.startsWith(cleanTerm)) return 1;

    return 0;
  });

  renderGlyphList(results, 'Nenhum resultado encontrado para a busca');
}

/**
 * Render Glyph Cards as Keyboard-Accessible Buttons
 */
function renderGlyphList(glyphs, emptyMsg = 'Nenhum caractere nesta categoria') {
  const grid = id('glyphGrid');
  const emptyState = id('emptyState');
  grid.innerHTML = '';

  if (!glyphs || glyphs.length === 0) {
    grid.classList.add('utility-hidden');
    emptyState.classList.remove('hidden');
    emptyState.querySelector('.empty-sub').textContent = emptyMsg;
    return;
  }

  grid.classList.remove('utility-hidden');
  emptyState.classList.add('hidden');

  const fragment = document.createDocumentFragment();

  glyphs.forEach((g, index) => {
    const card = createCardElement(g);
    fragment.appendChild(card);
    if (index === 0) selectGlyph(g, card);
  });

  grid.appendChild(fragment);
}

/**
 * Select Active Glyph Card
 */
function selectGlyph(glyph, cardElement) {
  activeGlyph = glyph;
  document.querySelectorAll('.glyph-card').forEach(c => c.classList.remove('selected'));
  if (cardElement) cardElement.classList.add('selected');
  updateInspector(glyph);
}

/**
 * Update Inspector Footer Info
 */
function updateInspector(glyph) {
  if (!glyph) return;
  const fullName = glyph.name || `${glyph.section} Character`;
  
  id('inspectGlyph').textContent = glyph.symbol;
  
  const subgroupEl = id('inspectSubgroup');
  subgroupEl.textContent = fullName;
  subgroupEl.title = `${fullName} (U+${glyph.hex})`;
  
  id('inspectCodepoint').textContent = `U+${glyph.hex}`;
  id('inspectHex').textContent = glyph.hex;
  id('inspectDec').textContent = glyph.dec;
  id('inspectEntity').textContent = `&#${glyph.dec};`;

  const isFav = favoriteGlyphs.some(f => f.hex === glyph.hex);
  const btnFav = id('btnFav');
  if (isFav) {
    btnFav.classList.add('is-fav');
  } else {
    btnFav.classList.remove('is-fav');
  }
}

/**
 * Toggle Favorite Glyph
 */
async function toggleFavorite(glyph) {
  const index = favoriteGlyphs.findIndex(f => f.hex === glyph.hex);
  if (index >= 0) {
    favoriteGlyphs.splice(index, 1);
    showToast(`${getMsg('removedFavMsg', 'Removido dos favoritos: ')}${glyph.symbol}`);
  } else {
    favoriteGlyphs.unshift(glyph);
    showToast(`${getMsg('addedFavMsg', 'Adicionado aos favoritos! ')}${glyph.symbol}`);
  }
  await saveStorage();
  updateInspector(glyph);

  if (currentCategory === 'favorites') {
    renderGlyphList(favoriteGlyphs, getMsg('emptyFavoritesMsg', 'Nenhum favorito salvo. Clique no ★ no painel inferior para salvar!'));
  }
}

/**
 * Add Glyph to Recent history
 */
async function addToRecent(glyph) {
  const existingIdx = recentGlyphs.findIndex(r => r.hex === glyph.hex);
  if (existingIdx >= 0) {
    recentGlyphs.splice(existingIdx, 1);
  }
  recentGlyphs.unshift(glyph);
  if (recentGlyphs.length > 50) recentGlyphs.pop();
  await saveStorage();

  if (currentCategory === 'home') {
    renderHomeView();
  }
}

/**
 * Clipboard Copy Helper with Feedback
 */
function copyToClipboard(text, message) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => fallbackCopy(text, message));
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const input = document.createElement('textarea');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  showToast(message);
}

/**
 * Toast Notification Popup
 */
function showToast(message) {
  const toast = id('toast');
  const toastMsg = id('toastMsg');
  toastMsg.textContent = message;

  toast.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 1800);
}

// Utility Helper
function id(elementId) {
  return document.getElementById(elementId);
}
