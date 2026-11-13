<template>
  <div class="atlas">
    <header class="atlas__head">
      <h1 class="atlas__titre">Atlas</h1>
      <p class="atlas__intro t-mono">
        Les bois courants autour d'Annecy. Chaque essence porte sa coordonnée ; touche un bloc pour sa fiche.
      </p>
    </header>

    <Plate :cols="cols" :rows="rows">
      <div class="atlas__grille">
        <AtlasBloc v-for="e in essencesTriees" :key="e.id" :essence="e" />
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

// Planche décorative (règles de coordonnées) ; la grille des blocs est responsive.
const cols = 6
const rows = 12

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

/* Grille responsive des blocs : s'écoule et se répartit selon la largeur. */
.atlas__grille {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--minor);
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
