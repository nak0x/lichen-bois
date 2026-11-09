<template>
  <!-- Mode clôture de démo : seule la phrase de principe, en --fs-display. -->
  <GridPaper v-if="cloture" class="accueil accueil--cloture">
    <p class="accueil__principe-seul">
      Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s'apprend.
    </p>
  </GridPaper>

  <GridPaper v-else class="accueil">
    <!-- Grappe de croix en haut à gauche (grille 3 × 3 d'intersections majeures). -->
    <Crosshairs :cells="croix" />

    <!-- Titre vertical dans la marge droite. -->
    <VerticalLabel class="accueil__vlabel" title="BOIS" subtitle="Module 01" />

    <!-- En-tête : mot-symbole pixel + sous-titre. -->
    <header class="accueil__tete">
      <PixelWordmark word="LICHEN" reveal class="accueil__wordmark" />
      <p class="accueil__sous-titre t-mono">Module 01 — Bois</p>
    </header>

    <!-- Grande coupe du frêne, révélée en escalier, qui déborde à droite. -->
    <div class="accueil__visuel" aria-hidden="true">
      <GridReveal
        :cols="REVEAL_COLS"
        :rows="REVEAL_ROWS"
        :seed="[0, REVEAL_ROWS - 1]"
        :mask="masqueEscalier"
      >
        <CoupeTransversale type="zone-poreuse" :seed="101" />
      </GridReveal>
    </div>

    <!-- Ligne de méthode. -->
    <p class="accueil__methode t-label">
      Observer · Identifier · Comprendre · Déduire
    </p>

    <!-- Tuiles de navigation. -->
    <nav class="accueil__tuiles" aria-label="Accès">
      <CellButton
        coord="A1"
        title="Nouveau spécimen"
        subtitle="Observer un bois"
        :cols="2"
        @click="nouveauSpecimen"
      />
      <CellButton coord="C1" title="Atlas" subtitle="Les cinq essences" to="/atlas" />
      <CellButton coord="D1" title="Défis" subtitle="Déduire un usage" to="/defis" />
      <CellButton coord="E1" title="Carnet" subtitle="Tes spécimens" to="/carnet" />
      <CellButton
        signal
        coord="R"
        title="Ce qui ne se déduit pas"
        subtitle="Le registre"
        :cols="2"
        to="/registre"
      />
    </nav>

    <!-- Pied : phrase de principe. -->
    <footer class="accueil__pied">
      <p class="accueil__principe t-mono">
        Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s'apprend.
      </p>
    </footer>
  </GridPaper>
</template>

<script setup lang="ts">
/**
 * Accueil (§8.1) — papier millimétré.
 * Grappe de croix, mot-symbole « LICHEN » révélé, coupe de frêne qui déborde
 * à droite, ligne de méthode, tuiles de navigation, phrase de principe.
 * ?demo=cloture → seule la phrase de principe, en --fs-display.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GridPaper from '@/components/ui/GridPaper.vue'
import Crosshairs from '@/components/ui/Crosshairs.vue'
import PixelWordmark from '@/components/ui/PixelWordmark.vue'
import VerticalLabel from '@/components/ui/VerticalLabel.vue'
import GridReveal from '@/components/ui/GridReveal.vue'
import CellButton from '@/components/ui/CellButton.vue'
import CoupeTransversale from '@/components/illustrations/CoupeTransversale.vue'
import { stairMask, type Cell } from '@/components/ui/grid'
import { useCarnetStore } from '@/stores/carnet'

const route = useRoute()
const router = useRouter()
const carnet = useCarnetStore()

const cloture = computed(() => route.query.demo === 'cloture')

// Grappe 3 × 3 de croix sur des intersections majeures en haut à gauche.
const croix: Cell[] = [
  [1, 1], [2, 1], [3, 1],
  [1, 2], [2, 2], [3, 2],
  [1, 3], [2, 3], [3, 3],
]

// Révélation en escalier de la coupe : silhouette stable (graine frêne).
const REVEAL_COLS = 6
const REVEAL_ROWS = 6
const masqueEscalier = computed<Cell[]>(() => stairMask(REVEAL_COLS, REVEAL_ROWS, 101))

async function nouveauSpecimen(): Promise<void> {
  const id = await carnet.creer('Spécimen sans nom')
  router.push(`/observer/${id}`)
}
</script>

<style scoped>
.accueil {
  position: relative;
  min-height: 100%;
  padding-top: var(--cell);
  padding-bottom: var(--cell);
}

/* Titre vertical, posé dans la marge droite. */
.accueil__vlabel {
  position: absolute;
  top: var(--cell);
  right: 0;
  z-index: 2;
}

/* En-tête. */
.accueil__tete {
  position: relative;
  z-index: 1;
  margin-top: var(--cell);
  padding-right: calc(2 * var(--fs-vertical));
}

.accueil__wordmark {
  --px: var(--cell);
}

.accueil__sous-titre {
  margin: var(--minor) 0 0;
  color: var(--ink-2);
}

/* Grande coupe qui déborde du bord droit. */
.accueil__visuel {
  position: relative;
  z-index: 0;
  width: calc(5 * var(--cell));
  /* Déborde du bord droit, comme le rocher de la réf. A. */
  margin-right: calc(-1.5 * var(--cell));
  margin-left: auto;
  margin-top: calc(-0.5 * var(--cell));
}

/* Ligne de méthode. */
.accueil__methode {
  position: relative;
  z-index: 1;
  margin: var(--cell) 0;
  color: var(--ink);
  letter-spacing: 0.12em;
}

/* Tuiles. */
.accueil__tuiles {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--minor);
}

.accueil__tuiles > :nth-child(1) {
  grid-column: 1 / -1;
}

.accueil__tuiles > :last-child {
  grid-column: 1 / -1;
}

/* Pied. */
.accueil__pied {
  margin-top: var(--cell);
  padding-top: var(--minor);
  border-top: var(--line) solid var(--ink);
}

.accueil__principe {
  margin: 0;
  color: var(--ink-2);
  max-width: 44ch;
}

/* Mode clôture. */
.accueil--cloture {
  display: flex;
  align-items: center;
}

.accueil__principe-seul {
  margin: 0;
  padding: var(--cell) 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-display);
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--ink);
  max-width: 14ch;
}

@media (min-width: 900px) {
  .accueil__visuel {
    width: calc(6 * var(--cell));
    margin-right: calc(-2 * var(--cell));
  }

  .accueil__tuiles {
    grid-template-columns: repeat(4, 1fr);
  }

  .accueil__tuiles > :nth-child(1),
  .accueil__tuiles > :last-child {
    grid-column: span 2;
  }
}
</style>
