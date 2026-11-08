# Lichen · Module Bois — notes de travail

Projet piloté par `SPEC.md` (source de vérité). PWA statique Vue 3 + Vite + TS, 100 % hors
ligne, aucune API, installable iPhone, déployable Coolify. Interface française, tutoiement.

## Règles communes (SPEC §10.1)

- **Commit automatique** à chaque étape symbolique, message exact de la section 10
  (Conventional Commits, français). Avant chaque commit : `pnpm typecheck` et `pnpm test`
  passent pour le périmètre concerné.
- `git add` **uniquement** les fichiers de son périmètre. Jamais `push --force`, jamais de
  réécriture d'historique.
- **Aucune nouvelle dépendance** : tout est installé en phase 0. Si besoin réel, le décrire
  dans le rapport final.
- Chaque sous-agent en worktree commence par `pnpm install --frozen-lockfile`.
- Un agent ne modifie **jamais** un fichier hors de son périmètre ; il décrit les changements
  nécessaires ailleurs dans son rapport final.

## Propriété des fichiers (SPEC §4)

- socle (phase 0) : `package.json`, configs, `src/types/content.ts`, `src/styles/tokens.css`,
  `src/router/index.ts`, `src/main.ts`, `src/App.vue`, stubs.
- A design-system : `src/styles/{fonts,base}.css`, `src/components/ui/**` (dont AppShell, BottomNav).
- B contenu : `src/data/**`.
- C logique : `src/engine/**`, `src/stores/**`.
- D pwa-deploy : `index.html` (head), `vite.config.ts`, `Dockerfile`, `nginx.conf`,
  `.dockerignore`, `pwa-assets.config.ts`, `README.md`, `public/`, `scripts/`.
- E illustrations : `src/components/illustrations/**`.
- F : `src/views/{Accueil,Observer,Identifier}*` + `src/components/screens/{observer,identifier}/**`.
- G : `src/views/{Atlas,Essence,Defis,Defi,Registre}*` + `src/components/screens/{atlas,defis,registre}/**`.
- H : `src/views/{Carnet,Specimen,Demo,Styleguide}*` + `src/components/screens/{carnet,demo}/**`.

## Design

Deux surfaces : **papier** millimétré beige (écrans d'action) et **planche** blanche à
coordonnées (écrans de savoir). Aplat imprimé : aucune ombre, aucun arrondi, filets 1 px.
Vermillon `--signal` réservé au registre et aux actions destructrices. Jamais le mot « certain ».

## Commandes

`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm test` · `pnpm test:e2e`
