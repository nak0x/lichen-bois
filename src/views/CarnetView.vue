<template>
  <GridPaper class="carnet">
    <Crosshairs :cells="[[1, 1], [2, 1], [1, 2]]" />
    <div class="carnet__corps">
      <VerticalLabel class="carnet__vlabel" title="CARNET" subtitle="spécimens" />
      <header class="carnet__entete">
        <h1 class="carnet__titre">Carnet</h1>
        <p class="carnet__sous t-mono">
          Tes spécimens : ce que tu as observé, mesuré, identifié et déduit.
        </p>
      </header>

      <div class="carnet__actions">
        <CellButton
          title="Nouveau spécimen"
          coord="A1"
          :cols="2"
          @click="nouveau"
        />
        <CellButton
          title="Exporter"
          subtitle="JSON"
          coord="X1"
          :cols="2"
          :disabled="vide"
          @click="exporter"
        />
        <CellButton
          title="Importer"
          subtitle="JSON"
          coord="I1"
          :cols="2"
          @click="declencherImport"
        />
        <CellButton
          title="Tout effacer"
          coord="R"
          :cols="2"
          signal
          :disabled="vide"
          @click="demandeEffacer = true"
        />
        <input
          ref="champImport"
          class="visually-hidden"
          type="file"
          accept="application/json,.json"
          @change="onImport"
        />
      </div>

      <p v-if="messageImport" class="carnet__flash t-mono">{{ messageImport }}</p>

      <section v-if="vide" class="carnet__vide">
        <p class="t-mono">
          Ton carnet est vide. Crée un spécimen pour commencer à observer.
        </p>
      </section>

      <ul v-else class="carnet__liste">
        <li v-for="s in specimensVisibles" :key="s.id">
          <SpecimenCarte :specimen="s" />
        </li>
      </ul>
    </div>

    <ConfirmationSignal
      v-if="demandeEffacer"
      titre="Tout effacer"
      message="Cette action supprime définitivement tous tes spécimens et leurs photos. Elle est irréversible."
      libelleConfirmer="Tout effacer"
      @annuler="demandeEffacer = false"
      @confirmer="confirmerEffacer"
    />
  </GridPaper>
</template>

<script setup lang="ts">
/**
 * CarnetView — liste des spécimens du carnet (§8.8).
 * Illustration/photo + nom + identification + date + nb défis. Actions :
 * Nouveau spécimen, Exporter (JSON), Importer, Tout effacer (vermillon,
 * confirmation). Appelle initialiser() au montage.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GridPaper from '@/components/ui/GridPaper.vue'
import Crosshairs from '@/components/ui/Crosshairs.vue'
import VerticalLabel from '@/components/ui/VerticalLabel.vue'
import CellButton from '@/components/ui/CellButton.vue'
import SpecimenCarte from '@/components/screens/carnet/SpecimenCarte.vue'
import ConfirmationSignal from '@/components/screens/carnet/ConfirmationSignal.vue'
import { useCarnetStore } from '@/stores/carnet'

const carnet = useCarnetStore()
const router = useRouter()

const champImport = ref<HTMLInputElement | null>(null)
const demandeEffacer = ref(false)
const messageImport = ref('')

onMounted(() => {
  void carnet.initialiser()
})

// Masque les spécimens « Atlas » implicites, qui ne sont pas de vrais spécimens.
const specimensVisibles = computed(() =>
  carnet.specimens.filter((s) => !s.id.startsWith('atlas-')),
)
const vide = computed(() => specimensVisibles.value.length === 0)

async function nouveau() {
  const id = await carnet.creer('Nouveau spécimen')
  router.push(`/observer/${id}`)
}

function exporter() {
  const json = carnet.exporterJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `carnet-lichen-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function declencherImport() {
  champImport.value?.click()
}

async function onImport(e: Event) {
  const input = e.target as HTMLInputElement
  const fichier = input.files?.[0]
  if (!fichier) return
  try {
    const texte = await fichier.text()
    await carnet.importerJSON(texte)
    messageImport.value = 'Import réussi.'
  } catch {
    messageImport.value = "Fichier illisible : l'import a échoué."
  } finally {
    input.value = ''
  }
}

async function confirmerEffacer() {
  await carnet.toutEffacer()
  demandeEffacer.value = false
}
</script>

<style scoped>
.carnet {
  min-height: 100%;
}

.carnet__corps {
  position: relative;
  display: flex;
  flex-direction: row;
}

.carnet__corps > :not(.carnet__vlabel) {
  flex: 1 1 auto;
  min-width: 0;
}

.carnet__vlabel {
  order: 2;
  flex: 0 0 auto;
  margin-left: var(--minor);
  padding-top: var(--cell);
}

.carnet__entete {
  padding-top: var(--cell);
  margin-bottom: var(--cell);
}

.carnet__titre {
  margin-bottom: var(--minor);
}

.carnet__sous {
  max-width: 40ch;
  color: var(--ink-2);
}

.carnet__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--minor);
  margin-bottom: var(--cell);
}

.carnet__flash {
  margin-bottom: var(--minor);
  color: var(--moss-ink);
}

.carnet__vide {
  border: var(--line) dashed var(--ink-3);
  padding: var(--cell);
  color: var(--ink-2);
}

.carnet__liste {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}
</style>
