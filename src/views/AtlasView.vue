<template>
  <div class="atlas">
    <header class="atlas__head">
      <h1 class="atlas__titre">Atlas</h1>
      <p class="atlas__intro t-mono">
        Cinq bois sur la planche. Chaque essence a sa coordonnée. Touche un bloc pour sa fiche.
      </p>
    </header>

    <Plate :cols="cols" :rows="rows">
      <div class="atlas__grille" :style="grilleStyle">
        <AtlasBloc v-for="e in essences" :key="e.id" :essence="e" />
      </div>
    </Plate>
  </div>
</template>

<script setup lang="ts">
/**
 * AtlasView (§8.4) — planche à coordonnées.
 * Chaque essence occupe un bloc à sa coordonnée, avec sa coupe, son nom et
 * son résumé. L'if porte une étiquette vermillon « registre ».
 */
import type { CSSProperties } from 'vue'
import { essences } from '@/data'
import Plate from '@/components/ui/Plate.vue'
import AtlasBloc from '@/components/screens/atlas/AtlasBloc.vue'

// Coordonnées utilisées : B2, B5, E2, E5, H3 → colonnes jusqu'à 7, lignes jusqu'à 10.
const cols = 8
const rows = 10

const grilleStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, var(--cell))`,
  gridAutoRows: 'var(--cell)',
}
</script>

<style scoped>
.atlas__head {
  margin-bottom: var(--minor);
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

/* Permet le défilement horizontal si la planche dépasse l'écran étroit. */
.atlas :deep(.plate) {
  overflow-x: auto;
}
</style>
