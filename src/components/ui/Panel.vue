<template>
  <section class="panel" :class="`panel--${variant}`">
    <header v-if="resolvedTitle" class="panel__head">
      <h3 class="panel__title">{{ resolvedTitle }}</h3>
      <slot name="head-extra" />
    </header>

    <!-- Variante locked : contenu masqué par une révélation figée + message. -->
    <div v-if="variant === 'locked'" class="panel__locked">
      <GridReveal
        class="panel__veil"
        :cols="6"
        :rows="4"
        :play="false"
        :cover="'var(--plate)'"
        :mask="veilMask"
      >
        <div class="panel__hidden" aria-hidden="true">
          <slot />
        </div>
      </GridReveal>
      <div class="panel__message">
        <p v-if="message" class="panel__msg-text t-mono">{{ message }}</p>
        <slot name="locked-actions" />
      </div>
    </div>

    <div v-else class="panel__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Panel — encadré. Variantes :
 *  - default : filet encre ;
 *  - safety : fond encre, texte papier, titre « SÉCURITÉ » ;
 *  - signal : fond --signal-soft, filet et titre --signal ;
 *  - locked : contenu masqué par GridReveal figé + message.
 */
import { computed } from 'vue'
import GridReveal from './GridReveal.vue'
import { stairMask, type Cell } from './grid'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'safety' | 'signal' | 'locked'
    title?: string
    /** Message affiché par la variante locked. */
    message?: string
    /** Graine du masque figé (stable par essence). */
    seed?: number
  }>(),
  { variant: 'default', seed: 1 },
)

const resolvedTitle = computed(() => {
  if (props.variant === 'safety') return props.title ?? 'Sécurité'
  return props.title
})

// Masque en escalier figé qui couvre tout le contenu verrouillé.
const veilMask = computed<Cell[]>(() => {
  const cells: Cell[] = []
  const extra = stairMask(6, 4, props.seed)
  const seen = new Set(extra.map(([c, r]) => `${c},${r}`))
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      if (!seen.has(`${c},${r}`)) cells.push([c, r])
    }
  }
  // Toutes les cellules restent couvertes (contenu entièrement masqué).
  return [...cells, ...extra]
})
</script>

<style scoped>
.panel {
  border: var(--line) solid var(--ink);
  padding: var(--minor);
  background: transparent;
}

.panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--minor);
  margin-bottom: calc(var(--minor) / 2);
}

.panel__title {
  font-weight: 700;
  font-size: var(--fs-h2);
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.panel__body {
  font-family: var(--font-body);
  font-weight: 300;
  line-height: 1.55;
}

/* safety : aplat encre. */
.panel--safety {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

/* signal : vermillon réservé registre / destructif. */
.panel--signal {
  background: var(--signal-soft);
  border-color: var(--signal);
}
.panel--signal .panel__title {
  color: var(--signal);
}

/* locked. */
.panel--locked {
  position: relative;
}

.panel__locked {
  position: relative;
}

.panel__veil {
  pointer-events: none;
}

.panel__hidden {
  filter: blur(1px);
}

.panel__message {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--minor);
  padding: var(--minor);
  text-align: center;
}

.panel__msg-text {
  margin: 0;
  color: var(--ink);
  max-width: 28ch;
}
</style>
