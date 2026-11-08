// Géométrie procédurale des coupes transversales.
// Tout est calculé dans un repère 0..100 (viewBox carré), centré en (50, 50).
// Rendu « planche de botanique imprimée » : aplats sobres, filets de 1 px.
// Déterministe par `seed` (PRNG à graine) pour un rendu stable par essence.
import type { CoupeType } from '@/types/content'
import { createPrng, range } from './prng'

export interface Point {
  x: number
  y: number
}

// Petit cercle : pore (feuillu) ou point de canal résinifère (conifère).
export interface Pore {
  x: number
  y: number
  r: number
}

// Un cerne de croissance : anneau de rayon `r`, avec sa part de bois d'été.
export interface Cerne {
  r: number
}

// Identifiants des zones touchables en mode interactif.
export type ZoneId =
  | 'ecorce'
  | 'aubier'
  | 'coeur'
  | 'cerne'
  | 'bois-printemps'
  | 'bois-ete'
  | 'pores'
  | 'canaux'
  | 'moelle'

export interface Zone {
  id: ZoneId
  nom: string
  explication: string
  // Repère pour l'étiquette et la cible tactile, en coordonnées du viewBox.
  cx: number
  cy: number
  // Rayon de la cible tactile (cercle invisible superposé).
  r: number
}

export interface Coupe {
  center: Point
  rayon: number // rayon extérieur du bois (hors écorce)
  // Cernes du plus intérieur au plus extérieur.
  cernes: Cerne[]
  // Secteurs annulaires de bois d'été (plus foncés) : [rInt, rExt].
  boisEte: { rInt: number; rExt: number }[]
  pores: Pore[]
  canaux: Pore[]
  moelle: { r: number; cloisons: Point[][] } | null
  coeur: { r: number } | null // duramen coloré
  ecorce: { interieur: number; exterieur: number } // rayons
  lenticelles: { x: number; y: number; w: number; h: number; angle: number }[]
  teinteBois: string
  teinteBoisEte: string
  teinteCoeur: string
  teinteEcorce: string
  teinteMoelle: string
  zones: Zone[]
}

const EXT = 44 // rayon extérieur du bois dans le viewBox 100x100

// Dessine un anneau de pores autour d'un rayon donné (zone poreuse : frêne).
function anneauPores(
  rng: () => number,
  center: Point,
  rayon: number,
  nb: number,
  taille: [number, number],
): Pore[] {
  const out: Pore[] = []
  const depart = rng() * Math.PI * 2
  for (let i = 0; i < nb; i++) {
    const a = depart + (i / nb) * Math.PI * 2 + range(rng, -0.05, 0.05)
    const rr = rayon + range(rng, -0.6, 0.6)
    out.push({
      x: center.x + Math.cos(a) * rr,
      y: center.y + Math.sin(a) * rr,
      r: range(rng, taille[0], taille[1]),
    })
  }
  return out
}

// Pores diffus : répartis uniformément dans toute la couronne de bois.
function poresDiffus(
  rng: () => number,
  center: Point,
  rMin: number,
  rMax: number,
  nb: number,
  taille: [number, number],
): Pore[] {
  const out: Pore[] = []
  for (let i = 0; i < nb; i++) {
    const a = rng() * Math.PI * 2
    // Racine carrée pour une densité surfacique uniforme.
    const rr = Math.sqrt(range(rng, rMin * rMin, rMax * rMax))
    out.push({
      x: center.x + Math.cos(a) * rr,
      y: center.y + Math.sin(a) * rr,
      r: range(rng, taille[0], taille[1]),
    })
  }
  return out
}

