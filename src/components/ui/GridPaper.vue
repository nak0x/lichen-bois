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
  /* Couvre toute la page, y compris si le contenu est court (mobile compris). */
  min-height: 100%;
  background-color: var(--paper);
  /* Opacité réduite : lignes plus discrètes (alpha abaissé). */
  background-image:
    /* lignes majeures (encre taupe) */
    linear-gradient(to right, rgba(169, 151, 138, 0.45) var(--line), transparent var(--line)),
    linear-gradient(to bottom, rgba(169, 151, 138, 0.45) var(--line), transparent var(--line)),
    /* lignes mineures */
    linear-gradient(to right, rgba(216, 206, 197, 0.4) var(--line), transparent var(--line)),
    linear-gradient(to bottom, rgba(216, 206, 197, 0.4) var(--line), transparent var(--line));
  background-size:
    var(--cell) var(--cell),
    var(--cell) var(--cell),
    var(--minor) var(--minor),
    var(--minor) var(--minor);
  /* La grille est calée sur la marge gauche/haut et se répète sur toute la surface. */
  background-repeat: repeat;
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
