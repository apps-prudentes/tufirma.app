import { test, expect } from '@playwright/test';

/**
 * E2E TEST: Flujo Completo de Firma Digital
 * Casos: SIGN-001, SIGN-003, SIGN-006, SIGN-009, CRED-002
 */

test.describe('Complete Signature Flow E2E', () => {
  let testUserId: string;

  test.beforeEach(async ({ page, context }) => {
    // Setup: Crear usuario de prueba (idealmente desde API)
    testUserId = `test-user-${Date.now()}`;

    // Ir a home
    await page.goto('/');
  });

  test('Complete flow: Sign up → Upload PDF → Create signature → Sign → Download', async ({ page }) => {
    // STEP 1: Registro (AUTH-001)
    await page.click('text=Registrarse');
    await page.fill('input[name="email"]', `${testUserId}@test.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button:has-text("Crear cuenta")');
    await page.waitForURL('/dashboard');

    // Verify: Usuario creado con 1 crédito
    const creditBadge = page.locator('text=1');
    await expect(creditBadge).toBeVisible();

    // STEP 2: Ir a /sign
    await page.click('button:has-text("Firmar un nuevo PDF")');
    await page.waitForURL('/sign');

    // STEP 3: Cargar PDF (SIGN-001)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/sample.pdf');

    // Verify: PDF se cargó y visualiza
    const pdfViewer = page.locator('canvas'); // canvas de PDF viewer
    await expect(pdfViewer).toBeVisible();

    // STEP 4: Crear firma (SIGN-003)
    const signatureCanvas = page.locator('canvas').first(); // canvas de firma

    // Dibujar firma (simular movimiento del ratón)
    const canvasBBox = await signatureCanvas.boundingBox();
    if (canvasBBox) {
      const x = canvasBBox.x + canvasBBox.width / 2;
      const y = canvasBBox.y + canvasBBox.height / 2;

      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 50, y + 20);
      await page.mouse.move(x + 100, y);
      await page.mouse.move(x + 150, y + 20);
      await page.mouse.up();
    }

    // Verify: Firma creada
    const saveButton = page.locator('button:has-text("Guardar")');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // STEP 5: Posicionar firma en PDF (SIGN-006)
    const placeSignatureBtn = page.locator('button:has-text("Colocar firma")');
    await placeSignatureBtn.click();

    // Verify: Firma aparece sobre PDF
    const signatureOverlay = page.locator('[class*="draggable"]');
    await expect(signatureOverlay).toBeVisible();

    // STEP 6: Exportar PDF (SIGN-009)
    const exportBtn = page.locator('button:has-text("Exportar PDF firmado")');

    // Verify: Botón debe estar habilitado
    await expect(exportBtn).toBeEnabled();
    await exportBtn.click();

    // Verify: Descarga se inicia
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    // STEP 7: Verificar créditos deducidos (CRED-002)
    await page.goto('/dashboard');

    // Balance debe ser 0 (1 inicial - 1 usado)
    const newCreditBadge = page.locator('text=0');
    await expect(newCreditBadge).toBeVisible();

    // Verify: Firma aparece en historial
    const recentSignatures = page.locator('text=Firmas Recientes');
    await expect(recentSignatures).toBeVisible();
  });

  test('Should block download without PDF selected', async ({ page }) => {
    await page.goto('/sign');

    // Intenta descargar sin PDF
    const exportBtn = page.locator('button:has-text("Exportar PDF firmado")');

    // Debe estar deshabilitado
    await expect(exportBtn).toBeDisabled();
  });

  test('Should show error when no signature created', async ({ page }) => {
    await page.goto('/sign');

    // Cargar PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/sample.pdf');

    // Intenta descargar sin firma
    const exportBtn = page.locator('button:has-text("Exportar PDF firmado")');
    await expect(exportBtn).toBeDisabled();
  });

  test('Should handle PDF navigation', async ({ page }) => {
    await page.goto('/sign');

    // Cargar PDF con múltiples páginas
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/multipage.pdf');

    // Navegar a página 2
    const nextPageBtn = page.locator('button:has-text("Siguiente")');
    await nextPageBtn.click();

    // Verify: Página cambió
    const pageCounter = page.locator('text=/Página 2/');
    await expect(pageCounter).toBeVisible();
  });
});
