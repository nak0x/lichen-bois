import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Silhouette from './Silhouette.vue'
import TestIcon from './TestIcon.vue'
import type { TestId } from '@/types/content'

describe('Silhouette', () => {
  const formes = ['rondelle', 'latte', 'tige', 'rameau-aiguilles'] as const

  it('rend chaque forme avec un libellé accessible', () => {
    for (const forme of formes) {
      const w = mount(Silhouette, { props: { forme } })
      expect(w.find('svg').exists()).toBe(true)
      expect(w.find('svg').attributes('aria-label')?.length).toBeGreaterThan(0)
    }
  })

  it('dessine des aiguilles pour le rameau', () => {
    const w = mount(Silhouette, { props: { forme: 'rameau-aiguilles' } })
    // Deux lignes par aiguille.
    expect(w.findAll('line').length).toBeGreaterThan(4)
  })

  it('utilise la rondelle par défaut', () => {
    const w = mount(Silhouette)
    expect(w.find('svg').attributes('aria-label')).toContain('Rondelle')
  })
})

describe('TestIcon', () => {
  const tests: TestId[] = [
    'soupeser',
    'odeur',
    'coupe',
    'ongle',
    'ecorce-rameau',
    'flexion',
    'fendage',
    'allumage',
  ]

  it('rend un pictogramme au trait pour chaque test', () => {
    for (const test of tests) {
      const w = mount(TestIcon, { props: { test } })
      const svg = w.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('fill')).toBe('none')
      expect(svg.attributes('stroke')).toBe('currentColor')
      expect(svg.attributes('aria-label')?.length).toBeGreaterThan(0)
      expect(svg.element.querySelectorAll('path, line, circle').length).toBeGreaterThan(0)
    }
  })
})
