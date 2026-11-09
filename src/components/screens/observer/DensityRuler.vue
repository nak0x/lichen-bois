<template>
  <figure class="ruler">
    <figcaption class="ruler__valeur">
      <span class="ruler__valeur-label t-label">Densité</span>
      <span class="ruler__valeur-nombre">{{ densiteFr }}</span>
      <span class="ruler__categorie t-label" :aria-label="`Catégorie : ${categorieFr}`">
        {{ categorieFr }}
      </span>
    </figcaption>

    <!-- Règle graduée de 0,3 à 0,9, bandes léger / moyen / lourd. -->
    <div class="ruler__piste" role="img" :aria-label="`Densité ${densiteFr}, ${categorieFr}`">
      <!-- Bandes de catégorie (aplats sobres, sans aucune essence placée dessus). -->
      <div class="ruler__bandes" aria-hidden="true">
        <span class="ruler__bande ruler__bande--leger" :style="{ width: largeur(MIN, SEUILS.legerMax) }">
          <span class="ruler__bande-nom t-label">Léger</span>
        </span>
        <span class="ruler__bande ruler__bande--moyen" :style="{ width: largeur(SEUILS.legerMax, SEUILS.moyenMax) }">
          <span class="ruler__bande-nom t-label">Moyen</span>
        </span>
        <span class="ruler__bande ruler__bande--lourd" :style="{ width: largeur(SEUILS.moyenMax, MAX) }">
          <span class="ruler__bande-nom t-label">Lourd</span>
        </span>
      </div>

      <!-- Graduations tous les 0,1. -->
      <div class="ruler__graduations" aria-hidden="true">
        <span
          v-for="g in graduations"
          :key="g"
          class="ruler__grad"
          :style="{ left: position(g) }"
        >
          <span class="ruler__grad-trait" />
          <span class="ruler__grad-nombre t-label">{{ fr(g) }}</span>
        </span>
      </div>

      <!-- Repère de la mesure (débordements bornés aux extrémités). -->
      <span class="ruler__curseur" :style="{ left: position(densiteBornee) }" aria-hidden="true">
        <span class="ruler__curseur-trait" />
      </span>
    </div>
  </figure>
</template>

<script setup lang="ts">
/**
 * DensityRuler (§8.2) — règle horizontale de densité, 0,3 → 0,9, graduée
 * tous les 0,1, avec les bandes léger / moyen / lourd (seuils du moteur).
 * Aucune essence n'y figure : ce serait donner la réponse (§11.8).
 */
import { computed } from 'vue'
import { SEUILS, categorieMasse } from '@/engine/identification'

const props = defineProps<{ densite: number }>()

const MIN = 0.3
const MAX = 0.9
const graduations = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

function fr(n: number): string {
  return n.toFixed(1).replace('.', ',')
}

const densiteFr = computed(() => props.densite.toFixed(2).replace('.', ','))

const densiteBornee = computed(() => Math.min(MAX, Math.max(MIN, props.densite)))

const categorieFr = computed(() => {
  const c = categorieMasse(props.densite)
  return c === 'leger' ? 'Léger' : c === 'moyen' ? 'Moyen' : 'Lourd'
})

/** Position (0–100 %) d'une valeur sur la piste. */
function position(v: number): string {
  const pct = ((v - MIN) / (MAX - MIN)) * 100
  return `${pct}%`
}

/** Largeur (%) d'une bande entre deux densités. */
function largeur(a: number, b: number): string {
  return `${((b - a) / (MAX - MIN)) * 100}%`
}
</script>

<style scoped>
.ruler {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}

.ruler__valeur {
  display: flex;
  align-items: baseline;
  gap: var(--minor);
}

.ruler__valeur-label {
  color: var(--ink-2);
}

.ruler__valeur-nombre {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h2);
  letter-spacing: -0.02em;
  color: var(--ink);
}

.ruler__categorie {
  margin-left: auto;
  padding: 4px 8px;
  color: var(--moss-ink);
  background: var(--moss-soft);
  border: var(--line) solid var(--moss-ink);
}

.ruler__piste {
  position: relative;
  height: calc(2 * var(--cell));
  border: var(--line) solid var(--ink);
}

.ruler__bandes {
  position: absolute;
  inset: 0;
  display: flex;
}

.ruler__bande {
  position: relative;
  height: 100%;
  border-right: var(--line) solid var(--ink);
}
.ruler__bande:last-child {
  border-right: none;
}

/* Trames sobres pour distinguer les bandes, sans couleur signal. */
.ruler__bande--leger {
  background: var(--paper);
}
.ruler__bande--moyen {
  background: var(--paper-raised);
}
.ruler__bande--lourd {
  background: var(--moss-soft);
}

.ruler__bande-nom {
  position: absolute;
  top: calc(var(--minor) / 2);
  left: calc(var(--minor) / 2);
  color: var(--ink-2);
}

.ruler__graduations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ruler__grad {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ruler__grad-trait {
  width: var(--line);
  height: calc(var(--minor) * 1.5);
  background: var(--ink-3);
}

.ruler__grad-nombre {
  margin-top: 2px;
  color: var(--ink-3);
}

/* Curseur de la mesure. */
.ruler__curseur {
  position: absolute;
  top: 0;
  bottom: 0;
  transform: translateX(-50%);
  width: 3px;
}

.ruler__curseur-trait {
  position: absolute;
  inset: 0;
  background: var(--ink);
}
.ruler__curseur-trait::before,
.ruler__curseur-trait::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
}
.ruler__curseur-trait::before {
  top: -1px;
  border-top: 6px solid var(--ink);
}
.ruler__curseur-trait::after {
  bottom: -1px;
  border-bottom: 6px solid var(--ink);
}
</style>
