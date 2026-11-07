#!/usr/bin/env node

/**
 * 🚀 Script de Atualização Automática de Descrições de Loja e README
 * 
 * Extrai automaticamente as mudanças dos commits Git (ou mensagem personalizada),
 * traduz para Inglês, Português e Espanhol e injeta a nova seção
 * "✨ What's New in Version vX.Y.Z:" no topo dos arquivos:
 *   - material/texts/description.md (EN)
 *   - material/texts/description_pt_BR.md (PT-BR)
 *   - material/texts/description_es_ES.md (ES)
 *   - README.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const textsDir = path.join(projectRoot, 'material/texts');
const readmePath = path.join(projectRoot, 'README.md');

/**
 * Obtém os commits entre a última tag (ou penúltima) e o estado atual
 */
function getRecentGitCommits(targetVersion) {
  try {
    // Buscar tags ordenadas por versão
    const tagsRaw = execSync('git tag -l --sort=-v:refname', { cwd: projectRoot, encoding: 'utf8' }).trim();
    const tags = tagsRaw.split('\n').filter(Boolean);

    let range = 'HEAD~5..HEAD';
    if (tags.length > 0) {
      const currentTag = `v${targetVersion}`;
      // Se a tag alvo já existe localmente, comparamos com a anterior
      if (tags[0] === currentTag && tags.length > 1) {
        range = `${tags[1]}..${tags[0]}`;
      } else if (tags[0] !== currentTag) {
        range = `${tags[0]}..HEAD`;
      }
    }

    const logOutput = execSync(`git log ${range} --no-merges --pretty=format:"%s"`, {
      cwd: projectRoot,
      encoding: 'utf8'
    }).trim();

    return logOutput.split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

/**
 * Traduz e categoriza commits semânticos para cada idioma
 */
function parseCommitsToChangelog(commits, customMessage) {
  if (customMessage) {
    return {
      en: [`- ${customMessage}`],
      pt: [`- ${customMessage}`],
      es: [`- ${customMessage}`]
    };
  }

  const enItems = [];
  const ptItems = [];
  const esItems = [];

  const seen = new Set();

  commits.forEach(msg => {
    // Ignorar commits de release automáticos ou duplicados
    if (msg.startsWith('chore(release):') || msg.startsWith('Merge ') || seen.has(msg)) {
      return;
    }
    seen.add(msg);

    // Mapeamentos inteligentes de mensagens comuns do repositório
    if (msg.includes('migrate character datasets to JSON') || msg.includes('JSON')) {
      enItems.push('⚡ Ultra-fast JSON Engine: Complete migration of character datasets to structured JSON.');
      ptItems.push('⚡ Motor JSON Ultra-Rápido: Migração completa dos conjuntos de dados de caracteres para JSON estruturado.');
      esItems.push('⚡ Motor JSON Ultra Rápido: Migración completa de los conjuntos de datos de caracteres a JSON estructurado.');
    } else if (msg.includes('i18n') || msg.includes('multilingual') || msg.includes('localized')) {
      enItems.push('🌐 Multilingual Expansion: Full localization support across English, Portuguese, and Spanish.');
      ptItems.push('🌐 Expansão Multilíngue: Suporte nativo completo a Português, Inglês e Espanhol.');
      esItems.push('🌐 Expansión Multilingüe: Soporte nativo completo para Español, Inglés y Portugués.');
    } else if (msg.includes('renderAboutView') || msg.includes('links')) {
      enItems.push('ℹ️ Enhanced About Screen: Dynamic version display, keyboard shortcuts guide, and official links.');
      ptItems.push('ℹ️ Tela Sobre Aprimorada: Exibição dinâmica de versão, guia de atalhos e links oficiais.');
      esItems.push('ℹ️ Pantalla Acerca de Mejorada: Versión dinámica, guía de atajos de teclado y enlaces oficiales.');
    } else if (msg.includes('shortcut') || msg.includes('navigation')) {
      enItems.push('⌨️ Keyboard Shortcuts: Modern shortcuts (Ctrl+K, /, Enter, C, F, Esc) for faster workflow.');
      ptItems.push('⌨️ Atalhos de Teclado: Novos atalhos rápidos (Ctrl+K, /, Enter, C, F, Esc) para navegação ágil.');
      esItems.push('⌨️ Atajos de Teclado: Nuevos atajos rápidos (Ctrl+K, /, Enter, C, F, Esc) para navegación ágil.');
    } else if (msg.includes('audit') || msg.includes('test') || msg.includes('ci:')) {
      enItems.push('🛠️ Quality & Stability: Comprehensive test suite and automatic documentation audits.');
      ptItems.push('🛠️ Qualidade e Estabilidade: Suíte de testes ampliada e auditoria contínua de documentação.');
      esItems.push('🛠️ Calidad y Estabilidad: Batería de pruebas ampliada y auditoría continua de documentación.');
    } else {
      // Fallback semântico limpo
      const cleanMsg = msg.replace(/^(feat|fix|perf|docs|refactor|ci|style)(\([^)]+\))?:\s*/i, '');
      enItems.push(`- ${cleanMsg}`);
      ptItems.push(`- ${cleanMsg}`);
      esItems.push(`- ${cleanMsg}`);
    }
  });

  // Fallback caso não haja commits mapeados
  if (enItems.length === 0) {
    enItems.push('- Performance improvements, updated store links, and refined documentation.');
    ptItems.push('- Melhorias de desempenho, links oficiais de lojas atualizados e documentação refinada.');
    esItems.push('- Mejoras de rendimiento, enlaces oficiales de tiendas actualizados y documentación refinada.');
  }

  return {
    en: Array.from(new Set(enItems)),
    pt: Array.from(new Set(ptItems)),
    es: Array.from(new Set(esItems))
  };
}

/**
 * Injeta o bloco de novidades no arquivo se a versão ainda não existir nele
 */
function injectChangelog(filePath, version, headerText, items) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // Se a versão já estiver documentada no arquivo, não duplica
  const versionHeaderRegex = new RegExp(`(✨\\s*(?:What's New in Version|Novidades da Versão|Novedades de la Versión)\\s*v${version.replace(/\./g, '\\.')}:)`, 'i');
  if (versionHeaderRegex.test(content)) {
    console.log(`  ℹ️  ${path.basename(filePath)} já contém a seção v${version}.`);
    return;
  }

  // Localizar o primeiro bloco de versão anterior
  const firstVersionMatch = content.match(/✨\s*(?:What's New in Version|Novidades da Versão|Novedades de la Versión)\s*v[\d.]+:/i);

  const newSection = `${headerText} v${version}:\n\n${items.join('\n')}\n\n`;

  let updatedContent = '';
  if (firstVersionMatch && firstVersionMatch.index !== undefined) {
    const insertIndex = firstVersionMatch.index;
    updatedContent = content.slice(0, insertIndex) + newSection + content.slice(insertIndex);
  } else {
    // Se não encontrou versões anteriores, insere após o primeiro parágrafo
    updatedContent = `${newSection}${content}`;
  }

  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`  ✔ ${path.basename(filePath)} atualizado com a seção v${version}!`);
}

/**
 * Atualiza o README.md com referências da versão
 */
function updateReadme(version) {
  if (!fs.existsSync(readmePath)) return;
  let readme = fs.readFileSync(readmePath, 'utf8');

  // Atualiza exemplos de release no README (ex: 4.3.0 -> 4.3.1 para a versão atual)
  const nextPatch = version.replace(/\.\d+$/, m => `.${Number(m.slice(1)) + 1}`);
  readme = readme.replace(/(# Faz um incremento patch automático \(ex: )[\d.]+( -> )[\d.]+(\))/g, `$1${version}$2${nextPatch}$3`);

  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log(`  ✔ README.md sincronizado para v${version}`);
}

/**
 * Função principal exportada para ser usada pelo release.js e CLI
 */
function updateDescriptions(targetVersion, customMessage = null) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = targetVersion || pkg.version;

  console.log(`\n📝 Gerando Changelog e Atualizando Descrições de Loja para v${version}...`);

  const commits = getRecentGitCommits(version);
  const changelog = parseCommitsToChangelog(commits, customMessage);

  // Injetar nos 3 arquivos
  injectChangelog(
    path.join(textsDir, 'description.md'),
    version,
    "✨ What's New in Version",
    changelog.en
  );

  injectChangelog(
    path.join(textsDir, 'description_pt_BR.md'),
    version,
    '✨ Novidades da Versão',
    changelog.pt
  );

  injectChangelog(
    path.join(textsDir, 'description_es_ES.md'),
    version,
    '✨ Novedades de la Versión',
    changelog.es
  );

  updateReadme(version);

  console.log('🎉 Descrições de loja (EN, PT-BR, ES) e README atualizados com sucesso!\n');

  return {
    version,
    notes: changelog.en.join('\n')
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let customMsg = null;
  const msgIdx = args.findIndex(a => a === '-m' || a === '--message');
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    customMsg = args[msgIdx + 1];
  }

  const targetVer = args[0] && !args[0].startsWith('-') ? args[0] : null;
  updateDescriptions(targetVer, customMsg);
}

module.exports = { updateDescriptions };
