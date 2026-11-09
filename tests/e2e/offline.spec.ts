import { test, expect } from '@playwright/test'

// Fonctionne hors ligne après une première visite terminée (precache complet).
test('contenu disponible hors ligne', async ({ page, context }) => {
  // Première visite : enregistre et active le service worker, precache les assets.
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    // Laisse Workbox terminer le precache.
    await new Promise((r) => setTimeout(r, 1500))
  })
  await page.reload({ waitUntil: 'networkidle' })

  // Coupe le réseau.
  await context.setOffline(true)

  for (const route of ['/atlas/frene', '/defis/arc-simple', '/demo']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#app')).not.toBeEmpty()
  }

  await context.setOffline(false)
})
