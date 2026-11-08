import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Answers, EssenceId, Mesures, ProprieteId, TestId } from '@/types/content'
import { useCarnetStore } from '@/stores/carnet'

/** Données injectées à une étape de démonstration. */
export interface InjecteEtape {
  mesures?: true | Mesures
  answers?: Answers
  identification?: EssenceId
  resultatsTests?: Partial<Record<TestId, string>>
  defi?: {
    essenceId: EssenceId
    cites: ProprieteId[]
  }
}

/** Définition d'une étape démo. */
export interface EtapeDemo {
  id: string
  route: string
  texte: string
  injecte?: InjecteEtape
}

/** Spécimen démo à créer au démarrage. */
export interface SpecimenDemo {
  id: string
  nom: string
  mesures?: Mesures
}

// Données de scénario (section 7.7)
export const SPECIMENS_DEMO: SpecimenDemo[] = [
  {
    id: 'demo-frene',
    nom: 'Tronc n°1',
    mesures: { longueur: 35, largeur: 1.2, epaisseur: 1.2, masse: 35 },
  },
  { id: 'demo-pin', nom: 'Latte n°2' },
  { id: 'demo-forsythia', nom: 'Tige n°3' },
]

export const ETAPES_DEMO: EtapeDemo[] = [
  {
    id: 'principe',
    route: '/',
    texte: 'Comprendre avant de faire. Le numérique avant et après la sortie, jamais à sa place.',
  },
  {
    id: 'specimen',
    route: '/observer/demo-frene',
    texte: "Un tronc posé sur la table. On ne sait pas encore ce que c'est.",
  },
  {
    id: 'densite',
    route: '/observer/demo-frene?test=soupeser',
    texte: 'On mesure, on pèse : 0,69. Lourd.',
    injecte: {
      mesures: { longueur: 35, largeur: 1.2, epaisseur: 1.2, masse: 35 },
      answers: { masse: 'lourd' },
    },
  },
  {
    id: 'coupe',
    route: '/observer/demo-frene?test=coupe',
    texte: 'À la loupe : un anneau de gros pores au début de chaque cerne.',
    injecte: { answers: { resine: 'non', coupe: 'pores-zone' } },
  },
  {
    id: 'identifier',
    route: '/identifier/demo-frene',
    texte: "Il reste deux candidats. L'app propose le test qui les départage : la moelle.",
    injecte: {},
  },
  {
    id: 'moelle',
    route: '/identifier/demo-frene',
    texte: "Moelle fine : proposition, frêne. On confirme par l'écorce.",
    injecte: {
      answers: { moelle: 'fine', ecorce: 'grise-losanges' },
      identification: 'frene',
    },
  },
  {
    id: 'fiche',
    route: '/atlas/frene',
    texte: "Pourquoi le frêne est tenace : la coupe l'explique. Les usages restent cachés.",
  },
  {
    id: 'defi-manche',
    route: '/defis/manche-hache?specimen=demo-frene',
    texte: "Le défi : un manche de hache. Le jeune choisit, justifie, puis l'app révèle.",
    injecte: { defi: { essenceId: 'frene', cites: ['tenacite', 'fendabilite'] } },
  },
  {
    id: 'pin',
    route: '/identifier/demo-pin',
    texte: 'Contraste : odeur de résine. Un seul candidat.',
    injecte: { answers: { resine: 'oui' }, identification: 'pin-sylvestre' },
  },
  {
    id: 'pin-arc',
    route: '/defis/arc-simple?specimen=demo-pin',
    texte: "Le pin pour un arc ? La latte a cassé : l'élasticité manque.",
    injecte: {
      resultatsTests: { flexion: 'casse-net' },
      defi: { essenceId: 'pin-sylvestre', cites: ['elasticite'] },
    },
  },
  {
    id: 'forsythia',
    route: '/identifier/demo-forsythia',
    texte: 'Une tige de jardin : moelle large et cloisonnée.',
    injecte: { answers: { moelle: 'large-creuse' }, identification: 'forsythia' },
  },
  {
    id: 'if',
    route: '/defis/arc-simple?essence=if',
    texte: "Le meilleur bois d'arc… et ce que l'observation ne dit pas.",
    injecte: { defi: { essenceId: 'if', cites: ['elasticite', 'tenacite'] } },
  },
  {
    id: 'cloture',
    route: '/?demo=cloture',
    texte: "Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s'apprend.",
  },
]

