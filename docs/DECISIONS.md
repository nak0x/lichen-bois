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

## Phase 1 — Agent B (contenu)

- **Ordre des critères** (section 7.1) respecté dans `criteres.ts` :
  `resine, masse, coupe, moelle, ecorce, rameau, ongle, couleur`.
  L'ordre de la SPEC est `resine, masse, coupe, moelle, couleur, ongle, ecorce, rameau` mais
  la phrase de départage indique `resine, masse, coupe, moelle, ecorce, rameau, ongle, couleur`.
  On suit l'ordre de la phrase de départage, cohérent avec la logique pédagogique (écorce et
  rameau visuels avant ongle plus subjectif, couleur en dernier car moins discriminant seul).

- **Type de la démo** (`demo.ts`) : `SpecimenDemo` est un sous-type léger de `Specimen`, car
  les spécimens de démo n'ont pas encore de `creeLe`, `photos`, `answers` ni `defis` initiaux —
  ces valeurs sont créées dynamiquement par le store au démarrage de la démo (section 8.9).
  Forcer `Specimen` complet ici aurait exigé des valeurs vides sans signification. `InjecteEtape`
  encode l'injection progressive : `mesures: true` signifie « injecter les mesures du spécimen
  démo » (le store les connaît), les autres clés sont les valeurs exactes à injecter.

- **Critère `ongle` du noisetier = `null`** : conforme à la SPEC (`ongle: null`). Le noisetier
  n'est pas discriminé par ce critère ; `null` signifie compatible avec toutes les options.

- **Propriétés manquantes** : aucune. Les 10 propriétés et 8 critères sont renseignés pour
  chaque essence, `null` explicite là où l'essence n'est pas discriminée par un critère.

- **`notesFiabilite` du forsythia** : champ présent dans `Essence`, renseigné tel quel depuis
  la SPEC. Pas de transformation.

- **`densite: null` du forsythia** : conforme à la SPEC (arbuste non mesuré en usage).

- **Registre** : `bois-traites` n'a pas de `essenceId` ni de `latin` car ce n'est pas une
  essence botanique. Le type `EntreeRegistre` les marque optionnels : correct.

## Phase 1 — Agent C (logique)

- **`meilleurCritereSuivant` : critère « ne différencie personne »** : la spec dit « ignorer un critère
  qui ne départage personne ». Interprétation retenue : un critère est inutile si son pire cas
  (max candidats pour une option) est ≥ nombre de candidats, ce qui signifie qu'au moins une option
  inclut tous les candidats sans rien éliminer. Un pire cas strictement inférieur au nombre de
  candidats garantit qu'au moins une option élimine au moins un candidat → critère utile.

- **Densité dans `filtrer` avec mesures** : la spec dit que si des mesures existent et que
  l'essence a une densité, on compare la densité mesurée à [min-tol ; max+tol] plutôt que la
  catégorie. Cette vérification s'applique même si aucune réponse 'masse' n'est présente dans
  `answers` : les mesures sont une source d'information indépendante des réponses textuelles.

- **`stores/demo.ts` : routeur optionnel** : le pilote accepte un objet `{ push }` minimal pour
  la navigation afin d'éviter une dépendance circulaire avec vue-router au niveau du store.
  Les vues injectent le routeur lors de l'appel.

- **Fixtures dans `src/engine/fixtures.ts`** : les données de test sont recopiées manuellement
  de la section 7 de SPEC.md et non importées de `src/data` (qui est un stub vide en phase 1).
  Après le merge de phase 1, l'agent principal peut remplacer les imports de fixtures par
  `src/data` dans `identification.spec.ts` et `defis.spec.ts`.
