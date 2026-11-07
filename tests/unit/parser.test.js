const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const srcDir = path.join(__dirname, '../../src');
const popupCode = fs.readFileSync(path.join(srcDir, 'js/popup.js'), 'utf8');

test('Group JSON Dataset Parsing', (t) => {
  const sampleGroupJSON = [
    {
      section: 'Setas Direcionais',
      sectionKey: 'sec_arrows_directional',
      chars: '➔➜➲🏹'
    },
    {
      section: 'Matemática',
      sectionKey: 'sec_math',
      chars: '∑∏∫√∞'
    }
  ];

  const parseGroupJSONMatch = popupCode.match(/function parseGroupJSON[\s\S]*?^}/m);
  const parseGroupJSON = new Function(`
    function getMsg(k, fallback) { return fallback; }
    function getUnicodeName(ch, hex, section) { return 'CHARACTER U+' + hex; }
    ${parseGroupJSONMatch ? parseGroupJSONMatch[0] : ''}
    return parseGroupJSON;
  `)();

  const glyphs = parseGroupJSON(sampleGroupJSON, 'arrows');

  assert.ok(glyphs.length === 9, 'Parsed glyphs should match total characters');
  assert.equal(glyphs[0].symbol, '➔');
  assert.equal(glyphs[0].hex, '2794');
  assert.equal(glyphs[0].dec, '10132');
  assert.equal(glyphs[0].section, 'Setas Direcionais');
  assert.equal(glyphs[4].symbol, '∑');
  assert.equal(glyphs[4].section, 'Matemática');
});
