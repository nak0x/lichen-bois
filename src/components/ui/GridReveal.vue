<template>
  <div class="reveal" :style="rootStyle">
    <div class="reveal__content">
      <slot />
    </div>
    <div class="reveal__overlay" aria-hidden="true">
      <div
        v-for="c in overlayCells"
        :key="c.key"
        class="reveal__cell"
        :class="{ 'reveal__cell--gone': gone && !c.masked, 'reveal__cell--mask': c.masked }"
        :style="{
          gridColumn: c.col + 1,
          gridRow: c.row + 1,
          transitionDelay: c.masked ? '0ms' : `${c.delay}ms`,
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * GridReveal — révélation en escalier (réf. B).
 * Superpose une grille de cellules couleur fond (mêmes lignes que le fond)
 * qui disparaissent une à une, en ordre de distance à une cellule « graine »,
 * avec un délai --t-cell par palier (plafonné à 900 ms au total).
 * Prop mask : cellules qui restent couvertes à la fin (silhouette en escalier).
 * prefers-reduced-motion : tout révélé instantanément.
 */
import { computed, onMounted, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { cellKey, manhattan, type Cell } from './grid'

const props = withDefaults(
  defineProps<{
    cols: number
    rows: number
    /** Cellule graine d'où part la révélation. */
    seed?: Cell
    /** Cellules qui restent couvertes définitivement (silhouette). */
    mask?: Cell[]
    /** Couleur des cellules de couverture (fond papier/planche). */
    cover?: string
    /** Démarre immédiatement masqué puis révèle (true) ou reste révélé. */
    play?: boolean
  }>(),
  {
    seed: () => [0, 0] as Cell,
    mask: () => [],
    cover: 'var(--paper)',
    play: true,
  },
)

const TOTAL_CAP = 900
const gone = ref(false)

const maskSet = computed(() => {
  const s = new Set<string>()
  for (const [c, r] of props.mask) s.add(cellKey(c, r))
  return s
})

const maxDist = computed(() => {
  // Distance maximale pour normaliser le délai sous le plafond de 900 ms.
  const corners: Cell[] = [
    [0, 0],
    [props.cols - 1, 0],
    [0, props.rows - 1],
    [props.cols - 1, props.rows - 1],
  ]
  return Math.max(1, ...corners.map((c) => manhattan(c, props.seed)))
})

const overlayCells = computed(() => {
  const cells: { key: string; col: number; row: number; masked: boolean; delay: number }[] = []
  const perStep = Math.min(28, TOTAL_CAP / maxDist.value)
  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols; c++) {
      const dist = manhattan([c, r], props.seed)
      cells.push({
        key: cellKey(c, r),
        col: c,
        row: r,
        masked: maskSet.value.has(cellKey(c, r)),
        delay: Math.round(dist * perStep),
      })
    }
  }
  return cells
})

const rootStyle = computed<CSSProperties>(() => ({
  '--reveal-cols': String(props.cols),
  '--reveal-rows': String(props.rows),
  '--reveal-cover': props.cover,
}))

onMounted(() => {
  if (!props.play) {
    gone.value = false
    return
  }
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    gone.value = true
    return
  }
  // Déclenche la transition au tick suivant pour partir de l'état couvert.
  requestAnimationFrame(() => {
    gone.value = true
  })
})
</script>

<style scoped>
.reveal {
  position: relative;
}

.reveal__content {
  position: relative;
}

.reveal__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(var(--reveal-cols), 1fr);
  grid-template-rows: repeat(var(--reveal-rows), 1fr);
  pointer-events: none;
}

.reveal__cell {
  background: var(--reveal-cover);
  /* Lignes de grille pour fondre avec le fond millimétré. */
  border-right: var(--line) solid color-mix(in srgb, var(--grid-minor) 60%, transparent);
  border-bottom: var(--line) solid color-mix(in srgb, var(--grid-minor) 60%, transparent);
  opacity: 1;
}

.reveal__cell--gone {
  opacity: 0;
}

.reveal__cell--mask {
  /* Reste couvert : silhouette en escalier définitive. */
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .reveal__cell {
    transition: opacity var(--t-cell, 28ms) linear;
  }
}
</style>
