<template>
  <GridPaper class="specimen">
    <AppShell :label="specimen ? specimen.nom.toUpperCase() : 'SPÉCIMEN'" sublabel="fiche">
      <template v-if="specimen">
        <header class="specimen__entete">
          <RouterLink class="specimen__retour t-label" to="/carnet">← Carnet</RouterLink>
          <input
            v-model="nomEdit"
            class="specimen__nom"
            type="text"
            aria-label="Nom du spécimen"
            @change="enregistrerNom"
          />
          <p class="specimen__date t-label">Créé le {{ date }}</p>
        </header>

        <!-- Identification -->
        <section class="specimen__bloc">
          <h2 class="specimen__h2">Identification</h2>
          <RouterLink
            v-if="essenceIdentifiee"
            class="specimen__ident"
            :to="`/atlas/${specimen.identification}`"
          >
            <div class="specimen__ident-visuel">
              <CoupeTransversale v-if="coupe" :type="coupe" />
            </div>
            <div>
              <p class="specimen__ident-nom">{{ nomIdent }}</p>
              <p class="specimen__ident-lien t-label">Voir la fiche →</p>
            </div>
          </RouterLink>
          <div v-else class="specimen__non-ident">
            <p class="t-mono">Pas encore identifié.</p>
            <CellButton
              title="Identifier"
              :cols="2"
              :to="`/identifier/${specimen.id}`"
            />
          </div>
        </section>

        <!-- Mesures -->
        <section v-if="specimen.mesures" class="specimen__bloc">
          <h2 class="specimen__h2">Mesures</h2>
          <dl class="specimen__mesures">
            <div><dt class="t-label">Longueur</dt><dd class="t-mono">{{ specimen.mesures.longueur }} cm</dd></div>
            <div><dt class="t-label">Largeur</dt><dd class="t-mono">{{ specimen.mesures.largeur }} cm</dd></div>
            <div><dt class="t-label">Épaisseur</dt><dd class="t-mono">{{ specimen.mesures.epaisseur }} cm</dd></div>
            <div><dt class="t-label">Masse</dt><dd class="t-mono">{{ specimen.mesures.masse }} g</dd></div>
            <div><dt class="t-label">Densité</dt><dd class="t-mono">{{ densiteAffichee }}</dd></div>
          </dl>
        </section>

        <!-- Observations -->
        <section v-if="observations.length" class="specimen__bloc">
          <h2 class="specimen__h2">Observations</h2>
          <ul class="specimen__obs">
            <li v-for="o in observations" :key="o.id" class="specimen__obs-item">
              <span class="specimen__obs-q t-label">{{ o.question }}</span>
              <span class="specimen__obs-r t-mono">{{ o.reponse }}</span>
            </li>
          </ul>
        </section>

        <!-- Résultats de tests -->
        <section v-if="resultats.length" class="specimen__bloc">
          <h2 class="specimen__h2">Résultats de tests</h2>
          <ul class="specimen__obs">
            <li v-for="r in resultats" :key="r.id" class="specimen__obs-item">
              <span class="specimen__obs-q t-label">{{ r.titre }}</span>
              <span class="specimen__obs-r t-mono">{{ r.resultat }}</span>
            </li>
          </ul>
        </section>

        <!-- Défis réalisés -->
        <section v-if="specimen.defis.length" class="specimen__bloc">
          <h2 class="specimen__h2">Défis réalisés</h2>
          <ul class="specimen__defis">
            <li v-for="(d, i) in specimen.defis" :key="i" class="specimen__defi">
              <p class="specimen__defi-titre">{{ titreDefi(d.defiId) }}</p>
              <p class="specimen__defi-verdict t-mono">{{ texteVerdict(d) }}</p>
              <p v-if="d.cites.length" class="specimen__defi-cites t-label">
                Cité : {{ d.cites.map(labelPropriete).join(', ') }}
              </p>
            </li>
          </ul>
        </section>

        <!-- Photos -->
        <section class="specimen__bloc">
          <h2 class="specimen__h2">Photos</h2>
          <PhotoGalerie :specimen-id="specimen.id" :cles="specimen.photos" />
        </section>

        <!-- Notes libres -->
        <section class="specimen__bloc">
          <h2 class="specimen__h2">Notes libres</h2>
          <textarea
            v-model="notesEdit"
            class="specimen__notes"
            rows="4"
            placeholder="Tes remarques, hypothèses, idées d'usage…"
            @change="enregistrerNotes"
          />
        </section>

        <!-- Suppression -->
        <div class="specimen__pied">
          <CellButton
            title="Supprimer ce spécimen"
            coord="R"
            :cols="2"
            signal
            @click="demandeSuppr = true"
          />
        </div>
      </template>

      <p v-else class="specimen__absent t-mono">
        Ce spécimen n'existe pas ou a été supprimé.
        <RouterLink to="/carnet">Retour au carnet</RouterLink>
      </p>
    </AppShell>

    <ConfirmationSignal
      v-if="demandeSuppr"
      titre="Supprimer"
      message="Ce spécimen et ses photos seront supprimés définitivement."
      libelleConfirmer="Supprimer"
      @annuler="demandeSuppr = false"
      @confirmer="confirmerSuppr"
    />
  </GridPaper>
</template>

