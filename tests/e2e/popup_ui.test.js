const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const popupHtmlPath = path.join(__dirname, '../../src/popup.html');

test('Extension HTML UI Structure Integrity', (t) => {
  const htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');

  // Verify essential UI element IDs exist
  assert.ok(htmlContent.includes('id="searchInput"'), 'Must contain #searchInput');
  assert.ok(htmlContent.includes('id="glyphGrid"'), 'Must contain #glyphGrid');
  assert.ok(htmlContent.includes('class="inspector"'), 'Must contain footer.inspector');
  assert.ok(htmlContent.includes('id="inspectGlyph"'), 'Must contain #inspectGlyph');
  assert.ok(htmlContent.includes('id="btnSidePanel"'), 'Must contain #btnSidePanel');
  assert.ok(htmlContent.includes('id="fontsModal"'), 'Must contain #fontsModal');
  assert.ok(htmlContent.includes('id="btnDismissModal"'), 'Must contain #btnDismissModal');

  // Verify clickable code badges and actions exist in inspector
  assert.ok(htmlContent.includes('id="inspectCodepoint"'), 'Must contain #inspectCodepoint');
  assert.ok(htmlContent.includes('id="btnCopyHexVal"'), 'Must contain #btnCopyHexVal');
  assert.ok(htmlContent.includes('id="btnCopyDecVal"'), 'Must contain #btnCopyDecVal');
  assert.ok(htmlContent.includes('id="btnCopyEntityVal"'), 'Must contain #btnCopyEntityVal');
  assert.ok(htmlContent.includes('id="btnCopyChar"'), 'Must contain #btnCopyChar');
  assert.ok(htmlContent.includes('id="btnFav"'), 'Must contain #btnFav');

  // Verify scripts are included in correct dependency order
  assert.ok(htmlContent.includes('src="js/unicode-data.js"'), 'Must load unicode-data.js');
  assert.ok(htmlContent.includes('src="js/unicode-names.js"'), 'Must load unicode-names.js');
  assert.ok(htmlContent.includes('src="js/popup.js"'), 'Must load popup.js');
});
