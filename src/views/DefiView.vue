<template>
  <div v-if="defi" class="defi">
    <header class="defi__head">
      <RouterLink class="defi__retour t-label" :to="{ name: 'defis' }">← Défis</RouterLink>
      <h1 class="defi__titre">{{ defi.titre }}</h1>
    </header>

    <Stepper :labels="['Le besoin', 'Choisis un bois', 'Justifie', 'Verdict']" :current="etape" />

    <!-- Panel sécurité si le défi en a une. -->
    <Panel v-if="defi.securite" variant="safety" class="defi__securite">{{ defi.securite }}</Panel>

    <!-- Étape 1 : le besoin, exigences en clair (sans nommer les propriétés). -->
    <section v-if="etape === 1" class="defi__section">
      <p class="defi__besoin t-mono">{{ defi.besoin }}</p>
      <h2 class="defi__h2">Il te faut un bois capable de…</h2>
      <ul class="defi__enclair t-mono">
        <li v-for="(ex, i) in defi.exigences" :key="i">{{ ex.enClair }}</li>
      </ul>
      <CellButton title="Choisir un bois" :cols="4" @click="etape = 2" />
    </section>

    <!-- Étape 2 : choix du bois (spécimens identifiés, puis essences). -->
    <section v-if="etape === 2" class="defi__section">
      <template v-if="specimensIdentifies.length">
        <h2 class="defi__h2">Tes spécimens identifiés</h2>
        <div class="defi__choix">
          <button
            v-for="s in specimensIdentifies"
            :key="s.id"
            type="button"
            class="defi__bois"
            :class="{ 'defi__bois--sel': choix?.type === 'specimen' && choix.id === s.id }"
            @click="choisirSpecimen(s.id, s.essenceId)"
          >
            <span class="defi__bois-nom">{{ s.nom }}</span>
            <span class="defi__bois-sub t-label">{{ nomEssence(s.essenceId) }}</span>
          </button>
        </div>
      </template>

      <h2 class="defi__h2">Les essences de l'atlas</h2>
      <div class="defi__choix">
        <button
          v-for="e in essences"
          :key="e.id"
          type="button"
          class="defi__bois"
          :class="{
            'defi__bois--sel': choix?.type === 'essence' && choix.essenceId === e.id,
            'defi__bois--signal': e.registre,
          }"
          @click="choisirEssence(e.id)"
        >
          <span class="defi__bois-nom">{{ e.nom }}</span>
          <span class="defi__bois-sub t-label">{{ e.coordonnee }}</span>
        </button>
      </div>

      <div class="defi__nav">
        <button type="button" class="defi__back t-label" @click="etape = 1">← Le besoin</button>
        <CellButton title="Justifier" :cols="4" :disabled="!choix" @click="etape = 3" />
      </div>
    </section>

    <!-- Étape 3 : justification par propriétés + raison libre. -->
    <section v-if="etape === 3" class="defi__section">
      <h2 class="defi__h2">Qu'est-ce qui rend ce bois adapté ?</h2>
      <div class="defi__chips">
        <Chip
          v-for="p in proprietes"
          :key="p.id"
          :selected="cites.includes(p.id)"
          @toggle="basculerCite(p.id)"
          >{{ p.label }}</Chip
        >
      </div>
      <label class="defi__raison-label t-label" for="defi-raison">Ta raison (facultatif)</label>
      <textarea
        id="defi-raison"
        v-model="raison"
        class="defi__raison"
        rows="3"
        placeholder="Explique ton choix avec tes mots."
      />
      <div class="defi__nav">
        <button type="button" class="defi__back t-label" @click="etape = 2">← Choisir</button>
        <CellButton title="Voir le verdict" :cols="4" @click="valider" />
      </div>
    </section>

    <!-- Étape 4 : verdict. -->
    <section v-if="etape === 4 && verdict && essenceChoisie" class="defi__section">
      <!-- Interception registre : AVANT toute analyse. -->
      <template v-if="verdict.interception && !analyseVue">
        <Panel variant="signal" title="Ce qui ne se déduit pas" class="defi__interception">
          <template v-if="entreeRegistre">
            <p class="defi__texte t-mono">{{ entreeRegistre.pourquoiIndeductible }}</p>
            <h3 class="defi__h3">Ce qu'il faut savoir</h3>
            <ul class="defi__liste-mono t-mono">
              <li v-for="(s, i) in entreeRegistre.ceQuIlFautSavoir" :key="i">{{ s }}</li>
            </ul>
            <p class="defi__lien-registre">
              <RouterLink class="defi__lien" :to="{ name: 'registre' }"
                >Lire l'entrée complète →</RouterLink
              >
            </p>
          </template>
        </Panel>
        <CellButton title="Voir quand même l'analyse" :cols="5" @click="analyseVue = true" />
      </template>

      <!-- Analyse. -->
      <template v-else>
        <h2 class="defi__verdict-titre">{{ libelleGlobal }}</h2>

        <!-- Une ligne par exigence. -->
        <ul class="defi__verdict">
          <li
            v-for="l in verdict.lignes"
            :key="l.propriete"
            class="defi__v-ligne"
            :class="`defi__v-ligne--${l.statut}`"
          >
            <span class="defi__v-marque" aria-hidden="true">{{ marque(l.statut) }}</span>
            <span class="defi__v-corps">
              <span class="defi__v-nom">{{ labelPropriete(l.propriete) }}</span>
              <span class="defi__v-detail t-mono">
                attendu {{ l.requis }}/5 · ce bois {{ l.valeur }}/5 — {{ enClair(l.propriete) }}
              </span>
            </span>
          </li>
        </ul>

        <!-- Retour sur la justification. -->
        <div class="defi__retroaction t-mono">
          <p v-if="verdict.citesPertinents.length">
            Tu as vu juste sur : {{ listeLabels(verdict.citesPertinents) }}.
          </p>
          <p v-if="verdict.oublies.length">
            Tu n'as pas cité : {{ listeLabels(verdict.oublies) }}.
          </p>
          <p v-if="verdict.citesHorsSujet.length">
            Hors sujet ici : {{ listeLabels(verdict.citesHorsSujet) }}.
          </p>
        </div>

        <!-- Révélation (usages placeholder, enrichie en commit suivant). -->
        <section class="defi__revelation">
          <h3 class="defi__h3">Révélation</h3>
          <p class="defi__texte t-mono">{{ defi.revelation }}</p>
          <div v-for="eid in defi.attendus" :key="eid" class="defi__usages-bloc">
            <h4 class="defi__usages-titre t-label">{{ nomEssence(eid) }}</h4>
            <ul class="defi__liste-mono t-mono">
              <li v-for="(u, i) in usagesDe(eid)" :key="i">{{ u }}</li>
            </ul>
          </div>
        </section>

        <div class="defi__nav">
          <CellButton title="Recommencer" :cols="4" @click="recommencer" />
          <RouterLink class="defi__lien" :to="{ name: 'defis' }">Autres défis →</RouterLink>
        </div>
      </template>
    </section>
  </div>

  <div v-else class="defi defi--absent">
    <p class="t-mono">Ce défi n'existe pas.</p>
    <RouterLink class="defi__lien" :to="{ name: 'defis' }">← Retour aux défis</RouterLink>
  </div>
