# Décisions

Journal des décisions prises en autonomie pendant la construction (section 3 de SPEC.md :
« prends la décision la plus raisonnable, note-la ici et continue »).

## Phase 0 — Socle

- **Versions résolues par pnpm** (cutoff tardif de l'environnement) : Vue 3.5, vue-router 5,
  pinia 4, Vite 8, TypeScript 7, Vitest 5, @vitejs/plugin-vue 6. L'API publique utilisée
  (`createRouter`/`createWebHistory`, `createPinia`, `defineStore` composition) reste celle
  décrite dans SPEC.md. Personne d'autre ne touche `package.json`.
- **Références en `.png`** (et non `.jpg`) dans `docs/references/` : `ref-a-papier.png`,
  `ref-b-coordonnees.png`. Les agents visuels les lisent sous ce nom.
- **Alias `@/` → `src/`** ajouté à `tsconfig.app.json` et `vite.config.ts` / `vitest.config.ts`
  pour des imports stables entre périmètres.
- **Route `/_styleguide`** enregistrée uniquement en `import.meta.env.DEV` (section 8.10).

## Phase 1 — Agent A (design-system)

- **Helpers partagés** regroupés dans `src/components/ui/grid.ts` (type `Cell`, PRNG
  `mulberry32` déterministe, `stairMask(cols, rows, seed)`, `manhattan`, `cellKey`) et
  `src/components/ui/pixelfont.ts` (fonte pixel 3×5 maison, sans police externe). Les écrans
  importent ces utilitaires via `@/components/ui/grid` et `@/components/ui/pixelfont`.
- **`CellButton` polymorphe** : rend un `<RouterLink>` si `to`, un `<a>` si `href`, sinon un
  `<button>`. Évite aux écrans de dupliquer la logique de lien.
- **`AppShell` masque `BottomNav`** automatiquement sur les routes `/demo*` (prop `nav`
  pour forcer). Padding bas réservé (72px + safe-bottom) pour que la nav ne couvre pas le contenu.
- **`GridReveal`** : délai par palier = `min(28ms, 900ms / distanceMax)` depuis la cellule
  graine (plafond 900 ms de la section 5.6). `prefers-reduced-motion` → tout révélé d'emblée.
  Prop `play=false` + `mask` complet pour un voile figé (utilisé par `Panel locked`).
- **`ChoiceCells`** ajoute toujours l'option « Je ne sais pas » (prop `allowUnknown` pour la
  retirer) ; re-cliquer sur l'option sélectionnée la désélectionne (`modelValue` repasse à
  `undefined`), ce qui n'altère pas le filtrage côté moteur (absence = ne filtre rien).
- **`Panel locked`** floute légèrement le contenu masqué et superpose un message + un slot
  `locked-actions` ; graine du masque via prop `seed` (silhouette stable par essence).
- **Test unitaire** `grid.spec.ts` : déterminisme du PRNG et de `stairMask`, bornes des
  cellules, distance de Manhattan.
