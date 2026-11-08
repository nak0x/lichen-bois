# LICHEN · Module BOIS — Spécification et workflow Claude Code

> **Claude Code** : ce fichier est ton unique prompt. Lis-le **en entier** avant toute action, puis exécute le workflow de la **section 10** jusqu'au bout. Les sections 5 à 9 sont la source de vérité. Ne t'arrête pour poser une question qu'en cas de blocage réel ; sinon, prends la décision la plus raisonnable, note-la dans `docs/DECISIONS.md` et continue.

---

## 0. Lancement (pour l'humain, avant Claude Code)

```bash
mkdir lichen-bois && cd lichen-bois
git init -b main
mkdir -p .claude docs/references
printf '{\n  "worktree": { "baseRef": "head" }\n}\n' > .claude/settings.json
# 1. Copier ce fichier à la racine : ./SPEC.md
# 2. Déposer les deux images de référence :
#      docs/references/ref-a-papier.jpg       (papier millimétré beige, rocher moussu détouré, titre vertical)
#      docs/references/ref-b-coordonnees.jpg  (grille blanche à coordonnées 1–12 / A–Q, forêt révélée en escalier)
corepack enable pnpm
git add -A && git commit -m "chore: spec et références visuelles"
claude --permission-mode auto "Lis SPEC.md en entier et exécute le workflow de la section 10 jusqu'au bout."
```

`worktree.baseRef: "head"` est indispensable : sans lui, les worktrees des sous-agents partent de la branche par défaut du remote et ne verraient pas les commits locaux du socle ni les merges de phase.

---

## 1. Intention

**Lichen** est un dispositif d'apprentissage pour des jeunes curieux (collège → jeune adulte), déjà à l'aise en forêt et maîtrisant les outils de base (couteau, hache, scie, corde, limes, gouges). Il ne donne pas de recettes : le jeune **déduit** ses techniques à partir de la compréhension des propriétés de ce qui l'entoure.

Le **module Bois** est la première brique : **identifier un bois et comprendre ses propriétés**, pour en déduire ses usages.

Chaîne pédagogique, qui structure toute l'app : **Observer → Identifier → Comprendre → Déduire**.

Garde-fou, visible dans l'interface : **« Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s'apprend. »** Ce qui ne se déduit pas (toxicité, bois traités) est **transmis directement**, dans un registre visuellement distinct.

Contexte d'usage : **en amont ou en aval d'une sortie, et pendant les temps de bricolage à la maison**. Jamais en forêt. L'outil prépare et prolonge l'expérience directe, il ne la remplace pas.

Contexte de démonstration : présentation devant un jury avec de vrais morceaux de bois (un tronc de frêne de 24 cm de diamètre, du pin, du forsythia). L'app est utilisée en direct pendant que les tests sont faits sur les vrais bois.

Le code doit rester piloté par les données : d'autres modules Lichen (plantes, orientation…) pourront réutiliser le même socle plus tard.

---

## 2. Contraintes non négociables

1. **100 % statique, aucune API, aucun appel réseau à l'exécution** : pas de CDN, polices auto-hébergées, pas d'analytics, pas de télémétrie.
2. **Fonctionne hors ligne** dès la première visite terminée (precache complet de tous les assets).
3. **Installable sur iPhone** (Safari → Partager → « Sur l'écran d'accueil »), plein écran `standalone`, safe areas respectées.
4. **Déployable sur Coolify** via un `Dockerfile` (build Node → nginx).
5. **Aucune reconnaissance d'image, aucune IA** : c'est le jeune qui observe.
6. **L'app ne donne jamais la réponse avant que le jeune ait raisonné** : les usages traditionnels sont révélés *après* un défi ; les candidats d'identification sont des « propositions », jamais des certitudes.
7. **Interface en français**, tutoiement, phrases courtes.
8. **Le parcours de démo complet fonctionne sans aucune photo** : les visuels principaux sont des illustrations SVG procédurales. Les photos réelles s'ajoutent ensuite sans changer le code.
9. **Ne reproduire aucun texte, nom, logo ou image des références visuelles** : on en reprend uniquement le langage graphique.

---

## 3. Priorités

