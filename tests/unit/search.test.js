const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const srcDir = path.join(__dirname, '../../src');

const namesCode = fs.readFileSync(path.join(srcDir, 'js/unicode-names.js'), 'utf8');
const dataCode = fs.readFileSync(path.join(srcDir, 'js/unicode-data.js'), 'utf8');
const popupCode = fs.readFileSync(path.join(srcDir, 'js/popup.js'), 'utf8');

eval(namesCode.replace('const OFFICIAL_UNICODE_NAMES', 'global.OFFICIAL_UNICODE_NAMES'));
eval(dataCode.replace('const SYNONYMS', 'global.SYNONYMS'));

const tryParseMatch = popupCode.match(/function tryParseCodepointOrEntity[\s\S]*?^}/m);

// Evaluate tryParseCodepointOrEntity function
const tryParseCodepointOrEntity = new Function('OFFICIAL_UNICODE_NAMES', 'SYNONYMS', `
  function getUnicodeName(ch, hex, section) {
    const cleanHex = hex.replace(/^0+/, '').toUpperCase();
    return OFFICIAL_UNICODE_NAMES[cleanHex] || OFFICIAL_UNICODE_NAMES[hex] || 'CHARACTER U+' + hex;
  }
  ${tryParseMatch ? tryParseMatch[0] : ''}
  return tryParseCodepointOrEntity;
`)(global.OFFICIAL_UNICODE_NAMES, global.SYNONYMS);

test('Hex Code Search Resolutions', (t) => {
  const hexTests = ['2605', 'U+2605', 'u+2605', '0x2605', '#2605', '&#x2605;', '\\u2605'];
  
  hexTests.forEach(term => {
    const matches = tryParseCodepointOrEntity(term);
    assert.ok(matches.length > 0, `Expected matches for term: ${term}`);
    const starMatch = matches.find(m => m.hex === '2605');
    assert.ok(starMatch, `Expected U+2605 for term: ${term}`);
    assert.equal(starMatch.symbol, '★');
    assert.equal(starMatch.dec, '9733');
  });

  const emojiMatch = tryParseCodepointOrEntity('1F600');
  assert.ok(emojiMatch.length > 0);
  assert.equal(emojiMatch[0].symbol, '😀');
  assert.equal(emojiMatch[0].hex, '1F600');
  assert.equal(emojiMatch[0].dec, '128512');
});

test('Decimal Code Search Resolutions', (t) => {
  const decTests = ['9733', '&#9733;', '&#9733'];
  
  decTests.forEach(term => {
    const matches = tryParseCodepointOrEntity(term);
    assert.ok(matches.length > 0, `Expected matches for dec term: ${term}`);
    const starMatch = matches.find(m => m.hex === '2605');
    assert.ok(starMatch, `Expected U+2605 for dec term: ${term}`);
    assert.equal(starMatch.symbol, '★');
    assert.equal(starMatch.dec, '9733');
  });

  const emojiDecMatch = tryParseCodepointOrEntity('&#128512;');
  assert.ok(emojiDecMatch.length > 0);
  assert.equal(emojiDecMatch[0].symbol, '😀');
  assert.equal(emojiDecMatch[0].hex, '1F600');
});

test('HTML Named Entity Search Resolutions', (t) => {
  const entityTests = ['&star;', 'star', '&copy;', 'copy', '&trade;', '&check;', '&lt;', '&gt;'];

  entityTests.forEach(term => {
    const matches = tryParseCodepointOrEntity(term);
    assert.ok(matches.length > 0, `Expected matches for entity: ${term}`);
  });

  const starMatch = tryParseCodepointOrEntity('&star;');
  assert.equal(starMatch[0].symbol, '★');
  assert.equal(starMatch[0].hex, '2605');

  const copyMatch = tryParseCodepointOrEntity('&copy;');
  assert.equal(copyMatch[0].symbol, '©');
  assert.equal(copyMatch[0].hex, '00A9');
});

test('Kaomoji Search Resolution by Name & Tags', (t) => {
  const kaomojiHtml = fs.readFileSync(path.join(srcDir, 'html/groups/kaomoji.html'), 'utf8');

  function mockDOMParser() {
    return {
      parseFromString: (html) => {
        const paragraphs = [];
        const regex = /<p>([\s\S]*?)<\/p>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
          paragraphs.push({ textContent: match[1].trim() });
        }
        return { querySelectorAll: () => paragraphs };
      }
    };
  }

  const parseGroupHTMLMatch = popupCode.match(/function parseGroupHTML[\s\S]*?^}/m);
  const parseGroupHTML = new Function('DOMParser', `
    function getUnicodeName(ch, hex, section) { return 'CHARACTER U+' + hex; }
    ${parseGroupHTMLMatch ? parseGroupHTMLMatch[0] : ''}
    return parseGroupHTML;
  `)(mockDOMParser);

  const parsedKaomojis = parseGroupHTML(kaomojiHtml, 'kaomoji');
  assert.ok(parsedKaomojis.length >= 150, `Expected at least 150 Kaomojis, got ${parsedKaomojis.length}`);

  // Test searching Kaomojis by name/tag tokens
  const mesaMatch = parsedKaomojis.filter(g => g.name.toLowerCase().includes('mesa') || g.section.toLowerCase().includes('mesa'));
  assert.ok(mesaMatch.length > 0, 'Must find table flip kaomojis when searching "mesa"');
  assert.ok(mesaMatch.some(g => g.symbol.includes('┻━┻')), 'Must include (╯°□°)╯ ┻━┻ in "mesa" matches');

  const shrugMatch = parsedKaomojis.filter(g => g.name.toLowerCase().includes('shrug') || g.name.toLowerCase().includes('ombros'));
  assert.ok(shrugMatch.length >= 1, 'Search for "shrug" or "ombros" must return matches');
  assert.ok(shrugMatch.some(g => g.symbol.includes('ツ')), 'Must include Kaomoji containing ツ in "shrug" matches');
});
