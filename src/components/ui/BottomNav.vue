<template>
  <nav class="bottom-nav" aria-label="Navigation principale">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      class="bottom-nav__item"
      :to="item.to"
      :aria-label="item.label"
    >
      <span class="bottom-nav__key t-label">{{ item.key }}</span>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
/**
 * BottomNav — navigation basse (réf. B), 5 cellules.
 * Fixe en bas, padding-bottom var(--safe-bottom).
 * Masquée en mode démo plein écran (via AppShell).
 */
const items = [
  { key: 'A', label: 'Observer', to: '/observer' },
  { key: 'B', label: 'Identifier', to: '/identifier' },
  { key: 'C', label: 'Atlas', to: '/atlas' },
  { key: 'D', label: 'Défis', to: '/defis' },
  { key: 'E', label: 'Carnet', to: '/carnet' },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: var(--paper-raised);
  border-top: var(--line) solid var(--ink);
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 56px;
  padding: 6px 2px;
  text-decoration: none;
  color: var(--ink-2);
  border-right: var(--line) solid var(--grid-major);
}

.bottom-nav__item:last-child {
  border-right: none;
}

.bottom-nav__key {
  color: var(--ink-3);
}

.bottom-nav__label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* Onglet actif : encre pleine. */
.bottom-nav__item.router-link-active {
  color: var(--ink);
  background: var(--moss-soft);
}
.bottom-nav__item.router-link-active .bottom-nav__key {
  color: var(--moss-ink);
}
</style>