</template>

<script setup lang="ts">
/**
 * DefiView (§8.6) — un défi en 4 étapes.
 * 1. Le besoin en clair, sans nommer les propriétés.
 * 2. Choix d'un bois : spécimens identifiés puis essences (pré-sélection via
 *    ?specimen= / ?essence=).
 * 3. Justification par Chip de propriétés + raison libre.
 * 4. Verdict : interception registre AVANT analyse, puis lignes ✓/~/✗,
 *    rétroaction, verdict global en titre, révélation des usages.
 * Le défi réalisé est enregistré via specimenOuAtlas + ajouterDefi.
 */
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { EssenceId, ProprieteId, Verdict } from '@/types/content'
import { defis, essences, proprietes, registre } from '@/data'
import { evaluer, LIBELLES_GLOBAL } from '@/engine/defis'
import { useCarnetStore } from '@/stores/carnet'
import Panel from '@/components/ui/Panel.vue'
import Chip from '@/components/ui/Chip.vue'
import CellButton from '@/components/ui/CellButton.vue'
import Stepper from '@/components/screens/defis/Stepper.vue'

const props = defineProps<{ defiId: string }>()
const route = useRoute()
const carnet = useCarnetStore()

const defi = computed(() => defis.find((d) => d.id === props.defiId))

