const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const srcDir = path.join(__dirname, '../../src');

test('Group HTML File Parsing', (t) => {
  const sampleGroupHTML = `
    <p>Setas Direcionais 10</p>
    <p>➔ ➔ ➜ ➲ 🏹</p>
    <p>Matemática 5</p>
    <p>∑ ∏ ∫ √ ∞</p>
  `;

  const paragraphMatches = sampleGroupHTML.match(/<p>([\s\S]*?)<\/p>/gi) || [];
  const glyphs = [];
  let currentSection = 'arrows';

  paragraphMatches.forEach(p => {
    const text = p.replace(/<[^>]+>/g, '').trim();
    if (!text) return;

    if (text.includes(' ') && text.match(/\d+$/)) {
      currentSection = text.replace(/\s+\d+$/, '').replace(/_/g, ' ');
    } else {
      const chars = Array.from(text);
      chars.forEach(ch => {
        if (!ch || ch === ' ' || ch === '\n') return;
        const codePoint = ch.codePointAt(0);
        const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');

        glyphs.push({
          symbol: ch,
          hex: hex,
          dec: codePoint.toString(),
          section: currentSection
        });
      });
    }
  });

  assert.ok(glyphs.length > 0, 'Parsed glyphs should not be empty');
  assert.equal(glyphs[0].symbol, '➔');
  assert.equal(glyphs[0].hex, '2794');
  assert.equal(glyphs[0].dec, '10132');
  assert.equal(glyphs[0].section, 'Setas Direcionais');
});
