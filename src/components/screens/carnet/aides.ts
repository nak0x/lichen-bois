/**
 * Petites aides de présentation partagées par les écrans carnet (§8.8).
 * Consomment les données et types existants, ne les modifient pas.
 */
import { essences, criteres, tests, proprietes, defis } from '@/data'
import type {
  CoupeType,
  CritereId,
  DefiRealise,
  EssenceId,
  Specimen,
  TestId,
} from '@/types/content'

/** Retourne le nom d'une essence depuis son id, ou l'id brut en repli. */
export function nomEssence(id: EssenceId | undefined): string {
  if (!id) return ''
  return essences.find((e) => e.id === id)?.nom ?? id
}

/** Retourne le type de coupe d'une essence (pour l'illustration). */
export function coupeEssence(id: EssenceId | undefined): CoupeType | null {
  if (!id) return null
  return essences.find((e) => e.id === id)?.coupe ?? null
}

/** Formate une date ISO en date lisible française courte. */
export function formaterDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Libellé d'une option de critère (question + réponse). */
export function libelleCritere(id: CritereId, optionId: string): { question: string; reponse: string } {
  const critere = criteres.find((c) => c.id === id)
  const question = critere?.question ?? id
  const reponse = critere?.options.find((o) => o.id === optionId)?.label ?? optionId
  return { question, reponse }
}

/** Libellé d'un résultat de test (titre du test + libellé de l'option). */
export function libelleResultatTest(id: TestId, optionId: string): { titre: string; resultat: string } {
  const test = tests.find((t) => t.id === id)
  const titre = test?.titre ?? id
  const resultat = test?.options?.find((o) => o.id === optionId)?.label ?? optionId
  return { titre, resultat }
}

/** Libellé d'une propriété depuis son id. */
export function labelPropriete(id: string): string {
  return proprietes.find((p) => p.id === id)?.label ?? id
}

/** Titre d'un défi depuis son id. */
export function titreDefi(id: string): string {
  return defis.find((d) => d.id === id)?.titre ?? id
}

/** Verdict d'un défi réalisé, en clair. */
export function texteVerdict(d: DefiRealise): string {
  switch (d.verdict) {
    case 'tient':
      return 'Ton choix tient'
    case 'tient-en-partie':
      return 'Ton choix tient en partie'
    default:
      return 'Ton choix ne tient pas'
  }
}

/** Nombre de critères observés (hors « je ne sais pas ») sur un spécimen. */
export function nbObservations(s: Specimen): number {
  return Object.values(s.answers).filter((v) => v && v !== 'je-ne-sais-pas').length
}
