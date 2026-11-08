<template>
  <RouterLink class="carte" :to="`/carnet/${specimen.id}`">
    <div class="carte__visuel">
      <img v-if="photoUrl" class="carte__photo" :src="photoUrl" :alt="`Photo de ${specimen.nom}`" />
      <CoupeTransversale v-else-if="coupe" :type="coupe" />
      <Silhouette v-else forme="rondelle" />
    </div>
    <div class="carte__infos">
      <h3 class="carte__nom">{{ specimen.nom }}</h3>
      <p v-if="identification" class="carte__ident t-mono">{{ identification }}</p>
      <p v-else class="carte__ident carte__ident--vide t-mono">Non identifié</p>
      <p class="carte__meta t-label">
        {{ date }}
        <span class="carte__sep">·</span>
        {{ specimen.defis.length }} défi{{ specimen.defis.length > 1 ? 's' : '' }}
      </p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
/**
 * SpecimenCarte — une tuile de la liste du carnet (§8.8).
 * Illustration de coupe (ou photo si présente) + nom + identification + date
 * + nombre de défis. Lien vers le détail du spécimen.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import CoupeTransversale from '@/components/illustrations/CoupeTransversale.vue'
import Silhouette from '@/components/illustrations/Silhouette.vue'
import { useCarnetStore } from '@/stores/carnet'
import type { Specimen } from '@/types/content'
import { coupeEssence, formaterDate, nomEssence } from './aides'

const props = defineProps<{ specimen: Specimen }>()

const carnet = useCarnetStore()

const coupe = computed(() => coupeEssence(props.specimen.identification))
const identification = computed(() => nomEssence(props.specimen.identification))
const date = computed(() => formaterDate(props.specimen.creeLe))

const photoUrl = ref<string | null>(null)

async function chargerVignette() {
  if (photoUrl.value) {
    URL.revokeObjectURL(photoUrl.value)
    photoUrl.value = null
  }
  const cle = props.specimen.photos[0]
  if (!cle) return
  const blob = await carnet.chargerPhoto(cle)
  if (blob) photoUrl.value = URL.createObjectURL(blob)
}

watch(() => props.specimen.photos[0], chargerVignette, { immediate: true })

onBeforeUnmount(() => {
  if (photoUrl.value) URL.revokeObjectURL(photoUrl.value)
})
</script>

<style scoped>
.carte {
  display: flex;
  gap: var(--minor);
  padding: var(--minor);
  border: var(--line) solid var(--ink);
  background: var(--paper-raised);
  text-decoration: none;
  color: inherit;
  align-items: stretch;
}

.carte:active {
  background: var(--ink);
  color: var(--paper);
}

.carte__visuel {
  flex: 0 0 auto;
  width: var(--cell);
  height: var(--cell);
  border: var(--line) solid var(--ink);
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.carte__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carte__infos {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
  justify-content: center;
}

.carte__nom {
  font-size: var(--fs-h2);
}

.carte__ident {
  margin: 0;
  color: var(--moss-ink);
}

.carte__ident--vide {
  color: var(--ink-3);
}

.carte__meta {
  margin: 0;
  color: var(--ink-2);
}

.carte__sep {
  margin: 0 0.3em;
}
</style>
