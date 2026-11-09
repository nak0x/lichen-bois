/**
 * Redimensionnement d'une photo côté client (§8.8).
 * Lit un fichier image, le redimensionne à 1280 px max sur le plus grand côté
 * via un canvas, l'encode en JPEG qualité 0,85 et retourne un Blob.
 * Tout se fait localement, sans aucun appel réseau.
 */
const TAILLE_MAX = 1280
const QUALITE = 0.85

/** Charge un fichier dans un élément <img> via une URL objet. */
function chargerImage(fichier: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Image illisible"))
    }
    img.src = url
  })
}

/**
 * Redimensionne une image en Blob JPEG.
 * Si le canvas n'est pas disponible (ex. tests jsdom), retourne le fichier tel quel.
 */
export async function redimensionnerPhoto(fichier: Blob): Promise<Blob> {
  const img = await chargerImage(fichier)

  let largeur = img.naturalWidth || img.width
  let hauteur = img.naturalHeight || img.height
  if (largeur === 0 || hauteur === 0) return fichier

  const plusGrand = Math.max(largeur, hauteur)
  if (plusGrand > TAILLE_MAX) {
    const facteur = TAILLE_MAX / plusGrand
    largeur = Math.round(largeur * facteur)
    hauteur = Math.round(hauteur * facteur)
  }

  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  const ctx = canvas.getContext('2d')
  if (!ctx) return fichier
  ctx.drawImage(img, 0, 0, largeur, hauteur)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', QUALITE)
  })
  return blob ?? fichier
}