const etape = ref(1)
type Choix =
  | { type: 'specimen'; id: string; essenceId: EssenceId }
  | { type: 'essence'; essenceId: EssenceId }
const choix = ref<Choix | null>(null)
const cites = ref<ProprieteId[]>([])
const raison = ref('')
const verdict = ref<Verdict | null>(null)
const analyseVue = ref(false)

// Spécimens du carnet identifiés (hors Atlas implicite).
const specimensIdentifies = computed(() =>
  carnet.specimens
    .filter((s) => s.identification && !s.id.startsWith('atlas-'))
    .map((s) => ({ id: s.id, nom: s.nom, essenceId: s.identification as EssenceId })),
)

const essenceChoisie = computed(() =>
  choix.value ? essences.find((e) => e.id === choix.value!.essenceId) : undefined,
)

const entreeRegistre = computed(() =>
  essenceChoisie.value
    ? registre.find((r) => r.essenceId === essenceChoisie.value!.id)
    : undefined,
)

const libelleGlobal = computed(() =>
  verdict.value ? LIBELLES_GLOBAL[verdict.value.global] : '',
)

function nomEssence(id: EssenceId): string {
  return essences.find((e) => e.id === id)?.nom ?? id
}

function usagesDe(id: EssenceId): string[] {
  return essences.find((e) => e.id === id)?.usages ?? []
}

function labelPropriete(id: ProprieteId): string {
  return proprietes.find((p) => p.id === id)?.label ?? id
}

function listeLabels(ids: ProprieteId[]): string {
  return ids.map(labelPropriete).join(', ')
}

function enClair(id: ProprieteId): string {
  return defi.value?.exigences.find((e) => e.propriete === id)?.enClair ?? ''
}

function marque(statut: 'ok' | 'limite' | 'insuffisant'): string {
  return statut === 'ok' ? '✓' : statut === 'limite' ? '~' : '✗'
}

function choisirSpecimen(id: string, essenceId: EssenceId): void {
  choix.value = { type: 'specimen', id, essenceId }
}

function choisirEssence(essenceId: EssenceId): void {
  choix.value = { type: 'essence', essenceId }
}

function basculerCite(id: ProprieteId): void {
  cites.value = cites.value.includes(id)
    ? cites.value.filter((p) => p !== id)
    : [...cites.value, id]
}

async function valider(): Promise<void> {
  if (!defi.value || !essenceChoisie.value) return
  const v = evaluer(defi.value, essenceChoisie.value, cites.value)
  verdict.value = v
  analyseVue.value = false
  etape.value = 4

  // Enregistrer le défi dans le spécimen choisi (ou Atlas implicite).
  const specimenId = choix.value?.type === 'specimen' ? choix.value.id : undefined
  const cible = await carnet.specimenOuAtlas(essenceChoisie.value.id, specimenId)
  await carnet.ajouterDefi(cible, {
    defiId: defi.value.id,
    essenceId: essenceChoisie.value.id,
    cites: [...cites.value],
    raison: raison.value || undefined,
    verdict: v.global,
    date: new Date().toISOString(),
  })
}

