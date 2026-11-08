<template>
  <div class="crosshairs" aria-hidden="true">
    <svg
      v-for="(c, i) in cells"
      :key="i"
      class="crosshairs__mark"
      :style="markStyle(c)"
      width="12"
      height="12"
      viewBox="0 0 12 12"
    >
      <path d="M6 1 V11 M1 6 H11" :stroke="color" stroke-width="1.5" />
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * Crosshairs — petites croix « + » brun foncé posées sur des intersections
 * majeures de la grille (réf. A). Props : cells = [col, row][] (indices de
 * lignes majeures). SVG 12 px, trait 1,5 px, couleur --cross par défaut.
 */
import type { CSSProperties } from 'vue'
import type { Cell } from './grid'

const props = withDefaults(
  defineProps<{
    cells: Cell[]
    color?: string
  }>(),
  { color: 'var(--cross)' },
)

function markStyle([col, row]: Cell): CSSProperties {
  // Centre la croix (12 px) sur l'intersection col/row.
  return {
    left: `calc(var(--margin) + ${col} * var(--cell) - 6px)`,
    top: `calc(${row} * var(--cell) - 6px)`,
  }
}

defineExpose({ cells: props.cells })
</script>

<style scoped>
.crosshairs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crosshairs__mark {
  position: absolute;
  overflow: visible;
}
</style>
