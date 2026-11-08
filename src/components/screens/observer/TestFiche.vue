<template>
  <section class="fiche" role="dialog" :aria-label="`Test : ${test.titre}`">
    <header class="fiche__tete">
      <div class="fiche__titre-bloc">
        <TestIcon :test="test.id" class="fiche__icone" />
        <h2 class="fiche__titre">{{ test.titre }}</h2>
      </div>
      <button type="button" class="fiche__fermer t-label" @click="emit('fermer')">
        Fermer ×
      </button>
    </header>

    <!-- Matériel. -->
    <div class="fiche__bloc">
      <h3 class="fiche__sous-titre t-label">Matériel</h3>
      <ul class="fiche__materiel t-mono">
        <li v-for="(m, i) in test.materiel" :key="i">{{ m }}</li>
      </ul>
    </div>

    <!-- Geste, liste numérotée. -->
    <div class="fiche__bloc">
      <h3 class="fiche__sous-titre t-label">Le geste</h3>
      <ol class="fiche__geste t-mono">
        <li v-for="(g, i) in test.geste" :key="i">{{ g }}</li>
      </ol>
    </div>

    <!-- Sécurité éventuelle. -->
    <Panel v-if="test.securite" variant="safety" class="fiche__panel">
      <p class="fiche__securite">{{ test.securite }}</p>
    </Panel>

    <!-- Contenu spécifique (soupeser : règle de densité ; autres : critères). -->
    <div class="fiche__bloc">
      <h3 class="fiche__sous-titre t-label">Ce que tu observes</h3>
      <slot name="observer" />
    </div>

    <!-- Pourquoi ça compte, repliable. -->
    <div class="fiche__bloc">
      <button
        type="button"
        class="fiche__pourquoi-btn t-label"
        :aria-expanded="pourquoiOuvert"
        @click="pourquoiOuvert = !pourquoiOuvert"
      >
        Pourquoi ça compte {{ pourquoiOuvert ? '−' : '+' }}
      </button>
      <p v-if="pourquoiOuvert" class="fiche__pourquoi t-mono">{{ test.pourquoi }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * TestFiche (§8.2) — feuille de test plein écran.
 * Matériel, geste numéroté, « Ce que tu observes » (slot), « Pourquoi ça
 * compte » repliable, Panel safety si securite.
 */
import { ref } from 'vue'
import type { Test } from '@/types/content'
import TestIcon from '@/components/illustrations/TestIcon.vue'
import Panel from '@/components/ui/Panel.vue'

defineProps<{ test: Test }>()
const emit = defineEmits<{ fermer: [] }>()

const pourquoiOuvert = ref(false)
</script>

<style scoped>
.fiche {
  display: flex;
  flex-direction: column;
  gap: var(--cell);
}

.fiche__tete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--minor);
  border-bottom: var(--line) solid var(--ink);
  padding-bottom: var(--minor);
}

.fiche__titre-bloc {
  display: flex;
  align-items: center;
  gap: var(--minor);
}

.fiche__icone {
  flex: 0 0 auto;
}

.fiche__titre {
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
}

.fiche__fermer {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 0 var(--minor);
  color: var(--ink);
  border: var(--line) solid var(--ink);
}

.fiche__bloc {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
}

.fiche__sous-titre {
  color: var(--ink-2);
}

.fiche__materiel,
.fiche__geste {
  margin: 0;
  padding-left: 1.4em;
  color: var(--ink);
}

.fiche__materiel li,
.fiche__geste li {
  margin-bottom: 0.3em;
}

.fiche__panel {
  margin: 0;
}

.fiche__securite {
  margin: 0;
}

.fiche__pourquoi-btn {
  align-self: flex-start;
  min-height: 44px;
  padding: 0 var(--minor);
  color: var(--ink);
  border: var(--line) solid var(--ink);
}

.fiche__pourquoi {
  margin: var(--minor) 0 0;
  color: var(--ink-2);
}
</style>
