<template>
  <svg
    class="test-icon"
    viewBox="0 0 24 24"
    role="img"
    :aria-label="ariaLabel"
    fill="none"
    stroke="currentColor"
    stroke-width="1"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- soupeser : balance à fléau. -->
    <g v-if="test === 'soupeser'">
      <line x1="12" y1="3" x2="12" y2="20" />
      <line x1="5" y1="6" x2="19" y2="6" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <path d="M5 6 L2.5 12 A3 3 0 0 0 7.5 12 Z" />
      <path d="M19 6 L16.5 12 A3 3 0 0 0 21.5 12 Z" />
    </g>

    <!-- odeur : nez de profil et volutes d'odeur. -->
    <g v-else-if="test === 'odeur'">
      <path d="M8 5 C8 9 6 11 6 14 C6 16 8 17 10 16" />
      <path d="M6 14 L8.5 14" />
      <path d="M14 8 C16 9 16 11 14 12" />
      <path d="M14 13 C16 14 16 16 14 17" />
      <path d="M17 7 C19 8.5 19 11 17 12.5" />
    </g>

    <!-- coupe : loupe. -->
    <g v-else-if="test === 'coupe'">
      <circle cx="10" cy="10" r="6" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" />
      <line x1="8" y1="10" x2="12" y2="10" />
      <line x1="10" y1="8" x2="10" y2="12" />
    </g>

    <!-- ongle : pouce qui presse (empreinte). -->
    <g v-else-if="test === 'ongle'">
      <path d="M7 21 L7 13 C7 11 8 10 10 10 L12 10 L12 6 C12 4.5 13 3.5 14.5 3.5 C16 3.5 16.5 5 16 7 L15 10 L18 10 C19.5 10 20 11 19.5 13 L18.5 19 C18 21 17 21 16 21 Z" />
      <path d="M13.5 5 A1.5 1.5 0 0 1 15 6.5" />
    </g>

    <!-- ecorce-rameau : morceau d'écorce crevassée. -->
    <g v-else-if="test === 'ecorce-rameau'">
      <path d="M5 4 L19 4 L19 20 L5 20 Z" />
      <path d="M9 4 C8 8 10 10 9 14 C8 17 10 18 9 20" />
      <path d="M13 4 C14 7 12 10 13 13 C14 16 12 18 13 20" />
      <path d="M16 6 L16 10" />
      <path d="M7 9 L7 13" />
    </g>

    <!-- flexion : latte pliée en arc. -->
    <g v-else-if="test === 'flexion'">
      <path d="M4 18 Q12 2 20 18" />
      <path d="M4 20 Q12 4 20 20" />
      <line x1="4" y1="18" x2="4" y2="20" />
      <line x1="20" y1="18" x2="20" y2="20" />
    </g>

    <!-- fendage : lame et bûche fendue. -->
    <g v-else-if="test === 'fendage'">
      <path d="M11 2 L13 2 L13 11 L15 14 L9 14 L11 11 Z" />
      <path d="M4 16 L10 16 L12 22 L4 22 Z" />
      <path d="M20 16 L14 16 L12 22 L20 22 Z" />
    </g>

    <!-- allumage : flamme. -->
    <g v-else>
      <path d="M12 2 C14 6 18 8 18 13 A6 6 0 0 1 6 13 C6 10 8 9 9 7 C10 10 12 10 12 8 C12 6 11 4 12 2 Z" />
      <path d="M12 20 C10.5 18 10.5 16 12 14.5 C13.5 16 13.5 18 12 20 Z" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TestId } from '@/types/content'

const props = defineProps<{ test: TestId }>()

const libelles: Record<TestId, string> = {
  soupeser: 'Soupeser et mesurer',
  odeur: 'Sentir et toucher',
  coupe: 'Lire la coupe à la loupe',
  ongle: "Test de l'ongle",
  'ecorce-rameau': 'Écorce et rameau',
  flexion: 'Plier une latte',
  fendage: 'Fendre',
  allumage: 'Allumer un copeau',
}
const ariaLabel = computed(() => libelles[props.test])
</script>

<style scoped>
.test-icon {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--ink);
}
</style>
