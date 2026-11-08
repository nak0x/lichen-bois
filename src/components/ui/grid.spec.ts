import { describe, expect, it } from 'vitest'
import { manhattan, prng, stairMask } from './grid'

describe('prng', () => {
  it('est déterministe à graine égale', () => {
    const a = prng(42)
    const b = prng(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('diffère selon la graine', () => {
    expect(prng(1)()).not.toBe(prng(2)())
  })

  it('reste dans [0, 1[', () => {
    const r = prng(7)
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('stairMask', () => {
  it('est stable pour une même graine', () => {
    expect(stairMask(6, 5, 123)).toEqual(stairMask(6, 5, 123))
  })

  it('reste dans les bornes de la grille', () => {
    for (const [c, r] of stairMask(8, 6, 999)) {
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThan(8)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThan(6)
    }
  })
})

describe('manhattan', () => {
  it('calcule la distance de Manhattan', () => {
    expect(manhattan([0, 0], [2, 3])).toBe(5)
  })
})
