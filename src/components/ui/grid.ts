/**
 * Utilitaires partagés du design system (Agent A).
 * Géométrie de grille et PRNG déterministe pour les masques en escalier.
 */

/** Coordonnée de cellule [colonne, ligne], indexée à partir de 0. */
export type Cell = [number, number]

/**
 * PRNG déterministe à graine (mulberry32).
 * Même graine → même suite de nombres : stable par essence.
 */
export function prng(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * stairMask — génère une silhouette en escalier déterministe.
 * Rend un ensemble de cellules « couvertes » qui restent masquées à la fin
 * d'une GridReveal, pour des bords en marches stables par graine.
 *
 * L'escalier descend depuis le bord gauche : pour chaque ligne une hauteur
 * de marche variable (mais bornée) donne un contour irrégulier mais cohérent.
 */
export function stairMask(cols: number, rows: number, seed: number): Cell[] {
  const rand = prng(seed)
  const cells: Cell[] = []
  // Hauteur de marche de départ, au tiers de la largeur.
  let edge = Math.max(1, Math.round(cols / 3))
  for (let row = 0; row < rows; row++) {
    // Variation de la marche : -1, 0 ou +1 colonne par ligne.
    const step = Math.floor(rand() * 3) - 1
    edge = Math.min(cols, Math.max(0, edge + step))
    for (let col = 0; col < edge; col++) {
      cells.push([col, row])
    }
  }
  return cells
}

/** Encode une cellule en clé « col,row » pour une recherche O(1). */
export function cellKey(col: number, row: number): string {
  return `${col},${row}`
}

/** Distance de Manhattan entre deux cellules (ordre de révélation en escalier). */
export function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}
