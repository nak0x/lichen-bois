<template>
  <GridPaper class="demo-boot">
    <div class="demo-boot__inner">
      <PixelWordmark word="LICHEN" reveal />
      <p class="t-mono demo-boot__texte">Démonstration — préparation du scénario…</p>
    </div>
  </GridPaper>
</template>

<script setup lang="ts">
/**
 * Point d'entrée du mode démo (section 8.9). Réinitialise l'état démo, crée les
 * spécimens de demo.ts et ouvre la première étape. La barre présentateur est
 * montée globalement (App.vue) et prend le relais ; cette vue se démonte dès que
 * la démo navigue vers la première route.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GridPaper from '@/components/ui/GridPaper.vue'
import PixelWordmark from '@/components/ui/PixelWordmark.vue'
import { useDemoStore } from '@/stores/demo'

const demo = useDemoStore()
const router = useRouter()

onMounted(async () => {
  await demo.demarrer(router)
})
</script>

<style scoped>
.demo-boot {
  min-height: 100dvh;
}
.demo-boot__inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem 0;
}
.demo-boot__texte {
  color: var(--ink-2);
}
</style>
