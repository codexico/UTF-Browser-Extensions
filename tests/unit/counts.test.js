const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const srcDir = path.join(__dirname, "../../src");

// Load unicode-names, unicode-data, and popup code
const namesCode = fs.readFileSync(
  path.join(srcDir, "js/unicode-names.js"),
  "utf8",
);
const dataCode = fs.readFileSync(
  path.join(srcDir, "js/unicode-data.js"),
  "utf8",
);

eval(
  namesCode.replace(
    "const OFFICIAL_UNICODE_NAMES",
    "global.OFFICIAL_UNICODE_NAMES",
  ),
);
eval(dataCode.replace("const POPULAR_GLYPHS", "global.POPULAR_GLYPHS"));

test("Total Official Unicode Consortium Characters Count", (t) => {
  const officialCount = Object.keys(global.OFFICIAL_UNICODE_NAMES).length;
  assert.ok(
    officialCount >= 43000,
    `Expected at least 43,000 Unicode characters, got ${officialCount}`,
  );
  assert.equal(
    officialCount,
    43085,
    "Exact official Unicode Consortium database character count",
  );
});

test("Popular Glyphs Count", (t) => {
  assert.ok(
    Array.isArray(global.POPULAR_GLYPHS),
    "POPULAR_GLYPHS must be an array",
  );
  assert.equal(
    global.POPULAR_GLYPHS.length,
    45,
    "Popular glyphs view must contain exactly 45 items",
  );
});

test("Category Group Character Counts Verification", (t) => {
  const expectedCategoryCounts = {
    arabic: 140,
    arrows: 112,
    block_elements: 32,
    box_drawing: 128,
    braile: 256,
    cherokee: 92,
    cjk: 529,
    currency_symbols: 34,
    devanagari: 128,
    dingbats: 192,
    emoticons: 141,
    enclosed_alphanumerics: 160,
    ethiopic: 350,
    games: 203,
    general_punctuation: 100,
    geometric_shapes: 96,
    greek: 524,
    hebrew: 51,
    hiragana: 93,
    kaomoji: 184,
    katakana: 96,
    khmer: 114,
    latin: 885,
    letterlike_symbols: 80,
    mathematical_operators: 256,
    miscellaneous_symbols: 256,
    miscellaneous_symbols_and_pictographs: 1068,
    miscellaneous_technical: 256,
    mongolian: 158,
    number_forms: 60,
    runic: 89,
    superscripts_and_subscripts: 42,
    thai: 87,
    text_emoticons: 90,
    tibetan: 211,
    transport_and_map_symbols: 128,
    yi: 1284,
  };

  const dataDir = path.join(srcDir, "data");
  let actualTotal = 0;

  Object.entries(expectedCategoryCounts).forEach(
    ([category, expectedCount]) => {
      const jsonPath = path.join(dataDir, `${category}.json`);
      assert.ok(
        fs.existsSync(jsonPath),
        `Dataset JSON file ${category}.json must exist`,
      );

      const dataset = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      let count = 0;

      dataset.forEach((sec) => {
        if (sec.items && Array.isArray(sec.items)) {
          count += sec.items.length;
        } else if (sec.chars) {
          count += Array.from(sec.chars).length;
        }
      });

      assert.equal(
        count,
        expectedCount,
        `Category '${category}' character count mismatch in JSON dataset`,
      );
      actualTotal += count;
    },
  );

  assert.equal(
    actualTotal,
    8705,
    "Exact total curated characters count across all 37 category groups",
  );
});
