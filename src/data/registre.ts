import type { EntreeRegistre } from '@/types/content'

export const registre: EntreeRegistre[] = [
  {
    id: 'if',
    essenceId: 'if',
    titre: 'If commun',
    latin: 'Taxus baccata',
    pourquoiIndeductible: 'Rien dans l\'aspect, l\'odeur ou le comportement mécanique du bois ne signale le danger. C\'est même l\'un des meilleurs bois d\'arc.',
    ceQuIlFautSavoir: [
      'Presque toutes les parties de l\'if sont très toxiques : aiguilles, écorce, bois, graines.',
      'Même la petite baie rouge contient une graine toxique : on n\'y goûte pas.',
      'Il est aussi mortel pour les chevaux et le bétail.',
    ],
    gestes: [
      'Ne jamais mâcher un rameau, une aiguille ou un copeau.',
      'Jamais d\'ustensile en contact avec la nourriture.',
      'Masque contre la sciure, mains lavées après le travail.',
    ],
  },
  {
    id: 'laurier-rose',
    titre: 'Laurier-rose',
    latin: 'Nerium oleander',
    pourquoiIndeductible: 'C\'est un arbuste de jardin très courant, aux tiges droites et tentantes. Rien ne signale sa toxicité.',
    ceQuIlFautSavoir: [
      'Toutes les parties sont très toxiques.',
      'La fumée de sa combustion l\'est aussi.',
    ],
    gestes: [
      'Jamais de brochette ni de bâton de cuisson en laurier-rose.',
      'Ne jamais le brûler.',
      'Se laver les mains après l\'avoir taillé.',
    ],
  },
  {
    id: 'bois-traites',
    titre: 'Bois traités, peints et palettes',
    pourquoiIndeductible: 'Un bois traité ou peint peut contenir des produits toxiques invisibles, qui passent dans la fumée quand il brûle.',
    ceQuIlFautSavoir: [
      'Bois peint, verni, aggloméré ou traité en autoclave (souvent verdâtre ou brunâtre) : jamais au feu.',
      'Palettes : cherche le marquage. HT signifie traité par la chaleur, utilisable pour le bricolage. MB signifie fumigé au bromure de méthyle : à éviter.',
    ],
    gestes: [
      'Ne jamais brûler un bois dont tu ne connais pas l\'origine.',
      'Pas de bois de récupération pour un ustensile alimentaire.',
    ],
  },
]
