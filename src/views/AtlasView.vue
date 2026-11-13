<template>
  <div class="atlas">
    <header class="atlas__head">
      <h1 class="atlas__titre">Atlas</h1>
      <p class="atlas__intro t-mono">
        Les bois courants autour d'Annecy. Glisse horizontalement ; touche un bloc pour sa fiche.
      </p>
    </header>

    <Plate :cols="cols" :rows="rows">
      <div class="atlas__grille" role="list">
        <AtlasBloc v-for="e in essencesTriees" :key="e.id" role="listitem" :essence="e" />
      </div>
    </Plate>
  </div>
</template>

<script setup lang="ts">
/**
 * AtlasView (§8.4) — planche à coordonnées.
 * Avec l'ajout des essences d'Annecy, les blocs ne sont plus placés à leur
 * coordonnée exacte (ce serait trop dense) : ils s'écoulent dans une grille
 * responsive, chaque bloc gardant sa coordonnée en étiquette.
 */
import { computed } from 'vue'
import { essences } from '@/data'
import Plate from '@/components/ui/Plate.vue'
import AtlasBloc from '@/components/screens/atlas/AtlasBloc.vue'

// Planche décorative (règles de coordonnées) ; la grille des blocs défile à l'horizontale.
const cols = 6
const rows = 4

// Tri par coordonnée (lettre puis chiffre) pour un ordre de lecture stable.
const essencesTriees = computed(() =>
  [...essences].sort((a, b) => a.coordonnee.localeCompare(b.coordonnee, 'fr', { numeric: true })),
)
</script>

<style scoped>
/* La planche fait 8 colonnes + règles ; sur mobile le --cell du socle (6 col)
   la ferait déborder. On recalcule un --cell local pour que toute la planche
   (règles comprises) tienne dans la largeur disponible. Tout (grille, coupes,
   blocs) se met à l'échelle ensemble puisque Plate et AtlasBloc lisent --cell. */
.atlas {
  --cell: calc((min(100vw, 1280px) - 2 * var(--margin)) / 7);
}

.atlas__head {
  margin-bottom: var(--minor);
}

/* Grille à défilement horizontal : les blocs se rangent en 2 rangées et on
   glisse latéralement, pour limiter le défilement vertical sur mobile. */
.atlas__grille {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, 1fr);
  grid-auto-columns: calc(3 * var(--cell));
  gap: var(--minor);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  padding-bottom: calc(var(--minor) / 2);
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.atlas__grille > * {
  scroll-snap-align: start;
}

@media (min-width: 900px) {
  /* Plus de hauteur disponible : trois rangées. */
  .atlas__grille {
    grid-template-rows: repeat(3, 1fr);
    grid-auto-columns: calc(2 * var(--cell));
  }
}

.atlas__titre {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
}

.atlas__intro {
  margin: calc(var(--minor) / 2) 0 0;
  color: var(--ink-2);
  max-width: 48ch;
}

/* Garde-fou : si la planche dépasse malgré tout, on peut la faire défiler. */
.atlas :deep(.plate) {
  overflow-x: auto;
}
</style>
