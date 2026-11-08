<template>
  <div class="plate" :class="`plate--${tone}`" :style="{ '--plate-rows': rows }">
    <div class="plate__grid" aria-hidden="true" />
    <Rulers :cols="cols" :rows="rows" :all="rulers === 'all'" />
    <div class="plate__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Plate — planche blanche à coordonnées (réf. B).
 * Fond --plate, grille --plate-grid, règles de coordonnées (Rulers).
 * tone 'signal' : règles et filets en vermillon (registre).
 * rulers 'default' : haut + gauche ; 'all' : + bas + droite.
 */
import { computed } from 'vue'
import Rulers from './Rulers.vue'

const props = withDefaults(
  defineProps<{
    /** Nombre de colonnes de la planche. */
    cols?: number
    /** Nombre de lignes de la planche. */
    rows?: number
    tone?: 'default' | 'signal'
    rulers?: 'default' | 'all'
  }>(),
  { cols: 12, rows: 8, tone: 'default', rulers: 'default' },
)

const cols = computed(() => props.cols)
const rows = computed(() => props.rows)
</script>

<style scoped>
.plate {
  --ruler-pad: calc(var(--cell) / 2);
  --plate-line: var(--plate-grid);
  position: relative;
  background: var(--plate);
  padding: var(--ruler-pad);
  min-height: calc(var(--plate-rows, 8) * var(--cell) + 2 * var(--ruler-pad));
  border: var(--line) solid var(--plate-line);
}

.plate--signal {
  --plate-line: var(--signal);
  --ruler-color: var(--signal);
  color: var(--ink);
}

/* Grille interne de la planche, calée sur la zone de contenu. */
.plate__grid {
  position: absolute;
  inset: var(--ruler-pad);
  pointer-events: none;
  background-image:
    linear-gradient(to right, var(--plate-line) var(--line), transparent var(--line)),
    linear-gradient(to bottom, var(--plate-line) var(--line), transparent var(--line));
  background-size: var(--cell) var(--cell);
  background-position: 0 0;
}

.plate--signal .plate__grid {
  opacity: 0.6;
}

.plate__content {
  position: relative;
}
</style>
