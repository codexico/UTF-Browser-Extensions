const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const textsDir = path.join(rootDir, 'material/texts');
const readmePath = path.join(rootDir, 'README.md');
const popupJsPath = path.join(rootDir, 'src/js/popup.js');

const OFFICIAL_LINKS = {
  chrome: 'https://chromewebstore.google.com/detail/unicode-utf-8-character-s/fcemphgmjnjpmmdhcedhjiegickfbiia',
  firefox: 'https://addons.mozilla.org/pt-BR/firefox/addon/unicode-utf-8-character-studio/',
  web: 'https://codexico.com.br/unicode/',
  github: 'https://github.com/codexico/UTF-Browser-Extensions'
};

test('Documentation & Store Descriptions Integrity Verification', (t) => {
  const descEnPath = path.join(textsDir, 'description.md');
  const descPtPath = path.join(textsDir, 'description_pt_BR.md');
  const descEsPath = path.join(textsDir, 'description_es_ES.md');

  // 1. Files must exist
  assert.ok(fs.existsSync(descEnPath), 'description.md (EN) must exist');
  assert.ok(fs.existsSync(descPtPath), 'description_pt_BR.md (PT-BR) must exist');
  assert.ok(fs.existsSync(descEsPath), 'description_es_ES.md (ES) must exist');
  assert.ok(fs.existsSync(readmePath), 'README.md must exist');

  const descEn = fs.readFileSync(descEnPath, 'utf8');
  const descPt = fs.readFileSync(descPtPath, 'utf8');
  const descEs = fs.readFileSync(descEsPath, 'utf8');
  const readme = fs.readFileSync(readmePath, 'utf8');
  const popupJs = fs.readFileSync(popupJsPath, 'utf8');

  // 2. Official links must be present across all description files
  [
    { name: 'description.md', content: descEn },
    { name: 'description_pt_BR.md', content: descPt },
    { name: 'description_es_ES.md', content: descEs },
    { name: 'README.md', content: readme }
  ].forEach(({ name, content }) => {
    assert.ok(content.includes(OFFICIAL_LINKS.chrome), `${name} must include Chrome Web Store link`);
    assert.ok(content.includes(OFFICIAL_LINKS.firefox), `${name} must include Firefox Add-on link`);
    assert.ok(content.includes(OFFICIAL_LINKS.web), `${name} must include Online Web link`);
    assert.ok(content.includes(OFFICIAL_LINKS.github), `${name} must include GitHub link`);
  });

  // 3. Popup Sobre (renderAboutView) must include official links and dynamic version
  assert.ok(popupJs.includes('renderAboutView'), 'popup.js must implement renderAboutView');
  assert.ok(popupJs.includes('chrome.runtime?.getManifest?.()?.version'), 'renderAboutView must read version dynamically from manifest');
  assert.ok(popupJs.includes(OFFICIAL_LINKS.chrome), 'renderAboutView must include Chrome Web Store link');
  assert.ok(popupJs.includes(OFFICIAL_LINKS.firefox), 'renderAboutView must include Firefox Add-on link');
  assert.ok(popupJs.includes(OFFICIAL_LINKS.web), 'renderAboutView must include Online Web link');
  assert.ok(popupJs.includes(OFFICIAL_LINKS.github), 'renderAboutView must include GitHub link');
});
