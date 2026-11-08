<template>
  <svg
    class="wordmark"
    :viewBox="`0 0 ${word_.width} ${word_.height}`"
    :style="{ width: `calc(${word_.width} * var(--px))`, height: `calc(${word_.height} * var(--px))` }"
    :aria-label="word"
    role="img"
  >
    <rect
      v-for="p in word_.pixels"
      :key="p.order"
      class="wordmark__px"
      :class="{ 'wordmark__px--revealed': !reveal || shown > p.order }"
      :x="p.col"
      :y="p.row"
      width="1"
      height="1"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
/**
 * PixelWordmark — mot-symbole dessiné en pixels 3×5 (réf. B, pas de police
 * externe). Chaque pixel = 1 unité de grille mineure (--px, par défaut --minor).
 * Prop reveal : apparition pixel par pixel. prefers-reduced-motion : tout visible.
 */
import { computed, onMounted, ref } from 'vue'
import { wordPixels } from './pixelfont'

const props = withDefaults(
  defineProps<{
    word?: string
    reveal?: boolean
    color?: string
  }>(),
  { word: 'LICHEN', reveal: false, color: 'var(--ink)' },
)

const word_ = computed(() => wordPixels(props.word))
const shown = ref(props.reveal ? 0 : word_.value.pixels.length)

onMounted(() => {
  if (!props.reveal) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    shown.value = word_.value.pixels.length
    return
  }
  // Révélation progressive : un pixel toutes les ~24 ms.
  const total = word_.value.pixels.length
  const tick = () => {
    shown.value += 1
    if (shown.value < total) requestAnimationFrame(() => setTimeout(tick, 24))
  }
  requestAnimationFrame(() => setTimeout(tick, 24))
})
</script>

<style scoped>
.wordmark {
  --px: var(--minor);
  display: block;
  shape-rendering: crispEdges;
}

.wordmark__px {
  opacity: 0;
}

.wordmark__px--revealed {
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .wordmark__px {
    transition: opacity var(--t-fast) linear;
  }
}
</style>
