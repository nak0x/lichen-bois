<template>
  <div class="app-shell">
    <slot />
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
// Stub de socle minimal. Agent A (design-system) le remplace :
// marges, safe areas, VerticalLabel facultatif, slot principal, BottomNav, 100dvh.
import BottomNav from './BottomNav.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
}
</style>
