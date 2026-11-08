<template>
  <div class="scale">
    <div class="scale__row">
      <span class="scale__label t-label">{{ label }}</span>
      <span class="scale__squares" :aria-label="`Note ${note} sur 5`" role="img">
        <span
          v-for="i in 5"
          :key="i"
          class="scale__sq"
          :class="{ 'scale__sq--on': i <= note }"
        />
      </span>
      <button
        v-if="hasExplain"
        type="button"
        class="scale__q"
        :aria-expanded="open"
        :aria-label="open ? 'Masquer l\'explication' : 'Afficher l\'explication'"
        @click="open = !open"
      >
        ?
      </button>
    </div>
    <div v-if="hasExplain && open" class="scale__explain t-mono">
      <p v-if="question" class="scale__question">{{ question }}</p>
      <p v-if="explication" class="scale__text">{{ explication }}</p>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PropertyScale — note 1–5 sur la grille mineure.
 * 5 carrés remplis en encre selon la note ; bouton « ? » qui déplie
 * la question et l'explication de la propriété.
 */
import { computed, ref } from 'vue'
import type { Note } from '@/types/content'

const props = defineProps<{
  label: string
  note: Note
  question?: string
  explication?: string
}>()

const open = ref(false)
const hasExplain = computed(() => Boolean(props.question || props.explication))
</script>

<style scoped>
.scale {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
  padding: calc(var(--minor) / 2) 0;
}

.scale__row {
  display: flex;
  align-items: center;
  gap: var(--minor);
}

.scale__label {
  flex: 1 1 auto;
  color: var(--ink);
}

.scale__squares {
  display: inline-flex;
  gap: 3px;
}

.scale__sq {
  width: var(--minor);
  height: var(--minor);
  min-width: 10px;
  min-height: 10px;
  border: var(--line) solid var(--ink);
}

.scale__sq--on {
  background: var(--ink);
}

.scale__q {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-body);
  color: var(--ink);
  border: var(--line) solid var(--ink);
  line-height: 1;
}

.scale__explain {
  color: var(--ink-2);
  padding-left: 2px;
}

.scale__question {
  font-weight: 400;
  color: var(--ink);
  margin: 0 0 0.3em;
}

.scale__text {
  margin: 0;
}
</style>
