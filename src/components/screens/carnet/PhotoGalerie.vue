<template>
  <div class="photos">
    <div v-if="urls.length" class="photos__grid">
      <figure v-for="p in urls" :key="p.cle" class="photos__item">
        <img class="photos__img" :src="p.url" alt="Photo du spécimen" />
        <button
          type="button"
          class="photos__suppr t-label"
          @click="supprimer(p.cle)"
        >
          Retirer
        </button>
      </figure>
    </div>

    <label class="photos__ajout">
      <input
        ref="champ"
        class="visually-hidden"
        type="file"
        accept="image/*"
        capture="environment"
        @change="onFichier"
      />
      <span class="photos__ajout-txt t-label">
        {{ occupe ? 'Traitement…' : '+ Ajouter une photo' }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
/**
 * PhotoGalerie — capture et affichage des photos d'un spécimen (§8.8).
 * Input file avec capture caméra arrière, redimensionnement 1280 px → JPEG 0,85,
 * stockage en Blob dans le store carnet. Les Blobs sont chargés en URL objet
 * pour l'affichage et révoqués au démontage.
 */
import { onBeforeUnmount, ref, watch } from 'vue'
import { useCarnetStore } from '@/stores/carnet'
import { redimensionnerPhoto } from './photo'

const props = defineProps<{
  specimenId: string
  /** Clés IndexedDB des photos du spécimen. */
  cles: string[]
}>()

const carnet = useCarnetStore()
const champ = ref<HTMLInputElement | null>(null)
const occupe = ref(false)

interface PhotoUrl {
  cle: string
  url: string
}
const urls = ref<PhotoUrl[]>([])

function revoquerTout() {
  for (const p of urls.value) URL.revokeObjectURL(p.url)
  urls.value = []
}

async function charger() {
  revoquerTout()
  const nouvelles: PhotoUrl[] = []
  for (const cle of props.cles) {
    const blob = await carnet.chargerPhoto(cle)
    if (blob) nouvelles.push({ cle, url: URL.createObjectURL(blob) })
  }
  urls.value = nouvelles
}

watch(() => props.cles, charger, { immediate: true, deep: true })

async function onFichier(e: Event) {
  const input = e.target as HTMLInputElement
  const fichier = input.files?.[0]
  if (!fichier) return
  occupe.value = true
  try {
    const blob = await redimensionnerPhoto(fichier)
    await carnet.ajouterPhoto(props.specimenId, blob)
  } finally {
    occupe.value = false
    if (champ.value) champ.value.value = ''
  }
}

async function supprimer(cle: string) {
  await carnet.supprimerPhoto(props.specimenId, cle)
}

onBeforeUnmount(revoquerTout)
</script>

<style scoped>
.photos {
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}

.photos__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(var(--cell) * 1.5), 1fr));
  gap: var(--minor);
}

.photos__item {
  margin: 0;
  display: flex;
  flex-direction: column;
  border: var(--line) solid var(--ink);
}

.photos__img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background: var(--paper-raised);
}

.photos__suppr {
  padding: 6px;
  border-top: var(--line) solid var(--ink);
  background: var(--paper-raised);
  color: var(--signal);
}

.photos__ajout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 var(--minor);
  border: var(--line) dashed var(--ink-2);
  cursor: pointer;
  align-self: flex-start;
}

.photos__ajout-txt {
  color: var(--ink-2);
}
</style>
