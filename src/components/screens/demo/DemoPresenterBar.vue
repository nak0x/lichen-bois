<template>
  <div v-if="demo.actif" class="demo-presenter">
    <!-- Zones de tap sur les bords gauche / droit de l'écran. -->
    <button
      class="demo-edge demo-edge--left"
      type="button"
      aria-label="Étape précédente"
      @click="precedent"
    />
    <button
      class="demo-edge demo-edge--right"
      type="button"
      aria-label="Étape suivante"
      @click="suivant"
    />

    <!-- Aide-mémoire du présentateur : texte de l'étape, en mono. -->
    <p v-if="demo.texteEtape" class="demo-presenter__texte t-mono">{{ demo.texteEtape }}</p>

    <!-- Barre de contrôle discrète. -->
    <nav class="demo-presenter__bar" aria-label="Contrôles de la démonstration">
      <span class="demo-presenter__compteur t-label">{{ demo.numeroEtape }} / {{ demo.total }}</span>
      <button
        class="demo-presenter__btn"
        type="button"
        :disabled="!demo.peutReculer"
        aria-label="Étape précédente"
        @click="precedent"
      >←</button>
      <button
        class="demo-presenter__btn"
        type="button"
        :disabled="!demo.peutAvancer"
        aria-label="Étape suivante"
        @click="suivant"
      >→</button>
      <button class="demo-presenter__btn demo-presenter__btn--text" type="button" @click="reinitialiser">
        Réinitialiser
      </button>
      <button class="demo-presenter__btn demo-presenter__btn--text" type="button" @click="quitter">
        Quitter
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
/**
 * Barre présentateur du mode démo (section 8.9). Montée globalement dans App.vue
 * pour persister pendant que la démo navigue vers les vraies routes.
 * Flèches clavier ←/→ et tap sur les bords gauche/droit de l'écran.
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '@/stores/demo'

const demo = useDemoStore()
const router = useRouter()

function suivant(): void {
  void demo.suivant(router)
}
function precedent(): void {
  void demo.precedent(router)
}
async function reinitialiser(): Promise<void> {
  // Redémarre la démo depuis la première étape (recrée les spécimens démo).
  await demo.demarrer(router)
}
function quitter(): void {
  demo.quitter()
  void router.push('/')
}

function onKeydown(e: KeyboardEvent): void {
  if (!demo.actif) return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    suivant()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    precedent()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.demo-presenter {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
}

/* Les contrôles et le texte reprennent les évènements ; le reste reste cliquable. */
.demo-presenter__bar,
.demo-presenter__texte,
.demo-edge {
  pointer-events: auto;
}

.demo-edge {
  position: fixed;
  top: 0;
  bottom: 72px;
  width: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
}
.demo-edge--left {
  left: 0;
}
.demo-edge--right {
  right: 0;
}

.demo-presenter__texte {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(44px + var(--safe-bottom) + 8px);
  width: min(92vw, 640px);
  margin: 0;
  padding: 8px 12px;
  font-size: var(--fs-label);
  color: var(--ink);
  background: var(--paper-raised);
  border: var(--line) solid var(--ink);
  text-align: center;
}

.demo-presenter__bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px calc(12px + var(--safe-right)) calc(8px + var(--safe-bottom)) calc(12px + var(--safe-left));
  background: var(--ink);
  color: var(--paper);
}

.demo-presenter__compteur {
  color: var(--paper);
  margin-right: auto;
}

.demo-presenter__btn {
  min-width: 44px;
  min-height: 36px;
  padding: 0 10px;
  color: var(--paper);
  border: var(--line) solid var(--paper);
  background: transparent;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
}
.demo-presenter__btn--text {
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.demo-presenter__btn:disabled {
  opacity: 0.4;
}
</style>
