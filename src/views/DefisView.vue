<template>
  <div class="defis">
    <header class="defis__head">
      <h1 class="defis__titre">Défis</h1>
      <p class="defis__intro t-mono">
        Un besoin, un bois à choisir, une justification. À toi de déduire.
      </p>
    </header>

    <ul class="defis__liste">
      <li v-for="d in defis" :key="d.id" class="defis__item">
        <RouterLink class="defis__tuile" :to="{ name: 'defi', params: { defiId: d.id } }">
          <h2 class="defis__tuile-titre">{{ d.titre }}</h2>
          <p class="defis__tuile-besoin t-mono">{{ d.besoin }}</p>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/**
 * DefisView (§8.6) — liste des défis.
 * Une tuile par défi : titre + besoin.
 */
import { RouterLink } from 'vue-router'
import { defis } from '@/data'
</script>

<style scoped>
.defis__head {
  margin-bottom: var(--minor);
}

.defis__titre {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
}

.defis__intro {
  margin: calc(var(--minor) / 2) 0 0;
  color: var(--ink-2);
}

.defis__liste {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}

.defis__tuile {
  display: block;
  padding: var(--minor);
  text-decoration: none;
  color: var(--ink);
  background: var(--plate);
  border: var(--line) solid var(--ink);
  transition: background var(--t-fast) linear, color var(--t-fast) linear;
}

.defis__tuile:active {
  background: var(--ink);
  color: var(--paper);
}

.defis__tuile-titre {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-h2);
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.defis__tuile-besoin {
  margin: calc(var(--minor) / 2) 0 0;
  color: var(--ink-2);
}

.defis__tuile:active .defis__tuile-besoin {
  color: var(--paper);
}
</style>
