import type { Answers, Critere, CritereId, Essence, Mesures } from '@/types/content'

export const SEUILS = { legerMax: 0.55, moyenMax: 0.65 }
export const TOLERANCE_DENSITE = 0.05

/** Densité en g/cm³ : masse (g) / volume (cm³) */
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

/**
 * Filtre les essences selon les réponses connues et les mesures disponibles.
 *
 * Règles (section 9.1) :
 * - Réponse absente ou 'je-ne-sais-pas' ne filtre rien pour les critères textuels.
 * - essence.criteres[c] === null → toujours compatible pour ce critère.
 * - Critère masse :
 *   - Si des mesures existent ET l'essence a une densite définie :
 *     compatible si densité ∈ [min − tol ; max + tol] (prioritaire sur la catégorie).
 *   - Sinon, si une réponse 'masse' existe dans answers : compare la catégorie à la liste.
 * - Tous les autres critères : exclusion si valeur observée ∉ liste de l'essence.
 */
export function filtrer(
  essences: Essence[],
  answers: Answers,
  mesures?: Mesures,
): ResultatCandidat[] {
  // Densité calculée une seule fois
  const densiteCalculee = mesures ? densite(mesures) : null

  return essences.map((essence) => {
    const exclusions: { critere: CritereId; valeur: string }[] = []

    // ── Vérification par la densité mesurée (prioritaire sur la catégorie) ──────
    if (densiteCalculee !== null && essence.densite !== null) {
      const compat =
        densiteCalculee >= essence.densite.min - TOLERANCE_DENSITE &&
        densiteCalculee <= essence.densite.max + TOLERANCE_DENSITE
      if (!compat) {
        exclusions.push({ critere: 'masse', valeur: `densite:${densiteCalculee.toFixed(3)}` })
      }
      // On saute la vérification par catégorie pour ce critère
    } else if (answers.masse && answers.masse !== 'je-ne-sais-pas') {
      // ── Fallback : catégorie choisie manuellement ────────────────────────────
      const liste = essence.criteres['masse']
      if (liste !== null && !liste.includes(answers.masse)) {
        exclusions.push({ critere: 'masse', valeur: answers.masse })
      }
    }

    // ── Tous les critères sauf masse (déjà traité) ───────────────────────────
    for (const [critereRaw, valeur] of Object.entries(answers) as [CritereId, string][]) {
      if (!valeur || valeur === 'je-ne-sais-pas') continue
      if (critereRaw === 'masse') continue // déjà traité

      const critere = critereRaw as CritereId
      const liste = essence.criteres[critere]

      // null → non discriminant, toujours compatible
      if (liste === null) continue

      if (!liste.includes(valeur)) {
        exclusions.push({ critere, valeur })
      }
    }

    return {
      essence,
      compatible: exclusions.length === 0,
      exclusions,
    }
  })
}

/**
 * Retourne le critère non répondu qui minimise le pire cas parmi les candidats fournis.
 *
 * Règles (section 9.1) :
 * - Ignorer les critères déjà répondus.
 * - Pour chaque option, compter les candidats compatibles (null = compatible avec toutes les options).
 * - Choisir le critère qui minimise le pire cas (max des comptes par option).
 * - Ignorer un critère qui ne départage personne : pire = candidats.length (toutes les options
 *   ramènent tous les candidats). Note : pire < candidats.length signifie qu'au moins une option
 *   élimine au moins un candidat → utile.
 * - Égalité : ordre de la section 7.1 (resine, masse, coupe, moelle, ecorce, rameau, ongle, couleur).
 * - Retourne null si un seul candidat ou aucun critère utile.
 */

// Ordre canonique de la section 7.1
const ORDRE_CRITERES: CritereId[] = [
  'resine', 'masse', 'coupe', 'moelle', 'ecorce', 'rameau', 'ongle', 'couleur',
]

export function meilleurCritereSuivant(
  candidats: Essence[],
  criteres: Critere[],
  answers: Answers,
): Critere | null {
  if (candidats.length <= 1) return null

  let meilleur: Critere | null = null
  let meilleurPire = Infinity
  let meilleurOrdre = Infinity

  for (const critere of criteres) {
    // Critère déjà répondu → passer
    if (answers[critere.id] !== undefined && answers[critere.id] !== '') continue

    let pire = 0

    for (const option of critere.options) {
      let count = 0
      for (const essence of candidats) {
        const liste = essence.criteres[critere.id]
        // null = non discriminant, compatible avec toutes les options
        if (liste === null || liste.includes(option.id)) {
          count++
        }
      }
      if (count > pire) pire = count
    }

    // Ignorer si ce critère ne réduit jamais le nombre de candidats :
    // pire = candidats.length signifie qu'au moins une option inclut tous les candidats
    // (ce qui ne différencie pas)
    // Par contre pire < candidats.length → au moins une option élimine au moins un candidat
    if (pire >= candidats.length) continue

    const ordre = ORDRE_CRITERES.indexOf(critere.id)
    const ordreEffectif = ordre === -1 ? 999 : ordre

    if (
      pire < meilleurPire ||
      (pire === meilleurPire && ordreEffectif < meilleurOrdre)
    ) {
      meilleurPire = pire
      meilleurOrdre = ordreEffectif
      meilleur = critere
    }
  }

  return meilleur
}