- **P0 (indispensable demain)** : parcours démo complet (section 8.9), Observer / Identifier / Fiche / Défis / Registre, design system fidèle aux références, PWA hors ligne installable, Dockerfile Coolify.
- **P1** : Carnet complet (photos via caméra, export/import JSON), suggestion du « meilleur test suivant », page styleguide, tests e2e.
- **P2 (seulement s'il reste du temps)** : simulation 2D de flexion, écrans de démarrage iOS (`apple-touch-startup-image`).

Chaque agent implémente d'abord le P0 de son périmètre, commit, puis le P1.

---

## 4. Stack et architecture

- **Vue 3 + Vite + TypeScript strict**, `vue-router` 4 (history), **Pinia**, **idb-keyval** (IndexedDB), **vite-plugin-pwa** (Workbox `generateSW`), **@vite-pwa/assets-generator**, **@fontsource**, **Vitest** + `@vue/test-utils` + `jsdom`, **Playwright** (chromium), **sharp** (script d'images). Gestionnaire : **pnpm**.
- Pas de bibliothèque UI : CSS maison sur tokens.
- Pas de Nuxt : aucun besoin de serveur ni de SSR ; Vite + vite-plugin-pwa produit un bundle statique plus simple à rendre 100 % hors ligne.

### Dépendances (installées toutes en phase 0, personne d'autre ne touche `package.json`)

```
dependencies: vue vue-router pinia idb-keyval @fontsource/inter-tight @fontsource/jetbrains-mono @fontsource/major-mono-display
devDependencies: vite @vitejs/plugin-vue typescript vue-tsc vite-plugin-pwa workbox-window @vite-pwa/assets-generator vitest @vue/test-utils jsdom @playwright/test sharp @types/node
```

### Scripts `package.json`

```json
{
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview --host --port 4173",
  "typecheck": "vue-tsc -b",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "generate-pwa-assets": "pwa-assets-generator",
  "images": "node scripts/process-images.mjs"
}
```

### Arborescence et propriété des fichiers

```
SPEC.md                      (lecture seule)
docs/references/             (lecture seule)
docs/DECISIONS.md            phase 0, puis append par tous
docs/screens/                phase 3 (captures)
.claude/settings.json        (lecture seule)
index.html                   phase 0 → agent D (balises head)
vite.config.ts               phase 0 → agent D
vitest.config.ts             phase 0
playwright.config.ts         phase 0 → phase 3
tsconfig*.json               phase 0
package.json, pnpm-lock.yaml phase 0 UNIQUEMENT
Dockerfile, nginx.conf, .dockerignore, pwa-assets.config.ts, README.md   agent D
public/                      agent D
scripts/                     agent D
assets-src/                  (photos brutes de l'humain, facultatif)
src/main.ts, src/App.vue     phase 0
src/router/index.ts          phase 0 (toutes les routes, vues en lazy import)
src/types/content.ts         phase 0 (recopie exacte de la section 6)
src/styles/tokens.css        phase 0 (recopie exacte de la section 5.3)
src/styles/fonts.css, base.css                agent A
src/components/ui/**                          agent A (dont AppShell, BottomNav)
src/components/illustrations/**               agent E
src/data/**                                   agent B
src/engine/**, src/stores/**                  agent C
src/views/Accueil*, Observer*, Identifier*  + src/components/screens/{observer,identifier}/**   agent F
src/views/Atlas*, Essence*, Defis*, Defi*, Registre*  + src/components/screens/{atlas,defis,registre}/**   agent G
src/views/Carnet*, Specimen*, Demo*, Styleguide*  + src/components/screens/{carnet,demo}/**   agent H
tests/e2e/**                                  phase 3
```

Un agent ne modifie **jamais** un fichier hors de son périmètre. S'il a besoin d'un changement ailleurs, il le décrit dans son rapport final ; l'agent principal l'applique au merge.

---

## 5. Direction visuelle

### 5.1 Lecture des références (ouvre les deux images avec Read avant de coder quoi que ce soit de visuel)

**Réf. A — papier millimétré chaud**
- Fond beige rosé uni, comme un papier.
- Grille fine taupe très légère ; une ligne plus marquée toutes les 4 cellules.
- Petites croix « + » brun foncé posées sur certaines intersections majeures, en grappe régulière (3 × 3), pas partout.
- Photo **détourée** (silhouette irrégulière, sans cadre) qui déborde du bord de page et chevauche la grille.
- Titre en **capitales géométriques expérimentales**, écrit **verticalement** dans la marge droite, avec un sous-titre vertical fin.
- Texte courant en **monospace léger**, très espacé, posé directement sur l'image.

**Réf. B — grille à coordonnées**
- Fond blanc, grille gris clair de 12 colonnes, **coordonnées** dans les marges : chiffres 1–12 en haut et en bas, lettres A–Q à gauche et à droite.
- **Grand titre grotesque gras**, serré, en capitales, interligne très court.
- Photo révélée par un **masque en escalier aligné sur les cellules** de la grille : les bords de l'image suivent les cases, comme des pixels géants.
- Petit logotype en **police pixel**.
- Informations en grotesque régulier, alignées sur les colonnes.

### 5.2 Synthèse pour Lichen

- **Deux surfaces** :
  - le **papier** (réf. A), fond beige millimétré, pour les écrans d'action : Accueil, Observer, Identifier, Carnet ;
  - la **planche** (réf. B), panneau blanc à coordonnées, pour les écrans de savoir : Atlas, Fiche essence, Défis, Registre.
- **Tout s'aligne sur la grille.** Les tuiles, les images et les blocs de texte occupent un nombre entier de cellules.
- **Coordonnées comme système de repérage** : chaque essence a une coordonnée sur la planche Atlas (ex. `B2`), chaque tuile affiche la sienne en petit, en haut à gauche.
- **Aplat, imprimé** : pas d'ombres, pas de coins arrondis, pas de dégradés. Filets de 1 px.
- **Révélation en escalier** : les illustrations et photos apparaissent cellule par cellule (réf. B) et peuvent déborder du cadre (réf. A).
- **Mot-symbole « LICHEN » en pixels**, dessiné avec des rectangles SVG sur la grille fine (pas de police pixel externe).
- **Titres verticaux** dans la marge droite (réf. A) : nom de l'écran ou de l'essence.
- **Couleurs** : encre quasi noire ; vert de mousse pour « observé / validé / sélectionné » ; **vermillon réservé exclusivement** au registre « ce qui ne se déduit pas » et aux actions destructrices.

### 5.3 Tokens (`src/styles/tokens.css`, à recopier tel quel)

```css
:root {
  color-scheme: light;

  /* Couleurs */
  --paper: #EBE5DF;
  --paper-raised: #F4F0EB;
  --plate: #FFFFFF;
  --ink: #1B1A17;
  --ink-2: #5E554D;
  --ink-3: #8C8178;
  --grid-minor: #D8CEC5;
  --grid-major: #A9978A;
  --plate-grid: #DCDCD8;
  --cross: #4E4037;
  --moss: #8A9A3B;
  --moss-soft: #DCE2BE;
  --moss-ink: #3E4A1E;
  --signal: #C0432A;
  --signal-soft: #F3D9D2;

  /* Grille */
  --cols: 6;
  --margin: 20px;
  --cell: calc((100vw - 2 * var(--margin)) / var(--cols));
  --minor: calc(var(--cell) / 4);
  --line: 1px;

  /* Typographie */
  --font-display: 'Inter Tight', system-ui, sans-serif;
  --font-body: 'JetBrains Mono', ui-monospace, monospace;
  --font-vertical: 'Major Mono Display', 'JetBrains Mono', monospace;
  --fs-display: clamp(44px, 13vw, 104px);
  --fs-h1: clamp(32px, 9vw, 56px);
  --fs-h2: 22px;
  --fs-body: 15px;
  --fs-input: 16px;
  --fs-label: 11px;
  --fs-vertical: clamp(28px, 8vw, 44px);

  /* Mouvement */
  --t-fast: 120ms;
  --t-cell: 28ms;

  /* Safe areas iOS */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}

@media (min-width: 900px) {
  :root {
    --cols: 12;
    --margin: 32px;
    --cell: calc((min(100vw, 1280px) - 2 * var(--margin)) / var(--cols));
  }
}
```

### 5.4 Typographie

| Usage | Police | Graisse | Détails |
|---|---|---|---|
| Titres d'écran, noms d'essence | Inter Tight | 800 | capitales, `letter-spacing: -0.03em`, `line-height: 0.92` |
| Sous-titres, tuiles | Inter Tight | 700 | capitales, `-0.01em` |
| Coordonnées, étiquettes | Inter Tight | 500 | capitales, `--fs-label`, `letter-spacing: 0.08em` |
| Texte courant | JetBrains Mono | 300 | `letter-spacing: 0.03em`, `line-height: 1.55` |
| Titres verticaux | Major Mono Display | 400 | `writing-mode: vertical-rl`, `letter-spacing: 0.2em` |

Imports dans `fonts.css` : `@fontsource/inter-tight/{500,700,800}.css`, `@fontsource/jetbrains-mono/{300,400}.css`, `@fontsource/major-mono-display/400.css`. Les champs de saisie sont à **16 px minimum** (sinon iOS zoome au focus).

### 5.5 Composants du design system (agent A, `src/components/ui/`)

| Composant | Rôle | Détails |
|---|---|---|
| `GridPaper` | fond papier (réf. A) | `background-image` en `linear-gradient` : lignes mineures tous les `--minor`, majeures tous les `--cell`. Le fond défile avec le contenu. |
| `Crosshairs` | croix « + » | SVG 12 px, trait 1,5 px `--cross`, posées sur des intersections majeures données en props (`cells: [col,row][]`). |
| `Plate` | planche (réf. B) | fond `--plate`, grille `--plate-grid`, règles de coordonnées en haut et à gauche (et en bas/à droite si `rulers="all"`). Prop `tone: 'default' | 'signal'` : en `signal`, règles et filets en vermillon. |
| `Rulers` | règles de coordonnées | chiffres 1…`--cols` et lettres A… alignés sur les lignes majeures, en `--fs-label`. |
| `VerticalLabel` | titre vertical | marge droite, Major Mono Display, + sous-titre vertical fin en mono. |
| `PixelWordmark` | « LICHEN » | lettres de 3 × 5 pixels dessinées en `<rect>` sur la grille mineure ; prop `reveal` pour l'apparition pixel par pixel. |
| `GridReveal` | révélation en escalier | enveloppe un contenu ; superpose des cellules couleur fond (avec les mêmes lignes de grille que le fond) qui disparaissent une à une, en ordre de distance à une cellule « graine », avec un délai `--t-cell`. Prop `mask` : liste de cellules qui restent couvertes à la fin, pour une silhouette en escalier définitive. Générateur `stairMask(cols, rows, seed)` déterministe (PRNG à graine) pour obtenir des bords en escalier stables par essence. `prefers-reduced-motion` : tout est révélé instantanément. |
| `Cutout` | photo détourée | affiche une image à fond transparent qui peut déborder du conteneur (`overflow: visible`, décalage en props) ; si l'image manque, affiche le slot de repli (illustration SVG). |
| `CellButton` | tuile de navigation ou d'action | occupe N × M cellules, filet encre 1 px, coordonnée en haut à gauche, titre Inter Tight, sous-titre mono. États : actif (fond `--moss`, texte `--moss-ink`), pressé (inversé encre/papier), désactivé (`--ink-3`). Cible tactile ≥ 44 px. |
| `ChoiceCells` | choix d'une option | options en tuiles larges, une seule sélectionnée, option « Je ne sais pas » toujours présente. |
| `PropertyScale` | note 1–5 | 5 carrés alignés sur la grille mineure, remplis en encre selon la note ; bouton « ? » qui déplie l'explication. |
| `Panel` | encadré | variantes `default` (filet encre), `safety` (fond encre, texte papier, titre « SÉCURITÉ »), `signal` (fond `--signal-soft`, filet et titre `--signal`), `locked` (contenu masqué par `GridReveal` figé + message). |
| `Chip` | étiquette sélectionnable | rectangle filet 1 px, capitales `--fs-label`. |
| `AppShell` | gabarit | marges, safe areas, `VerticalLabel` facultatif, slot principal, `BottomNav`. Hauteur `100dvh`. |
| `BottomNav` | navigation | 5 cellules : `A Observer`, `B Identifier`, `C Atlas`, `D Défis`, `E Carnet`. Fixe en bas, `padding-bottom: var(--safe-bottom)`. Masquée en mode démo plein écran. |

Règles globales (`base.css`) : `body { background: var(--paper); color: var(--ink); font: 300 var(--fs-body)/1.55 var(--font-body); }`, `overscroll-behavior: none`, `-webkit-tap-highlight-color: transparent`, focus visible = filet `--moss-ink` 2 px, aucune `border-radius`, aucune `box-shadow`.

### 5.6 Mouvement

- Transitions de page : fondu 120 ms + révélation `GridReveal` des visuels.
- Révélation cellule par cellule ≈ 28 ms par cellule, plafonnée à 900 ms au total.
- Sélections : bascule instantanée, sans rebond.
- `prefers-reduced-motion: reduce` : aucune animation.

---

## 6. Modèle de données (`src/types/content.ts`, à recopier tel quel)

```ts
export type EssenceId = 'frene' | 'pin-sylvestre' | 'noisetier' | 'forsythia' | 'if'
export type CritereId = 'resine' | 'masse' | 'coupe' | 'moelle' | 'couleur' | 'ongle' | 'ecorce' | 'rameau'
export type ProprieteId =
  | 'tenacite' | 'elasticite' | 'durete' | 'fendabilite' | 'allumage'
  | 'chauffage' | 'durabilite' | 'travail' | 'rectitude' | 'creux'
export type TestId = 'soupeser' | 'odeur' | 'coupe' | 'ongle' | 'ecorce-rameau' | 'flexion' | 'fendage' | 'allumage'
export type CoupeType = 'zone-poreuse' | 'resineux-canaux' | 'pores-diffus' | 'moelle-cloisonnee' | 'resineux-sans-canaux'
export type Note = 1 | 2 | 3 | 4 | 5

export interface Option { id: string; label: string; aide?: string }

export interface Critere {
  id: CritereId
  question: string
  options: Option[]
  pourquoi: string
  testId: TestId
  note?: string
}

export interface Test {
  id: TestId
  titre: string
  type: 'critere' | 'propriete' | 'mesure'
  materiel: string[]
  geste: string[]
  observer: string
  pourquoi: string
  securite?: string
  alimenteCriteres?: CritereId[]
  alimenteProprietes?: ProprieteId[]
  options?: Option[]            // résultats possibles d'un test de propriété
}

export interface Propriete { id: ProprieteId; label: string; question: string; explication: string }

export interface Essence {
  id: EssenceId
  nom: string
  latin: string
  famille: string
  coordonnee: string            // position sur la planche Atlas, ex. 'B2'
  registre: boolean             // true = apparaît aussi dans le registre « ne se déduit pas »
  resume: string
  pourquoi: string              // relie la structure du bois à ses propriétés
  criteres: Record<CritereId, string[] | null>   // options compatibles ; null = critère non discriminant pour cette essence
  densite: { min: number; max: number } | null   // bois sec, ordre de grandeur
  proprietes: Record<ProprieteId, Note>
  coupe: CoupeType
  usages: string[]              // révélés après un défi
  recolte: string
  anecdote?: string
  notesFiabilite?: string
  photos?: { piece?: string; coupe?: string; ecorce?: string }
}

export interface Exigence { propriete: ProprieteId; min: Note; poids: 1 | 2 | 3; enClair: string }

export interface Defi {
  id: string
  titre: string
  besoin: string
  exigences: Exigence[]
  attendus: EssenceId[]
  revelation: string
  securite?: string
}

export interface EntreeRegistre {
  id: string
  titre: string
  latin?: string
  essenceId?: EssenceId
  pourquoiIndeductible: string
  ceQuIlFautSavoir: string[]
  gestes: string[]
}

export type Answers = Partial<Record<CritereId, string>>

export interface Mesures { longueur: number; largeur: number; epaisseur: number; masse: number } // cm, cm, cm, g

export type VerdictGlobal = 'tient' | 'tient-en-partie' | 'ne-tient-pas'

export interface LigneVerdict { propriete: ProprieteId; requis: Note; valeur: Note; statut: 'ok' | 'limite' | 'insuffisant'; poids: 1 | 2 | 3 }

export interface Verdict {
  interception: boolean          // essence du registre : on affiche d'abord le registre
  lignes: LigneVerdict[]
  global: VerdictGlobal
  citesPertinents: ProprieteId[]
  citesHorsSujet: ProprieteId[]
  oublies: ProprieteId[]
}

export interface DefiRealise { defiId: string; essenceId: EssenceId; cites: ProprieteId[]; raison?: string; verdict: VerdictGlobal; date: string }

export interface Specimen {
  id: string
  nom: string
  creeLe: string
  photos: string[]               // clés IndexedDB des Blobs
  answers: Answers
  mesures?: Mesures
  resultatsTests: Partial<Record<TestId, string>>
  identification?: EssenceId
  defis: DefiRealise[]
  notes: string
}
```

---

## 7. Contenu (source de vérité)

**Agent B : convertis ce contenu en TypeScript typé, sans le réécrire ni l'enrichir.** Si une donnée manque pour satisfaire un type, mets la valeur la plus prudente et signale-le dans `docs/DECISIONS.md`. Fichiers : `criteres.ts`, `tests.ts`, `proprietes.ts`, `essences.ts`, `defis.ts`, `registre.ts`, `demo.ts`, `index.ts`.

### 7.1 Critères d'identification

```yaml
- id: resine
  testId: odeur
  question: "Sur une surface fraîchement coupée : y a-t-il de la résine ?"
  options:
    - { id: oui, label: "Oui : odeur de résine, parfois collant" }
    - { id: non, label: "Non : pas d'odeur de résine" }
  pourquoi: "Seuls certains conifères fabriquent de la résine, dans des canaux qui parcourent le bois. Une odeur de résine écarte d'un coup tous les feuillus."

- id: masse
  testId: soupeser
  question: "Soupesé ou mesuré, ce bois sec est…"
  options:
    - { id: leger, label: "Léger", aide: "densité inférieure à 0,55" }
    - { id: moyen, label: "Moyen", aide: "densité de 0,55 à 0,65" }
    - { id: lourd, label: "Lourd", aide: "densité supérieure à 0,65" }
  pourquoi: "La densité dit combien de matière remplit le bois. Elle annonce sa dureté, sa résistance et la chaleur qu'il donnera au feu."
  note: "Valable sur bois sec. Un bois fraîchement coupé est bien plus lourd à cause de l'eau qu'il contient."

- id: coupe
  testId: coupe
  question: "À la loupe, sur le bout du bois :"
  options:
    - { id: pores-zone, label: "Un anneau de gros pores au début de chaque cerne" }
    - { id: pores-diffus, label: "Des pores fins, répartis partout, à peine visibles" }
    - { id: sans-pores, label: "Aucun pore : des bandes claires et foncées bien nettes" }
  pourquoi: "Les pores sont les vaisseaux qui conduisent la sève chez les feuillus. Leur disposition est une signature de l'essence et explique une part de son comportement. Les conifères n'ont pas de vaisseaux : leur bois est fait de cellules fines et allongées."

- id: moelle
  testId: coupe
  question: "Au centre exact d'une tige ou d'une branche coupée :"
  options:
    - { id: fine, label: "Un point fin et plein" }
    - { id: large-creuse, label: "Un large cœur tendre, creux ou divisé en petites cloisons" }
  pourquoi: "La moelle est le tissu central de la jeune tige. Chez la plupart des arbres elle reste minuscule ; chez certains arbustes elle est large, creuse ou cloisonnée, et la tige devient facile à évider."

- id: couleur
  testId: coupe
  question: "Sur une coupe fraîche, le centre du bois est…"
  options:
    - { id: clair, label: "De la même teinte claire que le reste" }
    - { id: coeur-colore, label: "Nettement plus foncé ou coloré que la périphérie" }
  pourquoi: "En vieillissant, le centre du tronc cesse de conduire la sève et se charge de substances qui le colorent et souvent le protègent : c'est le cœur, ou duramen. La bande claire autour, l'aubier, est le bois encore vivant."

- id: ongle
  testId: ongle
  question: "L'ongle du pouce, pressé fort sur une face lisse :"
  options:
    - { id: marque, label: "Laisse une trace" }
    - { id: resiste, label: "Ne laisse presque rien" }
  pourquoi: "Un test de dureté de surface sans outil. Un bois tendre se marque : il se travaille facilement, mais s'use vite."

- id: ecorce
  testId: ecorce-rameau
  question: "L'écorce, si elle est présente :"
  options:
    - { id: grise-losanges, label: "Grise ; lisse sur les jeunes tiges, crevassée en réseau de losanges sur les troncs" }
    - { id: orangee-plaques, label: "Épaisse et crevassée en bas, orangée et s'exfoliant en fines plaques vers le haut" }
    - { id: lisse-lenticelles, label: "Lisse, brun-gris à cuivrée, marquée de petits traits ou points (lenticelles)" }
    - { id: rouge-lanieres, label: "Fine, brun-rouge, se détachant en lanières ou en plaques" }
  pourquoi: "L'écorce change avec l'âge, mais chaque essence garde sa manière à elle de se fissurer ou de s'exfolier."

- id: rameau
  testId: ecorce-rameau
  question: "Sur un rameau : bourgeons, aiguilles ou feuilles"
  options:
    - { id: bourgeons-noirs-opposes, label: "Bourgeons noirs et veloutés, face à face" }
    - { id: aiguilles-par-deux, label: "Aiguilles groupées par deux, bleu-vert, un peu tordues" }
    - { id: aiguilles-plates, label: "Aiguilles plates, vert sombre dessus, plus claires dessous, sur deux rangs" }
    - { id: feuilles-rondes-alternes, label: "Feuilles arrondies, dentées, douces, en alternance le long du rameau" }
    - { id: opposes-fleurs-jaunes, label: "Bourgeons ou feuilles face à face ; fleurs jaunes en fin d'hiver, avant les feuilles" }
  pourquoi: "Quand un rameau est disponible, c'est souvent le critère le plus sûr. La disposition face à face (opposée) ou en alternance est une signature forte."
```

Ordre d'affichage et de départage à égalité : `resine, masse, coupe, moelle, ecorce, rameau, ongle, couleur` (du plus simple au plus exigeant).

### 7.2 Tests d'observation (protocoles)

```yaml
- id: soupeser
  type: mesure
  titre: "Soupeser et mesurer"
  materiel: ["Balance de cuisine", "Règle ou mètre", "Un morceau régulier : latte, cube ou bûchette sciée d'équerre"]
  geste: ["Mesure la longueur, la largeur et l'épaisseur en centimètres.", "Pèse le morceau en grammes.", "Saisis les valeurs : l'app calcule la densité (masse ÷ volume)."]
  observer: "La densité, placée sur l'échelle léger / moyen / lourd."
  pourquoi: "Deux bois de même taille peuvent avoir des masses très différentes. La densité est un premier tri, et elle annonce une partie des propriétés."
  alimenteCriteres: [masse]

- id: odeur
  type: critere
  titre: "Sentir et toucher"
  materiel: ["Couteau"]
  geste: ["Rafraîchis une petite zone au couteau, en éloignant la lame de toi.", "Sens immédiatement la surface.", "Touche : la résine colle aux doigts."]
  observer: "Odeur de résine, surface collante."
  pourquoi: "La résine est la signature des pins, sapins et épicéas."
  securite: "Coupe toujours en éloignant la lame de toi et de la main qui tient le bois."
  alimenteCriteres: [resine]

- id: coupe
  type: critere
  titre: "Lire la coupe à la loupe"
  materiel: ["Cutter bien affûté ou papier de verre fin", "Loupe ×10", "Un peu d'eau"]
  geste: ["Sur le bout du bois, rafraîchis une zone grande comme un ongle d'une coupe nette.", "Humidifie légèrement : pores et cernes ressortent.", "Observe : pores, bandes claires et foncées, centre, différence de couleur."]
  observer: "Pores, cernes, moelle, couleur du cœur."
  pourquoi: "La structure du bois, visible sur sa coupe, explique la plupart de ses propriétés."
  securite: "Coupe toujours en éloignant la lame de toi et de la main qui tient le bois."
  alimenteCriteres: [coupe, moelle, couleur]

- id: ongle
  type: critere
  titre: "Le test de l'ongle"
  materiel: ["Ton pouce"]
  geste: ["Choisis une face lisse, dans le sens du fil.", "Presse fort l'ongle, sans glisser.", "Regarde la surface en lumière rasante."]
  observer: "Une trace, ou presque rien."
  pourquoi: "La dureté de surface se teste sans outil."
  alimenteCriteres: [ongle]

- id: ecorce-rameau
  type: critere
  titre: "Écorce et rameau"
  materiel: ["Loupe (facultatif)"]
  geste: ["Observe l'écorce : couleur, fissures, plaques.", "Si un rameau est présent : bourgeons, aiguilles ou feuilles, et leur disposition."]
  observer: "Forme de l'écorce, disposition des bourgeons ou des aiguilles."
  pourquoi: "Le vivant autour du bois est souvent plus parlant que le bois lui-même."
  securite: "Ne mâchouille jamais un rameau ou une aiguille pour identifier un bois : certains sont toxiques. Voir le registre."
  alimenteCriteres: [ecorce, rameau]

- id: flexion
  type: propriete
  titre: "Plier une latte"
  materiel: ["Lattes d'environ 1 × 1 × 35 cm, de même section et dans le même état (toutes sèches ou toutes vertes)"]
  geste: ["Tiens la latte par les extrémités, loin du visage.", "Plie progressivement, de plus en plus fort.", "Relâche une première fois avant la rupture, puis recommence jusqu'à la casse."]
  observer: "Comment la latte plie, revient, ou casse."
  options:
    - { id: plie-revient, label: "Plie fortement et revient presque droite" }
    - { id: casse-net, label: "Casse tôt, net ou en éclats courts" }
    - { id: plie-reste, label: "Plie et garde sa forme" }
  pourquoi: "Un arc, un manche ou un ressort demandent un bois qui plie sans rompre et restitue la force. Ce test compare élasticité et ténacité. Un bois vert plie bien plus qu'un bois sec : compare toujours des lattes dans le même état."
  securite: "Plie loin du visage : une latte qui casse peut projeter des éclats. Des lunettes sont une bonne idée."
  alimenteProprietes: [elasticite, tenacite]

- id: fendage
  type: propriete
  titre: "Fendre"
  materiel: ["Bûchette ou rondelle", "Couteau solide ou hachette", "Bâton de frappe", "Billot stable"]
  geste: ["Pose la lame dans l'axe, en passant par le centre.", "Frappe le dos de la lame avec le bâton, par petits coups.", "Observe le trajet de la fente."]
  observer: "La fente suit-elle une ligne droite ?"
  options:
    - { id: droit, label: "Se fend droit et régulier" }
    - { id: devie, label: "La fente dévie ou tourne" }
    - { id: bloque, label: "Résiste, bloquée par les fibres ou les nœuds" }
  pourquoi: "Un bois au fil droit donne des pièces longues et régulières sans scie : lattes, manches, bardeaux."
  securite: "Billot stable, jambes écartées, jamais la main dans l'axe de la lame. À faire dehors."
  alimenteProprietes: [fendabilite]

- id: allumage
  type: propriete
  titre: "Allumer un copeau"
  materiel: ["Petits copeaux fins de chaque bois", "Support ininflammable", "Allumettes", "Seau d'eau"]
  geste: ["Dehors uniquement, avec un adulte.", "Approche une flamme de chaque copeau, l'un après l'autre.", "Compte le temps avant qu'il brûle seul."]
  observer: "La vitesse à laquelle chaque copeau prend feu."
  options:
    - { id: vite, label: "S'enflamme presque aussitôt" }
    - { id: lent, label: "S'enflamme après quelques secondes" }
    - { id: difficile, label: "Noircit sans vraiment brûler" }
  pourquoi: "Lancer un feu et l'entretenir ne demandent pas le même bois."
  securite: "Uniquement dehors, sur un sol dégagé, avec de l'eau à portée de main. Jamais par vent fort ni en période de risque d'incendie."
  alimenteProprietes: [allumage]
```

### 7.3 Propriétés

```yaml
- { id: tenacite, label: "Ténacité", question: "Encaisse-t-il un choc sans casser ?", explication: "La ténacité, c'est l'énergie qu'un bois absorbe avant de rompre. Un manche d'outil ou un arc en ont besoin : ils subissent des chocs répétés." }
- { id: elasticite, label: "Élasticité", question: "Plie-t-il, puis revient-il ?", explication: "Un bois élastique se déforme sous l'effort puis reprend sa forme en rendant l'énergie. C'est le moteur d'un arc." }
- { id: durete, label: "Dureté", question: "Résiste-t-il à l'enfoncement ?", explication: "Un bois dur se marque peu et s'use lentement, mais demande plus d'effort à travailler." }
- { id: fendabilite, label: "Fendabilité", question: "Se fend-il droit ?", explication: "Un bois au fil droit se fend proprement en suivant ses fibres. On en tire des lattes longues et régulières sans scie." }
- { id: allumage, label: "Allumage", question: "S'enflamme-t-il vite ?", explication: "Les bois riches en résine, ou très secs et fins, prennent feu rapidement. Ils lancent un feu, ils ne l'entretiennent pas." }
- { id: chauffage, label: "Pouvoir de chauffe", question: "Brûle-t-il longtemps en chauffant ?", explication: "Un bois dense et sec brûle longtemps et donne des braises. Il entretient le feu une fois lancé." }
- { id: durabilite, label: "Durabilité", question: "Résiste-t-il à la pourriture dehors ?", explication: "Certains bois, surtout leur cœur coloré, résistent aux champignons et aux insectes. D'autres pourrissent vite au contact du sol." }
- { id: travail, label: "Facilité de travail", question: "Se taille-t-il facilement au couteau ?", explication: "Un bois tendre et homogène se sculpte facilement. Un bois dur ou noueux résiste à la lame." }
- { id: rectitude, label: "Rectitude", question: "Trouve-t-on des tiges ou des pièces bien droites ?", explication: "Certaines plantes produisent des tiges très droites, prêtes à l'emploi sans scier ni fendre." }
- { id: creux, label: "Facilité à évider", question: "L'intérieur se vide-t-il facilement ?", explication: "Une moelle large et tendre se retire facilement : la tige devient un tube." }
```

### 7.4 Essences

Les notes 1–5 sont des ordres de grandeur pédagogiques, à comparer entre essences, pas des mesures. Les densités sont des fourchettes pour du bois sec.

```yaml
- id: frene
  nom: "Frêne commun"
  latin: "Fraxinus excelsior"
  famille: "Oléacées"
  coordonnee: "B2"
  registre: false
  resume: "Lourd, tenace et élastique : le bois des manches d'outils."
  pourquoi: "Le frêne est un bois à zone poreuse : chaque printemps, l'arbre fabrique un anneau de gros vaisseaux, les pores visibles à la loupe, puis un bois d'été dense et fibreux. C'est ce bois d'été qui fait sa ténacité : il encaisse les chocs et plie avant de casser. Un frêne à cernes larges, qui a poussé vite, contient plus de bois d'été et résiste mieux. Son fil est généralement droit : il se fend proprement en longues pièces régulières."
  criteres:
    resine: [non]
    masse: [lourd]
    coupe: [pores-zone]
    moelle: [fine]
    couleur: [clair, coeur-colore]
    ongle: [resiste]
    ecorce: [grise-losanges]
    rameau: [bourgeons-noirs-opposes]
  densite: { min: 0.65, max: 0.75 }
  proprietes: { tenacite: 5, elasticite: 4, durete: 4, fendabilite: 5, allumage: 3, chauffage: 4, durabilite: 1, travail: 3, rectitude: 3, creux: 1 }
  coupe: zone-poreuse
  usages: ["Manches de haches, masses, marteaux et pioches", "Arcs", "Skis, raquettes et avirons anciens", "Échelles", "Pièces cintrées à la vapeur, comme les dossiers de chaises", "Bois de chauffage réputé"]
  recolte: "Le frêne est aujourd'hui frappé par la chalarose, une maladie qui fait dépérir beaucoup d'arbres en Europe. Travaille de préférence du bois déjà abattu ou tombé, et ne blesse pas un arbre sain. Un frêne malade ou mort sur pied peut perdre des branches sans prévenir : ne reste pas dessous, surtout par vent."
  anecdote: "Le frêne et le forsythia sont de la même famille, celle de l'olivier. Regarde leurs bourgeons : ils poussent face à face."

- id: pin-sylvestre
  nom: "Pin sylvestre"
  latin: "Pinus sylvestris"
  famille: "Pinacées"
  coordonnee: "B5"
  registre: false
  resume: "Léger, tendre et résineux : le bois qui lance le feu."
  pourquoi: "Le pin est un résineux : son bois n'a pas de pores, il est fait de cellules fines et allongées. Le bois de printemps, clair et tendre, alterne avec le bois d'été, foncé et plus dur : d'où les bandes bien nettes et la trace de l'ongle dans les zones claires. Des canaux remplis de résine parcourent le bois. Cette résine, très inflammable, explique un allumage rapide."
  criteres:
    resine: [oui]
    masse: [leger, moyen]
    coupe: [sans-pores]
    moelle: [fine]
    couleur: [clair, coeur-colore]
    ongle: [marque]
    ecorce: [orangee-plaques]
    rameau: [aiguilles-par-deux]
  densite: { min: 0.45, max: 0.58 }
  proprietes: { tenacite: 2, elasticite: 2, durete: 2, fendabilite: 3, allumage: 5, chauffage: 2, durabilite: 2, travail: 4, rectitude: 2, creux: 1 }
  coupe: resineux-canaux
  usages: ["Charpente, menuiserie, planches", "Allume-feu, surtout les parties gorgées de résine", "Résine chauffée en poix, pour coller et étanchéifier"]
  recolte: "Ramasse le bois mort au sol ou les branches basses déjà sèches ; on ne taille pas un pin vivant pour allumer un feu. En France, chaque forêt appartient à quelqu'un, propriétaire privé, commune ou État : demande toujours l'autorisation avant de prélever."
  anecdote: "La poix tirée de la résine de pin servait à étanchéifier les coques des bateaux."

- id: noisetier
  nom: "Noisetier"
  latin: "Corylus avellana"
  famille: "Bétulacées"
  coordonnee: "E2"
  registre: false
  resume: "Des tiges droites et souples qui repoussent après chaque coupe."
  pourquoi: "Le noisetier a un bois à pores diffus, homogène et assez tendre. Il pousse en cépée : de nombreuses tiges droites partent de la souche et se renouvellent quand on les coupe. Jeunes, ces tiges sont très souples : on les tresse, on les plie, on les refend."
  criteres:
    resine: [non]
    masse: [moyen, lourd]
    coupe: [pores-diffus]
    moelle: [fine]
    couleur: [clair]
    ongle: null
    ecorce: [lisse-lenticelles]
    rameau: [feuilles-rondes-alternes]
  densite: { min: 0.55, max: 0.68 }
  proprietes: { tenacite: 3, elasticite: 5, durete: 2, fendabilite: 4, allumage: 3, chauffage: 3, durabilite: 1, travail: 4, rectitude: 5, creux: 1 }
  coupe: pores-diffus
  usages: ["Vannerie et clayonnage (plessis)", "Tuteurs et piquets de jardin", "Cannes et baguettes", "Arcs simples", "Les noisettes"]
  recolte: "Coupe quelques tiges à la base, d'une coupe nette : la souche rejette. Ne prends jamais toutes les tiges d'une même cépée."
  anecdote: "Une cépée de noisetier coupée au ras du sol repousse en dizaines de tiges droites : c'est le principe du taillis, pratiqué depuis des siècles."

- id: forsythia
  nom: "Forsythia"
  latin: "Forsythia × intermedia"
  famille: "Oléacées"
  coordonnee: "E5"
  registre: false
  resume: "Un arbuste de jardin aux tiges faciles à évider."
  pourquoi: "Le forsythia n'est pas un arbre forestier : c'est un arbuste ornemental venu d'Asie, planté dans les haies et les jardins. Ses tiges ont une moelle large, souvent cloisonnée en petites chambres ou creuse entre les nœuds, entourée d'un anneau de bois mince. Cette structure rend la tige légère et facile à évider."
  criteres:
    resine: [non]
    masse: null
    coupe: null
    moelle: [large-creuse]
    couleur: null
    ongle: null
    ecorce: [lisse-lenticelles]
    rameau: [opposes-fleurs-jaunes]
  densite: null
  proprietes: { tenacite: 2, elasticite: 3, durete: 1, fendabilite: 2, allumage: 3, chauffage: 1, durabilite: 1, travail: 4, rectitude: 4, creux: 5 }
  coupe: moelle-cloisonnee
  usages: ["Petits tubes et sifflets, après évidement", "Tuteurs légers"]
  recolte: "Arbuste de jardin : la taille après la floraison fournit des tiges sans rien prélever ailleurs."
  anecdote: "Le forsythia ne pousse pas en forêt. La méthode marche partout où il y a du bois, même dans une haie de jardin."
  notesFiabilite: "Le forsythia est peu documenté comme bois d'usage : ces notes sont des estimations. Vérifie-les par tes propres tests."

- id: if
  nom: "If commun"
  latin: "Taxus baccata"
  famille: "Taxacées"
  coordonnee: "H3"
  registre: true
  resume: "Le bois d'arc le plus célèbre, et un bois toxique."
  pourquoi: "L'if est un conifère sans canaux résinifères : il ne sent pas la résine. Il pousse très lentement, d'où des cernes très fins et serrés. Son cœur rouge-orangé résiste à la compression, son aubier blanc et étroit à la tension : un arc taillé dans l'if associe les deux."
  criteres:
    resine: [non]
    masse: [moyen, lourd]
    coupe: [sans-pores]
    moelle: [fine]
    couleur: [coeur-colore]
    ongle: [resiste]
    ecorce: [rouge-lanieres]
    rameau: [aiguilles-plates]
  densite: { min: 0.62, max: 0.75 }
  proprietes: { tenacite: 4, elasticite: 5, durete: 4, fendabilite: 2, allumage: 2, chauffage: 3, durabilite: 5, travail: 2, rectitude: 2, creux: 1 }
  coupe: resineux-sans-canaux
  usages: ["Arcs : l'arc long anglais, l'arc inachevé retrouvé avec Ötzi", "Haies taillées", "Ébénisterie fine"]
  recolte: "Ne prélève pas : bois toxique et arbre à croissance très lente."
  anecdote: "Un if peut vivre plus de mille ans."
```

### 7.5 Défis

```yaml
- id: manche-hache
  titre: "Un manche de hache"
  besoin: "Un manche de hache encaisse des chocs répétés, toute la journée, sans casser."
  exigences:
    - { propriete: tenacite, min: 4, poids: 3, enClair: "encaisser des chocs sans casser" }
    - { propriete: elasticite, min: 3, poids: 2, enClair: "absorber les vibrations en fléchissant un peu" }
    - { propriete: fendabilite, min: 4, poids: 1, enClair: "donner une pièce au fil droit, sans fibre coupée" }
  attendus: [frene]
  revelation: "Le frêne est le bois de manche classique en Europe : tenace, un peu élastique, et il se fend en pièces au fil droit. Le noisetier peut faire un petit manche léger, pas un manche de hache."

- id: arc-simple
  titre: "Un arc simple"
  besoin: "Un arc plie fortement sans rompre, et rend la force à la flèche."
  exigences:
    - { propriete: elasticite, min: 4, poids: 3, enClair: "plier fortement et revenir" }
    - { propriete: tenacite, min: 3, poids: 2, enClair: "ne pas rompre sous la tension" }
    - { propriete: rectitude, min: 3, poids: 1, enClair: "partir d'une pièce bien droite" }
  attendus: [frene, noisetier]
  revelation: "Le frêne (en latte fendue) et le noisetier (en tige) font de bons arcs simples. Le bois d'arc le plus célèbre est l'if, mais il est toxique : c'est exactement ce que l'observation ne te dit pas."
  securite: "Un arc n'est pas un jouet : on ne vise jamais une personne ou un animal, et on tire uniquement dans un espace dégagé."

- id: allumer-feu
  titre: "Lancer un feu"
  besoin: "Pour démarrer un feu, il faut un bois qui s'enflamme vite, même en petite quantité."
  exigences:
    - { propriete: allumage, min: 4, poids: 3, enClair: "prendre feu presque aussitôt" }
  attendus: [pin-sylvestre]
  revelation: "Le pin, surtout ses parties gorgées de résine, lance le feu. Le frêne brûle très bien ensuite : il entretient le feu, il ne le démarre pas."
  securite: "Dehors uniquement, sur un sol dégagé, de l'eau à portée de main, jamais par vent fort ni en période de risque d'incendie."

- id: sifflet
  titre: "Un sifflet ou un petit tube"
  besoin: "Pour un sifflet ou un tube, il faut un intérieur facile à vider."
  exigences:
    - { propriete: creux, min: 4, poids: 3, enClair: "un intérieur qui se vide facilement" }
    - { propriete: travail, min: 3, poids: 1, enClair: "se tailler facilement au couteau" }
  attendus: [forsythia]
  revelation: "Les tiges à moelle large, comme celles du forsythia, se vident facilement. Le sureau est l'autre bois classique des sifflets."

- id: tuteurs
  titre: "Des tuteurs pour le jardin"
  besoin: "Des tuteurs droits, à renouveler chaque année sans abîmer la plante qui les fournit."
  exigences:
    - { propriete: rectitude, min: 4, poids: 3, enClair: "des tiges droites, prêtes à l'emploi" }
  attendus: [noisetier, forsythia]
  revelation: "La cépée de noisetier et la taille du forsythia fournissent chaque année des tiges droites. La durabilité compte peu : un tuteur se remplace."
```

### 7.6 Registre « ce qui ne se déduit pas »

```yaml
- id: if
  essenceId: if
  titre: "If commun"
  latin: "Taxus baccata"
  pourquoiIndeductible: "Rien dans l'aspect, l'odeur ou le comportement mécanique du bois ne signale le danger. C'est même l'un des meilleurs bois d'arc."
  ceQuIlFautSavoir: ["Presque toutes les parties de l'if sont très toxiques : aiguilles, écorce, bois, graines.", "Même la petite baie rouge contient une graine toxique : on n'y goûte pas.", "Il est aussi mortel pour les chevaux et le bétail."]
  gestes: ["Ne jamais mâcher un rameau, une aiguille ou un copeau.", "Jamais d'ustensile en contact avec la nourriture.", "Masque contre la sciure, mains lavées après le travail."]

- id: laurier-rose
  titre: "Laurier-rose"
  latin: "Nerium oleander"
  pourquoiIndeductible: "C'est un arbuste de jardin très courant, aux tiges droites et tentantes. Rien ne signale sa toxicité."
  ceQuIlFautSavoir: ["Toutes les parties sont très toxiques.", "La fumée de sa combustion l'est aussi."]
  gestes: ["Jamais de brochette ni de bâton de cuisson en laurier-rose.", "Ne jamais le brûler.", "Se laver les mains après l'avoir taillé."]

- id: bois-traites
  titre: "Bois traités, peints et palettes"
  pourquoiIndeductible: "Un bois traité ou peint peut contenir des produits toxiques invisibles, qui passent dans la fumée quand il brûle."
  ceQuIlFautSavoir: ["Bois peint, verni, aggloméré ou traité en autoclave (souvent verdâtre ou brunâtre) : jamais au feu.", "Palettes : cherche le marquage. HT signifie traité par la chaleur, utilisable pour le bricolage. MB signifie fumigé au bromure de méthyle : à éviter."]
  gestes: ["Ne jamais brûler un bois dont tu ne connais pas l'origine.", "Pas de bois de récupération pour un ustensile alimentaire."]
```

### 7.7 Scénario de démonstration (`demo.ts`)

```yaml
specimens:
  - { id: demo-frene, nom: "Tronc n°1", mesures: { longueur: 35, largeur: 1.2, epaisseur: 1.2, masse: 35 } }   # densité ≈ 0,69 → lourd
  - { id: demo-pin, nom: "Latte n°2" }
  - { id: demo-forsythia, nom: "Tige n°3" }
etapes:
  - { id: principe, route: "/", texte: "Comprendre avant de faire. Le numérique avant et après la sortie, jamais à sa place." }
  - { id: specimen, route: "/observer/demo-frene", texte: "Un tronc posé sur la table. On ne sait pas encore ce que c'est." }
  - { id: densite, route: "/observer/demo-frene?test=soupeser", texte: "On mesure, on pèse : 0,69. Lourd.", injecte: { mesures: true, answers: { masse: lourd } } }
  - { id: coupe, route: "/observer/demo-frene?test=coupe", texte: "À la loupe : un anneau de gros pores au début de chaque cerne.", injecte: { answers: { resine: non, coupe: pores-zone } } }
  - { id: identifier, route: "/identifier/demo-frene", texte: "Il reste deux candidats. L'app propose le test qui les départage : la moelle.", injecte: {} }
  - { id: moelle, route: "/identifier/demo-frene", texte: "Moelle fine : proposition, frêne. On confirme par l'écorce.", injecte: { answers: { moelle: fine, ecorce: grise-losanges }, identification: frene } }
  - { id: fiche, route: "/atlas/frene", texte: "Pourquoi le frêne est tenace : la coupe l'explique. Les usages restent cachés." }
  - { id: defi-manche, route: "/defis/manche-hache?specimen=demo-frene", texte: "Le défi : un manche de hache. Le jeune choisit, justifie, puis l'app révèle.", injecte: { defi: { essenceId: frene, cites: [tenacite, fendabilite] } } }   # retour attendu : « Tu n'as pas cité : élasticité »
  - { id: pin, route: "/identifier/demo-pin", texte: "Contraste : odeur de résine. Un seul candidat.", injecte: { answers: { resine: oui }, identification: pin-sylvestre } }
  - { id: pin-arc, route: "/defis/arc-simple?specimen=demo-pin", texte: "Le pin pour un arc ? La latte a cassé : l'élasticité manque.", injecte: { resultatsTests: { flexion: casse-net }, defi: { essenceId: pin-sylvestre, cites: [elasticite] } } }
  - { id: forsythia, route: "/identifier/demo-forsythia", texte: "Une tige de jardin : moelle large et cloisonnée.", injecte: { answers: { moelle: large-creuse }, identification: forsythia } }
  - { id: if, route: "/defis/arc-simple?essence=if", texte: "Le meilleur bois d'arc… et ce que l'observation ne dit pas.", injecte: { defi: { essenceId: if, cites: [elasticite, tenacite] } } }
  - { id: cloture, route: "/?demo=cloture", texte: "Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s'apprend." }
```

Avec ces données, le moteur doit produire exactement : après `masse` mesurée à 0,69 et `coupe: pores-zone` → candidats **frêne** et **forsythia** (le forsythia n'est discriminé ni par la masse ni par la coupe) ; meilleur test suivant → **moelle** ; après `moelle: fine` → **frêne** seul. Ce comportement est un test unitaire obligatoire.

---

## 8. Écrans et parcours

Routes (`src/router/index.ts`) : `/`, `/observer`, `/observer/:specimenId`, `/identifier/:specimenId`, `/atlas`, `/atlas/:essenceId`, `/defis`, `/defis/:defiId`, `/registre`, `/carnet`, `/carnet/:specimenId`, `/demo`, `/_styleguide` (dev uniquement).

### 8.1 Accueil `/` (papier)
- `GridPaper` + grappe de `Crosshairs` en haut à gauche.
- `PixelWordmark` « LICHEN » révélé pixel par pixel ; dessous, en mono : « Module 01 — Bois ».
- `VerticalLabel` à droite : « BOIS ».
- Grande illustration `CoupeTransversale` du frêne, révélée par `GridReveal` en escalier, qui **déborde du bord droit** (comme le rocher de la réf. A).
- Ligne de méthode : « Observer · Identifier · Comprendre · Déduire ».
- Tuiles `CellButton` : `A1 Nouveau spécimen` (crée un spécimen et ouvre Observer), `C1 Atlas`, `D1 Défis`, `E1 Carnet`, et une tuile vermillon `R Ce qui ne se déduit pas`.
- Pied : « Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s'apprend. »
- Avec `?demo=cloture` : seule la phrase de principe, en `--fs-display`, sur le papier.

### 8.2 Observer `/observer/:specimenId` (papier)
- En-tête : nom du spécimen (éditable), bouton photo (P1).
- Deux groupes de tuiles : **Pour identifier** (soupeser, odeur, coupe, ongle, écorce-rameau) et **Pour comprendre** (flexion, fendage, allumage). Chaque tuile montre son état : « à faire » ou le résultat retenu.
- Fiche de test (feuille plein écran, ouverte via `?test=<id>`) : Matériel, Geste (liste numérotée), Ce que tu observes (`ChoiceCells` par critère alimenté), « Pourquoi ça compte » repliable, `Panel safety` si `securite`.
- **Soupeser** : quatre champs numériques (cm, cm, cm, g), calcul de la densité affiché sur une règle horizontale graduée de 0,3 à 0,9 avec les bandes léger / moyen / lourd. **Les essences ne sont pas placées sur la règle** : ce serait donner la réponse. La catégorie se coche automatiquement dans `answers.masse`.
- Bouton final : « Identifier ce spécimen → ».

### 8.3 Identifier `/identifier/:specimenId` (papier)
- En haut : les 5 essences en cellules (illustration de coupe miniature + coordonnée). Une essence exclue passe en contour seul, barrée, avec la raison en `--fs-label` : « exclu : résine ».
- Liste des critères avec la réponse actuelle (modifiable sur place) ou « pas encore observé » ; « Pourquoi ce critère ? » repliable.
- **Meilleur test suivant** : « Le test qui départagerait le mieux : la moelle. » (lien vers la fiche de test).
- Un seul candidat restant : `Panel` « Proposition : Frêne commun. » Si un seul critère a été répondu : « Confirme avec un autre critère avant de conclure. » Bouton « Je confirme » → `specimen.identification`.
- Candidat restant du registre (`registre: true`) : `Panel signal` immédiat : « Attention : ce bois est dans le registre. Lis ce qui ne se déduit pas avant de le manipuler. » + lien.
- Zéro candidat : « Aucune essence de l'atlas ne correspond. Refais un test, ou ce bois n'est pas encore dans l'atlas. »
- Jamais le mot « certain ».

### 8.4 Atlas `/atlas` (planche)
- `Plate` à coordonnées. Chaque essence occupe un bloc de cellules à sa coordonnée, avec son illustration de coupe, son nom et son résumé. L'if porte une étiquette vermillon « registre ».

### 8.5 Fiche essence `/atlas/:essenceId` (planche)
- Nom en `--fs-h1`, latin et famille en mono, coordonnée ; `VerticalLabel` du nom.
- Bandeau vermillon en tête si `registre`, avec lien vers l'entrée du registre.
- **Coupe interactive** (`CoupeTransversale` interactive) : toucher une zone affiche son nom et son rôle.
- **Reconnaître** : la réponse attendue pour chaque critère (libellé de l'option), « — » si `null`.
- **Pourquoi ce bois se comporte ainsi** : `pourquoi`.
- **Propriétés** : 10 `PropertyScale`, chacune dépliable avec la `question` et l'`explication` de la propriété.
- **Usages traditionnels** : `Panel locked` par défaut, message « Essaie d'abord de le déduire : relève un défi. », bouton « Relever un défi ». Déverrouillé si un défi a été réalisé avec cette essence (store carnet). Lien discret « Révéler quand même », qui demande une confirmation.
- **Récolter en conscience** : `recolte`.
- **Le savais-tu ?** : `anecdote`. `notesFiabilite` en note si présente.

### 8.6 Défis `/defis` et `/defis/:defiId` (planche)
- Liste : une tuile par défi avec titre et besoin.
- Défi, en 4 étapes visibles (stepper sur la grille) :
  1. **Le besoin** : `besoin`, puis les exigences **en clair** (`enClair`), sans nommer les propriétés.
  2. **Choisis un bois** : les spécimens identifiés du carnet d'abord (« Tronc n°1 — frêne »), puis toutes les essences de l'atlas. Pré-sélection via `?specimen=` ou `?essence=`.
  3. **Justifie** : sélection de `Chip` de propriétés (« Qu'est-ce qui rend ce bois adapté ? ») + champ texte facultatif « Ta raison ».
  4. **Verdict** :
     - si l'essence est au registre : `Panel signal` d'interception avec l'entrée du registre, **avant** tout verdict, puis bouton « Voir quand même l'analyse » ;
     - sinon, une ligne par exigence : ✓ ok, ~ limite, ✗ insuffisant, avec la note de l'essence et l'explication ;
     - retour sur la justification : « Tu as vu juste sur : ténacité. Tu n'as pas cité : élasticité. Hors sujet ici : allumage. » ;
     - verdict global en titre : « Ton choix tient », « Ton choix tient en partie » ou « Ton choix ne tient pas » ;
     - si le spécimen a un résultat de test de propriété cohérent (ex. flexion `casse-net` et exigence d'élasticité), le rappeler : « Ta latte a cassé tôt : c'est cohérent. » (P1) ;
     - puis **Révélation** : `revelation` + usages traditionnels des `attendus`, révélés par `GridReveal`.
  - Le défi réalisé s'enregistre dans le spécimen choisi (ou dans un spécimen « Atlas » implicite si le choix vient de l'atlas).
  - `Panel safety` si le défi a une `securite`.

### 8.7 Registre `/registre` (planche, ton `signal`)
- Titre « Ce qui ne se déduit pas », phrase de principe, puis une section par entrée : `pourquoiIndeductible`, « Ce qu'il faut savoir », « Les gestes ». Lien vers la fiche essence si `essenceId`.

### 8.8 Carnet `/carnet` et `/carnet/:specimenId` (papier)
- Liste des spécimens : illustration ou photo, nom, identification, date, nombre de défis.
- Actions : « Nouveau spécimen », « Exporter (JSON) », « Importer », « Tout effacer » (vermillon, confirmation).
- Détail : observations, mesures, résultats de tests, identification, défis réalisés, notes libres, photos.
- Photo (P1) : `<input type="file" accept="image/*" capture="environment">`, redimensionnée côté client à 1280 px max (canvas → JPEG qualité 0,85), stockée en Blob dans IndexedDB.

### 8.9 Mode démo `/demo`
- Démarrage : réinitialise l'état démo (sans toucher aux vrais spécimens), crée les spécimens de `demo.ts`, ouvre l'étape 1.
- Barre présentateur discrète en bas : `n / 13`, ←, →, « Réinitialiser », « Quitter ». Flèches clavier, et tap sur les bords gauche et droit de l'écran.
- Chaque étape navigue vers sa `route` et applique `injecte` **progressivement** (on voit l'état changer à l'écran, pas un saut). Le texte de l'étape s'affiche en petit, en mono, au-dessus de la barre : c'est l'aide-mémoire du présentateur.
- Le présentateur peut à tout moment saisir de vraies valeurs à la place des valeurs injectées.
- `BottomNav` masquée pendant la démo.

### 8.10 Styleguide `/_styleguide` (P1, dev uniquement)
- Tous les composants de la section 5.5 et toutes les variantes de `CoupeTransversale`.

---

## 9. Moteurs, stores, PWA et déploiement

### 9.1 Moteur d'identification (`src/engine/identification.ts`)

```ts
export const SEUILS = { legerMax: 0.55, moyenMax: 0.65 }
export const TOLERANCE_DENSITE = 0.05
export function densite(m: Mesures): number                       // masse / (L × l × e)
export function categorieMasse(d: number): 'leger' | 'moyen' | 'lourd'
export interface ResultatCandidat { essence: Essence; compatible: boolean; exclusions: { critere: CritereId; valeur: string }[] }
export function filtrer(essences: Essence[], answers: Answers, mesures?: Mesures): ResultatCandidat[]
export function meilleurCritereSuivant(candidats: Essence[], criteres: Critere[], answers: Answers): Critere | null
```

Règles :
- Une réponse absente ou « je ne sais pas » ne filtre rien.
- Une essence dont le critère vaut `null` reste compatible pour ce critère.
- Sinon, l'essence est exclue si la valeur observée n'est pas dans sa liste.
- **Masse** : si des `mesures` existent et que l'essence a une `densite`, elle est compatible si la densité mesurée est dans `[min − 0,05 ; max + 0,05]` ; sinon on compare la catégorie choisie à la liste `criteres.masse`.
- `meilleurCritereSuivant` : parmi les critères non répondus, pour chaque option, compter les candidats compatibles (`null` compte comme compatible avec toutes les options) ; retenir le critère qui **minimise le pire cas**. Ignorer un critère qui ne départage personne. Égalité : ordre de la section 7.1. Retourne `null` si un seul candidat ou aucun critère utile.

### 9.2 Moteur des défis (`src/engine/defis.ts`)

```ts
export function evaluer(defi: Defi, essence: Essence, cites: ProprieteId[]): Verdict
```

- Ligne : `ok` si note ≥ min ; `limite` si note = min − 1 ; `insuffisant` sinon.
- Global : `ne-tient-pas` si une ligne `insuffisant` a un poids ≥ 2 ; sinon `tient-en-partie` s'il existe une ligne `limite` ou `insuffisant` ; sinon `tient`.
- `interception = essence.registre`.
- `citesPertinents` = cités ∩ exigences ; `oublies` = exigences de poids ≥ 2 non citées ; `citesHorsSujet` = cités ∖ exigences.

Résultats attendus (tests unitaires obligatoires) :

| Défi | frêne | pin | noisetier | forsythia | if |
|---|---|---|---|---|---|
| manche-hache | tient | ne-tient-pas | tient-en-partie | ne-tient-pas | interception |
| arc-simple | tient | ne-tient-pas | tient | tient-en-partie | interception |
| allumer-feu | tient-en-partie | tient | tient-en-partie | tient-en-partie | interception |
| sifflet | ne-tient-pas | ne-tient-pas | ne-tient-pas | tient | interception |
| tuteurs | tient-en-partie | ne-tient-pas | tient | tient | interception |

Pour l'if, le test vérifie `interception: true` ; le `global` est calculé normalement par les mêmes règles.

### 9.3 Stores (`src/stores/`)
- `carnet` (Pinia) : CRUD des spécimens, persistance via `idb-keyval` (clé `lichen:carnet:v1`), photos en Blobs (clés `lichen:photo:<uuid>`), export/import JSON (photos exclues de l'export en P0, incluses en base64 en P1). Au démarrage : `navigator.storage?.persist?.()`.
- `demo` : état de l'étape courante, injection progressive, isolation des spécimens démo (préfixe `demo-`), réinitialisation.

### 9.4 Illustrations (`src/components/illustrations/`, agent E)
- `CoupeTransversale.vue` : SVG procédural, props `type: CoupeType`, `interactive?: boolean`, `seed?: number`.
  - `zone-poreuse` (frêne) : cernes larges ; à chaque début de cerne, un anneau de gros pores (petits cercles) ; bois d'été dense ; moelle fine ; cœur éventuellement plus foncé.
  - `resineux-canaux` (pin) : bandes claires (bois de printemps) et foncées (bois d'été) contrastées, petits points de canaux résinifères, cœur légèrement rougeâtre.
  - `pores-diffus` (noisetier) : cernes peu marqués, pores très fins répartis uniformément, teinte claire homogène.
  - `moelle-cloisonnee` (forsythia) : large moelle centrale avec cloisons, anneau de bois mince, écorce à lenticelles.
  - `resineux-sans-canaux` (if) : cernes très fins et serrés, cœur rouge-orangé, aubier blanc étroit, pas de canaux.
  - Mode interactif : zones touchables (écorce, aubier, cœur, cerne, bois de printemps, bois d'été, pores ou canaux, moelle) avec étiquette et explication d'une phrase.
  - Palette : encre, `--ink-2`, `--ink-3`, tons bois sobres en aplats ; trait 1 px, rendu « planche de botanique imprimée ».
- `Silhouette.vue` : silhouettes de repli pour `Cutout` (rondelle, latte, tige, rameau d'aiguilles), en aplats.
- `TestIcon.vue` : pictogrammes au trait pour chaque test (balance, nez, loupe, pouce, écorce, latte pliée, lame, flamme).

### 9.5 PWA et iOS (agent D)
- `vite-plugin-pwa` : `registerType: 'autoUpdate'`, `injectRegister: 'auto'`, `workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,woff2,json,webmanifest}'], navigateFallback: '/index.html', cleanupOutdatedCaches: true, maximumFileSizeToCacheInBytes: 6 * 1024 * 1024 }`.
- Manifest : `name: "Lichen — Bois"`, `short_name: "Lichen"`, `lang: "fr"`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `orientation: "portrait"`, `background_color` et `theme_color` : `#EBE5DF`, icônes générées.
- `public/logo.svg` : un « L » en pixels sur papier millimétré beige, lisible à 64 px. `pwa-assets.config.ts` :

  ```ts
  import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'
  export default defineConfig({ preset, images: ['public/logo.svg'] })
  ```

  puis `pnpm generate-pwa-assets`, et référencer les icônes produites dans le manifest.
- `index.html` : `<html lang="fr">`, `viewport` avec `width=device-width, initial-scale=1, viewport-fit=cover`, `theme-color`, `color-scheme: light`, `apple-mobile-web-app-capable` et `mobile-web-app-capable` à `yes`, `apple-mobile-web-app-status-bar-style` à `default`, `apple-mobile-web-app-title` à `Lichen`, `<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">`.
- Le service worker exige HTTPS : Coolify le fournit (Let's Encrypt). En local, `localhost` suffit.
- `scripts/process-images.mjs` (sharp) : lit `assets-src/**/*.{png,jpg,jpeg}`, redimensionne à 1200 px max, convertit en WebP qualité 80 en **conservant la transparence**, écrit dans `public/img/` en gardant l'arborescence. Les chemins se déclarent ensuite dans `essences.ts` (`photos`).

### 9.6 Déploiement Coolify (agent D)

`Dockerfile` :

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

`nginx.conf` :

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml application/manifest+json;

  location = /sw.js { add_header Cache-Control "no-cache"; try_files $uri =404; }
  location = /index.html { add_header Cache-Control "no-cache"; }
  location = /manifest.webmanifest { default_type application/manifest+json; add_header Cache-Control "no-cache"; try_files $uri =404; }
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }
  location / { try_files $uri $uri/ /index.html; }
}
```

`.dockerignore` : `node_modules`, `dist`, `.git`, `.claude`, `docs/screens`, `assets-src`, `test-results`, `playwright-report`.

`README.md` : développement local ; déploiement Coolify (nouvelle ressource depuis le dépôt Git, build pack **Dockerfile**, port exposé **80**, domaine en HTTPS) ; installation sur iPhone (ouvrir l'URL dans **Safari** → Partager → « Sur l'écran d'accueil », puis ouvrir l'app une fois en ligne pour que tout soit mis en cache) ; ajout de photos (`assets-src/` → `pnpm images` → déclarer dans `essences.ts`).

---

## 10. Workflow Claude Code

Tu es l'**agent principal (orchestrateur)**. Tu travailles sur `main` dans le dossier racine. Tu délègues le travail parallèle à des **sous-agents isolés dans des worktrees git**.

### 10.1 Règles communes à tous les agents

- **Commit automatique à chaque étape symbolique** listée ci-dessous, sans demander, avec exactement le message indiqué (Conventional Commits, en français). Avant chaque commit : `pnpm typecheck` et `pnpm test` doivent passer pour le périmètre concerné ; sinon corriger d'abord.
- `git add` uniquement des fichiers de son périmètre. Jamais `git push --force`, jamais de réécriture d'historique, jamais de suppression de branche non mergée.
- Aucune nouvelle dépendance : tout est installé en phase 0. Si une dépendance manque vraiment, la décrire dans le rapport final.
- Chaque sous-agent commence par `pnpm install --frozen-lockfile` dans son worktree (un worktree ne contient pas `node_modules`).
- Chaque sous-agent lit `SPEC.md` (sections indiquées) et, s'il fait du visuel, ouvre les images de `docs/references/` avec Read.
- Rapport final de chaque sous-agent : nom de sa branche (`git branch --show-current`), liste de ses commits (`git log --oneline main..HEAD`), ce qui est fait, ce qui reste, changements nécessaires hors de son périmètre.

### 10.2 Phase 0 — Socle (agent principal, sur `main`)

1. Vérifier que `.claude/settings.json` contient `worktree.baseRef: "head"` et que le dépôt a au moins un commit. Créer `.gitignore` : `node_modules/`, `dist/`, `.claude/worktrees/`, `test-results/`, `playwright-report/`, `*.local`.
2. Générer le projet Vite `vue-ts` dans un **dossier temporaire** (create-vite est interactif dans un dossier non vide), puis copier les fichiers à la racine sans écraser `SPEC.md` ni `docs/`.
3. Installer **toutes** les dépendances de la section 4 avec pnpm ; écrire les scripts.
4. Écrire : `src/types/content.ts` (section 6), `src/styles/tokens.css` (section 5.3), `vitest.config.ts` (environnement `jsdom`), `playwright.config.ts` (chromium, `devices['iPhone 13']` avec `browserName: 'chromium'`, `webServer: pnpm build && pnpm preview`, `baseURL: http://localhost:4173`), `src/router/index.ts` (toutes les routes de la section 8, vues en lazy import).
5. Créer des **stubs typés** pour chaque fichier de chaque périmètre, pour que tout compile dès maintenant et que les agents travaillent en parallèle sans se bloquer : chaque vue (`<template><main>NomView</main></template>`), `AppShell` et `BottomNav` minimaux, `src/data/index.ts` exportant des tableaux typés vides, signatures des moteurs avec une implémentation triviale, stores vides, `CoupeTransversale` qui affiche un cercle.
6. `src/main.ts` (Pinia, router, imports `tokens.css`, `fonts.css`, `base.css`), `src/App.vue` (`<AppShell><RouterView /></AppShell>`), `docs/DECISIONS.md` vide, `CLAUDE.md` court (résumé des règles 10.1 et de la propriété des fichiers).
7. Vérifier `pnpm typecheck && pnpm test && pnpm build`.
8. Commit `chore(socle): Vue 3, Vite, TS, types, tokens, routes et stubs` puis tag `socle`.

### 10.3 Phase 1 — Fondations parallèles (5 sous-agents en worktree, lancés **dans un même message**)

Lance chaque sous-agent avec l'outil Agent et **isolation worktree** (`isolation: "worktree"`). Prompt de chaque agent : son nom, « lis SPEC.md, sections X », son périmètre exact (section 4), ses commits (ci-dessous), les règles 10.1.

**A — design-system** (sections 5, 8 pour le contexte)
1. `feat(design): polices auto-hébergées et typographie de base`
2. `feat(design): papier millimétré, croix et règles de coordonnées`
3. `feat(design): planche à coordonnées et titres verticaux`
4. `feat(design): mot-symbole pixel et révélation en escalier`
5. `feat(design): tuiles, choix, échelles de propriété, panneaux, étiquettes`
6. `feat(design): gabarit d'app et navigation basse avec safe areas`

**B — contenu** (sections 6, 7)
1. `feat(contenu): critères d'identification et protocoles de test`
2. `feat(contenu): propriétés et essences`
3. `feat(contenu): défis et registre`
4. `feat(contenu): scénario de démonstration`
5. `test(contenu): intégrité des données` — chaque essence couvre les 8 critères et les 10 propriétés ; toutes les options référencées existent ; chaque défi ne référence que des propriétés et des essences existantes ; chaque entrée du registre avec `essenceId` pointe vers une essence `registre: true` ; coordonnées uniques.

**C — logique** (sections 6, 7.7, 9.1, 9.2, 9.3)
1. `feat(moteur): identification par clé à accès multiple`
2. `test(moteur): scénario frêne, pin, forsythia, if` (dont le comportement exact de la section 7.7)
3. `feat(moteur): évaluation des défis`
4. `test(moteur): matrice des verdicts` (tableau de la section 9.2, cas par cas)
5. `feat(store): carnet persistant hors ligne, export et import`
6. `feat(store): pilote du mode démo`

Pour ses tests, l'agent C utilise des fixtures recopiées de la section 7 (le contenu réel arrive au merge) ; après le merge, l'agent principal bascule les tests sur `src/data`.

**D — pwa-deploy** (sections 2, 9.5, 9.6)
1. `feat(pwa): logo et génération des icônes`
2. `feat(pwa): service worker, manifest et balises iOS`
3. `feat(deploy): Dockerfile et nginx pour Coolify`
4. `feat(outils): script de traitement des photos`
5. `docs: README développement, déploiement et installation iPhone`

**E — illustrations** (sections 5, 9.4)
1. `feat(illustrations): coupes transversales des cinq essences`
2. `feat(illustrations): zones interactives et légendes de la coupe`
3. `feat(illustrations): silhouettes de repli et pictogrammes de tests`

**Merge de phase 1** (agent principal) : pour chaque branche retournée, `git merge --no-ff <branche> -m "merge: <agent>"`, dans l'ordre B, C, E, A, D. Résoudre les conflits en respectant la propriété des fichiers. Appliquer les changements hors périmètre signalés dans les rapports. Basculer les tests de C sur `src/data`. Vérifier `pnpm typecheck && pnpm test && pnpm build`. Commit `chore: intégration de la phase 1` si nécessaire, puis tag `phase-1`.

### 10.4 Phase 2 — Écrans parallèles (3 sous-agents en worktree, lancés **dans un même message**)

Les worktrees partent du `main` mergé (grâce à `baseRef: "head"`). Chaque agent n'utilise que les composants, données et moteurs existants ; un besoin de composant générique est construit localement dans `src/components/screens/<son-domaine>/` et signalé dans le rapport.

**F — observer-identifier** (sections 5, 8.1–8.3)
1. `feat(ecrans): accueil`
2. `feat(ecrans): observer et fiches de test`
3. `feat(ecrans): calcul de densité`
4. `feat(ecrans): identification et meilleur test suivant`

**G — comprendre-deduire** (sections 5, 8.4–8.7)
1. `feat(ecrans): atlas sur planche à coordonnées`
2. `feat(ecrans): fiche essence et coupe interactive`
3. `feat(ecrans): défis, justification et verdict`
4. `feat(ecrans): révélation des usages et registre`

**H — carnet-demo** (sections 5, 8.8–8.10)
1. `feat(ecrans): carnet et fiche spécimen`
2. `feat(ecrans): photos, export et import`
3. `feat(ecrans): mode démo et barre présentateur`
4. `feat(ecrans): styleguide`

**Merge de phase 2** : ordre F, G, H, mêmes règles qu'en phase 1, puis tag `phase-2`.

### 10.5 Phase 3 — Intégration et vérification (agent principal)

1. `pnpm typecheck && pnpm test && pnpm build` : tout passe.
2. Écrire `tests/e2e/` (Playwright) :
   - chaque route se charge sans erreur console et capture `docs/screens/<route>.png` au format iPhone 13 ;
   - **hors ligne** : charger `/`, attendre `navigator.serviceWorker.ready`, recharger, puis `context.setOffline(true)`, naviguer vers `/atlas/frene`, `/defis/arc-simple`, `/demo` : le contenu s'affiche ;
   - **démo** : parcourir les 13 étapes de `/demo` et vérifier les textes clés (« Proposition : Frêne commun », « Ton choix tient », panneau du registre à l'étape `if`).
   Si l'installation des navigateurs Playwright échoue sur la machine, consigner la raison dans `docs/DECISIONS.md` et faire la vérification manuelle équivalente avec `pnpm preview`.
3. Commit `test(e2e): parcours, hors ligne et démo`.
4. **Revue visuelle** : ouvre avec Read les deux références et les captures. Liste les écarts (grille, coordonnées, croix, typographie, révélation en escalier, débordement des visuels, vermillon réservé au registre). Corrige. Commit `style: alignement sur les références visuelles`.
5. **Revue indépendante** : lance un sous-agent de relecture **sans worktree et sans droit d'écriture**, qui n'a pas vu le travail. Prompt : « Lis SPEC.md, section 11. Vérifie chaque point dans le code et les captures de docs/screens. Rends une liste : point, conforme ou non, preuve. » Corrige chaque non-conformité. Commit `fix: retours de revue`.
6. Relecture du français de toute l'interface (accents, typographie française : espaces avant `: ; ? !`, guillemets « »). Commit `fix(contenu): relecture du français`.
7. Tag `v0.9-demo`.

### 10.6 Phase 4 — Livraison

- Si un remote `origin` existe : `git push origin main --tags`. Sinon, ne crée pas de remote : indique la commande dans le rapport.
- Supprimer les worktrees de sous-agents entièrement mergés (`git worktree remove`), jamais ceux qui contiennent du travail non mergé.

### 10.7 Phase P2 (seulement si tout ce qui précède est terminé et vert)

- Simulation 2D de flexion sur la fiche essence : une latte qui fléchit sous une charge croissante, rigidité et point de rupture **dérivés des notes 1–5** (élasticité, ténacité), avec la mention explicite « illustration qualitative ». Commit `feat(p2): simulation qualitative de flexion`.
- Écrans de démarrage iOS. Commit `feat(p2): écrans de démarrage iOS`.

### 10.8 Si l'isolation worktree des sous-agents échoue

Créer les worktrees à la main (`git worktree add .claude/worktrees/<agent> -b agent/<agent>`), lancer les sous-agents en leur indiquant ce chemin comme seul dossier de travail, et garder exactement le même découpage, les mêmes commits et les mêmes merges.

---

## 11. Définition de terminé (checklist de la revue)

1. Aucune requête réseau à l'exécution hors origine de l'app (polices locales, aucun CDN).
2. L'app fonctionne hors ligne après une première visite : routes, polices, illustrations.
3. Manifest valide, icônes présentes dont `apple-touch-icon-180x180.png`, balises iOS présentes, safe areas respectées, aucun champ sous 16 px.
4. `docker build .` réussit et l'image sert l'app sur le port 80 avec repli SPA.
5. Le parcours démo complet (section 8.9) s'enchaîne sans erreur, avec l'état injecté de façon visible.
6. Le moteur d'identification produit exactement le comportement de la section 7.7 ; la matrice des verdicts de la section 9.2 est couverte par des tests qui passent.
7. Les usages traditionnels ne sont jamais visibles avant un défi ou une révélation confirmée.
8. Aucune densité ni position d'essence n'est affichée sur la règle de densité de l'écran Observer.
9. Le mot « certain » n'apparaît nulle part dans l'interface.
10. Le vermillon n'est utilisé que pour le registre et les actions destructrices.
11. Papier millimétré avec croix sur les écrans d'action ; planches à coordonnées sur les écrans de savoir ; titres verticaux ; révélations en escalier ; visuels qui débordent sur l'accueil.
12. Aucun texte, nom, logo ou image provenant des références n'apparaît dans l'app.
13. Toute l'interface est en français correct, au tutoiement.
14. `prefers-reduced-motion` désactive toutes les animations.
15. Tous les commits de la section 10 existent avec leurs messages ; les tags `socle`, `phase-1`, `phase-2`, `v0.9-demo` existent.

---

## 12. Rapport final (dernier message de l'agent principal)

En français, court :
- ce qui est fait (P0, P1, P2) ;
- résultat de la checklist de la section 11, point par point ;
- commandes pour lancer en local et pour déployer sur Coolify ;
- comment installer sur iPhone ;
- comment ajouter les photos des vrais morceaux de bois ;
- ce qui reste ou a été décidé autrement (renvoi à `docs/DECISIONS.md`).
