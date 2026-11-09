<template>
  <div v-if="essence" class="fiche">
    <div class="fiche__col">
      <!-- En-tête : nom, latin/famille/coordonnée. -->
      <header class="fiche__head">
        <RouterLink class="fiche__retour t-label" :to="{ name: 'atlas' }">← Atlas</RouterLink>
        <h1 class="fiche__nom">{{ essence.nom }}</h1>
        <p class="fiche__meta t-mono">
          {{ essence.latin }} · {{ essence.famille }} · {{ essence.coordonnee }}
        </p>
      </header>

      <!-- Bandeau vermillon si registre. -->
      <Panel v-if="essence.registre" variant="signal" title="Registre" class="fiche__bloc">
        Ce bois est dans « ce qui ne se déduit pas ». Lis l'entrée du registre avant de le
        manipuler.
        <p class="fiche__lien-registre">
          <RouterLink class="fiche__lien" :to="{ name: 'registre' }"
            >Lire l'entrée du registre →</RouterLink
          >
        </p>
      </Panel>

      <!-- Coupe interactive. -->
      <section class="fiche__bloc">
        <h2 class="fiche__h2">La coupe</h2>
        <CoupeTransversale :type="essence.coupe" interactive />
      </section>

      <!-- Reconnaître. -->
      <section class="fiche__bloc">
        <h2 class="fiche__h2">Reconnaître</h2>
        <dl class="fiche__reconnaitre">
          <div v-for="c in criteres" :key="c.id" class="fiche__rec-ligne">
            <dt class="fiche__rec-q t-label">{{ c.question }}</dt>
            <dd class="fiche__rec-r t-mono">{{ libelleAttendu(c.id) }}</dd>
          </div>
        </dl>
      </section>

      <!-- Pourquoi. -->
      <section class="fiche__bloc">
        <h2 class="fiche__h2">Pourquoi ce bois se comporte ainsi</h2>
        <p class="fiche__texte t-mono">{{ essence.pourquoi }}</p>
      </section>

      <!-- Propriétés : 10 PropertyScale dépliables. -->
      <section class="fiche__bloc">
        <h2 class="fiche__h2">Propriétés</h2>
        <PropertyScale
          v-for="p in proprietes"
          :key="p.id"
          :label="p.label"
          :note="essence.proprietes[p.id]"
          :question="p.question"
          :explication="p.explication"
        />
      </section>

      <!-- Usages traditionnels : verrouillés par défaut. -->
      <section class="fiche__bloc">
        <h2 class="fiche__h2">Usages traditionnels</h2>

        <template v-if="usagesVisibles">
          <ul class="fiche__usages t-mono">
            <li v-for="(u, i) in essence.usages" :key="i">{{ u }}</li>
          </ul>
          <p v-if="defiRealise" class="fiche__note t-label">
            Déverrouillés : tu as relevé un défi avec ce bois.
          </p>
        </template>

        <Panel
          v-else
          variant="locked"
          :seed="seedUsages"
          message="Essaie d'abord de le déduire : relève un défi."
        >
          <ul class="fiche__usages t-mono">
            <li v-for="(u, i) in essence.usages" :key="i">{{ u }}</li>
          </ul>
          <template #locked-actions>
            <CellButton
              class="fiche__relever"
              title="Relever un défi"
              :to="{ name: 'defis' }"
              :cols="4"
            />
            <button type="button" class="fiche__reveler t-label" @click="revelerQuandMeme">
              Révéler quand même
            </button>
          </template>
        </Panel>
      </section>

      <!-- Récolter en conscience. -->
      <section class="fiche__bloc">
        <h2 class="fiche__h2">Récolter en conscience</h2>
        <p class="fiche__texte t-mono">{{ essence.recolte }}</p>
      </section>

      <!-- Le savais-tu ? -->
      <section v-if="essence.anecdote" class="fiche__bloc">
        <h2 class="fiche__h2">Le savais-tu ?</h2>
        <p class="fiche__texte t-mono">{{ essence.anecdote }}</p>
        <p v-if="essence.notesFiabilite" class="fiche__note t-mono">
          {{ essence.notesFiabilite }}
        </p>
      </section>
    </div>

    <VerticalLabel class="fiche__label" :title="essence.nom" subtitle="Atlas" />
  </div>

  <div v-else class="fiche fiche--absente">
    <p class="t-mono">Cette essence n'est pas dans l'atlas.</p>
    <RouterLink class="fiche__lien" :to="{ name: 'atlas' }">← Retour à l'atlas</RouterLink>
  </div>
