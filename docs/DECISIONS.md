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

## Phase 2 — Intégration (agent principal)

- **Agents F, G, H interrompus par une limite de session** avant d'avoir committé leur
  dernière étape. L'agent principal a mergé les commits existants (F : 3/4, G : 3/4, H : 2/4)
  puis **récupéré le travail non committé des worktrees** (IdentifierView + EssenceCell pour F,
  RegistreView pour G, finalisation CarnetView pour H) et **terminé les écrans manquants**
  (mode démo + barre présentateur + styleguide, non commencés par H). Les messages de commit
  exacts de la section 10.4 sont conservés.
- **Barre présentateur du mode démo montée globalement** (`App.vue` → `DemoPresenterBar.vue`)
  et non dans `DemoView` : la démo navigue vers les vraies routes (`/observer/...`, `/defis/...`),
  la vue `/demo` se démonte donc aussitôt. Le store `demo` expose `actif` ; `AppShell` masque
  désormais `BottomNav` quand `demo.actif` (et plus seulement sur le chemin `/demo`). Petites
  retouches hors périmètre strict (App.vue socle, AppShell d'agent A) assumées par l'orchestrateur
  au titre de l'intégration inter-périmètres.

## Phase 3 — Vérification (agent principal)

- **Bug de persistance du carnet (P0, trouvé par l'e2e)** : `idb-keyval.set` s'appuie sur
  `structuredClone`, qui lève `DataCloneError` sur le Proxy réactif de Pinia. Toute écriture
  du carnet échouait en navigateur réel (création de spécimen, démarrage de la démo).
  Correctif dans `src/stores/carnet.ts` : on persiste une copie simple
  (`JSON.parse(JSON.stringify(...))`) — les spécimens ne contiennent que des données
  sérialisables (les photos sont des clés IndexedDB, pas des Blobs).
- **Injection démo des défis** : `DefiView` applique l'injection de l'étape démo
  (bois choisi + propriétés citées) et affiche directement le verdict / l'interception
  registre, pour que le scénario se déroule tout seul à l'écran (section 8.9).
- **Revue visuelle** : mot-symbole « LICHEN » de l'accueil ramené à `--px: var(--minor)`
  (il débordait à `--cell`, seul « LI » restait visible). États vides « Spécimen introuvable »
  passés de `--signal` à `--ink-2` : le vermillon reste réservé au registre et au destructif.

## Phase 3 — Revue indépendante (section 11)

- Revue indépendante (agent lecture seule, section 11) : **les 15 points sont conformes**.
  Aucune non-conformité fonctionnelle relevée.
- **Retour de revue appliqué** : la planche Atlas (8 colonnes + règles) débordait sur mobile
  avec le `--cell` du socle (6 colonnes). On recalcule un `--cell` local à l'Atlas pour que
  toute la planche tienne dans la largeur, et chaque `AtlasBloc` est contenu (`overflow: hidden`,
  résumé tronqué à 2 lignes) pour ne pas déborder sur ses voisins.

## Phase 3 — Relecture du français

- Relecture de toute l'interface : **conforme**. Tutoiement partout (aucun « vous/votre/vos »),
  guillemets « » dans les chaînes citées, points de suspension « … », ligatures « œ » (cœur,
  nœuds) préservées depuis SPEC.md, accents sur les capitales (« DÉDUIRE »), espaces avant
  `: ; ? !` présents. Aucune correction nécessaire : le contenu reproduit fidèlement la
  section 7 (source de vérité) et les chaînes d'interface des agents sont correctes.
- Choix : on conserve les espaces ordinaires (et non des espaces insécables) avant la
  ponctuation double, cohérent avec le texte de SPEC.md et avec les assertions e2e
  (« Proposition : Frêne commun »).

## Post-livraison — Navigation et mobile

- **Navigation par boutons** : ajout d'un en-tête `AppHeader` (boutons « ← Retour » et
  « ⌂ Accueil ») monté par `AppShell` sur toutes les vues sauf l'accueil et le mode démo,
  en plus de la `BottomNav`. Route `/identifier` (sans paramètre) ajoutée pour que le lien
  « Identifier » de la nav basse résolve ; la route avec paramètre devient `identifier-specimen`
  (les liens existants sont basés sur le chemin, donc inchangés).
- **Scroll horizontal mobile corrigé** :
  - Accueil : la coupe qui déborde est désormais dans un conteneur `overflow: hidden` et bornée
    à `min(5·cell, 86vw)` → effet « bleed » conservé, sans scroll (débordait de 68 px).
  - Registre : la planche (12 colonnes par défaut de `Plate`) débordait de 360 px sur mobile ;
    `--cell` recalculé localement (/13) pour qu'elle tienne dans la largeur.
- **Taille des titres sur mobile** : `overflow-wrap: break-word` + `hyphens` sur h1/h2/h3, et
  sous 400 px, `--fs-display`/`--fs-h1` légèrement réduits. Vérifié : 0 px de débordement
  horizontal sur les 13 routes à 390 px.

## Post-livraison — Essences d'Annecy + UX d'identification

- **+20 essences courantes autour d'Annecy** (Haute-Savoie), total 25 : chêne, hêtre, charme,
  érables sycomore/champêtre, châtaignier, merisier, noyer, tilleul, bouleau, aulne, tremble,
  saule marsault, robinier, épicéa, sapin pectiné, mélèze, sureau noir, buis, cornouiller sanguin.
  Données pédagogiques (notes 1–5 = ordres de grandeur) ; `notesFiabilite` sur les bois
  d'arbuste peu documentés. Les 5 types de coupe existants couvrent toutes les essences.
- **Critères enrichis** : +5 options d'écorce et +6 options de rameau/feuille pour garder les
  essences distinguables. Beaucoup d'essences partagent des options → l'identification propose
  souvent un GROUPE de candidats, cohérent avec « des propositions, jamais des certitudes ».
- **Registre** : robinier, buis et sureau noir marqués `registre: true` avec une entrée chacun
  (toxicité non déductible du bois).
- **Tests du moteur sur fixture canonique** : `src/engine/fixtures.ts` réduit `@/data` aux 5
  essences d'origine. La logique (section 7.7, matrice 9.2) reste vérifiée exactement malgré
  l'ajout d'essences. L'intégrité des données (`data.spec`) s'exécute, elle, sur les 25.
- **Atlas** : avec 25 essences, les blocs ne sont plus placés à leur coordonnée exacte (trop
  dense, chevauchements) : grille responsive qui s'écoule, chaque bloc gardant sa coordonnée en
  étiquette. Défilement vertical accepté sur cet écran de savoir.
- **Identification — moins de défilement vertical** (demande utilisateur) :
  - la bande des essences candidates défile **horizontalement** (conteneur borné à la colonne,
    `overflow-x: auto`), candidates d'abord (registre en tête) puis exclues ;
  - la liste des 8 critères est **repliée par défaut** (ligne = nom + valeur, dépliable pour
    modifier). La page d'identification passe de ~6000 px à ~1600 px de haut sur mobile.
