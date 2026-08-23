const { test, expect } = require('@playwright/test');

test.describe('Unicode Studio Extension Playwright E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Carrega a página popup da extensão via servidor web HTTP local
    await page.goto('/popup.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Deve inicializar o Popup com título oficial e 45 caracteres populares na aba Início', async ({ page }) => {
    // Valida o título do aplicativo da tag <title>
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Unicode & UTF-8 Characters');

    // Valida a presença da seção de mais populares com exatamente 45 cards na grade inicial
    const popularCards = page.locator('#glyphGrid .glyph-card');
    await expect(popularCards).toHaveCount(45);
  });

  test('Deve navegar para a aba Kaomoji e renderizar expressões completas sem fatiamento', async ({ page }) => {
    // Clica no botão da pílula da categoria Kaomoji
    const kaomojiTab = page.locator('.nav-pill[data-category="kaomoji"]');
    await kaomojiTab.click();

    // Valida se a classe .kaomoji-grid foi aplicada ao container
    const grid = page.locator('#glyphGrid');
    await expect(grid).toHaveClass(/kaomoji-grid/);

    // Seleciona todos os cards de Kaomoji renderizados na grade
    const kaomojiCards = page.locator('#glyphGrid .glyph-card');
    await expect(kaomojiCards.first()).toBeVisible();

    const firstKaomojiText = await kaomojiCards.first().locator('.glyph-symbol').textContent();
    expect(firstKaomojiText).toContain('^');
    expect(firstKaomojiText.length).toBeGreaterThan(1);

    // Clica no primeiro Kaomoji e verifica se o Inspetor atualiza
    await kaomojiCards.first().click();

    const inspectGlyphText = await page.locator('#inspectGlyph').textContent();
    expect(inspectGlyphText).toBe(firstKaomojiText);
  });

  test('Deve filtrar caracteres em tempo real ao pesquisar por nome ("mesa") e código Hex ("2605")', async ({ page }) => {
    const searchInput = page.locator('#searchInput');

    // Pesquisa por "mesa" (Virando Mesa / Table Flip / Raiva)
    await searchInput.fill('mesa');
    await page.waitForTimeout(150);

    const mesaResult = page.locator('#glyphGrid .glyph-card').first();
    await expect(mesaResult).toBeVisible();
    const mesaSymbol = await mesaResult.locator('.glyph-symbol').textContent();
    expect(mesaSymbol.length).toBeGreaterThan(2);

    // Limpa a busca e pesquisa por Hex "2605" (Estrela ★)
    await searchInput.fill('2605');
    await page.waitForTimeout(150);

    const starResult = page.locator('#glyphGrid .glyph-card').first();
    await expect(starResult).toBeVisible();
    const starSymbol = await starResult.locator('.glyph-symbol').textContent();
    expect(starSymbol).toBe('★');
  });

  test('Deve alternar o estado do inspetor para Modo Kaomoji ao clicar em uma expressão', async ({ page }) => {
    // Navega para a categoria Kaomoji
    await page.locator('.nav-pill[data-category="kaomoji"]').click();
    await page.waitForTimeout(150);

    // Seleciona o segundo card de Kaomoji pós-carregamento
    const card = page.locator('#glyphGrid .glyph-card').nth(1);
    await expect(card).toBeVisible();
    const kaomojiSymbol = await card.locator('.glyph-symbol').textContent();
    await card.click();

    // Assegura que a pré-visualização do inspetor possui a classe .is-kaomoji-inspect
    const inspectPreview = page.locator('#inspectGlyph');
    await expect(inspectPreview).toHaveClass(/is-kaomoji-inspect/);

    // Valida que o rótulo do subgrupo indica Kaomoji
    const subgroupText = await page.locator('#inspectSubgroup').textContent();
    expect(subgroupText).toContain('Kaomoji');

    // Valida a exibição do Kaomoji no inspetor
    const inspectKaomojiDisplay = await page.locator('#inspectKaomojiDisplay').textContent();
    expect(inspectKaomojiDisplay).toBe(kaomojiSymbol);
  });

});
