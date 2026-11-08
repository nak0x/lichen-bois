// PRNG déterministe à graine (mulberry32). Un même `seed` produit toujours la
// même suite : le rendu d'une coupe est stable par essence, comme une planche
// de botanique imprimée qu'on retrouve identique d'une page à l'autre.
export function createPrng(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Nombre dans [min, max).
export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}
