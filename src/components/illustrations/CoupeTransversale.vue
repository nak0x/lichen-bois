<template>
  <svg class="coupe" viewBox="0 0 100 100" role="img" :aria-label="`Coupe ${type}`">
    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="1" />
  </svg>
</template>

<script setup lang="ts">
import type { CoupeType } from '@/types/content'

// Stub de socle : un simple cercle. Agent E (illustrations) dessine les 5 coupes
// procédurales, le mode interactif et les légendes (section 9.4).
defineProps<{ type: CoupeType; interactive?: boolean; seed?: number }>()
</script>
