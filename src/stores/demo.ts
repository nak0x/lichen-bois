import { defineStore } from 'pinia'
import { ref } from 'vue'

// Stub de socle. Agent C (logique) implémente le pilote du mode démo :
// état de l'étape courante, injection progressive, isolation des spécimens
// préfixés demo-, réinitialisation (section 9.3).
export const useDemoStore = defineStore('demo', () => {
  const etape = ref(0)
  const actif = ref(false)
  return { etape, actif }
})