<script setup lang="ts">
/**
 * SpecimenView — détail d'un spécimen (§8.8).
 * Observations, mesures, résultats de tests, identification, défis réalisés,
 * notes libres, photos. Appelle initialiser() au montage.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import GridPaper from '@/components/ui/GridPaper.vue'
import AppShell from '@/components/ui/AppShell.vue'
import CellButton from '@/components/ui/CellButton.vue'
import CoupeTransversale from '@/components/illustrations/CoupeTransversale.vue'
import PhotoGalerie from '@/components/screens/carnet/PhotoGalerie.vue'
import ConfirmationSignal from '@/components/screens/carnet/ConfirmationSignal.vue'
import { useCarnetStore } from '@/stores/carnet'
import { densite as calcDensite } from '@/engine/identification'
import type { CritereId } from '@/types/content'
import {
  coupeEssence,
  formaterDate,
  labelPropriete,
  libelleCritere,
  libelleResultatTest,
  nomEssence,
  texteVerdict,
  titreDefi,
} from '@/components/screens/carnet/aides'

const props = defineProps<{ specimenId: string }>()

const carnet = useCarnetStore()
const router = useRouter()

const demandeSuppr = ref(false)
const nomEdit = ref('')
const notesEdit = ref('')

onMounted(async () => {
  await carnet.initialiser()
})

const specimen = computed(() => carnet.trouver(props.specimenId))

watch(
  specimen,
  (s) => {
    if (s) {
      nomEdit.value = s.nom
      notesEdit.value = s.notes
    }
  },
  { immediate: true },
)

const date = computed(() => (specimen.value ? formaterDate(specimen.value.creeLe) : ''))
const essenceIdentifiee = computed(() => Boolean(specimen.value?.identification))
const nomIdent = computed(() => nomEssence(specimen.value?.identification))
const coupe = computed(() => coupeEssence(specimen.value?.identification))

const densiteAffichee = computed(() => {
  if (!specimen.value?.mesures) return '—'
  const d = calcDensite(specimen.value.mesures)
  return Number.isFinite(d) ? d.toFixed(2).replace('.', ',') : '—'
})

const observations = computed(() => {
  const s = specimen.value
  if (!s) return []
  return (Object.entries(s.answers) as [CritereId, string][])
    .filter(([, v]) => v && v !== 'je-ne-sais-pas')
    .map(([id, v]) => ({ id, ...libelleCritere(id, v) }))
})

const resultats = computed(() => {
  const s = specimen.value
  if (!s) return []
  return Object.entries(s.resultatsTests)
    .filter(([, v]) => Boolean(v))
    .map(([id, v]) => ({ id, ...libelleResultatTest(id as never, v as string) }))
})

async function enregistrerNom() {
  if (!specimen.value) return
  await carnet.mettreAJour(specimen.value.id, { nom: nomEdit.value.trim() || 'Spécimen sans nom' })
}

async function enregistrerNotes() {
  if (!specimen.value) return
  await carnet.mettreAJour(specimen.value.id, { notes: notesEdit.value })
}

async function confirmerSuppr() {
  const id = specimen.value?.id
  demandeSuppr.value = false
  if (id) await carnet.supprimer(id)
  router.push('/carnet')
}
</script>

<style scoped>
.specimen {
  min-height: 100dvh;
}

.specimen__entete {
  padding-top: var(--cell);
  margin-bottom: var(--cell);
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}

.specimen__retour {
  color: var(--ink-2);
  text-decoration: none;
  align-self: flex-start;
}

.specimen__nom {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
  background: transparent;
  border: none;
  border-bottom: var(--line) dashed var(--ink-3);
  padding: 0 0 4px;
  width: 100%;
}

.specimen__date {
  color: var(--ink-2);
}

.specimen__bloc {
  margin-bottom: var(--cell);
}

.specimen__h2 {
  margin-bottom: var(--minor);
  border-bottom: var(--line) solid var(--ink);
  padding-bottom: calc(var(--minor) / 2);
}

.specimen__ident {
  display: flex;
  gap: var(--minor);
  align-items: center;
  text-decoration: none;
  color: inherit;
  border: var(--line) solid var(--ink);
  padding: var(--minor);
  background: var(--moss-soft);
}

.specimen__ident-visuel {
  flex: 0 0 auto;
  width: var(--cell);
  height: var(--cell);
}

.specimen__ident-nom {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-h2);
  text-transform: uppercase;
  color: var(--moss-ink);
}

.specimen__ident-lien {
  margin: 0;
  color: var(--moss-ink);
}

.specimen__non-ident {
  display: flex;
  flex-direction: column;
  gap: var(--minor);
  align-items: flex-start;
}

.specimen__mesures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--minor);
  margin: 0;
}

.specimen__mesures div {
  border: var(--line) solid var(--ink-3);
  padding: calc(var(--minor) / 2) var(--minor);
}

.specimen__mesures dt {
  color: var(--ink-2);
  margin-bottom: 2px;
}

.specimen__mesures dd {
  margin: 0;
}

.specimen__obs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.specimen__obs-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: calc(var(--minor) / 2) 0;
  border-bottom: var(--line) dotted var(--grid-major);
}

.specimen__obs-q {
  color: var(--ink-2);
}

.specimen__defis {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}

.specimen__defi {
  border: var(--line) solid var(--ink);
  padding: var(--minor);
}

.specimen__defi-titre {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
}

.specimen__defi-verdict {
  margin: 0;
}

.specimen__defi-cites {
  margin: 4px 0 0;
  color: var(--ink-2);
}

.specimen__notes {
  width: 100%;
  background: var(--paper-raised);
  border: var(--line) solid var(--ink);
  padding: var(--minor);
  font-family: var(--font-body);
  resize: vertical;
}

.specimen__pied {
  margin-top: var(--cell);
}

.specimen__absent {
  padding-top: var(--cell);
}
</style>
