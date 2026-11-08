import type { Defi, Essence, ProprieteId, Verdict } from '@/types/content'

// Stub de socle avec implémentation triviale. Agent C (logique) implémente les règles
// de la section 9.2.
export function evaluer(_defi: Defi, essence: Essence, cites: ProprieteId[]): Verdict {
  return {
    interception: essence.registre,
    lignes: [],
    global: 'tient',
    citesPertinents: cites,
    citesHorsSujet: [],
    oublies: [],
  }
}