function recommencer(): void {
  etape.value = 1
  choix.value = null
  cites.value = []
  raison.value = ''
  verdict.value = null
  analyseVue.value = false
}

// Pré-sélection via ?specimen= / ?essence=.
onMounted(() => {
  const specimenQ = typeof route.query.specimen === 'string' ? route.query.specimen : undefined
  const essenceQ = typeof route.query.essence === 'string' ? route.query.essence : undefined
  if (specimenQ) {
    const s = specimensIdentifies.value.find((x) => x.id === specimenQ)
    if (s) {
      choisirSpecimen(s.id, s.essenceId)
      etape.value = 2
      return
    }
  }
  if (essenceQ) {
    const e = essences.find((x) => x.id === essenceQ)
    if (e) {
      choisirEssence(e.id)
      etape.value = 2
    }
  }
})
</script>

<style scoped>
.defi {
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}

.defi__retour {
  display: inline-block;
  color: var(--ink-2);
  text-decoration: none;
}

.defi__titre {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
}

.defi__section {
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}

.defi__h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-h2);
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.defi__h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-body);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.defi__besoin {
  margin: 0;
  color: var(--ink);
}

.defi__enclair,
.defi__liste-mono {
  margin: 0;
  padding-left: 1.2em;
  color: var(--ink-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.defi__texte {
  margin: 0;
  color: var(--ink-2);
}

.defi__choix {
  display: flex;
  flex-wrap: wrap;
  gap: var(--minor);
}

.defi__bois {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 44px;
  padding: calc(var(--minor) / 2) var(--minor);
  text-align: left;
  color: var(--ink);
  background: transparent;
  border: var(--line) solid var(--ink);
  cursor: pointer;
}

.defi__bois--sel {
  background: var(--moss);
  color: var(--moss-ink);
  border-color: var(--moss-ink);
}

.defi__bois--signal {
  border-color: var(--signal);
  color: var(--signal);
}

.defi__bois--signal.defi__bois--sel {
  background: var(--signal);
  color: var(--paper);
}

.defi__bois-nom {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-body);
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.defi__bois-sub {
  color: inherit;
  opacity: 0.8;
}

.defi__chips {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--minor) / 2);
}

.defi__raison-label {
  color: var(--ink-2);
}

.defi__raison {
  font: 300 var(--fs-input) / 1.5 var(--font-body);
  color: var(--ink);
  background: var(--plate);
  border: var(--line) solid var(--ink);
  padding: calc(var(--minor) / 2);
  resize: vertical;
}

.defi__nav {
  display: flex;
  align-items: center;
  gap: var(--minor);
  flex-wrap: wrap;
}

.defi__back {
  background: transparent;
  border: none;
  color: var(--ink-2);
  cursor: pointer;
  padding: 8px 0;
}

.defi__verdict-titre {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
}

.defi__verdict {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.defi__v-ligne {
  display: flex;
  gap: var(--minor);
  padding: calc(var(--minor) / 2) 0;
  border-top: var(--line) solid var(--plate-grid);
}

.defi__v-marque {
  flex: 0 0 auto;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h2);
  line-height: 1;
}

.defi__v-ligne--ok .defi__v-marque {
  color: var(--moss-ink);
}
.defi__v-ligne--limite .defi__v-marque {
  color: var(--ink-2);
}
.defi__v-ligne--insuffisant .defi__v-marque {
  color: var(--signal);
}

.defi__v-corps {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.defi__v-nom {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-body);
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.defi__v-detail {
  color: var(--ink-2);
}

.defi__retroaction {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--ink);
}

.defi__retroaction p {
  margin: 0;
}

.defi__revelation,
.defi__usages-bloc {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
}

.defi__usages-titre {
  color: var(--ink);
}

.defi__lien {
  color: var(--signal);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--fs-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
}

.defi__lien-registre {
  margin: calc(var(--minor) / 2) 0 0;
}

.defi--absent {
  gap: var(--minor);
}
</style>
