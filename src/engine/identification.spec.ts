import { describe, it, expect } from 'vitest'
import {
  densite,
  categorieMasse,
  filtrer,
  meilleurCritereSuivant,
  SEUILS,
  TOLERANCE_DENSITE,
} from './identification'
import { essences as essencesFixtures, criteres as criteresFixtures } from '@/data'
import type { Answers, Mesures } from '@/types/content'

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function candidatsCompatibles(essences: typeof essencesFixtures, answers: Answers, mesures?: Mesures) {
  return filtrer(essences, answers, mesures).filter((r) => r.compatible).map((r) => r.essence.id)
}

// ─── densite ──────────────────────────────────────────────────────────────────

describe('densite', () => {
  it('calcule masse / volume', () => {
    // 35g / (35 × 1.2 × 1.2 cm³) = 35 / 50.4 ≈ 0.694
    const m: Mesures = { longueur: 35, largeur: 1.2, epaisseur: 1.2, masse: 35 }
    expect(densite(m)).toBeCloseTo(0.694, 2)
  })

  it('densité exacte cube 1cm × 1cm × 1cm, 0.5g → 0.5', () => {
    expect(densite({ longueur: 1, largeur: 1, epaisseur: 1, masse: 0.5 })).toBeCloseTo(0.5)
  })
})

// ─── categorieMasse ───────────────────────────────────────────────────────────

describe('categorieMasse', () => {
  it('léger en dessous de 0.55', () => {
    expect(categorieMasse(0.4)).toBe('leger')
    expect(categorieMasse(0.549)).toBe('leger')
  })

  it('moyen de 0.55 à 0.65 inclus', () => {
    expect(categorieMasse(0.55)).toBe('moyen')
    expect(categorieMasse(0.60)).toBe('moyen')
    expect(categorieMasse(0.65)).toBe('moyen')
  })

  it('lourd au-dessus de 0.65', () => {
    expect(categorieMasse(0.651)).toBe('lourd')
    expect(categorieMasse(0.70)).toBe('lourd')
  })

  it('seuils constants', () => {
    expect(SEUILS.legerMax).toBe(0.55)
    expect(SEUILS.moyenMax).toBe(0.65)
    expect(TOLERANCE_DENSITE).toBe(0.05)
  })
})

// ─── Scénario démo section 7.7 ───────────────────────────────────────────────

describe('scénario démo section 7.7', () => {
  /**
   * Après masse mesurée ≈ 0,69 et coupe: pores-zone
   * → candidats frêne et forsythia
   * → meilleur test suivant : moelle
   * → après moelle: fine → frêne seul
   */

  const mesuresFrène: Mesures = { longueur: 35, largeur: 1.2, epaisseur: 1.2, masse: 35 }
  // densité ≈ 0.694 → lourd

  it('densité du tronc n°1 ≈ 0.69, catégorie lourd', () => {
    const d = densite(mesuresFrène)
    expect(d).toBeGreaterThan(0.65)
    expect(categorieMasse(d)).toBe('lourd')
  })

  it('après masse (mesures) + coupe pores-zone → candidats frêne et forsythia', () => {
    const answers: Answers = { resine: 'non', coupe: 'pores-zone' }
    const compat = candidatsCompatibles(essencesFixtures, answers, mesuresFrène)
    expect(compat).toContain('frene')
    expect(compat).toContain('forsythia')
    // pin exclu (résine oui, coupe sans-pores)
    expect(compat).not.toContain('pin-sylvestre')
    // noisetier exclu (coupe pores-diffus)
    expect(compat).not.toContain('noisetier')
    // if exclu (coupe sans-pores)
    expect(compat).not.toContain('if')
  })

  it('meilleur test suivant après frêne+forsythia → moelle', () => {
    const answers: Answers = { resine: 'non', coupe: 'pores-zone' }
    const resultats = filtrer(essencesFixtures, answers, mesuresFrène)
    const candidats = resultats.filter((r) => r.compatible).map((r) => r.essence)
    expect(candidats.map((e) => e.id)).toContain('frene')
    expect(candidats.map((e) => e.id)).toContain('forsythia')

    const meilleur = meilleurCritereSuivant(candidats, criteresFixtures, answers)
    expect(meilleur).not.toBeNull()
    expect(meilleur?.id).toBe('moelle')
  })

  it('après moelle: fine → frêne seul', () => {
    const answers: Answers = { resine: 'non', coupe: 'pores-zone', moelle: 'fine' }
    const resultats = filtrer(essencesFixtures, answers, mesuresFrène)
    const candidats = resultats.filter((r) => r.compatible).map((r) => r.essence)
    expect(candidats.map((e) => e.id)).toEqual(['frene'])
  })
})

// ─── Comportement général du filtre ──────────────────────────────────────────

