<template>
  <figure class="coupe" :class="{ 'coupe--interactive': interactive }">
    <svg
      class="coupe__svg"
      viewBox="0 0 100 100"
      role="img"
      :aria-label="ariaLabel"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Écorce : anneau en aplat sous le bois. -->
      <g class="coupe__ecorce">
        <circle
          :cx="coupe.center.x"
          :cy="coupe.center.y"
          :r="coupe.ecorce.exterieur"
          :fill="coupe.teinteEcorce"
          stroke="var(--ink)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      </g>

      <!-- Corps du bois (aubier). -->
      <circle
        :cx="coupe.center.x"
        :cy="coupe.center.y"
        :r="coupe.rayon"
        :fill="coupe.teinteBois"
        stroke="var(--ink)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />

      <!-- Cœur (duramen) coloré, en aplat plus foncé. -->
      <circle
        v-if="coupe.coeur"
        :cx="coupe.center.x"
        :cy="coupe.center.y"
        :r="coupe.coeur.r"
        :fill="coupe.teinteCoeur"
        stroke="var(--ink-3)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />

      <!-- Bandes de bois d'été : secteurs annulaires plus foncés. -->
      <g class="coupe__bois-ete">
        <circle
          v-for="(b, i) in coupe.boisEte"
          :key="`be-${i}`"
          :cx="coupe.center.x"
          :cy="coupe.center.y"
          :r="(b.rInt + b.rExt) / 2"
          fill="none"
          :stroke="coupe.teinteBoisEte"
          :stroke-width="b.rExt - b.rInt"
          vector-effect="non-scaling-stroke"
          opacity="0.9"
        />
      </g>

      <!-- Cernes : filets 1 px. -->
      <g class="coupe__cernes">
        <circle
          v-for="(c, i) in coupe.cernes"
          :key="`c-${i}`"
          :cx="coupe.center.x"
          :cy="coupe.center.y"
          :r="c.r"
          fill="none"
          stroke="var(--ink-2)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      </g>

      <!-- Pores (feuillus) : petits cercles en aplat clair cerné. -->
      <g class="coupe__pores">
        <circle
          v-for="(p, i) in coupe.pores"
          :key="`p-${i}`"
          :cx="p.x"
          :cy="p.y"
          :r="p.r"
          fill="var(--paper-raised)"
          stroke="var(--ink-2)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      </g>

      <!-- Canaux résinifères (conifères) : points pleins foncés. -->
      <g class="coupe__canaux">
        <circle
          v-for="(p, i) in coupe.canaux"
          :key="`k-${i}`"
          :cx="p.x"
          :cy="p.y"
          :r="p.r"
          fill="var(--ink)"
        />
      </g>

      <!-- Moelle : disque central, cloisons pour le forsythia. -->
      <g v-if="coupe.moelle" class="coupe__moelle">
        <circle
          :cx="coupe.center.x"
          :cy="coupe.center.y"
          :r="coupe.moelle.r"
          :fill="coupe.teinteMoelle"
          stroke="var(--ink-2)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
        <line
          v-for="(seg, i) in coupe.moelle.cloisons"
          :key="`cl-${i}`"
          :x1="seg[0].x"
          :y1="seg[0].y"
          :x2="seg[1].x"
          :y2="seg[1].y"
          stroke="var(--ink-2)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      </g>

      <!-- Lenticelles sur l'écorce (forsythia, noisetier). -->
      <g class="coupe__lenticelles">
        <rect
          v-for="(l, i) in coupe.lenticelles"
          :key="`le-${i}`"
          :x="l.x - l.w / 2"
          :y="l.y - l.h / 2"
          :width="l.w"
          :height="l.h"
          fill="var(--ink-2)"
          :transform="`rotate(${l.angle} ${l.x} ${l.y})`"
        />
      </g>

      <!-- Zones interactives : cibles invisibles + marqueurs. -->
      <g v-if="interactive" class="coupe__zones">
        <circle
          v-for="z in coupe.zones"
          :key="z.id"
          class="coupe__zone"
          :class="{ 'coupe__zone--active': active === z.id }"
          :cx="z.cx"
          :cy="z.cy"
          :r="z.r"
          role="button"
          tabindex="0"
          :aria-pressed="active === z.id"
          :aria-label="z.nom"
          @click="selectionner(z.id)"
          @keydown.enter.prevent="selectionner(z.id)"
          @keydown.space.prevent="selectionner(z.id)"
        />
        <circle
          v-for="z in coupe.zones"
          :key="`m-${z.id}`"
          class="coupe__marqueur"
          :class="{ 'coupe__marqueur--active': active === z.id }"
          :cx="z.cx"
          :cy="z.cy"
          r="1.6"
          aria-hidden="true"
        />
      </g>
    </svg>

    <!-- Légende de la zone sélectionnée. -->
    <figcaption v-if="interactive" class="coupe__legende" aria-live="polite">
      <template v-if="zoneActive">
        <span class="coupe__legende-nom">{{ zoneActive.nom }}</span>
        <span class="coupe__legende-texte">{{ zoneActive.explication }}</span>
      </template>
      <span v-else class="coupe__legende-aide">Touche une zone de la coupe pour la découvrir.</span>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CoupeType } from '@/types/content'
