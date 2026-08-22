const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const srcDir = path.join(__dirname, '../../src');
const namesCode = fs.readFileSync(path.join(srcDir, 'js/unicode-names.js'), 'utf8');

eval(namesCode.replace('const OFFICIAL_UNICODE_NAMES', 'global.OFFICIAL_UNICODE_NAMES'));

test('Unicode Official Consortium Name Database', (t) => {
  assert.ok(global.OFFICIAL_UNICODE_NAMES, 'OFFICIAL_UNICODE_NAMES dictionary must exist');
  
  // Test well known characters
  assert.equal(global.OFFICIAL_UNICODE_NAMES['2605'], 'BLACK STAR');
  assert.equal(global.OFFICIAL_UNICODE_NAMES['2713'], 'CHECK MARK');
  assert.equal(global.OFFICIAL_UNICODE_NAMES['A9'], 'COPYRIGHT');
  assert.equal(global.OFFICIAL_UNICODE_NAMES['1F600'], 'GRINNING FACE');
});
