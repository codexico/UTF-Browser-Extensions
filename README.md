# ⚡ Unicode & UTF-8 Character Studio (Browser Extension)

> **O repositório completo, ultra-rápido e divertido para pesquisar, inspecionar e copiar símbolos Unicode, caracteres UTF-8, Kaomojis e Emojis!**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-indigo?style=for-the-badge&logo=googlechrome)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-orange?style=for-the-badge&logo=firefox)](https://addons.mozilla.org/pt-BR/firefox/addon/unicode-utf-8-character-studio/)
[![Web Version](https://img.shields.io/badge/Web_Version-Astro-9333ea?style=for-the-badge&logo=astro)](https://codexico.com.br/unicode/)
![Since](https://img.shields.io/badge/Since-2010-amber?style=for-the-badge)
![Language](https://img.shields.io/badge/i18n-EN%20%7C%20PT--BR%20%7C%20ES-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
[![Author](https://img.shields.io/badge/Author-codexico.com.br-orange?style=for-the-badge)](https://codexico.com.br)

---

## ✨ Destaques & Funcionalidades

- 📚 **43.000+ Nomes Oficiais do Unicode Consortium**: Mapeamento preciso e atualizado para todos os símbolos, pontuações, escritas antigas, kaomojis e emojis.
- ⚡ **Motor JSON de Alta Performance**:
  - Migração de 100% dos 37 conjuntos de dados para arquivos JSON estruturados em `src/data/`.
  - Troca de categorias instantânea com carregamento nativo `JSON.parse()`, eliminando o overhead de `DOMParser`.
- 🎉 **Criada Originalmente em 2010**: Extensão com histórico de mais de 16 anos de evolução contínua!
- ⚡ **Visão `⚡ Início` Inteligente**:
  - **`⏱ Recentes`**: Histórico em tempo real dos seus últimos caracteres copiados.
  - **`🔥 45 Populares`**: Grade inicial com os caracteres e símbolos mais usados no dia a dia.
- (⁠*⁠˘⁠︶⁠˘⁠*⁠)⁠.⁠｡⁠*⁠♡ **Kaomojis & Emoticons de Texto**:
  - Mais de 184 kaomojis expressivos e 90 emoticons clássicos categorizados por sentimentos (Alegre, Triste, Amor, Raiva, etc.).
  - Pesquise facilmente por emoções ou palavras-chave em qualquer um dos 3 idiomas suportados!
- 🔍 **Busca Inteligente Bidirecional com Sinônimos (PT-BR / EN / ES)**:
  - Pesquisa por múltiplos termos independente da ordem das palavras.
  - Mapeamento inteligente de sinônimos: busque `"lupa"`, `"fogo"`, `"dinheiro"`, `"filme"`, `"cadeado"`, `"foguete"`, `"engrenagem"`, `"certo"`, `"estrela"` e encontre o caractere exato instantaneamente!
- 📌 **Suporte Nativo ao Painel Lateral (Side Panel API)**:
  - Fixe a extensão na barra lateral do Chrome e Firefox para mantê-la aberta ao lado da sua navegação sem que ela feche ao clicar fora.
- 🔍 **Inspetor de Caracteres no Rodapé**:
  - Exibe o caractere selecionado, nome oficial ou traduzido, bloco, código `U+HEX`, valor `DEC` e `Entidade HTML`.
  - **Códigos Clicáveis**: Clique sobre qualquer badge (`U+HEX`, `HEX`, `DEC`, `ENTITY`) para copiar o valor exato para a área de transferência.
- 🌍 **Internacionalização Nativa (i18n)**:
  - Detecção automática do idioma do navegador com suporte completo a **Inglês**, **Português (Brasil)** e **Espanhol**.
  - 100% dos textos da interface, categorias, emoticons, kaomojis e nomes de emojis carregados sob demanda em seu idioma nativo.
- 📊 **Contador Pessoal de Cópias**:
  - Estatística em tempo real e persistente com o total de caracteres copiados.
- 🔤 **Guia de Fontes Recomendadas**:
  - Links diretos e explicações sobre o download de fontes como *Google Noto Fonts*, *BabelStone* e *Quivira* para evitar o efeito "caixa tofu" em escritas raras (CJK, Tibetano, Rúnico, Braille, etc.).

---

## 📂 Estrutura do Projeto

```
src/
├── _locales/              # Traduções i18n sincronizadas (en, pt_BR, es)
│   ├── en/messages.json
│   ├── pt_BR/messages.json
│   └── es/messages.json
├── css/
│   └── popup.css          # Design System com suporte automático a Light/Dark Mode
├── data/                  # 37 conjuntos de dados estruturados em JSON + Emojis i18n
│   ├── emojis_pt.json     # Nomes de emojis localizados em Português
│   ├── emojis_es.json     # Nomes de emojis localizados em Espanhol
│   ├── text_emoticons.json # 90 emoticons em texto puro
│   ├── text_kaomojis.json # 184 kaomojis japoneses
│   └── ... (35 outros blocos Unicode)
├── js/
│   ├── background.js      # Service Worker (Manifest V3 Side Panel API)
│   ├── unicode-names.js   # Banco de dados com 43.085 nomes oficiais Unicode
│   ├── unicode-data.js    # Grade de populares & Dicionário bidirecional de sinônimos
│   └── popup.js           # Controller principal da UI, histórico, atalhos, busca e eventos
├── icon16.png             # Ícone 16x16
├── icon48.png             # Ícone 48x48
├── icon128-96.png         # Ícone oficial em alta resolução
├── manifest.json          # Configuração Manifest V3 para Chrome e Firefox
└── popup.html             # Interface principal da extensão
```

---

## 📦 Como Instalar no Google Chrome / Chromium (Modo Desenvolvedor)

1. Faça o clone ou download deste repositório:
   ```bash
   git clone https://github.com/codexico/UTF-Browser-Extensions.git
   ```
2. Abra o Google Chrome e navegue até `chrome://extensions`.
3. No canto superior direito, ative a chave **"Modo do desenvolvedor"** (*Developer mode*).
4. Clique no botão **"Carregar sem compactação"** (*Load unpacked*).
5. Selecione a pasta `src` localizada dentro do repositório clonado.
6. Prontinho! A extensão aparecerá no seu menu de extensões do Chrome.

---

## 🦊 Instalar no Mozilla Firefox

- 🛒 **Instalação Oficial**: [Disponível no Firefox Add-ons (AMO)](https://addons.mozilla.org/pt-BR/firefox/addon/unicode-utf-8-character-studio/)
- 🌐 **Versão Web Online**: [Acesse direto no navegador via codexico.com.br/unicode](https://codexico.com.br/unicode/)

### Como instalar temporariamente para desenvolvimento no Firefox:
1. Abra o Firefox e acesse `about:debugging#/runtime/this-firefox`.
2. Clique no botão **"Carregar extensão temporária..."** (*Load Temporary Add-on*).
3. Selecione o arquivo `src/manifest.json`.

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> ou <kbd>/</kbd> | Foca instantaneamente na barra de pesquisa |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Alternativa clássica para focar na pesquisa |
| <kbd>↓</kbd> *(na pesquisa)* | Pula o foco diretamente para o primeiro caractere da grade |
| <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> | Navegação 2D fluida por toda a grade de caracteres |
| <kbd>↑</kbd> *(no topo da grade)* | Retorna o foco para a caixa de pesquisa |
| <kbd>Enter</kbd> ou <kbd>C</kbd> | Copia o caractere selecionado para a área de transferência |
| <kbd>F</kbd> *(fora da pesquisa)* | Abre / fecha o modal com o Guia de Fontes Recomendadas |
| <kbd>Esc</kbd> | Limpa a caixa de pesquisa ou fecha o modal aberto |

---

## 🛠️ Comandos de Desenvolvimento

A suíte de testes utiliza o test runner nativo do Node.js (`node:test`), sem dependências externas pesadas:

```bash
# Executa todos os testes unitários (validação de JSONs, contagens, busca, parsers)
npm test

# Executa o linter oficial de extensões da Mozilla (compatibilidade Chrome e Firefox)
npm run lint

# Sincroniza a base de dados JSON com o blog Astro (caso aplicável)
npm run sync:astro

# Executa testes completos (incluindo Playwright caso configurado)
npm run test:all
```

---

## 🚀 Procedimento de Release

Para publicar uma nova versão completa da extensão (Testes + Lint + Bump + Build ZIP + Git Tag + Push + GitHub Release):

### ⚡ Forma Automatizada:
```bash
npm run release          # Faz um incremento patch automático (ex: 4.3.0 -> 4.3.1)
npm run release -- minor # Incremento minor (ex: 4.3.0 -> 4.4.0)
npm run release -- major # Incremento major (ex: 4.3.0 -> 5.0.0)
```

---

## 👤 Autor & Licença

Criada originalmente em **2010**, mantida e aprimorada com amor por **[codexico.com.br](https://codexico.com.br)**.
- 🦊 **Extensão Firefox**: [addons.mozilla.org](https://addons.mozilla.org/pt-BR/firefox/addon/unicode-utf-8-character-studio/)
- 🌐 **Versão Web Online**: [codexico.com.br/unicode](https://codexico.com.br/unicode/)

Distribuído sob a licença [OSL](LICENSE). Dados e nomenclaturas mantidos em conformidade com o padrão oficial do **Unicode Consortium**.
