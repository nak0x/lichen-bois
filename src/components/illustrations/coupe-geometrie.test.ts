import { describe, expect, it } from 'vitest'
import { construireCoupe } from './coupe-geometrie'
import type { CoupeType } from '@/types/content'

const TYPES: CoupeType[] = [
  'zone-poreuse',
  'resineux-canaux',
  'pores-diffus',
  'moelle-cloisonnee',
  'resineux-sans-canaux',
]

describe('construireCoupe', () => {
  it('est déterministe pour une même graine', () => {
    for (const t of TYPES) {
      const a = construireCoupe(t, 42)
      const b = construireCoupe(t, 42)
      expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    }
  })

  it('varie selon la graine', () => {
    const a = construireCoupe('zone-poreuse', 1)
    const b = construireCoupe('zone-poreuse', 2)
    expect(JSON.stringify(a.pores)).not.toBe(JSON.stringify(b.pores))
  })

  it('dessine des cernes dans chaque type', () => {
    for (const t of TYPES) {
      expect(construireCoupe(t, 7).cernes.length).toBeGreaterThan(0)
    }
  })

  it('place des pores pour les feuillus et des canaux pour le pin', () => {
    expect(construireCoupe('zone-poreuse', 7).pores.length).toBeGreaterThan(0)
    expect(construireCoupe('pores-diffus', 7).pores.length).toBeGreaterThan(0)
    expect(construireCoupe('resineux-canaux', 7).canaux.length).toBeGreaterThan(0)
    // Un résineux à canaux n'a pas de pores de feuillu.
    expect(construireCoupe('resineux-canaux', 7).pores.length).toBe(0)
  })

  it("donne une moelle cloisonnée large au forsythia et un cœur à l'if", () => {
    const forsythia = construireCoupe('moelle-cloisonnee', 7)
    expect(forsythia.moelle?.cloisons.length).toBeGreaterThan(0)
    expect(forsythia.moelle!.r).toBeGreaterThan(10)

    const si = construireCoupe('resineux-sans-canaux', 7)
    expect(si.coeur).not.toBeNull()
    expect(si.canaux.length).toBe(0)
  })

  it('expose des zones interactives nommées et expliquées', () => {
    for (const t of TYPES) {
      const zones = construireCoupe(t, 7).zones
      expect(zones.length).toBeGreaterThan(0)
      for (const z of zones) {
        expect(z.nom.length).toBeGreaterThan(0)
        expect(z.explication.length).toBeGreaterThan(0)
        expect(z.r).toBeGreaterThan(0)
      }
    }
  })

  it('reste dans le cadre du viewBox', () => {
    for (const t of TYPES) {
      const c = construireCoupe(t, 7)
      expect(c.ecorce.exterieur).toBeLessThanOrEqual(50)
    }
  })
})
