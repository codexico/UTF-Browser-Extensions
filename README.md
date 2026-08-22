# ⚡ Unicode & UTF-8 Character Studio (Chrome Extension)

> **O repositório completo, ultra-rápido e divertido para pesquisar, inspecionar e copiar símbolos Unicode, caracteres UTF-8 e Emojis!**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-indigo?style=for-the-badge&logo=googlechrome)
![Since](https://img.shields.io/badge/Since-2010-amber?style=for-the-badge)
![Language](https://img.shields.io/badge/i18n-EN%20%7C%20PT--BR%20%7C%20ES-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Author](https://img.shields.io/badge/Author-codexico.com.br-orange?style=for-the-badge)

---

## ✨ Destaques & Funcionalidades

- 📚 **43.000+ Nomes Oficiais do Unicode Consortium**: Mapeamento preciso e atualizado para todos os símbolos, pontuações, escritas antigas e emojis.
- 🎉 **Criada Originalmente em 2010**: Extensão com histórico de mais de 16 anos de evolução contínua!
- ⚡ **Visão `⚡ Início` Inteligente**:
  - **`⏱ Recentes`**: Histórico em tempo real dos seus últimos caracteres copiados.
  - **`🔥 45 Populares`**: Grade inicial com 5 linhas completas contendo os caracteres mais usados no dia a dia.
- 🔍 **Busca Fuzzy Bidirecional com Sinônimos (PT-BR / EN)**:
  - Pesquisa por múltiplos termos independente da ordem das palavras.
  - Mapeamento inteligente de sinônimos: busque `"lupa"`, `"fogo"`, `"dinheiro"`, `"filme"`, `"cadeado"`, `"foguete"`, `"engrenagem"`, `"certo"`, `"estrela"` e encontre o caractere exato instantaneamente!
- 📌 **Suporte Nativo ao Painel Lateral (Side Panel API)**:
  - Fixe a extensão na barra lateral do Chrome para mantê-la aberta ao lado da sua navegação sem que ela feche ao clicar fora.
- 🔍 **Inspetor de Caracteres no Rodapé**:
  - Exibe o caractere selecionado, nome oficial, bloco, código `U+HEX`, valor `DEC` e `Entidade HTML`.
  - **Códigos Clicáveis**: Clique sobre qualquer badge (`U+HEX`, `HEX`, `DEC`, `ENTITY`) para copiar o valor exato para a área de transferência.
- 🌍 **Internacionalização Nativa (i18n)**:
  - Detecção automática do idioma do navegador com suporte nativo a **Português**, **Inglês** e **Espanhol**.
- 📊 **Contador Pessoal de Cópias**:
  - Estatística em tempo real e persistente com o total de caracteres copiados.
- 🔤 **Guia de Fontes Recomendadas**:
  - Links diretos e explicações sobre o download de fontes como *Google Noto Fonts*, *BabelStone* e *Quivira* para evitar o efeito "caixa tofu" em escritas raras (CJK, Tibetano, Rúnico, Braille, etc.).

---

## 📂 Estrutura do Projeto

```
Chrome/
├── _locales/              # Arquivos de tradução i18n (en, pt_BR, es)
│   ├── en/messages.json
│   ├── pt_BR/messages.json
│   └── es/messages.json
├── css/
│   └── popup.css          # Design System com suporte automático a Light/Dark Mode
├── html/
│   └── groups/            # 38 conjuntos de dados oficiais do Unicode Consortium
├── js/
│   ├── background.js      # Service Worker (Manifest V3 Side Panel API)
│   ├── unicode-names.js   # Banco de dados com 43.085 nomes oficiais Unicode
│   ├── unicode-data.js    # Grade de populares & Dicionário bidirecional de sinônimos
│   └── popup.js           # Controller principal da UI, histórico, busca e eventos
├── icon128-96.png         # Ícone oficial da extensão
├── manifest.json          # Configuração Manifest V3 do Chrome
└── popup.html             # Interface principal da extensão
```

---

## 📦 Como Instalar no Google Chrome (Modo Desenvolvedor)

1. Faça o clone ou download deste repositório:
   ```bash
   git clone https://github.com/codexico/UTF-Browser-Extensions.git
   ```
2. Abra o Google Chrome e navegue até `chrome://extensions`.
3. No canto superior direito, ative a chave **"Modo do desenvolvedor"** (*Developer mode*).
4. Clique no botão **"Carregar sem compactação"** (*Load unpacked*).
5. Selecione a pasta `Chrome` localizada dentro do repositório clonado.
6. Prontinho! A extensão aparecerá no seu menu de extensões do Chrome.

---

## ⌨️ Atalhos de Teclado Úteis

- `Ctrl + F` ou `Cmd + F` ➔ Foca automaticamente na caixa de pesquisa.
- `Seta para Baixo` (na busca) ➔ Salta o foco diretamente para o primeiro caractere da grade.
- `Setas (Cima / Baixo / Esquerda / Direita)` ➔ Navegação 2D fluida por toda a grade de caracteres.
- `Seta para Cima` (no topo da grade) ➔ Retorna o foco para a caixa de pesquisa.
- `Esc` ➔ Limpa a busca ou fecha a janela de fontes.

---

## 👤 Autor & Licença

Criada originalmente em **2010**, mantida e aprimorada com amor por **[codexico.com.br](https://codexico.com.br)**.

Distribuído sob a licença [MIT](LICENSE). Dados e nomenclaturas mantidos em conformidade com o padrão oficial do **Unicode Consortium**.
