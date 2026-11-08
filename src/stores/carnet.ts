import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, set, del } from 'idb-keyval'
import type { DefiRealise, EssenceId, Mesures, Answers, Specimen, TestId } from '@/types/content'

const CLE_CARNET = 'lichen:carnet:v1'
const PREFIXE_PHOTO = 'lichen:photo:'

function nouvelId(): string {
  return crypto.randomUUID()
}

function nouvelleDate(): string {
  return new Date().toISOString()
}

export const useCarnetStore = defineStore('carnet', () => {
  const specimens = ref<Specimen[]>([])
  const charge = ref(false)

  /** Charge les spécimens depuis IndexedDB au démarrage. */
  async function initialiser(): Promise<void> {
    // Demander la persistance
    if (navigator.storage?.persist) {
      await navigator.storage.persist()
    }

    const data = await get<Specimen[]>(CLE_CARNET)
    if (data) {
      specimens.value = data
    }
    charge.value = true
  }

  /** Persiste l'état complet dans IndexedDB. */
  async function sauvegarder(): Promise<void> {
    await set(CLE_CARNET, specimens.value)
  }

  /** Crée un nouveau spécimen vide et retourne son id. */
  async function creer(nom?: string): Promise<string> {
    const id = nouvelId()
    const specimen: Specimen = {
      id,
      nom: nom ?? 'Spécimen sans nom',
      creeLe: nouvelleDate(),
      photos: [],
      answers: {},
      mesures: undefined,
      resultatsTests: {},
      identification: undefined,
      defis: [],
      notes: '',
    }
    specimens.value.push(specimen)
    await sauvegarder()
    return id
  }

  /** Crée un spécimen avec un id prédéfini (utilisé par le mode démo). */
  async function creerAvecId(id: string, nom: string): Promise<void> {
    // Éviter les doublons
    if (specimens.value.some((s) => s.id === id)) return
    const specimen: Specimen = {
      id,
      nom,
      creeLe: nouvelleDate(),
      photos: [],
      answers: {},
      mesures: undefined,
      resultatsTests: {},
      identification: undefined,
      defis: [],
      notes: '',
    }
    specimens.value.push(specimen)
    await sauvegarder()
  }

  function trouver(id: string): Specimen | undefined {
    return specimens.value.find((s) => s.id === id)
  }

  async function mettreAJour(id: string, patch: Partial<Omit<Specimen, 'id' | 'creeLe'>>): Promise<void> {
    const idx = specimens.value.findIndex((s) => s.id === id)
    if (idx === -1) return
    specimens.value[idx] = { ...specimens.value[idx], ...patch }
    await sauvegarder()
  }

  async function mettreAJourAnswers(id: string, answers: Answers): Promise<void> {
    const idx = specimens.value.findIndex((s) => s.id === id)
    if (idx === -1) return
    specimens.value[idx] = {
      ...specimens.value[idx],
      answers: { ...specimens.value[idx].answers, ...answers },
    }
    await sauvegarder()
  }

  async function mettreAJourMesures(id: string, mesures: Mesures): Promise<void> {
    await mettreAJour(id, { mesures })
  }

  async function mettreAJourIdentification(id: string, identification: EssenceId): Promise<void> {
    await mettreAJour(id, { identification })
  }

  async function mettreAJourResultatTest(id: string, testId: TestId, resultat: string): Promise<void> {
    const idx = specimens.value.findIndex((s) => s.id === id)
    if (idx === -1) return
    specimens.value[idx] = {
      ...specimens.value[idx],
      resultatsTests: { ...specimens.value[idx].resultatsTests, [testId]: resultat },
    }
    await sauvegarder()
  }

  async function ajouterDefi(id: string, defi: DefiRealise): Promise<void> {
    const idx = specimens.value.findIndex((s) => s.id === id)
    if (idx === -1) return
    specimens.value[idx] = {
      ...specimens.value[idx],
      defis: [...specimens.value[idx].defis, defi],
    }
    await sauvegarder()
  }

  async function supprimer(id: string): Promise<void> {
    const specimen = trouver(id)
    if (!specimen) return
    // Supprimer les photos en Blob
    for (const clePhoto of specimen.photos) {
      await del(clePhoto)
    }
    specimens.value = specimens.value.filter((s) => s.id !== id)
    await sauvegarder()
  }

  /**
   * Ajoute une photo (Blob) à un spécimen.
   * Retourne la clé IndexedDB utilisée.
   */
  async function ajouterPhoto(id: string, blob: Blob): Promise<string> {
    const clePhoto = `${PREFIXE_PHOTO}${nouvelId()}`
    await set(clePhoto, blob)
    const idx = specimens.value.findIndex((s) => s.id === id)
    if (idx !== -1) {
      specimens.value[idx] = {
        ...specimens.value[idx],
        photos: [...specimens.value[idx].photos, clePhoto],
      }
      await sauvegarder()
    }
    return clePhoto
  }

  /** Récupère un Blob de photo depuis IndexedDB. */
  async function chargerPhoto(clePhoto: string): Promise<Blob | undefined> {
    return get<Blob>(clePhoto)
  }

  /** Supprime une photo d'un spécimen. */
  async function supprimerPhoto(id: string, clePhoto: string): Promise<void> {
    await del(clePhoto)
    const idx = specimens.value.findIndex((s) => s.id === id)
    if (idx !== -1) {
      specimens.value[idx] = {
        ...specimens.value[idx],
        photos: specimens.value[idx].photos.filter((c) => c !== clePhoto),
      }
      await sauvegarder()
    }
  }

  /**
   * Exporte le carnet en JSON (P0 : photos exclues).
   * Les clés de photos restent dans le JSON mais les Blobs ne sont pas inclus.
   */
  function exporterJSON(): string {
    return JSON.stringify(specimens.value, null, 2)
  }

  /**
   * Exporte le carnet en JSON avec photos en base64 (P1).
   */
  async function exporterJSONAvecPhotos(): Promise<string> {
    const data = JSON.parse(JSON.stringify(specimens.value)) as Array<
      Specimen & { photosBase64?: Record<string, string> }
    >
    for (const specimen of data) {
      if (specimen.photos.length === 0) continue
      specimen.photosBase64 = {}
      for (const clePhoto of specimen.photos) {
        const blob = await chargerPhoto(clePhoto)
        if (blob) {
          const buffer = await blob.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          let binary = ''
          for (const b of bytes) binary += String.fromCharCode(b)
          specimen.photosBase64[clePhoto] = `data:${blob.type};base64,${btoa(binary)}`
        }
      }
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * Importe un carnet depuis JSON.
   * Fusionne avec les spécimens existants (les ids démo sont ignorés).
   */
  async function importerJSON(json: string): Promise<void> {
    type SpecimenImporte = Specimen & { photosBase64?: Record<string, string> }
    const data: SpecimenImporte[] = JSON.parse(json)
    for (const item of data) {
      // Ne pas importer les spécimens démo
      if (item.id.startsWith('demo-')) continue

      // Restaurer les photos base64 si présentes (P1)
      if (item.photosBase64) {
        const nouvellesPhotos: string[] = []
        for (const [ancienneCle, dataUrl] of Object.entries(item.photosBase64)) {
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          const clePhoto = `${PREFIXE_PHOTO}${nouvelId()}`
          await set(clePhoto, blob)
          // Remplacer l'ancienne clé par la nouvelle dans la liste
          const idx = item.photos.indexOf(ancienneCle)
          if (idx !== -1) {
            nouvellesPhotos.push(clePhoto)
          } else {
            nouvellesPhotos.push(clePhoto)
          }
        }
        item.photos = nouvellesPhotos
        delete item.photosBase64
      }

      // Mettre à jour ou insérer
      const existing = specimens.value.findIndex((s) => s.id === item.id)
      if (existing !== -1) {
        specimens.value[existing] = item
      } else {
        specimens.value.push(item)
      }
    }
    await sauvegarder()
  }

  /** Supprime tous les spécimens (hors démo). */
  async function toutEffacer(): Promise<void> {
    // Supprimer les photos
    for (const specimen of specimens.value) {
      for (const clePhoto of specimen.photos) {
        await del(clePhoto)
      }
    }
    specimens.value = []
    await sauvegarder()
  }

  /**
   * Retourne l'id du spécimen à utiliser pour enregistrer un défi.
   * - Si specimenId fourni et existant : l'utilise.
   * - Sinon : crée ou réutilise un spécimen implicite « Atlas » pour l'essence.
   *   (section 8.6 : « un spécimen « Atlas » implicite si le choix vient de l'atlas »)
   */
  async function specimenOuAtlas(essenceId: EssenceId, specimenId?: string): Promise<string> {
    if (specimenId) {
      const existing = trouver(specimenId)
      if (existing) return specimenId
    }
    // Chercher un spécimen Atlas existant pour cette essence
    const atlasId = `atlas-${essenceId}`
    const existing = trouver(atlasId)
    if (existing) return atlasId
    // Créer le spécimen Atlas implicite
    await creerAvecId(atlasId, `Atlas — ${essenceId}`)
    await mettreAJourIdentification(atlasId, essenceId)
    return atlasId
  }

  /** Supprime tous les spécimens démo (préfixe demo-). */
  async function effacerDemo(): Promise<void> {
    const demos = specimens.value.filter((s) => s.id.startsWith('demo-'))
    for (const specimen of demos) {
      for (const clePhoto of specimen.photos) {
        await del(clePhoto)
      }
    }
    specimens.value = specimens.value.filter((s) => !s.id.startsWith('demo-'))
    await sauvegarder()
  }

  return {
    specimens,
    charge,
    initialiser,
    creer,
    creerAvecId,
    trouver,
    mettreAJour,
    mettreAJourAnswers,
    mettreAJourMesures,
    mettreAJourIdentification,
    mettreAJourResultatTest,
    ajouterDefi,
    supprimer,
    ajouterPhoto,
    chargerPhoto,
    supprimerPhoto,
    exporterJSON,
    exporterJSONAvecPhotos,
    importerJSON,
    toutEffacer,
    specimenOuAtlas,
    effacerDemo,
  }
})