</template>

<script setup lang="ts">
/**
 * EssenceView (§8.5) — fiche d'une essence sur la planche.
 * Nom, latin/famille/coordonnée, bandeau registre, coupe interactive,
 * « Reconnaître » (libellé attendu par critère), « Pourquoi », 10 propriétés
 * dépliables, usages verrouillés (Panel locked) débloqués par un défi réalisé,
 * récolte et anecdote.
 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { CritereId } from '@/types/content'
import { essences, criteres, proprietes } from '@/data'
import { useCarnetStore } from '@/stores/carnet'
import { parseCoord } from '@/components/screens/atlas/coord'
import Panel from '@/components/ui/Panel.vue'
import PropertyScale from '@/components/ui/PropertyScale.vue'
import CellButton from '@/components/ui/CellButton.vue'
import VerticalLabel from '@/components/ui/VerticalLabel.vue'
import CoupeTransversale from '@/components/illustrations/CoupeTransversale.vue'

const props = defineProps<{ essenceId: string }>()

const essence = computed(() => essences.find((e) => e.id === props.essenceId))

const carnet = useCarnetStore()

// Un défi a-t-il été réalisé avec cette essence ? (store carnet)
const defiRealise = computed(() => {
  const id = essence.value?.id
  if (!id) return false
  return carnet.specimens.some((s) => s.defis.some((d) => d.essenceId === id))
})

// Révélation manuelle confirmée.
const revelationForcee = ref(false)

const usagesVisibles = computed(() => defiRealise.value || revelationForcee.value)

// Graine stable du masque verrouillé, dérivée de la coordonnée.
const seedUsages = computed(() => {
  const { col, row } = parseCoord(essence.value?.coordonnee ?? 'A1')
  return col * 31 + row
})

function libelleAttendu(id: CritereId): string {
  const e = essence.value
  if (!e) return '—'
  const attendus = e.criteres[id]
  if (!attendus || attendus.length === 0) return '—'
  const critere = criteres.find((c) => c.id === id)
  if (!critere) return '—'
  const labels = attendus.map(
    (optId) => critere.options.find((o) => o.id === optId)?.label ?? optId,
  )
  return labels.join(' ou ')
}

function revelerQuandMeme(): void {
  const ok = window.confirm(
    'Révéler les usages sans relever de défi ? Tu perds l\'occasion de les déduire toi-même.',
  )
  if (ok) revelationForcee.value = true
}
</script>

<style scoped>
.fiche {
  display: flex;
  gap: var(--minor);
}

.fiche__col {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--cell) / 2);
}

.fiche__label {
  flex: 0 0 auto;
}

.fiche__retour {
  display: inline-block;
  margin-bottom: calc(var(--minor) / 2);
  color: var(--ink-2);
  text-decoration: none;
}

.fiche__nom {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
}

.fiche__meta {
  margin: calc(var(--minor) / 2) 0 0;
  color: var(--ink-2);
}

.fiche__h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-h2);
  letter-spacing: -0.01em;
  text-transform: uppercase;
  margin-bottom: calc(var(--minor) / 2);
}

.fiche__texte {
  margin: 0;
  color: var(--ink-2);
  line-height: 1.55;
}

.fiche__bloc :deep(.coupe) {
  max-width: calc(var(--cell) * 5);
}

.fiche__reconnaitre {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.fiche__rec-ligne {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: calc(var(--minor) / 2) 0;
  border-top: var(--line) solid var(--plate-grid);
}

.fiche__rec-q {
  margin: 0;
  color: var(--ink-3);
}

.fiche__rec-r {
  margin: 0;
  color: var(--ink);
}

.fiche__usages {
  margin: 0;
  padding-left: 1.2em;
  color: var(--ink-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fiche__note {
  margin: calc(var(--minor) / 2) 0 0;
  color: var(--ink-3);
}

.fiche__lien-registre {
  margin: calc(var(--minor) / 2) 0 0;
}

.fiche__lien {
  color: var(--signal);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--fs-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
}

.fiche__relever {
  text-decoration: none;
}

.fiche__reveler {
  background: transparent;
  border: none;
  color: var(--ink-3);
  text-decoration: underline;
  cursor: pointer;
  padding: 4px;
}

.fiche--absente {
  display: flex;
  flex-direction: column;
  gap: var(--minor);
}
</style>
