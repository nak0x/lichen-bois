export type EssenceId =
  | 'frene' | 'pin-sylvestre' | 'noisetier' | 'forsythia' | 'if'
  // Essences courantes autour d'Annecy (Haute-Savoie), ajoutées ensuite.
  | 'chene-pedoncule' | 'hetre' | 'charme' | 'erable-sycomore' | 'erable-champetre'
  | 'chataignier' | 'merisier' | 'noyer' | 'tilleul' | 'bouleau'
  | 'aulne-glutineux' | 'tremble' | 'saule-marsault' | 'robinier' | 'epicea'
  | 'sapin-pectine' | 'meleze' | 'sureau-noir' | 'buis' | 'cornouiller-sanguin'
export type CritereId = 'resine' | 'masse' | 'coupe' | 'moelle' | 'couleur' | 'ongle' | 'ecorce' | 'rameau'
export type ProprieteId =
  | 'tenacite' | 'elasticite' | 'durete' | 'fendabilite' | 'allumage'
  | 'chauffage' | 'durabilite' | 'travail' | 'rectitude' | 'creux'
export type TestId = 'soupeser' | 'odeur' | 'coupe' | 'ongle' | 'ecorce-rameau' | 'flexion' | 'fendage' | 'allumage'
export type CoupeType = 'zone-poreuse' | 'resineux-canaux' | 'pores-diffus' | 'moelle-cloisonnee' | 'resineux-sans-canaux'
export type Note = 1 | 2 | 3 | 4 | 5

export interface Option { id: string; label: string; aide?: string }

export interface Critere {
  id: CritereId
  question: string
  options: Option[]
  pourquoi: string
  testId: TestId
  note?: string
}

export interface Test {
  id: TestId
  titre: string
  type: 'critere' | 'propriete' | 'mesure'
  materiel: string[]
  geste: string[]
  observer: string
  pourquoi: string
  securite?: string
  alimenteCriteres?: CritereId[]
  alimenteProprietes?: ProprieteId[]
  options?: Option[]            // résultats possibles d'un test de propriété
}

export interface Propriete { id: ProprieteId; label: string; question: string; explication: string }

export interface Essence {
  id: EssenceId
  nom: string
  latin: string
  famille: string
  coordonnee: string            // position sur la planche Atlas, ex. 'B2'
  registre: boolean             // true = apparaît aussi dans le registre « ne se déduit pas »
  resume: string
  pourquoi: string              // relie la structure du bois à ses propriétés
  criteres: Record<CritereId, string[] | null>   // options compatibles ; null = critère non discriminant pour cette essence
  densite: { min: number; max: number } | null   // bois sec, ordre de grandeur
  proprietes: Record<ProprieteId, Note>
  coupe: CoupeType
  usages: string[]              // révélés après un défi
  recolte: string
  anecdote?: string
  notesFiabilite?: string
  photos?: { piece?: string; coupe?: string; ecorce?: string }
}

export interface Exigence { propriete: ProprieteId; min: Note; poids: 1 | 2 | 3; enClair: string }

export interface Defi {
  id: string
  titre: string
  besoin: string
  exigences: Exigence[]
  attendus: EssenceId[]
  revelation: string
  securite?: string
}

export interface EntreeRegistre {
  id: string
  titre: string
  latin?: string
  essenceId?: EssenceId
  pourquoiIndeductible: string
  ceQuIlFautSavoir: string[]
  gestes: string[]
}

export type Answers = Partial<Record<CritereId, string>>

export interface Mesures { longueur: number; largeur: number; epaisseur: number; masse: number } // cm, cm, cm, g

export type VerdictGlobal = 'tient' | 'tient-en-partie' | 'ne-tient-pas'

export interface LigneVerdict { propriete: ProprieteId; requis: Note; valeur: Note; statut: 'ok' | 'limite' | 'insuffisant'; poids: 1 | 2 | 3 }

export interface Verdict {
  interception: boolean          // essence du registre : on affiche d'abord le registre
  lignes: LigneVerdict[]
  global: VerdictGlobal
  citesPertinents: ProprieteId[]
  citesHorsSujet: ProprieteId[]
  oublies: ProprieteId[]
}

export interface DefiRealise { defiId: string; essenceId: EssenceId; cites: ProprieteId[]; raison?: string; verdict: VerdictGlobal; date: string }

export interface Specimen {
  id: string
  nom: string
  creeLe: string
  photos: string[]               // clés IndexedDB des Blobs
  answers: Answers
  mesures?: Mesures
  resultatsTests: Partial<Record<TestId, string>>
  identification?: EssenceId
  defis: DefiRealise[]
  notes: string
}
