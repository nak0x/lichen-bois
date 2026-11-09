import { test, expect } from '@playwright/test'

// Chaque route se charge sans erreur console et une capture est prise au format iPhone 13.
const routes: { path: string; nom: string }[] = [
  { path: '/', nom: 'accueil' },
  { path: '/observer/demo-frene', nom: 'observer' },
  { path: '/identifier/demo-frene', nom: 'identifier' },
  { path: '/atlas', nom: 'atlas' },
  { path: '/atlas/frene', nom: 'atlas-frene' },
  { path: '/defis', nom: 'defis' },
  { path: '/defis/arc-simple', nom: 'defi-arc-simple' },
  { path: '/registre', nom: 'registre' },
  { path: '/carnet', nom: 'carnet' },
]

for (const r of routes) {
  test(`route ${r.path} se charge sans erreur console`, async ({ page }) => {
    const erreurs: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') erreurs.push(msg.text())
    })
    page.on('pageerror', (err) => erreurs.push(err.message))

    await page.goto(r.path, { waitUntil: 'networkidle' })
    await expect(page.locator('#app')).not.toBeEmpty()
    // Laisse les révélations (mot-symbole, GridReveal) se terminer avant la capture.
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `docs/screens/${r.nom}.png`, fullPage: true })

    expect(erreurs, `erreurs console sur ${r.path} :\n${erreurs.join('\n')}`).toEqual([])
  })
}