export const useDemoStore = defineStore('demo', () => {
  const actif = ref(false)
  const etapeIndex = ref(0)

  const etapeCourante = computed<EtapeDemo | null>(() =>
    actif.value ? (ETAPES_DEMO[etapeIndex.value] ?? null) : null,
  )

  const total = computed(() => ETAPES_DEMO.length)

  const peutReculer = computed(() => etapeIndex.value > 0)
  const peutAvancer = computed(() => etapeIndex.value < ETAPES_DEMO.length - 1)

  /** Démarre le mode démo : réinitialise l'état démo et crée les spécimens. */
  async function demarrer(router?: { push: (route: string) => void }): Promise<void> {
    const carnet = useCarnetStore()

    // Supprimer les spécimens démo existants
    await carnet.effacerDemo()

    // Créer les spécimens démo
    for (const spec of SPECIMENS_DEMO) {
      await carnet.creerAvecId(spec.id, spec.nom)
      if (spec.mesures) {
        await carnet.mettreAJourMesures(spec.id, spec.mesures)
      }
    }

    etapeIndex.value = 0
    actif.value = true

    if (router) {
      router.push(ETAPES_DEMO[0].route)
    }
  }

  /** Navigue vers l'étape suivante en appliquant l'injection. */
  async function suivant(router?: { push: (route: string) => void }): Promise<void> {
    if (!peutAvancer.value) return
    etapeIndex.value++
    await appliquerEtape(etapeIndex.value, router)
  }

  /** Navigue vers l'étape précédente. */
  async function precedent(router?: { push: (route: string) => void }): Promise<void> {
    if (!peutReculer.value) return
    etapeIndex.value--
    await appliquerEtape(etapeIndex.value, router)
  }

  /** Applique l'injection d'une étape donnée (index). */
  async function appliquerEtape(
    index: number,
    router?: { push: (route: string) => void },
  ): Promise<void> {
    const etape = ETAPES_DEMO[index]
    if (!etape) return

    const carnet = useCarnetStore()

    if (etape.injecte) {
      const inj = etape.injecte

      // Déterminer le specimenId depuis la route (ex. /observer/demo-frene)
      const match = etape.route.match(/\/(observer|identifier)\/([^?]+)/)
      const specimenId = match ? match[2] : null

      if (specimenId) {
        if (inj.mesures && typeof inj.mesures === 'object') {
          await carnet.mettreAJourMesures(specimenId, inj.mesures as Mesures)
        }
        if (inj.answers) {
          await carnet.mettreAJourAnswers(specimenId, inj.answers)
        }
        if (inj.identification) {
          await carnet.mettreAJourIdentification(specimenId, inj.identification)
        }
        if (inj.resultatsTests) {
          for (const [testId, resultat] of Object.entries(inj.resultatsTests)) {
            await carnet.mettreAJourResultatTest(
              specimenId,
              testId as TestId,
              resultat,
            )
          }
        }
      }
    }

    if (router) {
      router.push(etape.route)
    }
  }

  /** Réinitialise complètement le mode démo sans le redémarrer. */
  async function reinitialiser(): Promise<void> {
    const carnet = useCarnetStore()
    await carnet.effacerDemo()
    etapeIndex.value = 0
    actif.value = false
  }

  /** Quitte le mode démo (ne supprime pas les spécimens démo). */
  function quitter(): void {
    actif.value = false
  }

  return {
    actif,
    etapeIndex,
    etapeCourante,
    total,
    peutReculer,
    peutAvancer,
    demarrer,
    suivant,
    precedent,
    appliquerEtape,
    reinitialiser,
    quitter,
  }
})
