<template>
  <RouterLink
    class="atlas-bloc"
    :to="{ name: 'essence', params: { essenceId: essence.id } }"
    :style="style"
  >
    <span class="atlas-bloc__coord t-label">{{ essence.coordonnee }}</span>
    <span v-if="essence.registre" class="atlas-bloc__registre t-label">Registre</span>
    <div class="atlas-bloc__coupe">
      <CoupeTransversale :type="essence.coupe" />
    </div>
    <h2 class="atlas-bloc__nom">{{ essence.nom }}</h2>
    <p class="atlas-bloc__resume t-mono">{{ essence.resume }}</p>
  </RouterLink>
</template>

<script setup lang="ts">
/**
 * AtlasBloc — bloc d'une essence sur la planche Atlas (§8.4).
 * Positionné sur sa coordonnée, il porte la coupe, le nom et le résumé.
 * L'if (registre) porte une étiquette vermillon « registre ».
 */
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { RouterLink } from 'vue-router'
import type { Essence } from '@/types/content'
import CoupeTransversale from '@/components/illustrations/CoupeTransversale.vue'
import { parseCoord } from './coord'

const props = withDefaults(
  defineProps<{
    essence: Essence
    /** Largeur du bloc en cellules. */
    cols?: number
    /** Hauteur du bloc en cellules. */
    rows?: number
  }>(),
  { cols: 3, rows: 3 },
)

const style = computed<CSSProperties>(() => {
  const { col, row } = parseCoord(props.essence.coordonnee)
  return {
    gridColumn: `${col} / span ${props.cols}`,
    gridRow: `${row} / span ${props.rows}`,
  }
})
</script>

<style scoped>
.atlas-bloc {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
  padding: var(--minor);
  text-decoration: none;
  color: var(--ink);
  background: var(--plate);
  border: var(--line) solid var(--ink);
  transition: background var(--t-fast) linear, color var(--t-fast) linear;
  /* Chaque bloc reste contenu dans son emprise de cellules : pas de débordement
     sur les blocs voisins de la planche. */
  overflow: hidden;
}

.atlas-bloc:active {
  background: var(--ink);
  color: var(--paper);
}

.atlas-bloc__coord {
  color: var(--ink-3);
}

.atlas-bloc__registre {
  position: absolute;
  top: var(--minor);
  right: var(--minor);
  padding: 2px 6px;
  color: var(--signal);
  border: var(--line) solid var(--signal);
}

.atlas-bloc__coupe {
  width: 100%;
  max-width: calc(var(--cell) * 2);
  margin: calc(var(--minor) / 2) 0;
}

.atlas-bloc__nom {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h2);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
}

.atlas-bloc:active .atlas-bloc__coord {
  color: var(--paper);
}

.atlas-bloc__resume {
  margin: 0;
  color: var(--ink-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.atlas-bloc:active .atlas-bloc__resume {
  color: var(--paper);
}
</style>
