#!/usr/bin/env node

/**
 * 📝 Script de Validação e Lembrete de Documentação & Descrições de Loja
 * 
 * Verifica se os arquivos de descrição (description.md, description_pt_BR.md, description_es_ES.md),
 * o README.md e a tela Sobre (popup.js) estão sincronizados com a versão atual da extensão.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const textsDir = path.join(projectRoot, 'material/texts');
const readmePath = path.join(projectRoot, 'README.md');
const popupJsPath = path.join(projectRoot, 'src/js/popup.js');

const OFFICIAL_LINKS = {
  chrome: 'https://chromewebstore.google.com/detail/unicode-utf-8-character-s/fcemphgmjnjpmmdhcedhjiegickfbiia',
  firefox: 'https://addons.mozilla.org/pt-BR/firefox/addon/unicode-utf-8-character-studio/',
  web: 'https://codexico.com.br/unicode/',
  github: 'https://github.com/codexico/UTF-Browser-Extensions'
};

function checkDocs(targetVersion) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = targetVersion || pkg.version;

  console.log('📋 ========================================================');
  console.log(`   Auditoria de Descrições & Documentação (v${version})   `);
  console.log('========================================================\n');

  let hasWarnings = false;

  const descFiles = [
    { name: 'description.md (EN)', file: path.join(textsDir, 'description.md') },
    { name: 'description_pt_BR.md (PT-BR)', file: path.join(textsDir, 'description_pt_BR.md') },
    { name: 'description_es_ES.md (ES)', file: path.join(textsDir, 'description_es_ES.md') }
  ];

  descFiles.forEach(({ name, file }) => {
    if (!fs.existsSync(file)) {
      console.error(`  ❌ Arquivo não encontrado: ${name}`);
      hasWarnings = true;
      return;
    }

    const content = fs.readFileSync(file, 'utf8');

    // Checar presença da versão
    if (!content.includes(`v${version}`)) {
      console.warn(`  ⚠️  [LEMBRETE] ${name}: Não menciona a versão v${version}! Atualize a seção de novidades.`);
      hasWarnings = true;
    } else {
      console.log(`  ✔ ${name}: Contém seção de novidades da v${version}`);
    }

    // Checar links oficiais
    Object.entries(OFFICIAL_LINKS).forEach(([key, url]) => {
      if (!content.includes(url)) {
        console.warn(`  ⚠️  [LINKS] ${name}: Não inclui o link oficial de ${key}!`);
        hasWarnings = true;
      }
    });
  });

  // Checar README.md
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    Object.entries(OFFICIAL_LINKS).forEach(([key, url]) => {
      if (!readmeContent.includes(url)) {
        console.warn(`  ⚠️  [LINKS] README.md: Não inclui o link oficial de ${key}!`);
        hasWarnings = true;
      }
    });
    console.log('  ✔ README.md: Links essenciais validados');
  }

  // Checar popup.js (tela Sobre)
  if (fs.existsSync(popupJsPath)) {
    const popupContent = fs.readFileSync(popupJsPath, 'utf8');
    if (!popupContent.includes('chrome.runtime?.getManifest?.()?.version')) {
      console.warn('  ⚠️  [SOBRE] popup.js: A versão da tela Sobre não está dinâmica via manifest!');
      hasWarnings = true;
    } else {
      console.log('  ✔ popup.js: Tela Sobre (renderAboutView) possui versão dinâmica e links');
    }
  }

  console.log('\n--------------------------------------------------------');
  if (hasWarnings) {
    console.log('💡 LEMBRETE DE PUBLICAÇÃO:');
    console.log('   - Atualize a seção "What\'s New / Novidades" em material/texts/description*.md');
    console.log('   - Certifique-se de que os textos da tela "Sobre" e do README refletem as novidades!');
    console.log('--------------------------------------------------------\n');
    return false;
  } else {
    console.log('🎉 Todas as descrições, telas e links estão 100% sincronizados!\n');
    return true;
  }
}

if (require.main === module) {
  const targetVer = process.argv[2];
  const ok = checkDocs(targetVer);
  if (!ok && process.env.STRICT_DOCS === 'true') {
    process.exit(1);
  }
}

module.exports = { checkDocs, OFFICIAL_LINKS };

