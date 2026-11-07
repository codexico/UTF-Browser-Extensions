const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const dataDir = path.join(rootDir, 'src/data');
const localesDir = path.join(rootDir, 'src/_locales');

test('JSON Datasets Integrity & Localization Keys Verification', (t) => {
  const tePath = path.join(dataDir, 'text_emoticons.json');
  const kmPath = path.join(dataDir, 'kaomoji.json');

  assert.ok(fs.existsSync(tePath), 'text_emoticons.json must exist');
  assert.ok(fs.existsSync(kmPath), 'kaomoji.json must exist');

  const teData = JSON.parse(fs.readFileSync(tePath, 'utf8'));
  const kmData = JSON.parse(fs.readFileSync(kmPath, 'utf8'));

  assert.ok(Array.isArray(teData), 'text_emoticons.json must be an array of sections');
  assert.ok(Array.isArray(kmData), 'kaomoji.json must be an array of sections');

  const countItems = (dataset) => dataset.reduce((acc, sec) => acc + (sec.items ? sec.items.length : 0), 0);

  const teCount = countItems(teData);
  const kmCount = countItems(kmData);

  assert.equal(teCount, 90, 'text_emoticons.json must contain exactly 90 emoticons');
  assert.equal(kmCount, 184, 'kaomoji.json must contain exactly 184 kaomojis');

  // Verify that all keys exist in pt_BR, en, and es messages.json
  const ptMessages = JSON.parse(fs.readFileSync(path.join(localesDir, 'pt_BR/messages.json'), 'utf8'));
  const enMessages = JSON.parse(fs.readFileSync(path.join(localesDir, 'en/messages.json'), 'utf8'));
  const esMessages = JSON.parse(fs.readFileSync(path.join(localesDir, 'es/messages.json'), 'utf8'));

  [teData, kmData].forEach(dataset => {
    dataset.forEach(sec => {
      assert.ok(sec.section, 'Section must have a fallback title');
      assert.ok(sec.sectionKey, 'Section must have a sectionKey');
      assert.ok(ptMessages[sec.sectionKey], `pt_BR must have section key: ${sec.sectionKey}`);
      assert.ok(enMessages[sec.sectionKey], `en must have section key: ${sec.sectionKey}`);
      assert.ok(esMessages[sec.sectionKey], `es must have section key: ${sec.sectionKey}`);

      sec.items.forEach(item => {
        assert.ok(item.symbol, 'Item must have a symbol');
        assert.ok(item.name, 'Item must have a fallback name');
        assert.ok(item.key, 'Item must have a localization key');
        assert.ok(ptMessages[item.key], `pt_BR must have item key: ${item.key}`);
        assert.ok(enMessages[item.key], `en must have item key: ${item.key}`);
        assert.ok(esMessages[item.key], `es must have item key: ${item.key}`);
      });
    });
  });
});

