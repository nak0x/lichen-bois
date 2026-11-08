<template>
  <button
    type="button"
    class="chip"
    :class="{ 'chip--selected': selected, 'chip--signal': signal }"
    :aria-pressed="selectable ? selected : undefined"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
/**
 * Chip — étiquette sélectionnable (filet 1 px, capitales --fs-label).
 * Sélectionnée : fond mousse. Variante signal pour le registre.
 */
const props = withDefaults(
  defineProps<{
    selected?: boolean
    /** Si false, la puce est purement décorative/informative. */
    selectable?: boolean
    signal?: boolean
  }>(),
  { selectable: true },
)

const emit = defineEmits<{ toggle: [boolean] }>()

function onClick() {
  if (props.selectable) emit('toggle', !props.selected)
}
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 6px 10px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--fs-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
  background: transparent;
  border: var(--line) solid var(--ink);
  transition: background var(--t-fast) linear, color var(--t-fast) linear;
}

.chip--selected {
  background: var(--moss);
  color: var(--moss-ink);
  border-color: var(--moss-ink);
}

.chip--signal {
  color: var(--signal);
  border-color: var(--signal);
}

.chip--signal.chip--selected {
  background: var(--signal);
  color: var(--paper);
}
</style>
