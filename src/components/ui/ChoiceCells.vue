<template>
  <div class="choices" role="radiogroup" :aria-label="label">
    <button
      v-for="opt in allOptions"
      :key="opt.id"
      type="button"
      class="choice"
      :class="{ 'choice--selected': modelValue === opt.id }"
      role="radio"
      :aria-checked="modelValue === opt.id"
      @click="select(opt.id)"
    >
      <span class="choice__mark" aria-hidden="true" />
      <span class="choice__text">
        <span class="choice__label">{{ opt.label }}</span>
        <span v-if="opt.aide" class="choice__aide">{{ opt.aide }}</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * ChoiceCells — choix d'une seule option (tuiles larges).
 * L'option « Je ne sais pas » est toujours ajoutée en dernier.
 */
import { computed } from 'vue'
import type { Option } from '@/types/content'

const UNKNOWN_ID = 'je-ne-sais-pas'

const props = withDefaults(
  defineProps<{
    options: Option[]
    modelValue?: string
    label?: string
    /** Ajoute l'option « Je ne sais pas » (par défaut oui). */
    allowUnknown?: boolean
  }>(),
  { allowUnknown: true, label: 'Choix' },
)

const emit = defineEmits<{ 'update:modelValue': [string | undefined] }>()

const allOptions = computed<Option[]>(() =>
  props.allowUnknown
    ? [...props.options, { id: UNKNOWN_ID, label: 'Je ne sais pas' }]
    : props.options,
)

function select(id: string) {
  // Re-cliquer sur l'option sélectionnée la désélectionne.
  emit('update:modelValue', props.modelValue === id ? undefined : id)
}
</script>

<style scoped>
.choices {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
}

.choice {
  display: flex;
  align-items: flex-start;
  gap: var(--minor);
  min-height: 44px;
  padding: var(--minor);
  text-align: left;
  color: var(--ink);
  background: transparent;
  border: var(--line) solid var(--ink);
  transition: background var(--t-fast) linear, color var(--t-fast) linear;
}

.choice--selected {
  background: var(--moss);
  color: var(--moss-ink);
  border-color: var(--moss-ink);
}

/* Case carrée 1 px, pleine si sélectionnée. */
.choice__mark {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border: var(--line) solid currentColor;
}

.choice--selected .choice__mark {
  background: var(--moss-ink);
}

.choice__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.choice__label {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--fs-body);
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.choice__aide {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: var(--fs-label);
  letter-spacing: 0.03em;
  color: var(--ink-2);
}

.choice--selected .choice__aide {
  color: var(--moss-ink);
  opacity: 0.8;
}
</style>
