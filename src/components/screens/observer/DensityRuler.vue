<template>
  <!-- Règle de densité (détaillée en commit 3). -->
  <div class="ruler">
    <p class="ruler__valeur t-mono">Densité : {{ densite.toFixed(2).replace('.', ',') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * DensityRuler (§8.2) — règle horizontale de densité, 0,3 → 0,9.
 * Les essences n'y figurent jamais : ce serait donner la réponse.
 */
defineProps<{ densite: number }>()
</script>

<style scoped>
.ruler__valeur {
  margin: 0;
  color: var(--ink);
}
</style>
