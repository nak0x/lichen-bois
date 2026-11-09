<template>
  <div class="sg">
    <h1 class="sg__title">Styleguide</h1>
    <p class="t-mono sg__intro">Tous les composants du design system (section 5.5) et les variantes de coupe. Page de développement uniquement.</p>

    <section class="sg__section">
      <h2>Typographie</h2>
      <p style="font-family: var(--font-display); font-weight: 800; font-size: var(--fs-h1); text-transform: uppercase; letter-spacing: -0.03em;">Titre Inter Tight 800</p>
      <p class="t-label">Étiquette Inter Tight 500</p>
      <p class="t-mono">Texte courant JetBrains Mono 300, posé sur le papier.</p>
      <VerticalLabel title="BOIS" subtitle="module 01" />
    </section>

    <section class="sg__section">
      <h2>PixelWordmark</h2>
      <PixelWordmark word="LICHEN" :reveal="false" />
    </section>

    <section class="sg__section">
      <h2>GridPaper + Crosshairs</h2>
      <GridPaper class="sg__demo-surface">
        <Crosshairs :cells="[[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2]]" />
        <p class="t-mono" style="padding: 1rem 0;">Papier millimétré avec grappe de croix.</p>
      </GridPaper>
    </section>

    <section class="sg__section">
      <h2>Plate + Rulers</h2>
      <Plate :cols="6" :rows="4">
        <p class="t-mono" style="padding: 1rem;">Planche à coordonnées (ton default).</p>
      </Plate>
      <Plate :cols="6" :rows="4" tone="signal" rulers="all">
        <p class="t-mono" style="padding: 1rem;">Planche ton signal.</p>
      </Plate>
    </section>

    <section class="sg__section">
      <h2>CellButton</h2>
      <div class="sg__row">
        <CellButton coord="A1" title="Nouveau spécimen" subtitle="observer" :cols="3" :rows="1" />
        <CellButton coord="C1" title="Atlas" :cols="2" :rows="1" active />
        <CellButton coord="R" title="Ce qui ne se déduit pas" :cols="3" :rows="1" signal />
        <CellButton title="Désactivé" :cols="2" :rows="1" disabled />
      </div>
    </section>

    <section class="sg__section">
      <h2>ChoiceCells</h2>
      <ChoiceCells v-model="choix" :options="optionsDemo" label="Choisis une option" />
      <p class="t-mono">Sélection : {{ choix ?? '—' }}</p>
    </section>

    <section class="sg__section">
      <h2>PropertyScale</h2>
      <PropertyScale label="Ténacité" :note="5" question="Encaisse-t-il un choc sans casser ?" explication="L'énergie qu'un bois absorbe avant de rompre." />
      <PropertyScale label="Dureté" :note="2" />
    </section>

    <section class="sg__section">
      <h2>Chip</h2>
      <div class="sg__row">
        <Chip :selected="true" selectable>Élasticité</Chip>
        <Chip selectable>Ténacité</Chip>
        <Chip :selectable="false">Lecture seule</Chip>
      </div>
    </section>

    <section class="sg__section">
      <h2>Panel</h2>
      <Panel title="Par défaut">Encadré à filet encre.</Panel>
      <Panel variant="safety" title="Sécurité">Coupe en éloignant la lame de toi.</Panel>
      <Panel variant="signal" title="Attention">Ce bois est dans le registre.</Panel>
      <Panel variant="locked" message="Essaie d'abord de le déduire : relève un défi." :seed="3">
        Usages traditionnels masqués.
      </Panel>
    </section>

    <section class="sg__section">
      <h2>GridReveal</h2>
      <GridReveal :cols="8" :rows="5" :seed="[0, 0]">
        <div style="background: var(--moss-soft); height: 140px;"></div>
      </GridReveal>
    </section>

    <section class="sg__section">
      <h2>Cutout + Silhouette</h2>
      <Cutout alt="Silhouette de repli">
        <Silhouette forme="rondelle" />
      </Cutout>
    </section>

    <section class="sg__section">
      <h2>CoupeTransversale — toutes les variantes</h2>
      <div class="sg__coupes">
        <figure v-for="t in coupes" :key="t" class="sg__coupe">
          <CoupeTransversale :type="t" />
          <figcaption class="t-label">{{ t }}</figcaption>
        </figure>
      </div>
      <h3>Interactive</h3>
      <CoupeTransversale type="zone-poreuse" interactive />
    </section>

    <section class="sg__section">
      <h2>TestIcon</h2>
      <div class="sg__row">
        <TestIcon v-for="t in testsIcones" :key="t" :test="t" style="width: 40px;" />
      </div>
    </section>

    <section class="sg__section">
      <h2>Silhouettes</h2>
      <div class="sg__row">
        <Silhouette v-for="f in silhouettes" :key="f" :forme="f" style="width: 72px;" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CoupeType, Option, TestId } from '@/types/content'
import VerticalLabel from '@/components/ui/VerticalLabel.vue'
import PixelWordmark from '@/components/ui/PixelWordmark.vue'
import GridPaper from '@/components/ui/GridPaper.vue'
import Crosshairs from '@/components/ui/Crosshairs.vue'
import Plate from '@/components/ui/Plate.vue'
import CellButton from '@/components/ui/CellButton.vue'
import ChoiceCells from '@/components/ui/ChoiceCells.vue'
import PropertyScale from '@/components/ui/PropertyScale.vue'
import Chip from '@/components/ui/Chip.vue'
import Panel from '@/components/ui/Panel.vue'
import GridReveal from '@/components/ui/GridReveal.vue'
import Cutout from '@/components/ui/Cutout.vue'
import CoupeTransversale from '@/components/illustrations/CoupeTransversale.vue'
import TestIcon from '@/components/illustrations/TestIcon.vue'
import Silhouette, { type SilhouetteForme } from '@/components/illustrations/Silhouette.vue'

const choix = ref<string | undefined>('a')
const optionsDemo: Option[] = [
  { id: 'a', label: 'Première option' },
  { id: 'b', label: 'Deuxième option', aide: 'avec une aide' },
]

const coupes: CoupeType[] = [
  'zone-poreuse',
  'resineux-canaux',
  'pores-diffus',
  'moelle-cloisonnee',
  'resineux-sans-canaux',
]
const testsIcones: TestId[] = ['soupeser', 'odeur', 'coupe', 'ongle', 'ecorce-rameau', 'flexion', 'fendage', 'allumage']
const silhouettes: SilhouetteForme[] = ['rondelle', 'latte', 'tige', 'rameau-aiguilles']
</script>

<style scoped>
.sg {
  padding: 1rem 0 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.sg__title {
  font-size: var(--fs-h1);
}
.sg__intro {
  color: var(--ink-2);
}
.sg__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: var(--line) solid var(--grid-major);
  padding-top: 1rem;
}
.sg__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-end;
}
.sg__demo-surface {
  position: relative;
  min-height: 120px;
}
.sg__coupes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}
.sg__coupe {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
