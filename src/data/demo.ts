import type { EssenceId, Answers, Mesures, ProprieteId, TestId } from '@/types/content'

// Spécimen de démo : données minimales, le store complète les champs manquants au démarrage.
// Décision : SpecimenDemo n'implémente pas Specimen complet pour ne pas forcer des données
// vides sans signification (photos, notes, defis, creeLe). Voir docs/DECISIONS.md.
export interface SpecimenDemo {
  id: string
  nom: string
  mesures?: Mesures
}

// Injection progressive des données pendant la démo.
export interface InjecteEtape {
  mesures?: true
  answers?: Answers
  identification?: EssenceId
  resultatsTests?: Partial<Record<TestId, string>>
  defi?: {
    essenceId: EssenceId
    cites: ProprieteId[]
  }
}

export interface Etape {
  id: string
  route: string
  texte: string
  injecte?: InjecteEtape
}

export interface Demo {
  specimens: SpecimenDemo[]
  etapes: Etape[]
}

export const demo: Demo = {
  specimens: [
    { id: 'demo-frene', nom: 'Tronc n°1', mesures: { longueur: 35, largeur: 1.2, epaisseur: 1.2, masse: 35 } },
    { id: 'demo-pin', nom: 'Latte n°2' },
    { id: 'demo-forsythia', nom: 'Tige n°3' },
  ],
  etapes: [
    {
      id: 'principe',
      route: '/',
      texte: 'Comprendre avant de faire. Le numérique avant et après la sortie, jamais à sa place.',
    },
    {
      id: 'specimen',
      route: '/observer/demo-frene',
      texte: 'Un tronc posé sur la table. On ne sait pas encore ce que c\'est.',
    },
    {
      id: 'densite',
      route: '/observer/demo-frene?test=soupeser',
      texte: 'On mesure, on pèse : 0,69. Lourd.',
      injecte: { mesures: true, answers: { masse: 'lourd' } },
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
      texte: 'Il reste deux candidats. L\'app propose le test qui les départage : la moelle.',
      injecte: {},
    },
    {
      id: 'moelle',
      route: '/identifier/demo-frene',
      texte: 'Moelle fine : proposition, frêne. On confirme par l\'écorce.',
      injecte: { answers: { moelle: 'fine', ecorce: 'grise-losanges' }, identification: 'frene' },
    },
    {
      id: 'fiche',
      route: '/atlas/frene',
      texte: 'Pourquoi le frêne est tenace : la coupe l\'explique. Les usages restent cachés.',
    },
    {
      id: 'defi-manche',
      route: '/defis/manche-hache?specimen=demo-frene',
      texte: 'Le défi : un manche de hache. Le jeune choisit, justifie, puis l\'app révèle.',
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
      texte: 'Le pin pour un arc ? La latte a cassé : l\'élasticité manque.',
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
      texte: 'Le meilleur bois d\'arc… et ce que l\'observation ne dit pas.',
      injecte: { defi: { essenceId: 'if', cites: ['elasticite', 'tenacite'] } },
    },
    {
      id: 'cloture',
      route: '/?demo=cloture',
      texte: 'Ce qui se rattrape se déduit. Ce qui ne se rattrape pas s\'apprend.',
    },
  ],
}
