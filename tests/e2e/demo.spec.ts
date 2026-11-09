import { test, expect } from '@playwright/test'

// Parcours des 13 étapes du mode démo (section 8.9) et vérification des textes clés.
test('le mode démo enchaîne les 13 étapes avec l\'état injecté', async ({ page }) => {
  await page.goto('/demo', { waitUntil: 'networkidle' })

  // La barre présentateur apparaît : 1 / 13.
  const compteur = page.locator('.demo-presenter__compteur')
  await expect(compteur).toContainText('1 / 13')

  const avancer = async (n: number) => {
    for (let i = 0; i < n; i++) {
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(150)
    }
  }

  // Étape 6 (index 5) : moelle fine → proposition frêne.
  await avancer(5)
  await expect(compteur).toContainText('6 / 13')
  await expect(page.getByText('Proposition : Frêne commun')).toBeVisible()

  // Étape 8 (index 7) : défi manche de hache avec le frêne → le choix tient.
  await avancer(2)
  await expect(compteur).toContainText('8 / 13')
  await expect(page.getByText('Ton choix tient', { exact: false })).toBeVisible()

  // Étape 12 (index 11) : arc avec l'if → interception du registre.
  await avancer(4)
  await expect(compteur).toContainText('12 / 13')
  await expect(page.locator('.defi__interception')).toBeVisible()
  await expect(page.getByText('Ce qui ne se déduit pas')).toBeVisible()

  // Étape 13 (index 12) : clôture, phrase de principe.
  await avancer(1)
  await expect(compteur).toContainText('13 / 13')
  await expect(page.locator('.accueil__principe-seul')).toContainText('Ce qui se rattrape se déduit')
})
