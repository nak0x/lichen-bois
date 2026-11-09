<template>
  <GridPaper class="identifier">
    <Crosshairs :cells="croix" />
    <VerticalLabel class="identifier__vlabel" title="IDENTIFIER" />

    <header class="identifier__tete">
      <h1 class="identifier__titre">Identifier</h1>
      <p v-if="specimen" class="identifier__nom t-mono">{{ specimen.nom }}</p>
      <p v-else class="identifier__absent t-mono">Spécimen introuvable.</p>
    </header>

    <template v-if="specimen">
      <!-- Les cinq essences en cellules. -->
      <section class="identifier__essences">
        <EssenceCell
          v-for="r in resultats"
          :key="r.essence.id"
          :essence="r.essence"
          :exclue="!r.compatible"
          :raison="raisonExclusion(r)"
        />
      </section>

      <!-- Panel de verdict / proposition / signal. -->
      <!-- Cas : candidat du registre encore possible → signal immédiat. -->
      <Panel
        v-if="candidatRegistre"
        variant="signal"
        title="Attention"
        class="identifier__verdict"
      >
        <p class="identifier__verdict-texte">
          Ce bois pourrait être {{ candidatRegistre.nom }}, qui est dans le registre.
          Lis ce qui ne se déduit pas avant de le manipuler.
        </p>
        <RouterLink class="identifier__lien" :to="`/registre`">
          Ouvrir le registre →
        </RouterLink>
      </Panel>

      <!-- Cas : un seul candidat (hors registre). -->
      <Panel
        v-else-if="candidats.length === 1"
        variant="default"
        title="Proposition"
        class="identifier__verdict"
      >
        <p class="identifier__verdict-texte">
          Proposition : {{ candidats[0].nom }}.
        </p>
        <p v-if="nbCriteresRepondus <= 1" class="identifier__verdict-aide t-mono">
          Confirme avec un autre critère avant de conclure.
        </p>
        <template v-else>
          <p
            v-if="specimen.identification === candidats[0].id"
            class="identifier__confirme t-label"
          >
            Identifié comme {{ candidats[0].nom }}.
          </p>
          <CellButton
            v-else
            title="Je confirme"
            :cols="2"
            @click="confirmer(candidats[0].id)"
          />
        </template>
      </Panel>

      <!-- Cas : zéro candidat. -->
      <Panel
        v-else-if="candidats.length === 0 && auMoinsUnCritere"
        variant="default"
        title="Aucune correspondance"
        class="identifier__verdict"
      >
        <p class="identifier__verdict-texte">
          Aucune essence de l'atlas ne correspond. Refais un test, ou ce bois
          n'est pas encore dans l'atlas.
        </p>
      </Panel>

      <!-- Meilleur test suivant. -->
      <p v-if="meilleur" class="identifier__meilleur t-mono">
        Le test qui départagerait le mieux : {{ labelCritere(meilleur) }}.
        <RouterLink class="identifier__lien" :to="lienTest(meilleur)">
          Faire ce test →
        </RouterLink>
      </p>

      <!-- Liste des critères, modifiables sur place. -->
      <section class="identifier__criteres">
        <h2 class="identifier__sous-titre">Les critères</h2>
        <div v-for="c in criteres" :key="c.id" class="identifier__critere">
          <div class="identifier__critere-tete">
            <span class="identifier__critere-nom t-label">{{ labelCritere(c) }}</span>
            <span class="identifier__critere-valeur t-mono">{{ valeurLisible(c) }}</span>
          </div>
          <ChoiceCells
            :options="c.options"
            :label="c.question"
            :model-value="specimen.answers[c.id]"
            @update:model-value="(v) => onReponse(c.id, v)"
          />
          <button
            type="button"
            class="identifier__pourquoi-btn t-label"
            :aria-expanded="pourquoiOuvert[c.id] === true"
            @click="togglePourquoi(c.id)"
          >
            Pourquoi ce critère ? {{ pourquoiOuvert[c.id] ? '−' : '+' }}
          </button>
          <p v-if="pourquoiOuvert[c.id]" class="identifier__pourquoi t-mono">
            {{ c.pourquoi }}
          </p>
        </div>
      </section>
    </template>
  </GridPaper>
</template>

<script setup lang="ts">
/**
 * Identifier (§8.3) — papier. Cinq essences en cellules (exclusions barrées),
 * liste des critères modifiables, meilleur test suivant, proposition pour un
 * candidat, signal immédiat si candidat du registre, cas zéro candidat.
 * On parle toujours de « proposition », jamais d'une conclusion définitive.
 */
