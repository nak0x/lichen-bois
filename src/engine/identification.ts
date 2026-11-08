import type { Answers, Critere, CritereId, Essence, Mesures } from '@/types/content'

export const SEUILS = { legerMax: 0.55, moyenMax: 0.65 }
export const TOLERANCE_DENSITE = 0.05

// Stub de socle avec implémentation triviale. Agent C (logique) implémente les règles
// de la section 9.1.
export function densite(m: Mesures): number {
  return m.masse / (m.longueur * m.largeur * m.epaisseur)
}

export function categorieMasse(d: number): 'leger' | 'moyen' | 'lourd' {
  if (d < SEUILS.legerMax) return 'leger'
  if (d <= SEUILS.moyenMax) return 'moyen'
  return 'lourd'
}

export interface ResultatCandidat {
  essence: Essence
  compatible: boolean
  exclusions: { critere: CritereId; valeur: string }[]
}

export function filtrer(essences: Essence[], _answers: Answers, _mesures?: Mesures): ResultatCandidat[] {
  return essences.map((essence) => ({ essence, compatible: true, exclusions: [] }))
}

export function meilleurCritereSuivant(_candidats: Essence[], _criteres: Critere[], _answers: Answers): Critere | null {
  return null
}
