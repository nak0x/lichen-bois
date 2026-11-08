<template>
  <component
    :is="tag"
    class="cell-btn"
    :class="{
      'cell-btn--active': active,
      'cell-btn--disabled': disabled,
      'cell-btn--signal': signal,
    }"
    :style="spanStyle"
    :to="to"
    :href="href"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
  >
    <span v-if="coord" class="cell-btn__coord t-label">{{ coord }}</span>
    <span class="cell-btn__body">
      <span class="cell-btn__title">{{ title }}</span>
      <span v-if="subtitle" class="cell-btn__subtitle">{{ subtitle }}</span>
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
/**
 * CellButton — tuile de navigation ou d'action (réf. B).
 * Occupe N×M cellules, filet encre 1 px, coordonnée en haut à gauche,
 * titre Inter Tight, sous-titre mono. États : actif (fond --moss), pressé
 * (inversé encre/papier au :active), désactivé (--ink-3). Cible tactile ≥ 44 px.
 * Rend un <RouterLink> si `to`, un <a> si `href`, sinon un <button>.
 */
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    coord?: string
    /** Largeur en cellules. */
    cols?: number
    /** Hauteur en cellules. */
    rows?: number
    active?: boolean
    disabled?: boolean
    /** Registre / action destructrice : vermillon. */
    signal?: boolean
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit'
  }>(),
  { cols: 1, rows: 1, type: 'button' },
)

const tag = computed(() => {
  if (props.to && !props.disabled) return RouterLink
  if (props.href && !props.disabled) return 'a'
  return 'button'
})

const spanStyle = computed<CSSProperties>(() => ({
  '--span-cols': String(props.cols),
  '--span-rows': String(props.rows),
}))
</script>

<style scoped>
.cell-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: calc(var(--minor) / 2);
  min-height: max(44px, calc(var(--span-rows, 1) * var(--cell)));
  padding: var(--minor);
  text-align: left;
  text-decoration: none;
  color: var(--ink);
  background: transparent;
  border: var(--line) solid var(--ink);
  font-family: var(--font-display);
  transition: background var(--t-fast) linear, color var(--t-fast) linear;
}

/* État actif : fond mousse. */
.cell-btn--active {
  background: var(--moss);
  color: var(--moss-ink);
  border-color: var(--moss-ink);
}

/* Pressé : inversion encre/papier. */
.cell-btn:not(.cell-btn--disabled):active {
  background: var(--ink);
  color: var(--paper);
}

.cell-btn--disabled {
  color: var(--ink-3);
  border-color: var(--ink-3);
  cursor: not-allowed;
  pointer-events: none;
}

.cell-btn--signal {
  color: var(--signal);
  border-color: var(--signal);
}
.cell-btn--signal:not(.cell-btn--disabled):active {
  background: var(--signal);
  color: var(--paper);
}

.cell-btn__coord {
  color: inherit;
  opacity: 0.75;
}

.cell-btn__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-btn__title {
  font-weight: 700;
  font-size: var(--fs-h2);
  letter-spacing: -0.01em;
  line-height: 1;
  text-transform: uppercase;
}

.cell-btn__subtitle {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: var(--fs-label);
  letter-spacing: 0.03em;
  text-transform: none;
  color: var(--ink-2);
}

.cell-btn--active .cell-btn__subtitle,
.cell-btn:active .cell-btn__subtitle {
  color: inherit;
}
</style>