import { computed, onMounted, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import GridPaper from '@/components/ui/GridPaper.vue'
import Crosshairs from '@/components/ui/Crosshairs.vue'
import VerticalLabel from '@/components/ui/VerticalLabel.vue'
import CellButton from '@/components/ui/CellButton.vue'
import ChoiceCells from '@/components/ui/ChoiceCells.vue'
import Panel from '@/components/ui/Panel.vue'
import EssenceCell from '@/components/screens/identifier/EssenceCell.vue'
import { essences, criteres } from '@/data'
import type { Critere, CritereId, EssenceId } from '@/types/content'
import { filtrer, meilleurCritereSuivant, type ResultatCandidat } from '@/engine/identification'
import { useCarnetStore } from '@/stores/carnet'
import type { Cell } from '@/components/ui/grid'

const props = defineProps<{ specimenId?: string }>()
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

// Libellé court d'un critère (minuscule, pour « exclu : résine »).
const LABELS_COURTS: Record<CritereId, string> = {
  resine: 'résine',
  masse: 'masse',
  coupe: 'coupe',
  moelle: 'moelle',
  couleur: 'couleur',
  ongle: 'ongle',
  ecorce: 'écorce',
  rameau: 'rameau',
}

function labelCritere(c: Critere): string {
  return LABELS_COURTS[c.id]
}

// Filtrage : résultats (compatibles + exclus) et liste des candidats.
const resultats = computed<ResultatCandidat[]>(() => {
  const spec = specimen.value
  if (!spec) return essences.map((e) => ({ essence: e, compatible: true, exclusions: [] }))
  return filtrer(essences, spec.answers, spec.mesures)
})

const candidats = computed(() => resultats.value.filter((r) => r.compatible).map((r) => r.essence))

// Un candidat du registre encore possible déclenche le signal immédiat.
const candidatRegistre = computed(() => candidats.value.find((e) => e.registre) ?? null)

// Critères répondus (hors « je ne sais pas »), pour la règle de confirmation.
const nbCriteresRepondus = computed(() => {
  const spec = specimen.value
  if (!spec) return 0
  let n = 0
  for (const c of criteres) {
    const v = spec.answers[c.id]
    if (v && v !== 'je-ne-sais-pas') n++
  }
  // La masse mesurée compte aussi comme un critère observé.
  if (spec.mesures && !(spec.answers.masse && spec.answers.masse !== 'je-ne-sais-pas')) n++
  return n
})

const auMoinsUnCritere = computed(() => nbCriteresRepondus.value > 0)

// Meilleur test suivant parmi les candidats restants.
const meilleur = computed<Critere | null>(() => {
  const spec = specimen.value
  if (!spec) return null
  return meilleurCritereSuivant(candidats.value, criteres, spec.answers)
})

/** Raison d'exclusion formatée (« exclu : résine »). */
function raisonExclusion(r: ResultatCandidat): string | undefined {
  if (r.compatible || r.exclusions.length === 0) return undefined
  const crit = r.exclusions[0].critere
  return `exclu : ${LABELS_COURTS[crit]}`
}

/** Valeur lisible de la réponse courante d'un critère. */
function valeurLisible(c: Critere): string {
  const spec = specimen.value
  const v = spec?.answers[c.id]
  if (!v || v === 'je-ne-sais-pas') {
    return v === 'je-ne-sais-pas' ? 'je ne sais pas' : 'pas encore observé'
  }
  const opt = c.options.find((o) => o.id === v)
  return opt ? opt.label : v
}

function lienTest(c: Critere): string {
  const spec = specimen.value
  if (!spec) return '/observer'
  return `/observer/${spec.id}?test=${c.testId}`
}

const pourquoiOuvert = reactive<Partial<Record<CritereId, boolean>>>({})
function togglePourquoi(id: CritereId): void {
  pourquoiOuvert[id] = !pourquoiOuvert[id]
}

async function onReponse(critere: CritereId, valeur: string | undefined): Promise<void> {
  if (!specimen.value) return
  await carnet.mettreAJourAnswers(specimen.value.id, { [critere]: valeur } as Record<CritereId, string>)
}

async function confirmer(id: EssenceId): Promise<void> {
  if (!specimen.value) return
  await carnet.mettreAJourIdentification(specimen.value.id, id)
}
</script>

<style scoped>
.identifier {
  position: relative;
  min-height: 100%;
  padding-top: var(--cell);
  padding-bottom: var(--cell);
  padding-right: calc(1.5 * var(--fs-vertical));
}

.identifier__vlabel {
  position: absolute;
  top: var(--cell);
  right: 0;
}

.identifier__tete {
  margin-bottom: var(--cell);
}

.identifier__titre {
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
}

.identifier__nom {
  margin: calc(var(--minor) / 2) 0 0;
  color: var(--ink-2);
}

.identifier__absent {
  color: var(--signal);
}

/* Cinq essences. */
.identifier__essences {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--minor);
  margin-bottom: var(--cell);
}

.identifier__verdict {
  margin-bottom: var(--cell);
}

.identifier__verdict-texte {
  margin: 0 0 var(--minor);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-h2);
  letter-spacing: -0.01em;
}

.identifier__verdict-aide {
  margin: 0;
  color: var(--ink-2);
}

.identifier__confirme {
  color: var(--moss-ink);
}

.identifier__lien {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--fs-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.identifier__meilleur {
  margin: 0 0 var(--cell);
  padding: var(--minor);
  color: var(--ink);
  border: var(--line) solid var(--ink);
}

/* Critères. */
.identifier__sous-titre {
  margin-bottom: var(--minor);
  font-weight: 700;
  font-size: var(--fs-h2);
}

.identifier__critere {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
  margin-bottom: var(--cell);
  padding-bottom: var(--minor);
  border-bottom: var(--line) solid var(--grid-major);
}

.identifier__critere-tete {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--minor);
}

.identifier__critere-nom {
  color: var(--ink-2);
}

.identifier__critere-valeur {
  color: var(--ink);
  text-align: right;
}

.identifier__pourquoi-btn {
  align-self: flex-start;
  min-height: 44px;
  padding: 0 var(--minor);
  color: var(--ink);
  border: var(--line) solid var(--ink);
}

.identifier__pourquoi {
  margin: 0;
  color: var(--ink-2);
}

@media (min-width: 900px) {
  .identifier__essences {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
