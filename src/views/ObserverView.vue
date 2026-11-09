<template>
  <GridPaper class="observer">
    <Crosshairs :cells="croix" />
    <VerticalLabel class="observer__vlabel" title="OBSERVER" />

    <!-- Fiche de test plein écran (via ?test=<id>). -->
    <template v-if="testActif">
      <TestFiche :test="testActif" @fermer="fermerFiche">
        <template #observer>
          <!-- Soupeser : champs + règle de densité. -->
          <SoupeserFiche
            v-if="testActif.id === 'soupeser'"
            :mesures="specimen?.mesures"
            @mesures="onMesures"
            @categorie="onCategorieMasse"
          />
          <!-- Autres tests : un ChoiceCells par critère / propriété alimenté. -->
          <template v-else>
            <div
              v-for="critere in criteresDuTest"
              :key="critere.id"
              class="observer__critere"
            >
              <p class="observer__question t-mono">{{ critere.question }}</p>
              <ChoiceCells
                :options="critere.options"
                :label="critere.question"
                :model-value="specimen?.answers[critere.id]"
                @update:model-value="(v) => onReponseCritere(critere.id, v)"
              />
            </div>
            <!-- Tests de propriété (flexion, fendage, allumage). -->
            <div v-if="testActif.type === 'propriete' && testActif.options" class="observer__critere">
              <p class="observer__question t-mono">{{ testActif.observer }}</p>
              <ChoiceCells
                :options="testActif.options"
                :label="testActif.observer"
                :allow-unknown="false"
                :model-value="specimen?.resultatsTests[testActif.id]"
                @update:model-value="(v) => onResultatPropriete(v)"
              />
            </div>
          </template>
        </template>
      </TestFiche>
    </template>

    <!-- Vue principale de l'observation. -->
    <template v-else>
      <header class="observer__tete">
        <span class="observer__coord t-label">Spécimen</span>
        <input
          v-if="specimen"
          class="observer__nom"
          :value="specimen.nom"
          aria-label="Nom du spécimen"
          @change="onRenommer"
        />
        <p v-else class="observer__absent t-mono">Spécimen introuvable.</p>
      </header>

      <!-- Pour identifier. -->
      <section class="observer__groupe">
        <h2 class="observer__groupe-titre">Pour identifier</h2>
        <div class="observer__tuiles">
          <CellButton
            v-for="t in testsIdentifier"
            :key="t.id"
            :title="t.titre"
            :subtitle="etatTest(t)"
            :active="estFait(t)"
            @click="ouvrirFiche(t.id)"
          />
        </div>
      </section>

      <!-- Pour comprendre. -->
      <section class="observer__groupe">
        <h2 class="observer__groupe-titre">Pour comprendre</h2>
        <div class="observer__tuiles">
          <CellButton
            v-for="t in testsComprendre"
            :key="t.id"
            :title="t.titre"
            :subtitle="etatTest(t)"
            :active="estFait(t)"
            @click="ouvrirFiche(t.id)"
          />
        </div>
      </section>

      <!-- Vers l'identification. -->
      <CellButton
        v-if="specimen"
        class="observer__suite"
        title="Identifier ce spécimen →"
        :cols="2"
        :to="`/identifier/${specimen.id}`"
      />
    </template>
  </GridPaper>
</template>

<script setup lang="ts">
/**
 * Observer (§8.2) — papier. Deux groupes de tuiles (pour identifier / pour
 * comprendre), fiche de test plein écran via ?test=<id>, bouton vers
 * l'identification.
 */
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GridPaper from '@/components/ui/GridPaper.vue'
import Crosshairs from '@/components/ui/Crosshairs.vue'
import VerticalLabel from '@/components/ui/VerticalLabel.vue'
import CellButton from '@/components/ui/CellButton.vue'
import ChoiceCells from '@/components/ui/ChoiceCells.vue'
import TestFiche from '@/components/screens/observer/TestFiche.vue'
import SoupeserFiche from '@/components/screens/observer/SoupeserFiche.vue'
import { tests, criteres } from '@/data'
import type { CritereId, Mesures, Test, TestId } from '@/types/content'
import { useCarnetStore } from '@/stores/carnet'
import type { Cell } from '@/components/ui/grid'

const props = defineProps<{ specimenId?: string }>()
const route = useRoute()
const router = useRouter()
const carnet = useCarnetStore()

onMounted(() => {
  void carnet.initialiser()
})

const croix: Cell[] = [
  [1, 1], [2, 1],
  [1, 2], [2, 2],
]

const specimen = computed(() =>
  props.specimenId ? carnet.trouver(props.specimenId) : undefined,
)

