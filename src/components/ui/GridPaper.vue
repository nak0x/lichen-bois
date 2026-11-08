<template>
  <div class="grid-paper" :class="{ 'grid-paper--raised': raised }">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * GridPaper — fond papier millimétré (réf. A).
 * Lignes mineures tous les --minor, majeures tous les --cell.
 * Le fond défile avec le contenu (background attaché au bloc, pas fixe).
 */
withDefaults(
  defineProps<{
    /** Papier légèrement plus clair (--paper-raised). */
    raised?: boolean
  }>(),
  { raised: false },
)
</script>

<style scoped>
.grid-paper {
  position: relative;
  background-color: var(--paper);
  background-image:
    /* lignes majeures (encre taupe) */
    linear-gradient(to right, var(--grid-major) var(--line), transparent var(--line)),
    linear-gradient(to bottom, var(--grid-major) var(--line), transparent var(--line)),
    /* lignes mineures */
    linear-gradient(to right, var(--grid-minor) var(--line), transparent var(--line)),
    linear-gradient(to bottom, var(--grid-minor) var(--line), transparent var(--line));
  background-size:
    var(--cell) var(--cell),
    var(--cell) var(--cell),
    var(--minor) var(--minor),
    var(--minor) var(--minor);
  /* La grille est calée sur la marge gauche/haut. */
  background-position:
    var(--margin) 0,
    0 0,
    var(--margin) 0,
    0 0;
}

.grid-paper--raised {
  background-color: var(--paper-raised);
}
</style>
