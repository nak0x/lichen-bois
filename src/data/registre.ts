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
    id: 'robinier',
    essenceId: 'robinier',
    titre: 'Robinier faux-acacia',
    latin: 'Robinia pseudoacacia',
    pourquoiIndeductible: 'Son bois est l\'un des plus durables d\'Europe, parfait pour les piquets : rien dans le bois ne dit que le reste de l\'arbre est toxique.',
    ceQuIlFautSavoir: [
      'L\'écorce, les feuilles et surtout les graines sont toxiques si on les avale.',
      'Les jeunes rameaux portent des épines dures.',
      'Le bois lui-même est sûr à travailler ; le danger vient des autres parties de l\'arbre.',
    ],
    gestes: [
      'Ne mâche ni n\'avale aucune partie de l\'arbre.',
      'Écarte l\'écorce et les épines avant de tailler ; lave-toi les mains après.',
      'Pas de gousses ni de graines à portée des plus jeunes.',
    ],
  },
  {
    id: 'buis',
    essenceId: 'buis',
    titre: 'Buis commun',
    latin: 'Buxus sempervirens',
    pourquoiIndeductible: 'Ce bois très dur et très fin est idéal pour le tournage et les petites pièces ; son aspect ne révèle en rien sa toxicité.',
    ceQuIlFautSavoir: [
      'Feuilles, écorce et bois contiennent des substances toxiques si on les ingère.',
      'La sciure fine peut irriter les voies respiratoires.',
      'Évite-le pour un ustensile en contact prolongé avec la nourriture.',
    ],
    gestes: [
      'Masque contre la sciure, et mains lavées après le travail.',
      'Ne porte pas un copeau à la bouche.',
      'Réserve-le aux objets qu\'on ne mange pas (jeux, manches, tournage).',
    ],
  },
  {
    id: 'sureau-noir',
    essenceId: 'sureau-noir',
    titre: 'Sureau noir',
    latin: 'Sambucus nigra',
    pourquoiIndeductible: 'C\'est le bois à sifflets par excellence, tendre et facile à évider : rien dans la tige ne prévient que les fruits et les parties vertes crus sont toxiques.',
    ceQuIlFautSavoir: [
      'Les baies crues, les feuilles et la moelle verte sont toxiques ; cuites, les baies mûres deviennent comestibles.',
      'La tige sèche, elle, se travaille sans danger pour un sifflet.',
      'On confond facilement le sureau noir (bon) avec le sureau yèble, herbacé et plus toxique.',
    ],
    gestes: [
      'Ne goûte jamais la moelle ni les baies crues.',
      'Lave-toi les mains après avoir évidé une tige.',
      'En cas de doute sur l\'espèce, ne récolte pas les fruits.',
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