// Répartition des tests en deux groupes (section 8.2).
const ID_IDENTIFIER: TestId[] = ['soupeser', 'odeur', 'coupe', 'ongle', 'ecorce-rameau']
const ID_COMPRENDRE: TestId[] = ['flexion', 'fendage', 'allumage']

const testsIdentifier = computed(() =>
  ID_IDENTIFIER.map((id) => tests.find((t) => t.id === id)).filter((t): t is Test => !!t),
)
const testsComprendre = computed(() =>
  ID_COMPRENDRE.map((id) => tests.find((t) => t.id === id)).filter((t): t is Test => !!t),
)

// Fiche active via ?test=<id>.
const testActif = computed<Test | null>(() => {
  const id = route.query.test
  if (typeof id !== 'string') return null
  return tests.find((t) => t.id === id) ?? null
})

// Critères alimentés par le test actif (pour les tests de type critère).
const criteresDuTest = computed(() => {
  const t = testActif.value
  if (!t?.alimenteCriteres) return []
  return t.alimenteCriteres
    .map((cid) => criteres.find((c) => c.id === cid))
    .filter((c): c is NonNullable<typeof c> => !!c)
})

function ouvrirFiche(id: TestId): void {
  router.push({ query: { ...route.query, test: id } })
}

function fermerFiche(): void {
  const q = { ...route.query }
  delete q.test
  router.push({ query: q })
}

/** Libellé d'état d'une tuile : « à faire » ou le résultat retenu. */
function etatTest(t: Test): string {
  const spec = specimen.value
  if (!spec) return 'à faire'
  if (t.type === 'propriete') {
    const r = spec.resultatsTests[t.id]
    const opt = t.options?.find((o) => o.id === r)
    return opt ? opt.label : 'à faire'
  }
  // Test de critère ou de mesure : premier critère alimenté répondu.
  const cids = t.alimenteCriteres ?? []
  for (const cid of cids) {
    const rep = spec.answers[cid]
    if (rep && rep !== 'je-ne-sais-pas') {
      const crit = criteres.find((c) => c.id === cid)
      const opt = crit?.options.find((o) => o.id === rep)
      if (opt) return opt.label
      return rep
    }
  }
  return 'à faire'
}

function estFait(t: Test): boolean {
  return etatTest(t) !== 'à faire'
}

async function onReponseCritere(critere: CritereId, valeur: string | undefined): Promise<void> {
  if (!specimen.value) return
  await carnet.mettreAJourAnswers(specimen.value.id, { [critere]: valeur } as Record<CritereId, string>)
}

async function onResultatPropriete(valeur: string | undefined): Promise<void> {
  const t = testActif.value
  if (!specimen.value || !t || !valeur) return
  await carnet.mettreAJourResultatTest(specimen.value.id, t.id, valeur)
}

async function onMesures(mesures: Mesures): Promise<void> {
  if (!specimen.value) return
  await carnet.mettreAJourMesures(specimen.value.id, mesures)
}

async function onCategorieMasse(categorie: string): Promise<void> {
  if (!specimen.value) return
  await carnet.mettreAJourAnswers(specimen.value.id, { masse: categorie })
}

async function onRenommer(e: Event): Promise<void> {
  if (!specimen.value) return
  const nom = (e.target as HTMLInputElement).value.trim()
  if (nom) await carnet.mettreAJour(specimen.value.id, { nom })
}
</script>

<style scoped>
.observer {
  position: relative;
  min-height: 100%;
  padding-top: var(--cell);
  padding-bottom: var(--cell);
  padding-right: calc(1.5 * var(--fs-vertical));
}

.observer__vlabel {
  position: absolute;
  top: var(--cell);
  right: 0;
}

.observer__tete {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
  margin-bottom: var(--cell);
}

.observer__coord {
  color: var(--ink-2);
}

.observer__nom {
  width: 100%;
  min-height: 44px;
  padding: 0 var(--minor);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
  color: var(--ink);
  background: transparent;
  border: var(--line) solid var(--ink);
}

.observer__absent {
  /* État vide neutre : le vermillon est réservé au registre et au destructif. */
  color: var(--ink-2);
}

.observer__groupe {
  margin-bottom: var(--cell);
}

.observer__groupe-titre {
  margin-bottom: var(--minor);
  font-weight: 700;
  font-size: var(--fs-h2);
}

.observer__tuiles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--minor);
}

.observer__suite {
  margin-top: var(--minor);
}

.observer__critere {
  display: flex;
  flex-direction: column;
  gap: var(--minor);
  margin-bottom: var(--cell);
}

.observer__question {
  margin: 0;
  color: var(--ink);
}

@media (min-width: 900px) {
  .observer__tuiles {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
