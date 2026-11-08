<template>
  <div class="soupeser">
    <!-- Quatre champs numériques (≥ 16 px pour éviter le zoom iOS). -->
    <div class="soupeser__champs">
      <label class="soupeser__champ">
        <span class="soupeser__label t-label">Longueur (cm)</span>
        <input
          v-model.number="longueur"
          class="soupeser__input"
          type="number"
          inputmode="decimal"
          min="0"
          step="0.1"
        />
      </label>
      <label class="soupeser__champ">
        <span class="soupeser__label t-label">Largeur (cm)</span>
        <input
          v-model.number="largeur"
          class="soupeser__input"
          type="number"
          inputmode="decimal"
          min="0"
          step="0.1"
        />
      </label>
      <label class="soupeser__champ">
        <span class="soupeser__label t-label">Épaisseur (cm)</span>
        <input
          v-model.number="epaisseur"
          class="soupeser__input"
          type="number"
          inputmode="decimal"
          min="0"
          step="0.1"
        />
      </label>
      <label class="soupeser__champ">
        <span class="soupeser__label t-label">Masse (g)</span>
        <input
          v-model.number="masse"
          class="soupeser__input"
          type="number"
          inputmode="decimal"
          min="0"
          step="1"
        />
      </label>
    </div>

    <!-- Règle de densité (placée en commit 3). -->
    <DensityRuler v-if="densiteValide !== null" :densite="densiteValide" />
    <p v-else class="soupeser__attente t-mono">
      Saisis les quatre valeurs : la densité se calcule toute seule.
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * SoupeserFiche (§8.2) — quatre champs numériques, calcul de densité.
 * La catégorie (léger / moyen / lourd) est renvoyée au parent pour alimenter
 * answers.masse. Les mesures complètes sont renvoyées pour le store.
 * Les essences ne sont jamais placées sur la règle : ce serait donner la réponse.
 */
import { computed, ref, watch } from 'vue'
import type { Mesures } from '@/types/content'
import { categorieMasse, densite } from '@/engine/identification'
import DensityRuler from './DensityRuler.vue'

const props = defineProps<{ mesures?: Mesures }>()
const emit = defineEmits<{ mesures: [Mesures]; categorie: [string] }>()

const longueur = ref<number | undefined>(props.mesures?.longueur)
const largeur = ref<number | undefined>(props.mesures?.largeur)
const epaisseur = ref<number | undefined>(props.mesures?.epaisseur)
const masse = ref<number | undefined>(props.mesures?.masse)

// Reflète les mesures injectées (mode démo) si elles changent.
watch(
  () => props.mesures,
  (m) => {
    if (!m) return
    longueur.value = m.longueur
    largeur.value = m.largeur
    epaisseur.value = m.epaisseur
    masse.value = m.masse
  },
)

const mesuresCompletes = computed<Mesures | null>(() => {
  const l = longueur.value
  const la = largeur.value
  const e = epaisseur.value
  const m = masse.value
  if (
    typeof l === 'number' && l > 0 &&
    typeof la === 'number' && la > 0 &&
    typeof e === 'number' && e > 0 &&
    typeof m === 'number' && m > 0
  ) {
    return { longueur: l, largeur: la, epaisseur: e, masse: m }
  }
  return null
})

const densiteValide = computed<number | null>(() =>
  mesuresCompletes.value ? densite(mesuresCompletes.value) : null,
)

// Remonte mesures + catégorie dès qu'elles sont complètes.
watch(mesuresCompletes, (m) => {
  if (!m) return
  emit('mesures', m)
  emit('categorie', categorieMasse(densite(m)))
})
</script>

<style scoped>
.soupeser {
  display: flex;
  flex-direction: column;
  gap: var(--cell);
}

.soupeser__champs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--minor);
}

.soupeser__champ {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
}

.soupeser__label {
  color: var(--ink-2);
}

.soupeser__input {
  width: 100%;
  min-height: 44px;
  padding: 0 var(--minor);
  /* 16 px minimum : sinon iOS zoome au focus. */
  font-size: var(--fs-input);
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--paper-raised);
  border: var(--line) solid var(--ink);
}

.soupeser__attente {
  margin: 0;
  color: var(--ink-3);
}
</style>
