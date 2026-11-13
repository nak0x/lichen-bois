import type { Critere, Defi, Essence } from '@/types/content'
import { criteres, defis, essences } from '@/data'

// Fixtures canoniques du moteur : les 5 essences d'origine (section 7).
// Les tests du moteur (comportement exact de la section 7.7 et matrice 9.2) se
// basent sur ce monde fermé à 5 essences, indépendamment des essences ajoutées
// ensuite à l'atlas (Annecy). Ainsi la logique reste vérifiée exactement.
const IDS_ORIGINE = ['frene', 'pin-sylvestre', 'noisetier', 'forsythia', 'if']

export const essencesFixtures: Essence[] = essences.filter((e) => IDS_ORIGINE.includes(e.id))
export const criteresFixtures: Critere[] = criteres
export const defisFixtures: Defi[] = defis
