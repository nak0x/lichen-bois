import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Specimen } from '@/types/content'

// Stub de socle. Agent C (logique) implémente la persistance idb-keyval,
// le CRUD, les photos en Blobs et l'export/import JSON (section 9.3).
export const useCarnetStore = defineStore('carnet', () => {
  const specimens = ref<Specimen[]>([])
  return { specimens }
})