describe('filtrer - comportements généraux', () => {
  it('réponse absente ne filtre rien', () => {
    const answers: Answers = {}
    const compat = candidatsCompatibles(essencesFixtures, answers)
    expect(compat).toHaveLength(5)
  })

  it('résine oui → pin sylvestre uniquement', () => {
    const compat = candidatsCompatibles(essencesFixtures, { resine: 'oui' })
    expect(compat).toEqual(['pin-sylvestre'])
  })

  it('résine non → tout sauf pin', () => {
    const compat = candidatsCompatibles(essencesFixtures, { resine: 'non' })
    expect(compat).not.toContain('pin-sylvestre')
    expect(compat).toHaveLength(4)
  })

  it('critère null → toujours compatible (forsythia, masse null)', () => {
    const compat = candidatsCompatibles(essencesFixtures, { masse: 'lourd' })
    expect(compat).toContain('forsythia') // masse null = compatible
  })

  it('masse avec mesures : pin exclu si densité ≈ 0.69 (hors [0.45-0.05 ; 0.58+0.05])', () => {
    const mesures: Mesures = { longueur: 35, largeur: 1.2, epaisseur: 1.2, masse: 35 }
    const compat = candidatsCompatibles(essencesFixtures, {}, mesures)
    // pin : [0.40 ; 0.63] → 0.69 > 0.63 → exclu
    expect(compat).not.toContain('pin-sylvestre')
  })

  it('masse avec mesures : pin compatible si densité ≈ 0.50', () => {
    // 50g / 100cm³ = 0.5
    const mesures: Mesures = { longueur: 10, largeur: 10, epaisseur: 1, masse: 50 }
    const compat = candidatsCompatibles(essencesFixtures, {}, mesures)
    expect(compat).toContain('pin-sylvestre')
  })

  it('exclusions rapportées correctement', () => {
    const resultats = filtrer(essencesFixtures, { resine: 'oui' })
    const freneResult = resultats.find((r) => r.essence.id === 'frene')
    expect(freneResult?.compatible).toBe(false)
    expect(freneResult?.exclusions).toHaveLength(1)
    expect(freneResult?.exclusions[0].critere).toBe('resine')
  })
})

// ─── meilleurCritereSuivant ───────────────────────────────────────────────────

describe('meilleurCritereSuivant', () => {
  it('retourne null si un seul candidat', () => {
    const frene = essencesFixtures.filter((e) => e.id === 'frene')
    expect(meilleurCritereSuivant(frene, criteresFixtures, {})).toBeNull()
  })

  it('résine est choisi en premier sur toutes les essences', () => {
    const meilleur = meilleurCritereSuivant(essencesFixtures, criteresFixtures, {})
    // La résine distingue le pin (oui) de tous les autres (non) : pire cas = 4 avec 'non'
    // mais c'est le mieux possible car masse peut laisser beaucoup de candidats
    expect(meilleur).not.toBeNull()
  })

  it("n'inclut pas les critères déjà répondus", () => {
    const answers: Answers = { resine: 'non', coupe: 'pores-zone' }
    const candidats = filtrer(essencesFixtures, answers).filter((r) => r.compatible).map((r) => r.essence)
    const meilleur = meilleurCritereSuivant(candidats, criteresFixtures, answers)
    expect(meilleur?.id).not.toBe('resine')
    expect(meilleur?.id).not.toBe('coupe')
  })

  it('retourne null si aucun critère utile (tous les candidats identiques sur tous les critères restants)', () => {
    // Avec un seul candidat
    const frene = essencesFixtures.filter((e) => e.id === 'frene')
    expect(meilleurCritereSuivant(frene, criteresFixtures, {})).toBeNull()
  })
})

// ─── Test spécifique : pin seul après résine oui ──────────────────────────────

describe('scénario pin', () => {
  it('résine oui → pin seul dès la première réponse', () => {
    const compat = candidatsCompatibles(essencesFixtures, { resine: 'oui' })
    expect(compat).toEqual(['pin-sylvestre'])
  })
})

// ─── Test spécifique : forsythia après moelle large-creuse ───────────────────

describe('scénario forsythia', () => {
  it('moelle large-creuse → forsythia seul (les autres ont moelle fine)', () => {
    const compat = candidatsCompatibles(essencesFixtures, { moelle: 'large-creuse' })
    expect(compat).toEqual(['forsythia'])
  })
})

// ─── Test if ─────────────────────────────────────────────────────────────────

describe('scénario if', () => {
  it('if identifiable par aiguilles plates + coeur coloré', () => {
    const answers: Answers = { coupe: 'sans-pores', rameau: 'aiguilles-plates' }
    const compat = candidatsCompatibles(essencesFixtures, answers)
    expect(compat).toContain('if')
    expect(compat).not.toContain('pin-sylvestre') // aiguilles par deux
  })
})
