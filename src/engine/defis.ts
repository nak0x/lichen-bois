import type {
  Defi,
  Essence,
  LigneVerdict,
  ProprieteId,
  Verdict,
  VerdictGlobal,
} from '@/types/content'

/**
 * Évalue le verdict d'un défi pour une essence et les propriétés citées.
 * Règles (section 9.2) :
 * - Ligne : ok si note ≥ min ; limite si note = min − 1 ; insuffisant sinon.
 * - Global : ne-tient-pas si ≥ 1 ligne insuffisant avec poids ≥ 2 ; sinon tient-en-partie
 *   s'il existe ≥ 1 ligne limite ou insuffisant ; sinon tient.
 * - interception = essence.registre.
 * - citesPertinents = cités ∩ exigences.
 * - oublies = exigences de poids ≥ 2 non citées.
 * - citesHorsSujet = cités ∖ exigences.
 */

/** Libellés français des verdicts globaux pour l'interface (section 8.6). */
export const LIBELLES_GLOBAL: Record<VerdictGlobal, string> = {
  'tient': 'Ton choix tient',
  'tient-en-partie': 'Ton choix tient en partie',
  'ne-tient-pas': 'Ton choix ne tient pas',
}

export function evaluer(defi: Defi, essence: Essence, cites: ProprieteId[]): Verdict {
  const exigenceProprietes = new Set(defi.exigences.map((e) => e.propriete))

  const lignes: LigneVerdict[] = defi.exigences.map((exigence) => {
    const valeur = essence.proprietes[exigence.propriete]
    let statut: 'ok' | 'limite' | 'insuffisant'
    if (valeur >= exigence.min) {
      statut = 'ok'
    } else if (valeur === exigence.min - 1) {
      statut = 'limite'
    } else {
      statut = 'insuffisant'
    }
    return {
      propriete: exigence.propriete,
      requis: exigence.min,
      valeur,
      statut,
      poids: exigence.poids,
    }
  })

  // Global
  let global: VerdictGlobal = 'tient'
  if (lignes.some((l) => l.statut === 'insuffisant' && l.poids >= 2)) {
    global = 'ne-tient-pas'
  } else if (lignes.some((l) => l.statut === 'limite' || l.statut === 'insuffisant')) {
    global = 'tient-en-partie'
  }

  // Rétroaction sur les propriétés citées
  const citesPertinents = cites.filter((p) => exigenceProprietes.has(p))
  const citesHorsSujet = cites.filter((p) => !exigenceProprietes.has(p))
  const oublies = defi.exigences
    .filter((e) => e.poids >= 2 && !cites.includes(e.propriete))
    .map((e) => e.propriete)

  return {
    interception: essence.registre,
    lignes,
    global,
    citesPertinents,
    citesHorsSujet,
    oublies,
  }
}
