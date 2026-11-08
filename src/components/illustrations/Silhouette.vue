<template>
  <svg
    class="silhouette"
    :viewBox="`0 0 ${VB} ${VB}`"
    role="img"
    :aria-label="ariaLabel"
    preserveAspectRatio="xMidYMid meet"
  >
    <!-- Rondelle : une bûche vue de bout, cernes concentriques. -->
    <g v-if="forme === 'rondelle'" class="silhouette__g">
      <circle :cx="C" :cy="C" r="42" fill="var(--sil-fill)" stroke="var(--ink)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <circle :cx="C" :cy="C" r="42" fill="none" stroke="var(--ink)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <circle :cx="C" :cy="C" r="32" fill="none" stroke="var(--ink-3)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <circle :cx="C" :cy="C" r="22" fill="none" stroke="var(--ink-3)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <circle :cx="C" :cy="C" r="12" fill="none" stroke="var(--ink-3)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <circle :cx="C" :cy="C" r="2" fill="var(--ink)" />
    </g>

    <!-- Latte : une planchette longue et droite, fil marqué. -->
    <g v-else-if="forme === 'latte'" class="silhouette__g">
      <rect x="14" y="6" width="22" height="88" fill="var(--sil-fill)" stroke="var(--ink)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <line x1="21" y1="8" x2="21" y2="92" stroke="var(--ink-3)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <line x1="28" y1="8" x2="28" y2="92" stroke="var(--ink-3)" stroke-width="1" vector-effect="non-scaling-stroke" />
    </g>

    <!-- Tige : une tige droite, légèrement conique, avec un nœud. -->
    <g v-else-if="forme === 'tige'" class="silhouette__g">
      <path
        d="M44 6 L54 6 L52 94 L46 94 Z"
        fill="var(--sil-fill)"
        stroke="var(--ink)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <line x1="44" y1="40" x2="54" y2="40" stroke="var(--ink-3)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <line x1="45" y1="68" x2="53" y2="68" stroke="var(--ink-3)" stroke-width="1" vector-effect="non-scaling-stroke" />
    </g>

    <!-- Rameau d'aiguilles : une branche avec aiguilles en épi. -->
    <g v-else class="silhouette__g">
      <path
        d="M22 92 Q40 60 78 14"
        fill="none"
        stroke="var(--ink)"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
        stroke-linecap="round"
      />
      <g stroke="var(--ink-2)" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round">
        <template v-for="(a, i) in aiguilles" :key="i">
          <line :x1="a.x" :y1="a.y" :x2="a.x1" :y2="a.y1" />
          <line :x1="a.x" :y1="a.y" :x2="a.x2" :y2="a.y2" />
        </template>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type SilhouetteForme = 'rondelle' | 'latte' | 'tige' | 'rameau-aiguilles'

const props = withDefaults(defineProps<{ forme?: SilhouetteForme }>(), {
  forme: 'rondelle',
})

const VB = 100
const C = 50
const forme = computed(() => props.forme)

const libelles: Record<SilhouetteForme, string> = {
  rondelle: 'Rondelle de bois',
  latte: 'Latte de bois',
  tige: 'Tige droite',
  'rameau-aiguilles': "Rameau d'aiguilles",
}
const ariaLabel = computed(() => libelles[props.forme])

// Aiguilles réparties le long de la branche, par paires divergentes.
const aiguilles = computed(() => {
  const out: { x: number; y: number; x1: number; y1: number; x2: number; y2: number }[] = []
  const nb = 9
  for (let i = 1; i <= nb; i++) {
    const t = i / (nb + 1)
    // Point sur la courbe quadratique de la branche.
    const mt = 1 - t
    const x = mt * mt * 22 + 2 * mt * t * 40 + t * t * 78
    const y = mt * mt * 92 + 2 * mt * t * 60 + t * t * 14
    const len = 11
    out.push({
      x,
      y,
      x1: x - len,
      y1: y - len * 0.2,
      x2: x - len * 0.2,
      y2: y - len,
    })
  }
  return out
})
</script>

<style scoped>
.silhouette {
  --sil-fill: #d8c7ad;
  display: block;
  width: 100%;
  height: auto;
  color: var(--ink);
}
</style>
