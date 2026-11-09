<template>
  <div
    class="ess-cell"
    :class="{ 'ess-cell--exclue': exclue, 'ess-cell--signal': essence.registre }"
  >
    <span class="ess-cell__coord t-label">{{ essence.coordonnee }}</span>
    <div class="ess-cell__coupe" aria-hidden="true">
      <CoupeTransversale :type="essence.coupe" />
    </div>
    <span class="ess-cell__nom">{{ essence.nom }}</span>
    <span v-if="exclue && raison" class="ess-cell__raison t-label">{{ raison }}</span>
    <span v-else-if="essence.registre" class="ess-cell__registre t-label">registre</span>
  </div>
</template>

<script setup lang="ts">
/**
 * EssenceCell (§8.3) — une essence en cellule : coupe miniature + coordonnée.
 * Exclue : contour seul, barrée, raison en --fs-label (« exclu : résine »).
 */
import type { Essence } from '@/types/content'
import CoupeTransversale from '@/components/illustrations/CoupeTransversale.vue'

defineProps<{
  essence: Essence
  exclue?: boolean
  /** Raison d'exclusion déjà formatée (ex. « exclu : résine »). */
  raison?: string
}>()
</script>

<style scoped>
.ess-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
  padding: var(--minor);
  border: var(--line) solid var(--ink);
  background: transparent;
}

.ess-cell__coord {
  color: var(--ink-2);
}

.ess-cell__coupe {
  width: 100%;
}

.ess-cell__nom {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink);
}

.ess-cell__registre {
  color: var(--signal);
}

/* Exclue : contour seul, coupe estompée, nom barré. */
.ess-cell--exclue {
  border-color: var(--ink-3);
}
.ess-cell--exclue .ess-cell__coupe {
  opacity: 0.25;
}
.ess-cell--exclue .ess-cell__nom {
  color: var(--ink-3);
  text-decoration: line-through;
}

.ess-cell__raison {
  color: var(--ink-3);
}

/* Essence du registre encore candidate : contour vermillon. */
.ess-cell--signal:not(.ess-cell--exclue) {
  border-color: var(--signal);
}
</style>
