<template>
  <div class="registre">
    <Plate tone="signal" :rows="rows">
      <div class="registre__contenu">
        <header class="registre__head">
          <h1 class="registre__titre">Ce qui ne se déduit pas</h1>
          <p class="registre__principe t-mono">
            Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s'apprend. Ces bois ne se
            lisent pas : on te les transmet directement.
          </p>
        </header>

        <section v-for="entree in registre" :key="entree.id" class="registre__entree">
          <h2 class="registre__entree-titre">{{ entree.titre }}</h2>
          <p v-if="entree.latin" class="registre__latin t-mono">{{ entree.latin }}</p>

          <p class="registre__texte t-mono">{{ entree.pourquoiIndeductible }}</p>

          <h3 class="registre__h3">Ce qu'il faut savoir</h3>
          <ul class="registre__liste t-mono">
            <li v-for="(s, i) in entree.ceQuIlFautSavoir" :key="i">{{ s }}</li>
          </ul>

          <h3 class="registre__h3">Les gestes</h3>
          <ul class="registre__liste t-mono">
            <li v-for="(g, i) in entree.gestes" :key="i">{{ g }}</li>
          </ul>

          <p v-if="entree.essenceId" class="registre__lien-fiche">
            <RouterLink
              class="registre__lien"
              :to="{ name: 'essence', params: { essenceId: entree.essenceId } }"
              >Voir la fiche essence →</RouterLink
            >
          </p>
        </section>
      </div>
    </Plate>
  </div>
</template>

<script setup lang="ts">
/**
 * RegistreView (§8.7) — planche au ton signal.
 * Titre « Ce qui ne se déduit pas », phrase de principe, une section par entrée
 * (pourquoi indéductible, ce qu'il faut savoir, les gestes), lien fiche essence
 * si essenceId.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { registre } from '@/data'
import Plate from '@/components/ui/Plate.vue'

// Assez de lignes pour couvrir les entrées du registre.
const rows = computed(() => Math.max(8, registre.length * 6))
</script>

<style scoped>
/* La planche fait 12 colonnes (défaut de Plate) + règles ; sur mobile le --cell
   du socle la ferait déborder. On recalcule un --cell local pour qu'elle tienne
   dans la largeur, sans scroll horizontal. */
.registre {
  --cell: calc((min(100vw, 1280px) - 2 * var(--margin)) / 13);
}

.registre__contenu {
  display: flex;
  flex-direction: column;
  gap: var(--cell);
}

.registre__head {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
}

.registre__titre {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--fs-h1);
  letter-spacing: -0.03em;
  line-height: 0.92;
  text-transform: uppercase;
  color: var(--signal);
}

.registre__principe {
  margin: 0;
  color: var(--ink-2);
  max-width: 52ch;
}

.registre__entree {
  display: flex;
  flex-direction: column;
  gap: calc(var(--minor) / 2);
  padding-top: var(--minor);
  border-top: var(--line) solid var(--signal);
}

.registre__entree-titre {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-h2);
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.registre__latin {
  margin: 0;
  color: var(--ink-3);
}

.registre__texte {
  margin: 0;
  color: var(--ink-2);
}

.registre__h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-body);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--signal);
  margin-top: calc(var(--minor) / 2);
}

.registre__liste {
  margin: 0;
  padding-left: 1.2em;
  color: var(--ink-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.registre__lien-fiche {
  margin: calc(var(--minor) / 2) 0 0;
}

.registre__lien {
  color: var(--signal);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--fs-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
}
</style>
