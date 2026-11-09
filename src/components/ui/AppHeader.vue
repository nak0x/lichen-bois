<template>
  <nav class="app-header" aria-label="Navigation">
    <button class="app-header__btn" type="button" @click="retour">
      <span aria-hidden="true">←</span> Retour
    </button>
    <RouterLink class="app-header__btn app-header__btn--home" to="/">
      <span aria-hidden="true">⌂</span> Accueil
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
/**
 * AppHeader — navigation par boutons en haut de l'écran (Retour / Accueil).
 * Montée par AppShell sur toutes les vues sauf l'accueil et le mode démo.
 */
import { useRouter } from 'vue-router'

const router = useRouter()

function retour(): void {
  // Revient en arrière si possible, sinon ramène à l'accueil.
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<style scoped>
.app-header {
  display: flex;
  gap: var(--minor);
  align-items: center;
  padding: calc(var(--minor) / 2) 0;
  margin-bottom: calc(var(--minor) / 2);
  border-bottom: var(--line) solid var(--ink);
}

.app-header__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 12px;
  color: var(--ink);
  background: transparent;
  border: var(--line) solid var(--ink);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
}

.app-header__btn:active {
  background: var(--ink);
  color: var(--paper);
}

.app-header__btn--home {
  margin-left: auto;
}
</style>
