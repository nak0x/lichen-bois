<template>
  <div class="vlabel">
    <span class="vlabel__title">{{ title }}</span>
    <span v-if="subtitle" class="vlabel__subtitle">{{ subtitle }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * VerticalLabel — titre vertical dans la marge droite (réf. A).
 * Major Mono Display pour le titre, + sous-titre vertical fin en mono.
 */
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.vlabel {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.4em;
  writing-mode: vertical-rl;
}

.vlabel__title {
  font-family: var(--font-vertical);
  font-weight: 400;
  font-size: var(--fs-vertical);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--ink);
}

.vlabel__subtitle {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: var(--fs-label);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-2);
}
</style>
