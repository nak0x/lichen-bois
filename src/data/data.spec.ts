import { describe, it, expect } from 'vitest'
import { criteres, essences, proprietes, defis, registre } from './index'

const CRITERE_IDS = ['resine', 'masse', 'coupe', 'moelle', 'ecorce', 'rameau', 'ongle', 'couleur'] as const
const PROPRIETE_IDS = [
  'tenacite', 'elasticite', 'durete', 'fendabilite', 'allumage',
  'chauffage', 'durabilite', 'travail', 'rectitude', 'creux',
] as const

describe('Intégrité des données', () => {
  describe('Critères', () => {
    it('contient exactement 8 critères dans le bon ordre', () => {
      expect(criteres.map(c => c.id)).toEqual(CRITERE_IDS)
    })

    it('chaque critère a un testId valide', () => {
      const testIds = new Set(['soupeser', 'odeur', 'coupe', 'ongle', 'ecorce-rameau', 'flexion', 'fendage', 'allumage'])
      for (const c of criteres) {
        expect(testIds.has(c.testId)).toBe(true)
      }
    })

    it('chaque critère a au moins une option', () => {
      for (const c of criteres) {
        expect(c.options.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Propriétés', () => {
    it('contient exactement 10 propriétés', () => {
      expect(proprietes).toHaveLength(10)
    })

    it('couvre tous les ProprieteId', () => {
      const ids = new Set(proprietes.map(p => p.id))
      for (const id of PROPRIETE_IDS) {
        expect(ids.has(id)).toBe(true)
      }
    })
  })

  describe('Essences', () => {
    it('contient les 5 essences d\'origine et au moins une vingtaine en tout', () => {
      const ids = essences.map((e) => e.id)
      for (const id of ['frene', 'pin-sylvestre', 'noisetier', 'forsythia', 'if']) {
        expect(ids).toContain(id)
      }
      expect(essences.length).toBeGreaterThanOrEqual(20)
    })

    it('chaque identifiant d\'essence est unique', () => {
      const ids = essences.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('chaque essence couvre les 8 critères', () => {
      for (const e of essences) {
        for (const critereId of CRITERE_IDS) {
          expect(
            Object.prototype.hasOwnProperty.call(e.criteres, critereId),
            `Essence "${e.id}" manque le critère "${critereId}"`,
          ).toBe(true)
        }
      }
    })

    it('chaque essence couvre les 10 propriétés', () => {
      for (const e of essences) {
        for (const propId of PROPRIETE_IDS) {
          expect(
            Object.prototype.hasOwnProperty.call(e.proprietes, propId),
            `Essence "${e.id}" manque la propriété "${propId}"`,
          ).toBe(true)
        }
      }
    })

    it('toutes les notes de propriété sont entre 1 et 5', () => {
      for (const e of essences) {
        for (const [propId, note] of Object.entries(e.proprietes)) {
          expect(
            [1, 2, 3, 4, 5].includes(note as number),
            `Essence "${e.id}", propriété "${propId}" : note invalide (${note})`,
          ).toBe(true)
        }
      }
    })

    it('les options référencées dans criteres.essences existent dans Critere.options', () => {
      const optionsByCritere: Record<string, Set<string>> = {}
      for (const c of criteres) {
        optionsByCritere[c.id] = new Set(c.options.map(o => o.id))
      }

      for (const e of essences) {
        for (const [critereId, valeurs] of Object.entries(e.criteres)) {
          if (valeurs === null) continue
          const validOptions = optionsByCritere[critereId]
          for (const v of valeurs) {
            expect(
              validOptions?.has(v),
              `Essence "${e.id}", critère "${critereId}" : option "${v}" introuvable dans les options du critère`,
            ).toBe(true)
          }
        }
      }
    })

    it('les coordonnées sont uniques', () => {
      const coords = essences.map(e => e.coordonnee)
      const uniqueCoords = new Set(coords)
      expect(uniqueCoords.size).toBe(coords.length)
    })

    it('le type de coupe de chaque essence est valide', () => {
      const coupeTypes = new Set(['zone-poreuse', 'resineux-canaux', 'pores-diffus', 'moelle-cloisonnee', 'resineux-sans-canaux'])
      for (const e of essences) {
        expect(
          coupeTypes.has(e.coupe),
          `Essence "${e.id}" a un type de coupe invalide : "${e.coupe}"`,
        ).toBe(true)
      }
    })
  })

  describe('Défis', () => {
    const essenceIds = new Set(essences.map(e => e.id))
    const propIds = new Set(PROPRIETE_IDS)

    it('chaque défi ne référence que des propriétés existantes', () => {
      for (const d of defis) {
        for (const ex of d.exigences) {
          expect(
            propIds.has(ex.propriete),
            `Défi "${d.id}" : propriété "${ex.propriete}" introuvable`,
          ).toBe(true)
        }
      }
    })

    it('chaque défi ne référence que des essences existantes dans attendus', () => {
      for (const d of defis) {
        for (const eid of d.attendus) {
          expect(
            essenceIds.has(eid),
            `Défi "${d.id}" : essence attendue "${eid}" introuvable`,
          ).toBe(true)
        }
      }
    })

    it('le poids de chaque exigence est 1, 2 ou 3', () => {
      for (const d of defis) {
        for (const ex of d.exigences) {
          expect(
            [1, 2, 3].includes(ex.poids),
            `Défi "${d.id}", exigence "${ex.propriete}" : poids invalide (${ex.poids})`,
          ).toBe(true)
        }
      }
    })

    it('le min de chaque exigence est entre 1 et 5', () => {
      for (const d of defis) {
        for (const ex of d.exigences) {
          expect(
            ex.min >= 1 && ex.min <= 5,
            `Défi "${d.id}", exigence "${ex.propriete}" : min invalide (${ex.min})`,
          ).toBe(true)
        }
      }
    })
  })

  describe('Registre', () => {
    it('chaque entrée avec essenceId pointe vers une essence registre: true', () => {
      const essenceRegistre = new Map(essences.map(e => [e.id, e.registre]))
      for (const e of registre) {
        if (e.essenceId !== undefined) {
          expect(
            essenceRegistre.get(e.essenceId),
            `Registre "${e.id}" : essenceId "${e.essenceId}" n'est pas marqué registre: true`,
          ).toBe(true)
        }
      }
    })

    it('chaque entrée a au moins un geste et une information', () => {
      for (const e of registre) {
        expect(e.ceQuIlFautSavoir.length, `Registre "${e.id}" : ceQuIlFautSavoir vide`).toBeGreaterThan(0)
        expect(e.gestes.length, `Registre "${e.id}" : gestes vide`).toBeGreaterThan(0)
      }
    })
  })
})
