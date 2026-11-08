<template>
  <div class="rulers" aria-hidden="true">
    <!-- Chiffres en haut -->
    <div class="rulers__axis rulers__axis--top">
      <span v-for="n in cols" :key="'t' + n" class="rulers__tick t-label">{{ n }}</span>
    </div>
    <!-- Lettres à gauche -->
    <div class="rulers__axis rulers__axis--left">
      <span v-for="(l, i) in letters" :key="'l' + i" class="rulers__tick t-label">{{ l }}</span>
    </div>
    <!-- Côtés bas / droite si demandés -->
    <template v-if="all">
      <div class="rulers__axis rulers__axis--bottom">
        <span v-for="n in cols" :key="'b' + n" class="rulers__tick t-label">{{ n }}</span>
      </div>
      <div class="rulers__axis rulers__axis--right">
        <span v-for="(l, i) in letters" :key="'r' + i" class="rulers__tick t-label">{{ l }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * Rulers — règles de coordonnées (réf. B).
 * Chiffres 1…cols en haut (et en bas si all), lettres A… à gauche
 * (et à droite si all). Alignés sur les lignes majeures, en --fs-label.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    cols: number
    rows: number
    /** Règles aussi en bas et à droite. */
    all?: boolean
  }>(),
  { all: false },
)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const letters = computed(() =>
  Array.from({ length: props.rows }, (_, i) => ALPHABET[i % ALPHABET.length]),
)
</script>

<style scoped>
.rulers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: var(--ruler-color, var(--ink-3));
}

.rulers__axis {
  position: absolute;
  display: grid;
}

/* Chaque tick occupe une cellule et centre son libellé. */
.rulers__tick {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Axes horizontaux : colonnes de --cell. */
.rulers__axis--top,
.rulers__axis--bottom {
  left: var(--ruler-pad);
  right: var(--ruler-pad);
  height: var(--ruler-pad);
  grid-auto-flow: column;
  grid-auto-columns: var(--cell);
}

.rulers__axis--top {
  top: 0;
}

.rulers__axis--bottom {
  bottom: 0;
}

/* Axes verticaux : lignes de --cell. */
.rulers__axis--left,
.rulers__axis--right {
  top: var(--ruler-pad);
  bottom: var(--ruler-pad);
  width: var(--ruler-pad);
  grid-auto-flow: row;
  grid-auto-rows: var(--cell);
}

.rulers__axis--left {
  left: 0;
}

.rulers__axis--right {
  right: 0;
}
</style>
