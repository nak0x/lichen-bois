import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CoupeTransversale from './CoupeTransversale.vue'

describe('CoupeTransversale', () => {
  it('rend une coupe non interactive sans zones ni légende', () => {
    const w = mount(CoupeTransversale, { props: { type: 'zone-poreuse' } })
    expect(w.find('svg').exists()).toBe(true)
    expect(w.findAll('.coupe__zone')).toHaveLength(0)
    expect(w.find('.coupe__legende').exists()).toBe(false)
  })

  it('affiche des zones touchables et une aide par défaut en mode interactif', () => {
    const w = mount(CoupeTransversale, { props: { type: 'zone-poreuse', interactive: true } })
    expect(w.findAll('.coupe__zone').length).toBeGreaterThan(0)
    expect(w.find('.coupe__legende-aide').exists()).toBe(true)
  })

  it("révèle le nom et l'explication d'une zone au clic, et bascule", async () => {
    const w = mount(CoupeTransversale, { props: { type: 'resineux-sans-canaux', interactive: true } })
    const zone = w.findAll('.coupe__zone')[1]
    await zone.trigger('click')
    expect(w.find('.coupe__legende-nom').exists()).toBe(true)
    expect(w.find('.coupe__legende-texte').text().length).toBeGreaterThan(0)
    expect(zone.attributes('aria-pressed')).toBe('true')
    // Un second clic referme la légende.
    await zone.trigger('click')
    expect(w.find('.coupe__legende-aide').exists()).toBe(true)
  })

  it('est activable au clavier (Entrée)', async () => {
    const w = mount(CoupeTransversale, { props: { type: 'pores-diffus', interactive: true } })
    const zone = w.findAll('.coupe__zone')[0]
    expect(zone.attributes('tabindex')).toBe('0')
    expect(zone.attributes('role')).toBe('button')
    await zone.trigger('keydown.enter')
    expect(w.find('.coupe__legende-nom').exists()).toBe(true)
  })

  it('porte un libellé accessible décrivant le type de coupe', () => {
    const w = mount(CoupeTransversale, { props: { type: 'moelle-cloisonnee' } })
    expect(w.find('svg').attributes('aria-label')).toContain('forsythia')
  })
})
