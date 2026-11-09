<template>
  <div class="app-shell">
    <main class="app-shell__main">
      <div class="app-shell__inner">
        <slot />
      </div>
      <VerticalLabel
        v-if="label"
        class="app-shell__label"
        :title="label"
        :subtitle="sublabel"
      />
    </main>
    <BottomNav v-if="showNav" />
  </div>
</template>

<script setup lang="ts">
/**
 * AppShell — gabarit d'application.
 * Marges, safe areas, VerticalLabel facultatif, slot principal, BottomNav.
 * Hauteur 100dvh. La nav est masquée en mode démo plein écran
 * (route /demo) ou via la prop `nav="false"`.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDemoStore } from '@/stores/demo'
import BottomNav from './BottomNav.vue'
import VerticalLabel from './VerticalLabel.vue'

const props = withDefaults(
  defineProps<{
    /** Titre vertical dans la marge droite (facultatif). */
    label?: string
    sublabel?: string
    /** Force l'affichage/masquage de la navigation basse. */
    nav?: boolean
  }>(),
  {},
)

const route = useRoute()
const demo = useDemoStore()

const showNav = computed(() => {
  if (props.nav !== undefined) return props.nav
  // Masquée en mode démo plein écran (route /demo ou démo active qui navigue ailleurs).
  return !route.path.startsWith('/demo') && !demo.actif
})
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-shell__main {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  padding-top: var(--safe-top);
  padding-left: calc(var(--margin) + var(--safe-left));
  padding-right: calc(var(--margin) + var(--safe-right));
  /* Dégage la navigation basse (hauteur + safe-area). */
  padding-bottom: calc(72px + var(--safe-bottom));
}

.app-shell__inner {
  flex: 1 1 auto;
  min-width: 0;
}

/* Titre vertical dans la marge droite. */
.app-shell__label {
  flex: 0 0 auto;
  margin-left: var(--minor);
  padding-top: var(--minor);
}

@media (min-width: 900px) {
  .app-shell__main {
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
