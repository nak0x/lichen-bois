<template>
  <ol class="stepper" :aria-label="`Étape ${current} sur ${labels.length}`">
    <li
      v-for="(label, i) in labels"
      :key="i"
      class="stepper__step"
      :class="{
        'stepper__step--active': i + 1 === current,
        'stepper__step--done': i + 1 < current,
      }"
    >
      <span class="stepper__num t-label">{{ i + 1 }}</span>
      <span class="stepper__label t-label">{{ label }}</span>
    </li>
  </ol>
</template>

<script setup lang="ts">
/**
 * Stepper — jalons d'un défi sur la grille (§8.6).
 * Composant local (aucun équivalent générique dans ui/).
 */
defineProps<{
  labels: string[]
  /** Étape courante, 1-indexée. */
  current: number
}>()
</script>

<style scoped>
.stepper {
  list-style: none;
  margin: 0 0 var(--minor);
  padding: 0;
  display: flex;
  gap: 0;
  border: var(--line) solid var(--ink);
}

.stepper__step {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: calc(var(--minor) / 2);
  color: var(--ink-3);
  border-right: var(--line) solid var(--ink);
}

.stepper__step:last-child {
  border-right: none;
}

.stepper__step--active {
  background: var(--moss);
  color: var(--moss-ink);
}

.stepper__step--done {
  color: var(--ink);
}

.stepper__num {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--line) solid currentColor;
}

.stepper__label {
  display: none;
}

@media (min-width: 560px) {
  .stepper__label {
    display: inline;
  }
}
</style>