import { construireCoupe, type ZoneId } from './coupe-geometrie'

const props = defineProps<{
  type: CoupeType
  interactive?: boolean
  seed?: number
}>()

// Graine stable par essence : à défaut, on dérive une graine du type pour que
// chaque coupe garde toujours le même rendu.
const grainesParType: Record<CoupeType, number> = {
  'zone-poreuse': 101,
  'resineux-canaux': 202,
  'pores-diffus': 303,
  'moelle-cloisonnee': 404,
  'resineux-sans-canaux': 505,
}

const coupe = computed(() =>
  construireCoupe(props.type, props.seed ?? grainesParType[props.type]),
)

const libelles: Record<CoupeType, string> = {
  'zone-poreuse': 'Coupe transversale à zone poreuse (type frêne)',
  'resineux-canaux': 'Coupe transversale de résineux à canaux (type pin)',
  'pores-diffus': 'Coupe transversale à pores diffus (type noisetier)',
  'moelle-cloisonnee': 'Coupe transversale à moelle cloisonnée (type forsythia)',
  'resineux-sans-canaux': 'Coupe transversale de résineux sans canaux (type if)',
}
const ariaLabel = computed(() => libelles[props.type])

const active = ref<ZoneId | null>(null)
const zoneActive = computed(() => coupe.value.zones.find((z) => z.id === active.value) ?? null)

function selectionner(id: ZoneId): void {
  active.value = active.value === id ? null : id
}
</script>

<style scoped>
.coupe {
  --coupe-bois: #e3d4bc;
  --coupe-bois-ete: #b79a72;
  --coupe-coeur: #c9a878;
  --coupe-coeur-if: #b76a43;
  --coupe-moelle: #d8c7ad;
  --coupe-ecorce: #8c7256;
  --coupe-ecorce-if: #9a5a3f;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.coupe__svg {
  display: block;
  width: 100%;
  height: auto;
  color: var(--ink);
}

/* Zones interactives : cibles invisibles mais focalisables. */
.coupe__zone {
  fill: transparent;
  cursor: pointer;
  outline: none;
}
.coupe__zone:focus-visible {
  stroke: var(--moss-ink);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
.coupe__zone--active {
  stroke: var(--moss);
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

.coupe__marqueur {
  fill: var(--ink);
  pointer-events: none;
  transition: fill var(--t-fast, 120ms) linear;
}
.coupe__marqueur--active {
  fill: var(--moss-ink);
}

.coupe--interactive .coupe__svg {
  cursor: default;
}

.coupe__legende {
  min-height: 2.6em;
  font: 300 var(--fs-body, 15px) / 1.45 var(--font-body, ui-monospace, monospace);
  color: var(--ink-2);
  border-top: 1px solid var(--ink);
  padding-top: 0.5rem;
}
.coupe__legende-nom {
  display: block;
  font-family: var(--font-display, system-ui, sans-serif);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: var(--fs-label, 11px);
  color: var(--ink);
}
.coupe__legende-texte {
  display: block;
  color: var(--ink-2);
}
.coupe__legende-aide {
  color: var(--ink-3);
}

@media (prefers-reduced-motion: reduce) {
  .coupe__marqueur {
    transition: none;
  }
}
</style>
