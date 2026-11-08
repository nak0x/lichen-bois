/**
 * Utilitaires de coordonnées pour la planche Atlas (réf. B).
 * Une coordonnée s'écrit lettre + chiffre, ex. « B2 » : lettre = ligne (A=1…),
 * chiffre = colonne (1…). Sert à positionner chaque essence sur sa cellule.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export interface CoordPos {
  /** Colonne 1-indexée. */
  col: number
  /** Ligne 1-indexée. */
  row: number
}

/** Analyse une coordonnée « B2 » en position { col, row } 1-indexée. */
export function parseCoord(coord: string): CoordPos {
  const m = /^([A-Z])(\d+)$/i.exec(coord.trim())
  if (!m) return { col: 1, row: 1 }
  const row = ALPHABET.indexOf(m[1].toUpperCase()) + 1
  const col = Number(m[2])
  return { col: Math.max(1, col), row: Math.max(1, row) }
}