export function construireCoupe(type: CoupeType, seed = 1): Coupe {
  const rng = createPrng(seed)
  const center: Point = { x: 50, y: 50 }
  const rayon = EXT

  const base: Omit<Coupe, 'zones'> = {
    center,
    rayon,
    cernes: [],
    boisEte: [],
    pores: [],
    canaux: [],
    moelle: null,
    coeur: null,
    ecorce: { interieur: rayon, exterieur: rayon + 5 },
    lenticelles: [],
    teinteBois: 'var(--coupe-bois)',
    teinteBoisEte: 'var(--coupe-bois-ete)',
    teinteCoeur: 'var(--coupe-coeur)',
    teinteEcorce: 'var(--coupe-ecorce)',
    teinteMoelle: 'var(--coupe-moelle)',
  }

  switch (type) {
    case 'zone-poreuse': {
      // Frêne : cernes larges ; à chaque début de cerne, un anneau de gros pores ;
      // bois d'été dense ; moelle fine ; cœur éventuellement plus foncé.
      const nbCernes = 6
      const pasBase = rayon / (nbCernes + 0.5)
      let r = pasBase * 0.9
      for (let i = 0; i < nbCernes; i++) {
        const pas = pasBase * range(rng, 0.82, 1.18)
        r += pas
        if (r > rayon) break
        base.cernes.push({ r })
        // Anneau de gros pores juste à l'intérieur du cerne (bois de printemps).
        const rPores = r - pas * 0.72
        const nbPores = Math.round(14 + rPores * 0.6)
        base.pores.push(...anneauPores(rng, center, rPores, nbPores, [0.75, 1.15]))
        // Bande de bois d'été dense, dans la moitié extérieure du cerne.
        base.boisEte.push({ rInt: r - pas * 0.42, rExt: r })
      }
      base.moelle = { r: 2.2, cloisons: [] }
      base.coeur = { r: rayon * 0.55 }
      return {
        ...base,
        zones: [
          zone('ecorce', 'Écorce', "La couche externe protège le tronc et se renouvelle de l'extérieur.", center.x, center.y - (rayon + 2.5), 3),
          zone('coeur', 'Cœur', "Le bois central ne conduit plus la sève ; il devient plus foncé et plus stable.", center.x - rayon * 0.28, center.y, 4),
          zone('aubier', 'Aubier', "Le bois clair encore vivant, à la périphérie, conduit la sève.", center.x + rayon * 0.78, center.y, 4),
          zone('pores', 'Pores', "Les gros vaisseaux alignés au début de chaque cerne conduisent la sève au printemps.", center.x, center.y + rayon * 0.5, 3),
          zone('bois-ete', "Bois d'été", "Le bois dense formé en fin de saison fait la ténacité du frêne.", center.x, center.y - rayon * 0.62, 3),
          zone('moelle', 'Moelle', "Le point central, vestige de la jeune tige, reste minuscule chez le frêne.", center.x, center.y, 2.6),
        ],
      }
    }

    case 'resineux-canaux': {
      // Pin : bandes claires (printemps) et foncées (été) contrastées, petits points
      // de canaux résinifères, cœur légèrement rougeâtre.
      const nbCernes = 9
      const pasBase = rayon / (nbCernes + 0.5)
      let r = pasBase * 0.8
      for (let i = 0; i < nbCernes; i++) {
        const pas = pasBase * range(rng, 0.9, 1.1)
        r += pas
        if (r > rayon) break
        base.cernes.push({ r })
        // Bois d'été : bande foncée nette dans le tiers extérieur du cerne.
        base.boisEte.push({ rInt: r - pas * 0.34, rExt: r })
      }
      // Canaux résinifères : points épars, surtout vers le bois d'été.
      base.canaux = poresDiffus(rng, center, rayon * 0.2, rayon * 0.96, 26, [0.5, 0.85])
      base.moelle = { r: 2, cloisons: [] }
      base.coeur = { r: rayon * 0.5 }
      return {
        ...base,
        zones: [
          zone('ecorce', 'Écorce', "Épaisse à la base, elle s'exfolie en plaques orangées vers le haut du tronc.", center.x, center.y - (rayon + 2.5), 3),
          zone('coeur', 'Cœur', "Le cœur du pin se teinte légèrement de rouge en vieillissant.", center.x - rayon * 0.26, center.y, 4),
          zone('bois-printemps', 'Bois de printemps', "La bande claire et tendre marque le début du cerne ; l'ongle s'y enfonce.", center.x + rayon * 0.4, center.y - rayon * 0.2, 2.5),
          zone('bois-ete', "Bois d'été", "La bande foncée et dense ferme le cerne : d'où les anneaux bien nets.", center.x + rayon * 0.55, center.y + rayon * 0.2, 2.5),
          zone('canaux', 'Canaux résinifères', "Ces petits canaux remplis de résine rendent le pin inflammable.", center.x, center.y + rayon * 0.5, 3),
          zone('moelle', 'Moelle', "Le point central reste fin, comme chez la plupart des arbres.", center.x, center.y, 2.4),
        ],
      }
    }

    case 'pores-diffus': {
      // Noisetier : cernes peu marqués, pores très fins répartis uniformément,
      // teinte claire homogène.
      const nbCernes = 7
      const pasBase = rayon / (nbCernes + 0.5)
      let r = pasBase
      for (let i = 0; i < nbCernes; i++) {
        r += pasBase * range(rng, 0.95, 1.05)
        if (r > rayon) break
        base.cernes.push({ r })
      }
      base.pores = poresDiffus(rng, center, rayon * 0.12, rayon * 0.97, 120, [0.3, 0.52])
      base.moelle = { r: 2, cloisons: [] }
      base.coeur = null // teinte homogène, pas de duramen tranché
      return {
        ...base,
        zones: [
          zone('ecorce', 'Écorce', "Lisse et cuivrée, marquée de petits traits clairs : les lenticelles.", center.x, center.y - (rayon + 2.5), 3),
          zone('aubier', 'Aubier', "Le bois est clair et homogène d'un bord à l'autre, sans cœur tranché.", center.x + rayon * 0.6, center.y, 4),
          zone('pores', 'Pores diffus', "Des pores fins et réguliers partout : un bois homogène, souple quand il est jeune.", center.x - rayon * 0.3, center.y + rayon * 0.3, 3),
          zone('cerne', 'Cerne', "Les cernes sont peu contrastés : la croissance est régulière.", center.x, center.y - rayon * 0.55, 3),
          zone('moelle', 'Moelle', "Le point central reste fin ; la tige n'est pas creuse.", center.x, center.y, 2.4),
        ],
      }
    }

    case 'moelle-cloisonnee': {
      // Forsythia : large moelle centrale avec cloisons, anneau de bois mince,
      // écorce à lenticelles.
      const rMoelle = rayon * 0.5
      base.ecorce = { interieur: rayon, exterieur: rayon + 4 }
      // Anneau de bois mince : deux cernes serrés entre la moelle et l'écorce.
      base.cernes.push({ r: rMoelle + (rayon - rMoelle) * 0.5 })
      base.cernes.push({ r: rayon })
      // Cloisons de la moelle : segments radiaux irréguliers formant des chambres.
      const nbCloisons = 7
      const cloisons: Point[][] = []
      const depart = rng() * Math.PI * 2
      for (let i = 0; i < nbCloisons; i++) {
        const a = depart + (i / nbCloisons) * Math.PI * 2
        const r1 = rMoelle * range(rng, 0.15, 0.3)
        const r2 = rMoelle * range(rng, 0.82, 0.98)
        cloisons.push([
          { x: center.x + Math.cos(a) * r1, y: center.y + Math.sin(a) * r1 },
          { x: center.x + Math.cos(a) * r2, y: center.y + Math.sin(a) * r2 },
        ])
      }
      // Quelques cloisons transversales (arcs) reliant deux rayons voisins.
      base.moelle = { r: rMoelle, cloisons }
      base.lenticelles = lenticelles(rng, center, rayon + 2)
      return {
        ...base,
        zones: [
          zone('ecorce', 'Écorce', "Lisse, ponctuée de lenticelles, autour d'un bois mince.", center.x, center.y - (rayon + 1.5), 3),
          zone('aubier', 'Anneau de bois', "Une mince couronne de bois entoure la moelle : la tige reste légère.", center.x + rayon * 0.78, center.y, 3),
          zone('moelle', 'Moelle cloisonnée', "La large moelle, divisée en chambres, s'évide facilement : d'où les tubes et sifflets.", center.x, center.y, rMoelle * 0.7),
        ],
      }
    }

    case 'resineux-sans-canaux': {
      // If : cernes très fins et serrés, cœur rouge-orangé, aubier blanc étroit,
      // pas de canaux.
      const nbCernes = 18
      const pasBase = rayon / (nbCernes + 0.5)
      let r = pasBase * 0.7
      for (let i = 0; i < nbCernes; i++) {
        r += pasBase * range(rng, 0.92, 1.08)
        if (r > rayon) break
        base.cernes.push({ r })
        base.boisEte.push({ rInt: r - pasBase * 0.28, rExt: r })
      }
      base.moelle = { r: 1.6, cloisons: [] }
      base.coeur = { r: rayon * 0.78 } // cœur rouge-orangé large, aubier étroit
      base.teinteCoeur = 'var(--coupe-coeur-if)'
      base.ecorce = { interieur: rayon, exterieur: rayon + 3.5 }
      base.teinteEcorce = 'var(--coupe-ecorce-if)'
      return {
        ...base,
        zones: [
          zone('ecorce', 'Écorce', "Fine et brun-rouge, elle se détache en lanières.", center.x, center.y - (rayon + 2), 3),
          zone('coeur', 'Cœur', "Le cœur rouge-orangé résiste à la compression : c'est le ventre de l'arc.", center.x - rayon * 0.3, center.y, 5),
          zone('aubier', 'Aubier', "L'aubier blanc, étroit, résiste à la tension : c'est le dos de l'arc.", center.x + rayon * 0.88, center.y, 2.5),
          zone('cerne', 'Cernes serrés', "Une croissance très lente donne des cernes fins et serrés, denses.", center.x, center.y - rayon * 0.6, 3),
          zone('moelle', 'Moelle', "Le point central reste minuscule ; aucun canal de résine.", center.x, center.y, 2.2),
        ],
      }
    }
  }
}

function zone(id: ZoneId, nom: string, explication: string, cx: number, cy: number, r: number): Zone {
  return { id, nom, explication, cx, cy, r }
}

function lenticelles(
  rng: () => number,
  center: Point,
  rayon: number,
): { x: number; y: number; w: number; h: number; angle: number }[] {
  const out: { x: number; y: number; w: number; h: number; angle: number }[] = []
  const nb = 10
  const depart = rng() * Math.PI * 2
  for (let i = 0; i < nb; i++) {
    const a = depart + (i / nb) * Math.PI * 2 + range(rng, -0.1, 0.1)
    out.push({
      x: center.x + Math.cos(a) * rayon,
      y: center.y + Math.sin(a) * rayon,
      w: 2.4,
      h: 0.7,
      angle: (a * 180) / Math.PI + 90,
    })
  }
  return out
}
