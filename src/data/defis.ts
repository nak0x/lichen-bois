import type { Defi } from '@/types/content'

export const defis: Defi[] = [
  {
    id: 'manche-hache',
    titre: 'Un manche de hache',
    besoin: 'Un manche de hache encaisse des chocs répétés, toute la journée, sans casser.',
    exigences: [
      { propriete: 'tenacite', min: 4, poids: 3, enClair: 'encaisser des chocs sans casser' },
      { propriete: 'elasticite', min: 3, poids: 2, enClair: 'absorber les vibrations en fléchissant un peu' },
      { propriete: 'fendabilite', min: 4, poids: 1, enClair: 'donner une pièce au fil droit, sans fibre coupée' },
    ],
    attendus: ['frene'],
    revelation: 'Le frêne est le bois de manche classique en Europe : tenace, un peu élastique, et il se fend en pièces au fil droit. Le noisetier peut faire un petit manche léger, pas un manche de hache.',
  },
  {
    id: 'arc-simple',
    titre: 'Un arc simple',
    besoin: 'Un arc plie fortement sans rompre, et rend la force à la flèche.',
    exigences: [
      { propriete: 'elasticite', min: 4, poids: 3, enClair: 'plier fortement et revenir' },
      { propriete: 'tenacite', min: 3, poids: 2, enClair: 'ne pas rompre sous la tension' },
      { propriete: 'rectitude', min: 3, poids: 1, enClair: 'partir d\'une pièce bien droite' },
    ],
    attendus: ['frene', 'noisetier'],
    revelation: 'Le frêne (en latte fendue) et le noisetier (en tige) font de bons arcs simples. Le bois d\'arc le plus célèbre est l\'if, mais il est toxique : c\'est exactement ce que l\'observation ne te dit pas.',
    securite: 'Un arc n\'est pas un jouet : on ne vise jamais une personne ou un animal, et on tire uniquement dans un espace dégagé.',
  },
  {
    id: 'allumer-feu',
    titre: 'Lancer un feu',
    besoin: 'Pour démarrer un feu, il faut un bois qui s\'enflamme vite, même en petite quantité.',
    exigences: [
      { propriete: 'allumage', min: 4, poids: 3, enClair: 'prendre feu presque aussitôt' },
    ],
    attendus: ['pin-sylvestre'],
    revelation: 'Le pin, surtout ses parties gorgées de résine, lance le feu. Le frêne brûle très bien ensuite : il entretient le feu, il ne le démarre pas.',
    securite: 'Dehors uniquement, sur un sol dégagé, de l\'eau à portée de main, jamais par vent fort ni en période de risque d\'incendie.',
  },
  {
    id: 'sifflet',
    titre: 'Un sifflet ou un petit tube',
    besoin: 'Pour un sifflet ou un tube, il faut un intérieur facile à vider.',
    exigences: [
      { propriete: 'creux', min: 4, poids: 3, enClair: 'un intérieur qui se vide facilement' },
      { propriete: 'travail', min: 3, poids: 1, enClair: 'se tailler facilement au couteau' },
    ],
    attendus: ['forsythia', 'sureau-noir'],
    revelation: 'Les tiges à moelle large, comme celles du forsythia ou du sureau, se vident facilement. Le sureau est le bois à sifflets le plus connu — mais ses baies crues sont toxiques, c\'est dans le registre.',
  },
  {
    id: 'tuteurs',
    titre: 'Des tuteurs pour le jardin',
    besoin: 'Des tuteurs droits, à renouveler chaque année sans abîmer la plante qui les fournit.',
    exigences: [
      { propriete: 'rectitude', min: 4, poids: 3, enClair: 'des tiges droites, prêtes à l\'emploi' },
    ],
    attendus: ['noisetier', 'forsythia'],
    revelation: 'La cépée de noisetier et la taille du forsythia fournissent chaque année des tiges droites. La durabilité compte peu : un tuteur se remplace.',
  },
]
