/**
 * Fonte pixel 3×5 (Agent A) — glyphes dessinés pour le mot-symbole.
 * Chaque glyphe = 5 chaînes de 3 caractères (# = pixel allumé).
 * Pas de police externe : on dessine des <rect> sur la grille mineure.
 */
export const GLYPH_W = 3
export const GLYPH_H = 5

type Glyph = string[]

const GLYPHS: Record<string, Glyph> = {
  A: ['###', '# #', '###', '# #', '# #'],
  C: ['###', '#  ', '#  ', '#  ', '###'],
  E: ['###', '#  ', '###', '#  ', '###'],
  H: ['# #', '# #', '###', '# #', '# #'],
  I: ['###', ' # ', ' # ', ' # ', '###'],
  L: ['#  ', '#  ', '#  ', '#  ', '###'],
  N: ['# #', '###', '###', '###', '# #'],
  O: ['###', '# #', '# #', '# #', '###'],
  S: ['###', '#  ', '###', '  #', '###'],
  ' ': ['   ', '   ', '   ', '   ', '   '],
}

export interface Pixel {
  /** Colonne absolue (en pixels de grille mineure), ligne absolue. */
  col: number
  row: number
  /** Ordre de révélation (lecture gauche→droite, haut→bas). */
  order: number
}

/**
 * Transforme un mot en liste de pixels allumés, avec un espace d'1 pixel
 * entre chaque glyphe. Les coordonnées sont relatives (0,0 en haut à gauche).
 */
export function wordPixels(word: string): { pixels: Pixel[]; width: number; height: number } {
  const pixels: Pixel[] = []
  let cursor = 0
  let order = 0
  for (const ch of word.toUpperCase()) {
    const glyph = GLYPHS[ch] ?? GLYPHS[' ']
    for (let r = 0; r < GLYPH_H; r++) {
      const line = glyph[r]
      for (let c = 0; c < GLYPH_W; c++) {
        if (line[c] === '#') {
          pixels.push({ col: cursor + c, row: r, order: order++ })
        }
      }
    }
    cursor += GLYPH_W + 1 // espace d'un pixel
  }
  const width = Math.max(0, cursor - 1)
  return { pixels, width, height: GLYPH_H }
}
