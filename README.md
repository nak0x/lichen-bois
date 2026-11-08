# Lichen — Module Bois

Application web progressive (PWA) pour identifier les bois et comprendre leurs propriétés.
100 % statique, fonctionne hors ligne, installable sur iPhone.

---

## Développement local

### Prérequis

- Node.js 22+
- pnpm (`corepack enable pnpm`)

### Lancer l'app

```bash
pnpm install
pnpm dev
```

L'app est disponible sur `http://localhost:5173`.

### Autres commandes

```bash
pnpm build        # Build de production (TypeScript + Vite + service worker)
pnpm preview      # Prévisualiser le build (http://localhost:4173)
pnpm typecheck    # Vérification des types TypeScript
pnpm test         # Tests unitaires (Vitest)
pnpm test:e2e     # Tests end-to-end (Playwright)
pnpm images       # Traiter les photos brutes (voir ci-dessous)
```

---

## Déploiement sur Coolify

1. Dans Coolify, crée une **nouvelle ressource** depuis ton dépôt Git.
2. Sélectionne le build pack **Dockerfile**.
3. Port exposé : **80**.
4. Active HTTPS (Let's Encrypt) depuis les paramètres du domaine — le service worker exige HTTPS.
5. Lance le déploiement : Coolify exécute le Dockerfile, qui construit l'app puis la sert avec nginx.

Le Dockerfile est un build multi-étapes : Node 22 pour la compilation, nginx 1.27 pour le service.
Chaque déploiement produit une image autonome, sans dépendance réseau à l'exécution.

---

## Installer l'app sur iPhone

1. Ouvre l'URL de l'app dans **Safari** (pas Chrome ni Firefox).
2. Appuie sur le bouton **Partager** (icône carré avec flèche vers le haut).
3. Fais défiler et choisis **« Sur l'écran d'accueil »**.
4. Valide le nom « Lichen » et appuie sur **Ajouter**.
5. **Important** : ouvre l'app une première fois en ligne et attends quelques secondes
   que le service worker mette tout en cache. L'app fonctionnera ensuite hors ligne.

---

## Ajouter les photos des vrais morceaux de bois

Les photos brutes (pièce entière, coupe transversale, écorce) se placent dans `assets-src/`.

### Structure recommandée

```
assets-src/
  frene/
    piece.jpg
    coupe.jpg
    ecorce.jpg
  pin-sylvestre/
    piece.jpg
    coupe.jpg
  noisetier/
    piece.jpg
  ...
```

### Traitement

```bash
pnpm images
```

Le script convertit chaque photo en WebP (1200 px max, qualité 80) et l'écrit dans `public/img/`
en conservant l'arborescence.

### Déclaration dans les données

Ouvre `src/data/essences.ts` et renseigne le champ `photos` de chaque essence :

```ts
photos: {
  piece: '/img/frene/piece.webp',
  coupe: '/img/frene/coupe.webp',
  ecorce: '/img/frene/ecorce.webp',
}
```

Les photos s'affichent alors dans la fiche essence et les fiches de test via le composant `Cutout`.
Si une photo est absente, l'illustration SVG de repli s'affiche automatiquement.
