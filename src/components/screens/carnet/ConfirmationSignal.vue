<template>
  <div class="confirm" role="dialog" aria-modal="true" :aria-label="titre">
    <div class="confirm__fond" @click="$emit('annuler')" />
    <Panel class="confirm__panel" variant="signal" :title="titre">
      <p class="confirm__msg t-mono">{{ message }}</p>
      <div class="confirm__actions">
        <button type="button" class="confirm__btn t-label" @click="$emit('annuler')">
          Annuler
        </button>
        <button
          type="button"
          class="confirm__btn confirm__btn--signal t-label"
          @click="$emit('confirmer')"
        >
          {{ libelleConfirmer }}
        </button>
      </div>
    </Panel>
  </div>
</template>

<script setup lang="ts">
/**
 * ConfirmationSignal — demande de confirmation pour une action destructrice (§8.8).
 * Vermillon réservé au destructif. Overlay simple, sans dépendance.
 */
import Panel from '@/components/ui/Panel.vue'

withDefaults(
  defineProps<{
    titre: string
    message: string
    libelleConfirmer?: string
  }>(),
  { libelleConfirmer: 'Confirmer' },
)

defineEmits<{ confirmer: []; annuler: [] }>()
</script>

<style scoped>
.confirm {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--margin);
}

.confirm__fond {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--ink) 55%, transparent);
}

.confirm__panel {
  position: relative;
  max-width: 480px;
  width: 100%;
  background: var(--signal-soft);
}

.confirm__msg {
  margin-bottom: var(--minor);
}

.confirm__actions {
  display: flex;
  gap: var(--minor);
  justify-content: flex-end;
}

.confirm__btn {
  min-height: 44px;
  padding: 0 var(--cell);
  border: var(--line) solid var(--ink);
  background: var(--paper);
}

.confirm__btn--signal {
  border-color: var(--signal);
  background: var(--signal);
  color: var(--paper);
}
</style>
