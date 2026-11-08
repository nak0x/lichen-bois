<template>
  <div class="cutout" :style="rootStyle">
    <img
      v-if="src && !failed"
      class="cutout__img"
      :src="src"
      :alt="alt"
      :style="offsetStyle"
      @error="failed = true"
    />
    <div v-else class="cutout__fallback" :style="offsetStyle">
      <slot>
        <!-- Repli par défaut si aucune illustration fournie. -->
        <span class="cutout__placeholder" :aria-label="alt" role="img" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Cutout — photo détourée à fond transparent (réf. A).
 * Peut déborder du conteneur (overflow visible). Décalage en props (dx/dy,
 * en unités de cellule). Si l'image manque, affiche le slot de repli
 * (illustration SVG fournie par l'appelant).
 */
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    /** Décalage horizontal/vertical en cellules (déborde si hors cadre). */
    dx?: number
    dy?: number
    /** Largeur en cellules (facultatif). */
    cols?: number
  }>(),
  { alt: '', dx: 0, dy: 0 },
)

const failed = ref(false)

const rootStyle = computed<CSSProperties>(() =>
  props.cols ? { width: `calc(${props.cols} * var(--cell))` } : {},
)

const offsetStyle = computed<CSSProperties>(() => ({
  transform: `translate(calc(${props.dx} * var(--cell)), calc(${props.dy} * var(--cell)))`,
}))
</script>

<style scoped>
.cutout {
  position: relative;
  overflow: visible;
}

.cutout__img,
.cutout__fallback {
  display: block;
  width: 100%;
  height: auto;
}

.cutout__placeholder {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  border: var(--line) dashed var(--ink-3);
}
</style>
